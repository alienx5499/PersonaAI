'use client';

import { type ReactNode } from 'react';

import { CodeBlockWithCopy } from '@/components/chat/code-block-with-copy';

export function MessageContent(props: { content: string }): ReactNode {
  const { content } = props;

  // Parse triple-backtick fenced blocks and keep whitespace/newlines intact.
  // This expects the common format: ```lang?\n ...code...\n```
  const codeFenceRegex =
    /```([a-zA-Z0-9_-]+)?[ \t]*\n([\s\S]*?)```[ \t]*(?:\n|$)/g;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = codeFenceRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const matchIndex = match.index;
    const language = match[1] ?? '';
    const code = match[2] ?? '';

    if (matchIndex > lastIndex) {
      nodes.push(
        <span
          key={`t-${partIndex++}`}
          className="whitespace-pre-wrap break-words"
        >
          {content.slice(lastIndex, matchIndex)}
        </span>,
      );
    }

    nodes.push(
      <CodeBlockWithCopy
        key={`c-${partIndex++}`}
        code={code}
        language={language}
      />,
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (nodes.length === 0) {
    return <span className="whitespace-pre-wrap break-words">{content}</span>;
  }

  if (lastIndex < content.length) {
    nodes.push(
      <span
        key={`t-${partIndex++}`}
        className="whitespace-pre-wrap break-words"
      >
        {content.slice(lastIndex)}
      </span>,
    );
  }

  return <>{nodes}</>;
}
