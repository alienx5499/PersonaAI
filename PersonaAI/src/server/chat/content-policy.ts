import { Filter } from 'bad-words';

let profanityFilter: Filter | null = null;

function getProfanityFilter() {
  if (!profanityFilter) {
    profanityFilter = new Filter();
  }
  return profanityFilter;
}

export function hasBannedLanguage(text: string): boolean {
  return getProfanityFilter().isProfane(text);
}

export function sanitizeLanguage(text: string): string {
  return getProfanityFilter().clean(text);
}
