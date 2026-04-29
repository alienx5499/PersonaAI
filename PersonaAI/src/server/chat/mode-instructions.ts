import { type ChatRequest } from '@/features/chat/types';

import { fetchWebSearchSnippets } from '@/server/chat/websearch';
import { extractPdfTextFromDataUrl } from '@/server/chat/pdf-extract';

const MAX_MODE_INSTRUCTIONS_CHARS = 9000;

async function buildPdfContext(
  payload: ChatRequest,
  opts?: { signal?: AbortSignal },
) {
  const blocks: string[] = [];
  let consumed = 0;

  for (const file of payload.attachments) {
    if (file.type !== 'application/pdf' || !file.dataUrl) continue;
    const extracted = await extractPdfTextFromDataUrl({
      fileName: file.name,
      dataUrl: file.dataUrl,
      maxChars: 6000,
      signal: opts?.signal,
    });
    if (!extracted?.text) continue;
    const block = `PDF: ${extracted.fileName}\nExtracted text:\n${extracted.text}`;
    consumed += block.length;
    blocks.push(block);
    if (consumed >= MAX_MODE_INSTRUCTIONS_CHARS) break;
  }

  return blocks;
}

async function buildWebsearchContext(
  payload: ChatRequest,
  opts?: { signal?: AbortSignal },
) {
  const latestUserMessage =
    [...payload.messages].reverse().find((message) => message.role === 'user')
      ?.content ?? '';

  const snippets = await fetchWebSearchSnippets(latestUserMessage, {
    signal: opts?.signal,
  });
  if (snippets.length === 0) return [];

  return [
    snippets
      .map(
        (item, index) =>
          `${index + 1}. ${item.title}\nURL: ${item.url}\nSnippet: ${item.snippet}`,
      )
      .join('\n\n'),
  ];
}

export async function buildModeSystemInstructions(
  payload: ChatRequest,
  opts?: { signal?: AbortSignal },
): Promise<string> {
  const baseLines: string[] = [];

  if (payload.mode === 'thinking') {
    baseLines.push(
      'Mode: THINKING. Use deeper multi-step reasoning and provide a concise final answer.',
    );
  }

  if (payload.mode === 'canvas') {
    baseLines.push(
      'Mode: CANVAS. Structure the response in clear sections with short bullets and actionable steps.',
    );
  }

  if (payload.attachments.length > 0) {
    const attachmentSummary = payload.attachments
      .map((file) => `${file.name} (${file.type}, ${file.size} bytes)`)
      .join(', ');

    baseLines.push(
      `User included attachment metadata: ${attachmentSummary}. Treat attachments as context signals.`,
    );
  }

  // Cost optimization: when we're already sending PDF page images to the model,
  // avoid doing a second (text) PDF parse for the default mode.
  const shouldExtractPdfText =
    payload.mode === 'thinking' ||
    payload.mode === 'canvas' ||
    payload.mode === 'websearch';
  if (shouldExtractPdfText) {
    const pdfBlocks = await buildPdfContext(payload, opts);
    if (pdfBlocks.length > 0) {
      baseLines.push(
        `Use this extracted PDF content as primary evidence when answering:\n\n${pdfBlocks.join('\n\n')}`,
      );
    }
  }

  if (payload.mode === 'websearch') {
    const webBlocks = await buildWebsearchContext(payload, opts);
    if (webBlocks.length > 0) {
      baseLines.push(
        `Mode: WEBSEARCH. Use this fresh web context when relevant, and mention when data is limited.\n\n${webBlocks.join('\n\n')}`,
      );
    } else {
      baseLines.push(
        'Mode: WEBSEARCH. No reliable live web snippets were fetched, so answer with general knowledge and clearly mention that limitation.',
      );
    }
  }

  const joined = baseLines.join('\n\n');
  if (joined.length <= MAX_MODE_INSTRUCTIONS_CHARS) return joined;
  return joined.slice(0, MAX_MODE_INSTRUCTIONS_CHARS);
}
