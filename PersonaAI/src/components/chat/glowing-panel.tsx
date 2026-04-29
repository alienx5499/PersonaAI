'use client';

import { ReactNode } from 'react';

import { GlowingEffect } from '@/components/ui/glowing-effect-card';
import { cn } from '@/lib/utils';

type GlowingPanelProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  glowClassName?: string;
};

export function GlowingPanel({
  children,
  className,
  innerClassName,
  glowClassName,
}: GlowingPanelProps) {
  return (
    <div
      className={cn(
        'relative rounded-[1.25rem] border-[0.75px] border-gray-800 p-2 transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] md:rounded-[1.5rem] md:p-3',
        className,
      )}
    >
      <GlowingEffect
        blur={0}
        inactiveZone={0.01}
        spread={40}
        proximity={64}
        movementDuration={0.35}
        borderWidth={3}
        disabled={false}
        glow
        className={cn('rounded-[1.25rem] md:rounded-[1.5rem]', glowClassName)}
      />
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border-[0.75px] border-gray-800 bg-black shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
