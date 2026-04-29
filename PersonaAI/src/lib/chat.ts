export type ChatRole = 'user' | 'assistant';

export type ChatAttachmentMeta = {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  extractedText?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: ChatAttachmentMeta[];
};
