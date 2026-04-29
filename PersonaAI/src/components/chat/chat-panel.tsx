'use client';

import { GlowingPanel } from '@/components/chat/glowing-panel';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { type ChatMessage } from '@/lib/chat';
import { type PersonaConfig } from '@/lib/personas';

type ChatPanelProps = {
  activePersona: PersonaConfig;
  messages: ChatMessage[];
  isTyping: boolean;
  errorMessage: string | null;
  onSubmitMessage: (message: string) => void;
};

export function ChatPanel({
  activePersona,
  messages,
  isTyping,
  errorMessage,
  onSubmitMessage,
}: ChatPanelProps) {
  return (
    <GlowingPanel
      className="flex flex-col"
      innerClassName="flex flex-col p-3 sm:p-4"
    >
      <div className="mb-2 max-h-[52vh] space-y-3 overflow-y-auto pr-1 sm:mb-3 md:max-h-[58vh]">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
            Conversation is empty. Ask a question or use a quick-start chip.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={[
                'max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed sm:max-w-[88%]',
                message.role === 'user'
                  ? 'ml-auto bg-zinc-200 text-zinc-950'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-100',
              ].join(' ')}
            >
              {message.content}
            </div>
          ))
        )}

        {isTyping && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
            {activePersona.name} is typing...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800/70 bg-black/60 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-black/50">
        <PromptInputBox
          isLoading={isTyping}
          placeholder={`Ask ${activePersona.name}...`}
          className="rounded-xl border-zinc-700 bg-zinc-900 shadow-none"
          onSend={(message) => onSubmitMessage(message)}
        />
      </div>
    </GlowingPanel>
  );
}
