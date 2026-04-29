'use client';

import { useState } from 'react';

async function copyTextToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers / blocked clipboard permissions.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

export function CodeBlockWithCopy(props: { code: string; language?: string }) {
  const { code, language } = props;
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/50">
      <div className="flex items-center justify-end gap-2 border-b border-zinc-800/60 px-2 py-1">
        <button
          type="button"
          aria-label="Copy code"
          onClick={() => {
            void (async () => {
              await copyTextToClipboard(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            })();
          }}
          className={[
            'rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-[11px] text-zinc-200',
            'hover:bg-zinc-900',
            'active:scale-[0.99]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70',
          ].join(' ')}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre className="overflow-x-auto p-3 text-[12px] leading-relaxed">
        <code className={language ? `language-${language}` : undefined}>
          {code}
        </code>
      </pre>
    </div>
  );
}
