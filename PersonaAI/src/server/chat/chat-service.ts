import OpenAI from 'openai';

import { type ChatRequest } from '@/features/chat/types';
import { PERSONA_SYSTEM_PROMPTS } from '@/lib/system-prompts';
import { NVIDIA_CHAT_CONFIG } from '@/server/chat/chat-config';
import { sanitizeLanguage } from '@/server/chat/content-policy';

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

export async function generateChatReply(payload: ChatRequest): Promise<string> {
  const client = getNvidiaClient();

  const completion = await client.chat.completions.create({
    model: NVIDIA_CHAT_CONFIG.model,
    messages: [
      { role: 'system', content: PERSONA_SYSTEM_PROMPTS[payload.personaId] },
      ...payload.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: NVIDIA_CHAT_CONFIG.temperature,
    top_p: NVIDIA_CHAT_CONFIG.topP,
    max_tokens: NVIDIA_CHAT_CONFIG.maxTokens,
    stream: false,
    reasoning_budget: NVIDIA_CHAT_CONFIG.reasoningBudget,
    chat_template_kwargs: {
      enable_thinking: NVIDIA_CHAT_CONFIG.enableThinking,
    },
  } as never);

  const rawReply = completion.choices[0]?.message?.content?.trim() ?? '';
  return sanitizeLanguage(rawReply.replaceAll('—', '-'));
}
