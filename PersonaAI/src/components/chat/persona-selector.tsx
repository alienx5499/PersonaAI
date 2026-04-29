'use client';

import Image from 'next/image';

import { GlowingEffect } from '@/components/ui/glowing-effect-card';
import { type PersonaConfig, type PersonaId } from '@/lib/personas';

type PersonaSelectorProps = {
  personas: PersonaConfig[];
  activePersonaId: PersonaId;
  onSelect: (personaId: PersonaId) => void;
};

export function PersonaSelector({
  personas,
  activePersonaId,
  onSelect,
}: PersonaSelectorProps) {
  return (
    <section className="mb-4">
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
        {personas.map((persona) => {
          const isActive = persona.id === activePersonaId;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onSelect(persona.id)}
              aria-pressed={isActive}
              className={[
                'group relative min-w-[16rem] snap-start cursor-pointer touch-manipulation rounded-[1.25rem] border-[0.75px] p-2 text-left transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:min-w-0 md:rounded-[1.5rem] md:p-3',
                isActive
                  ? 'border-cyan-300/70 shadow-[0_0_0_1px_rgba(103,232,249,0.35)]'
                  : 'border-gray-800',
              ].join(' ')}
            >
              <div className="hidden sm:block">
                <GlowingEffect
                  blur={0}
                  inactiveZone={0.01}
                  spread={40}
                  proximity={64}
                  movementDuration={0.35}
                  borderWidth={3}
                  disabled={false}
                  glow
                  className="rounded-[1.25rem] md:rounded-[1.5rem]"
                />
              </div>
              <div
                className={[
                  'relative overflow-hidden rounded-xl border-[0.75px] border-gray-800 bg-black p-4 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition',
                  isActive
                    ? 'border-cyan-300/45 bg-zinc-950 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(103,232,249,0.25)]'
                    : 'group-hover:border-gray-700',
                ].join(' ')}
              >
                {isActive && (
                  <span className="absolute right-3 top-3 rounded-full border border-cyan-300/50 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                    Active
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <Image
                    src={persona.imageUrl}
                    alt={persona.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full border border-zinc-700 object-cover"
                  />
                  <p className="text-sm font-semibold text-zinc-100 sm:text-[0.95rem]">
                    {persona.name}
                  </p>
                </div>
                <p
                  className={[
                    'mt-2 pr-16 text-xs leading-relaxed',
                    isActive ? 'text-zinc-200' : 'text-zinc-400',
                  ].join(' ')}
                >
                  {persona.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
