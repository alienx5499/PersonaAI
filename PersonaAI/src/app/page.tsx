'use client';

import { useMemo } from 'react';

import { ActivePersonaCard } from '@/components/chat/active-persona-card';
import { ChatPanel } from '@/components/chat/chat-panel';
import { PersonaSelector } from '@/components/chat/persona-selector';
import { SuggestionChips } from '@/components/chat/suggestion-chips';
import { GooeyText } from '@/components/ui/gooey-text-morphing';
import { useChat } from '@/features/chat/hooks/use-chat';
import { PERSONAS } from '@/lib/personas';

export default function Home() {
  const gooeyTexts = useMemo(
    () => [
      'PersonaAI',
      'Persona Chatbot',
      'Scaler Mentor AI',
      'Interview Prep Mentor',
      'SST Learning Guide',
      'Scaler Academy Assistant',
    ],
    [],
  );

  const {
    activePersona,
    activePersonaId,
    errorMessage,
    isTyping,
    messages,
    resetConversation,
    sendMessage,
  } = useChat();

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-4 md:h-auto md:min-h-screen md:overflow-visible">
      <header className="mb-3 shrink-0 space-y-2 pt-1 text-center sm:mb-4 sm:pt-2">
        <GooeyText
          texts={gooeyTexts}
          morphTime={2}
          cooldownTime={1.1}
          className="h-14 sm:h-16"
          textClassName="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl md:text-4xl"
        />
        <p className="text-sm text-zinc-400">
          Switch persona to reset conversation and start a fresh context.
        </p>
      </header>

      <div className="shrink-0">
        <PersonaSelector
          personas={PERSONAS}
          activePersonaId={activePersonaId}
          onSelect={resetConversation}
        />
        <ActivePersonaCard persona={activePersona} />
        <SuggestionChips
          persona={activePersona}
          onSelectSuggestion={(suggestion) => {
            void sendMessage(suggestion);
          }}
        />
      </div>
      <ChatPanel
        activePersona={activePersona}
        messages={messages}
        isTyping={isTyping}
        errorMessage={errorMessage}
        onSubmitMessage={(message, options) => {
          void sendMessage(message, options);
        }}
      />
    </main>
  );
}
