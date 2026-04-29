'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { requestChatReply } from '@/features/chat/api/chat-client';
import { type ChatAttachment, type ChatMode } from '@/features/chat/types';
import { type ChatMessage } from '@/lib/chat';
import { PERSONAS, type PersonaId } from '@/lib/personas';

function getChatStorageKey() {
  if (typeof window === 'undefined') return '';
  const namespace = [
    window.location.host,
    window.location.pathname,
    'chat-state',
  ]
    .filter(Boolean)
    .join('|');
  return `pa:${btoa(namespace)}`;
}

function buildLocalMessage(
  role: ChatMessage['role'],
  content: string,
  attachments?: ChatAttachment[],
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
    attachments,
  };
}

export function useChat() {
  const [activePersonaId, setActivePersonaId] = useState<PersonaId>('anshuman');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activePersonaRef = useRef<PersonaId>(activePersonaId);
  const messagesRef = useRef<ChatMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activePersonaRef.current = activePersonaId;
  }, [activePersonaId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = getChatStorageKey();
    if (!storageKey) return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        activePersonaId?: PersonaId;
        messages?: ChatMessage[];
      };

      const nextPersonaId =
        parsed.activePersonaId &&
        PERSONAS.some((persona) => persona.id === parsed.activePersonaId)
          ? parsed.activePersonaId
          : undefined;
      const nextMessages = Array.isArray(parsed.messages)
        ? parsed.messages
        : [];

      const schedule = (fn: () => void) => {
        if (typeof queueMicrotask === 'function') queueMicrotask(fn);
        else setTimeout(fn, 0);
      };

      schedule(() => {
        if (nextPersonaId) setActivePersonaId(nextPersonaId);
        setMessages(nextMessages);
      });
    } catch {
      // Ignore corrupted payloads.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onHardReloadKeyDown = (e: KeyboardEvent) => {
      const isHardReload =
        e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r';
      if (!isHardReload) return;

      try {
        const storageKey = getChatStorageKey();
        if (storageKey) window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage failures.
      }
    };

    window.addEventListener('keydown', onHardReloadKeyDown);
    return () => window.removeEventListener('keydown', onHardReloadKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = getChatStorageKey();
    if (!storageKey) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ activePersonaId, messages }),
    );
  }, [activePersonaId, messages]);

  const activePersona = useMemo(
    () =>
      PERSONAS.find((persona) => persona.id === activePersonaId) ?? PERSONAS[0],
    [activePersonaId],
  );

  const resetConversation = (personaId: PersonaId) => {
    setActivePersonaId(personaId);
    setMessages([]);
    setInput('');
    setIsTyping(false);
    setErrorMessage(null);
  };

  const sendMessage = async (
    content: string,
    options?: {
      mode?: ChatMode;
      attachments?: ChatAttachment[];
    },
  ) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const personaAtSend = activePersonaRef.current;
    const attachmentList = options?.attachments ?? [];
    const userMessage = buildLocalMessage('user', trimmed, attachmentList);
    const nextMessages = [...messagesRef.current, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);
    setErrorMessage(null);

    try {
      const reply = await requestChatReply({
        personaId: personaAtSend,
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        mode: options?.mode ?? 'default',
        attachments: options?.attachments ?? [],
      });

      if (personaAtSend !== activePersonaRef.current) return;
      setMessages((prev) => [...prev, buildLocalMessage('assistant', reply)]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while generating a response.';
      setErrorMessage(message);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    activePersona,
    activePersonaId,
    errorMessage,
    input,
    isTyping,
    messages,
    setInput,
    resetConversation,
    sendMessage,
  };
}
