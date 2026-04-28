export type PersonaId = 'anshuman' | 'abhimanyu' | 'kshitij';

export type PersonaConfig = {
  id: PersonaId;
  name: string;
  title: string;
  oneLiner: string;
  imageUrl: string;
  suggestions: string[];
};

export const PERSONAS: PersonaConfig[] = [
  {
    id: 'anshuman',
    name: 'Anshuman Singh',
    title: 'Co-founder | InterviewBit + Scaler Academy',
    oneLiner:
      'Direct, framework-driven advice rooted in practical interview and hiring expectations.',
    imageUrl:
      'https://secure.gravatar.com/avatar/be33340e4bb86666fb317d0418c57044d9fdf60d60ad42125bff3bd32bece962?s=200&d=mm&r=g',
    suggestions: [
      'How should I practice DSA for placements in 3 months?',
      'How do I stay consistent when interview prep feels overwhelming?',
      'What is your framework for solving hard coding questions?',
    ],
  },
  {
    id: 'abhimanyu',
    name: 'Abhimanyu Saxena',
    title: 'Co-founder | InterviewBit + Scaler Academy',
    oneLiner:
      'Pragmatic, mission-led guidance focused on outcomes, integrity, and execution.',
    imageUrl:
      'https://secure.gravatar.com/avatar/c7ac3854bc967e95b0a3bbcda2aad45c5720e80d534f4630547ae6e4f1bf231d?s=200&d=mm&r=g',
    suggestions: [
      'How should a fresher build a standout project portfolio?',
      'What daily habits compound career growth in tech?',
      'How can I become better at product thinking as an engineer?',
    ],
  },
  {
    id: 'kshitij',
    name: 'Kshitij Mishra',
    title: 'Dean, Scaler School of Technology (SST)',
    oneLiner:
      'Calm, mentorship-first coaching focused on consistency, growth loops, and long-term progress.',
    imageUrl: 'https://avatars.githubusercontent.com/u/28945755?v=4',
    suggestions: [
      'How do I build strong communication for interviews?',
      'How should I revise what I learn so it sticks long-term?',
      'What should my weekly roadmap look like for job readiness?',
    ],
  },
];
