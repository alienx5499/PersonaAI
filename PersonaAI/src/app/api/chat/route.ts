import { NextResponse } from 'next/server';

import { chatRequestSchema } from '@/server/chat/chat-schema';
import { hasBannedLanguage } from '@/server/chat/content-policy';
import { generateChatReply } from '@/server/chat/chat-service';
import { checkRateLimit } from '@/server/chat/rate-limit';

export async function POST(req: Request) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for') ?? '';
    const ip = forwardedFor.split(',')[0]?.trim() || 'local';

    const rate = checkRateLimit({ key: ip, limit: 8, windowMs: 60_000 });
    if (!rate.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)),
          },
        },
      );
    }

    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            'Invalid request payload. Please provide valid persona and messages.',
        },
        { status: 400 },
      );
    }

    const latestUserMessage = [...parsed.data.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (latestUserMessage && hasBannedLanguage(latestUserMessage.content)) {
      return NextResponse.json(
        {
          error:
            'Please avoid abusive language. Rephrase your question respectfully and try again.',
        },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const reply = await generateChatReply(parsed.data, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!reply) {
      return NextResponse.json(
        { error: 'Model returned an empty response.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat route error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.', code: 'CHAT_TIMEOUT' },
        { status: 504 },
      );
    }

    const isMissingKey =
      error instanceof Error &&
      error.message.includes('Missing NVIDIA_API_KEY');
    const message = isMissingKey
      ? error.message
      : 'Failed to generate response. Please try again in a moment.';
    const code = isMissingKey ? 'NVIDIA_API_KEY_MISSING' : 'CHAT_ROUTE_ERROR';

    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}
