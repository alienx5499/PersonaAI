import OpenAI from 'openai';

import { type ChatRequest } from '@/features/chat/types';
import { PERSONA_SYSTEM_PROMPTS } from '@/lib/system-prompts';
import { NVIDIA_CHAT_CONFIG } from '@/server/chat/chat-config';
import { sanitizeLanguage } from '@/server/chat/content-policy';
import { buildModeSystemInstructions } from '@/server/chat/mode-instructions';
import { extractPdfPageImagesFromDataUrl } from '@/server/chat/pdf-extract';

function getNvidiaClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NVIDIA_API_KEY in environment configuration.');
  }

  return new OpenAI({
    apiKey,
    baseURL: NVIDIA_CHAT_CONFIG.baseURL,
  });
}

export async function generateChatReply(
  payload: ChatRequest,
  opts?: { signal?: AbortSignal },
): Promise<string> {
  const client = getNvidiaClient();
  const modeInstructions = await buildModeSystemInstructions(payload, {
    signal: opts?.signal,
  });
  const systemPrompt = `${PERSONA_SYSTEM_PROMPTS[payload.personaId]}${
    modeInstructions ? `\n\n${modeInstructions}` : ''
  }`;
  const modelMessages: Array<Record<string, unknown>> = payload.messages.map(
    (message) => ({
      role: message.role,
      content: message.content,
    }),
  );
  const latestUserIndex = [...payload.messages]
    .map((message, index) => ({ message, index }))
    .reverse()
    .find(({ message }) => message.role === 'user')?.index;
  const imageAttachments = payload.attachments.filter(
    (file) =>
      file.type.startsWith('image/') && file.dataUrl?.startsWith('data:image/'),
  );
  const pdfAttachments = payload.attachments.filter(
    (file) => file.type === 'application/pdf' && file.dataUrl?.includes(','),
  );
  const pdfPageImages =
    pdfAttachments.length > 0
      ? await (async () => {
          const maxTotalImages = 4;
          const all: Array<{
            fileName: string;
            pageNumber: number;
            dataUrl: string;
          }> = [];
          for (const pdf of pdfAttachments) {
            const pageImages = await extractPdfPageImagesFromDataUrl({
              fileName: pdf.name,
              dataUrl: pdf.dataUrl as string,
              maxPages: 2,
              scale: 1,
              desiredWidth: 900,
              signal: opts?.signal,
            });
            all.push(...pageImages);
            if (all.length >= maxTotalImages) break;
          }
          return all.slice(0, maxTotalImages);
        })()
      : [];

  if (typeof latestUserIndex === 'number' && latestUserIndex >= 0) {
    const hasMultimodalInputs =
      imageAttachments.length > 0 || pdfPageImages.length > 0;
    if (hasMultimodalInputs) {
      const originalText = payload.messages[latestUserIndex]?.content ?? '';
      modelMessages[latestUserIndex] = {
        role: 'user',
        content: [
          { type: 'text', text: originalText },
          ...imageAttachments.map((file) => ({
            type: 'image_url',
            image_url: { url: file.dataUrl as string },
          })),
          ...pdfPageImages.map((img) => ({
            type: 'image_url',
            image_url: { url: img.dataUrl },
          })),
        ],
      };
    }
  }

  const completion = await client.chat.completions.create({
    model: NVIDIA_CHAT_CONFIG.model,
    messages: [{ role: 'system', content: systemPrompt }, ...modelMessages],
    temperature: NVIDIA_CHAT_CONFIG.temperature,
    top_p: NVIDIA_CHAT_CONFIG.topP,
    max_tokens: NVIDIA_CHAT_CONFIG.maxTokens,
    stream: false,
    reasoning_budget: NVIDIA_CHAT_CONFIG.reasoningBudget,
    chat_template_kwargs: {
      enable_thinking: NVIDIA_CHAT_CONFIG.enableThinking,
    },
    signal: opts?.signal,
  } as never);

  const rawReply = completion.choices[0]?.message?.content?.trim() ?? '';
  if (!rawReply) {
    return 'I could not generate a complete response from the model this time. Please resend the question, and if you uploaded a file, include what exactly you want me to verify.';
  }
  return sanitizeLanguage(rawReply.replaceAll('—', '-'));
}
