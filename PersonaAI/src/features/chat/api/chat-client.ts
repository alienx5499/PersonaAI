import {
  type ChatAttachment,
  chatResponseSchema,
  type ApiErrorResponse,
  type ChatApiMessage,
  type ChatMode,
  type ChatRequest,
} from '@/features/chat/types';
import { type PersonaId } from '@/lib/personas';

export async function requestChatReply(params: {
  personaId: PersonaId;
  messages: ChatApiMessage[];
  mode?: ChatMode;
  attachments?: ChatAttachment[];
  signal?: AbortSignal;
}): Promise<string> {
  const payload: ChatRequest = {
    personaId: params.personaId,
    messages: params.messages,
    mode: params.mode ?? 'default',
    attachments: params.attachments ?? [],
  };

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: params.signal,
  });

  const contentType = res.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `Server error (${res.status}). Response: ${text.slice(0, 200)}`,
      );
    }
    throw new Error('Invalid non-JSON response from server.');
  }

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    const err = data as ApiErrorResponse;
    throw new Error(err?.error ?? 'Failed to generate response.');
  }

  const parsed = chatResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid response format from server.');
  }

  return parsed.data.reply;
}
