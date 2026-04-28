import { z } from 'zod';

import { type PersonaId } from '@/lib/personas';

export const chatRoleSchema = z.enum(['user', 'assistant']);

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z.string().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  personaId: z.enum(['anshuman', 'abhimanyu', 'kshitij'] satisfies [
    PersonaId,
    ...PersonaId[],
  ]),
  messages: z.array(chatMessageSchema).min(1).max(40),
});

export const chatResponseSchema = z.object({
  reply: z.string().min(1),
});

export type ChatApiMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;

export type ApiErrorResponse = {
  error: string;
};
