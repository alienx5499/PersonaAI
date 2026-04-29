'use client';

import { GlowingPanel } from '@/components/chat/glowing-panel';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { type ChatAttachment, type ChatMode } from '@/features/chat/types';
import { type ChatMessage } from '@/lib/chat';
import { type PersonaConfig } from '@/lib/personas';

type ChatPanelProps = {
  activePersona: PersonaConfig;
  messages: ChatMessage[];
  isTyping: boolean;
  errorMessage: string | null;
  onSubmitMessage: (
    message: string,
    options?: {
      mode?: ChatMode;
      attachments?: ChatAttachment[];
    },
  ) => void;
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
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.attachments.map((file) => (
                    <span
                      key={`${message.id}-${file.name}`}
                      className="inline-flex"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (file.dataUrl) {
                            const dataUrl = file.dataUrl;
                            // Use object URL to avoid browser blocking very long data URLs.
                            void (async () => {
                              try {
                                const res = await fetch(dataUrl);
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                window.open(
                                  url,
                                  '_blank',
                                  'noopener,noreferrer',
                                );
                                setTimeout(
                                  () => URL.revokeObjectURL(url),
                                  10_000,
                                );
                              } catch {
                                window.open(
                                  file.dataUrl,
                                  '_blank',
                                  'noopener,noreferrer',
                                );
                              }
                            })();
                          }
                        }}
                        disabled={!file.dataUrl}
                        className={[
                          'rounded-full border px-2 py-0.5 text-[11px]',
                          message.role === 'user'
                            ? 'border-zinc-300/80 bg-zinc-100 text-zinc-700'
                            : 'border-zinc-600 bg-zinc-800 text-zinc-300',
                          file.dataUrl
                            ? 'cursor-pointer underline decoration-dotted underline-offset-2'
                            : 'cursor-default opacity-80',
                        ].join(' ')}
                        title={
                          file.dataUrl
                            ? 'Open attachment in browser'
                            : 'No preview URL'
                        }
                      >
                        {file.name}
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
          onSend={(message, options) => onSubmitMessage(message, options)}
        />
      </div>
    </GlowingPanel>
  );
}
