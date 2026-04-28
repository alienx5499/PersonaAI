'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { requestChatReply } from '@/features/chat/api/chat-client';
import { type ChatMessage } from '@/lib/chat';
import { PERSONAS, type PersonaId } from '@/lib/personas';

function buildLocalMessage(
  role: ChatMessage['role'],
  content: string,
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
  };
}

export function useChat() {
  const [activePersonaId, setActivePersonaId] = useState<PersonaId>('anshuman');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activePersonaRef = useRef<PersonaId>(activePersonaId);

  useEffect(() => {
    activePersonaRef.current = activePersonaId;
  }, [activePersonaId]);

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

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const personaAtSend = activePersonaRef.current;
    const userMessage = buildLocalMessage('user', trimmed);
    const nextMessages = [...messages, userMessage];

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
