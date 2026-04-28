import { NextResponse } from 'next/server';

import { chatRequestSchema } from '@/server/chat/chat-schema';
import { hasBannedLanguage } from '@/server/chat/content-policy';
import { generateChatReply } from '@/server/chat/chat-service';

export async function POST(req: Request) {
  try {
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

    const reply = await generateChatReply(parsed.data);
    if (!reply) {
      return NextResponse.json(
        { error: 'Model returned an empty response.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat route error:', error);
    const message =
      error instanceof Error && error.message.includes('NVIDIA_API_KEY')
        ? error.message
        : 'Failed to generate response. Please try again in a moment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
