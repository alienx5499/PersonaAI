'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export const GooeyText = React.memo(function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName,
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);
  const filterId = React.useId();

  React.useEffect(() => {
    if (texts.length === 0) return;

    const text1 = text1Ref.current;
    const text2 = text2Ref.current;
    if (!text1 || !text2) return;

    let textIndex = texts.length - 1;
    let time = performance.now();
    let morph = 0;
    let cooldown = cooldownTime;
    let frame = 0;
    let inCooldown = false;

    text1.textContent = texts[textIndex % texts.length];
    text2.textContent = texts[(textIndex + 1) % texts.length];

    const setMorph = (fraction: number) => {
      const safeFraction = Math.max(fraction, 0.0001);
      const inverse = Math.max(1 - fraction, 0.0001);

      text2.style.filter = `blur(${Math.min(8 / safeFraction - 8, 100)}px)`;
      text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      text1.style.filter = `blur(${Math.min(8 / inverse - 8, 100)}px)`;
      text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
    };

    const doCooldown = () => {
      morph = 0;
      if (inCooldown) return;
      inCooldown = true;
      text2.style.filter = '';
      text2.style.opacity = '100%';
      text1.style.filter = '';
      text1.style.opacity = '0%';
    };

    const doMorph = () => {
      inCooldown = false;
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const newTime = performance.now();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime - time) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          text1.textContent = texts[textIndex % texts.length];
          text2.textContent = texts[(textIndex + 1) % texts.length];
        }
        doMorph();
      } else {
        doCooldown();
      }
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn('relative', className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="relative flex min-h-[2.5rem] w-full items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <span
          ref={text1Ref}
          className={cn(
            'absolute left-1/2 top-1/2 inline-block -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-6xl text-foreground md:text-[60pt]',
            textClassName,
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            'absolute left-1/2 top-1/2 inline-block -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-6xl text-foreground md:text-[60pt]',
            textClassName,
          )}
        />
      </div>
    </div>
  );
});
