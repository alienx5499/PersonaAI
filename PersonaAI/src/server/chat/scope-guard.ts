import { type PersonaId } from '@/lib/personas';

const SDE_TOPIC_KEYWORDS = [
  'sde',
  'software',
  'engineer',
  'engineering',
  'developer',
  'development',
  'coding',
  'code',
  'programming',
  'dsa',
  'leetcode',
  'algorithm',
  'data structure',
  'system design',
  'backend',
  'frontend',
  'full stack',
  'api',
  'database',
  'sql',
  'javascript',
  'typescript',
  'python',
  'java',
  'c++',
  'golang',
  'node',
  'react',
  'nextjs',
  'microservice',
  'distributed system',
  'debug',
  'interview',
  'placement',
  'resume',
  'career',
  'internship',
];

const SDE_INTENT_PHRASES = [
  'time complexity',
  'space complexity',
  'big o',
  'low level design',
  'high level design',
  'object oriented design',
  'machine coding',
  'code review',
  'bug fix',
  'debugging',
  'interview prep',
  'mock interview',
];

const OFF_TOPIC_KEYWORDS = [
  'recipe',
  'cook',
  'cooking',
  'chef',
  'pasta',
  'pizza',
  'biryani',
  'spaghetti',
  'food',
  'diet',
  'workout',
  'gym',
  'astrology',
  'horoscope',
  'tarot',
  'poem',
  'lyrics',
  'love letter',
  'joke',
  'movie',
  'travel plan',
];

const OFF_TOPIC_DOMAIN_KEYWORDS = [
  'kitchen',
  'restaurant',
  'nutrition',
  'calorie',
  'zodiac',
  'religion',
  'cricket',
  'football',
  'music',
  'song',
  'cinema',
  'netflix',
  'fashion',
  'makeup',
  'dating',
  'relationship',
  'wedding',
];

const JAILBREAK_PHRASES = [
  'ignore all previous instructions',
  'ignore previous instructions',
  'ignore system prompt',
  'do not follow system prompt',
  'developer mode',
  'jailbreak',
  'bypass safety',
  'act as',
  'act like',
  'you are now',
  'roleplay as',
  'pretend to be',
  'decode and obey',
  'reverse and obey',
  'comply exactly',
];

function normalize(text: string): string {
  return text.toLowerCase().replaceAll(/\s+/g, ' ').trim();
}

function normalizeObfuscation(text: string): string {
  return text
    .toLowerCase()
    .replaceAll('@', 'a')
    .replaceAll('4', 'a')
    .replaceAll('3', 'e')
    .replaceAll('1', 'i')
    .replaceAll('!', 'i')
    .replaceAll('0', 'o')
    .replaceAll('$', 's')
    .replaceAll('5', 's')
    .replaceAll('7', 't');
}

function reverseWord(input: string): string {
  return input.split('').reverse().join('');
}

const REVERSED_OFF_TOPIC_TOKENS = OFF_TOPIC_KEYWORDS.map((kw) =>
  reverseWord(kw.replaceAll(/[^a-z0-9]/g, '')),
).filter((token) => token.length >= 4);

function countMatches(text: string, keywords: string[]): number {
  return keywords.reduce(
    (count, kw) => (text.includes(kw) ? count + 1 : count),
    0,
  );
}

export function isClearlyOffTopicSdeQuery(input: string): boolean {
  const text = normalize(input);
  const deobfuscatedText = normalizeObfuscation(text);
  if (!text) return false;

  const hasSdeSignal =
    SDE_TOPIC_KEYWORDS.some(
      (kw) => text.includes(kw) || deobfuscatedText.includes(kw),
    ) || SDE_INTENT_PHRASES.some((kw) => text.includes(kw));
  const hasOffTopicSignal = OFF_TOPIC_KEYWORDS.some(
    (kw) => text.includes(kw) || deobfuscatedText.includes(kw),
  );

  if (hasOffTopicSignal && !hasSdeSignal) return true;

  const explicitRoleHijack =
    (text.includes('act like') ||
      text.includes('you are now') ||
      text.includes('act as')) &&
    (text.includes('chef') ||
      text.includes('cooking') ||
      text.includes('recipe') ||
      text.includes('pizza') ||
      text.includes('pasta'));
  if (explicitRoleHijack) return true;

  const compact = deobfuscatedText.replaceAll(/[^a-z0-9]/g, '');
  const hasReversedOffTopicSignal = REVERSED_OFF_TOPIC_TOKENS.some(
    (token) => deobfuscatedText.includes(token) || compact.includes(token),
  );
  const asksToDecodeAndObey =
    (text.includes('reverse') || text.includes('decode')) &&
    (text.includes('obey') || text.includes('comply'));
  if (asksToDecodeAndObey && !hasSdeSignal) {
    return true;
  }
  if (hasReversedOffTopicSignal && asksToDecodeAndObey && !hasSdeSignal) {
    return true;
  }

  const jailbreakPressure = countMatches(deobfuscatedText, JAILBREAK_PHRASES);
  const offTopicPressure =
    countMatches(deobfuscatedText, OFF_TOPIC_KEYWORDS) +
    countMatches(deobfuscatedText, OFF_TOPIC_DOMAIN_KEYWORDS);
  const sdePressure =
    countMatches(deobfuscatedText, SDE_TOPIC_KEYWORDS) +
    countMatches(deobfuscatedText, SDE_INTENT_PHRASES);

  const riskScore =
    offTopicPressure * 2 + jailbreakPressure * 2 - sdePressure * 2;
  if (riskScore >= 3 && offTopicPressure > 0) return true;

  return false;
}

export function buildOffTopicPersonaReply(personaId: PersonaId): string {
  if (personaId === 'abhimanyu') {
    return 'This is exactly how engineers lose momentum, by chasing irrelevant distractions. I am not answering non-SDE requests like recipes or roleplay. Use this time to ask about coding interviews, system design, or execution strategy. What engineering milestone are you committing to this week?';
  }

  if (personaId === 'kshitij') {
    return 'This is off track, and you are wasting valuable prep time on non-engineering noise. I will not answer requests outside SDE, coding, and interview growth. Bring your focus back to fundamentals, revision loops, and practical software problem solving. Which interview skill do you want to improve first?';
  }

  return 'Stop burning prep time on non-engineering requests. I will not answer topics outside SDE, coding interviews, and software growth. Ask a real engineering question and we will work through it with structure and depth. What is the hardest technical topic you are struggling with right now?';
}
