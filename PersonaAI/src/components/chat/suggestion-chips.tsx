'use client';

import { GlowingPanel } from '@/components/chat/glowing-panel';
import { type PersonaConfig } from '@/lib/personas';

type SuggestionChipsProps = {
  persona: PersonaConfig;
  onSelectSuggestion: (text: string) => void;
};

export function SuggestionChips({
  persona,
  onSelectSuggestion,
}: SuggestionChipsProps) {
  return (
    <GlowingPanel className="mb-4" innerClassName="p-3 sm:p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Quick Start Questions
      </p>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {persona.suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelectSuggestion(suggestion)}
            className="cursor-pointer snap-start touch-manipulation whitespace-nowrap rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </GlowingPanel>
  );
}
