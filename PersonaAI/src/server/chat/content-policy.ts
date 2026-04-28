import { Filter } from 'bad-words';

const profanityFilter = new Filter();

export function hasBannedLanguage(text: string): boolean {
  return profanityFilter.isProfane(text);
}

export function sanitizeLanguage(text: string): string {
  return profanityFilter.clean(text);
}
