import { z } from 'zod';

import { type PersonaId } from '@/lib/personas';

export const chatRoleSchema = z.enum(['user', 'assistant']);

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z.string().min(1).max(4000),
});

export const chatModeSchema = z.enum([
  'default',
  'thinking',
  'websearch',
  'canvas',
]);

export const chatAttachmentSchema = z.object({
  name: z.string().min(1).max(160),
  type: z.string().min(1).max(120),
  size: z
    .number()
    .int()
    .nonnegative()
    .max(10 * 1024 * 1024),
  dataUrl: z.string().max(15_000_000).optional(),
  extractedText: z.string().max(120_000).optional(),
});

export const chatRequestSchema = z.object({
  personaId: z.enum(['anshuman', 'abhimanyu', 'kshitij'] satisfies [
    PersonaId,
    ...PersonaId[],
  ]),
  messages: z.array(chatMessageSchema).min(1).max(40),
  mode: chatModeSchema.default('default'),
  attachments: z.array(chatAttachmentSchema).max(3).default([]),
});

export const chatResponseSchema = z.object({
  reply: z.string().min(1),
});

export type ChatApiMessage = z.infer<typeof chatMessageSchema>;
export type ChatMode = z.infer<typeof chatModeSchema>;
export type ChatAttachment = z.infer<typeof chatAttachmentSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;

export type ApiErrorResponse = {
  error: string;
};
