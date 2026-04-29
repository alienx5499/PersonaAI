'use client';

import Image from 'next/image';

import { GlowingPanel } from '@/components/chat/glowing-panel';
import { type PersonaConfig } from '@/lib/personas';

type ActivePersonaCardProps = {
  persona: PersonaConfig;
};

export function ActivePersonaCard({ persona }: ActivePersonaCardProps) {
  return (
    <GlowingPanel className="mb-4" innerClassName="p-4">
      <div className="flex items-center gap-3">
        <Image
          src={persona.imageUrl}
          alt={persona.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
        />
        <p className="text-sm font-medium text-zinc-200">
          Active Persona: {persona.name}
        </p>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{persona.oneLiner}</p>
    </GlowingPanel>
  );
}
