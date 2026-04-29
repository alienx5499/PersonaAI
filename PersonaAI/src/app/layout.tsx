import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PersonaAI',
  description: 'Persona-based AI chatbot project',
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        {/* Best-effort animated favicon (many browsers still prefer static). */}
        <link
          rel="icon"
          href="/favicon-animated.gif"
          type="image/gif"
          sizes="32x32"
        />
        {/* Fallback for browsers that don't animate favicons. */}
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />

        {/* PWA/App install best-practice. */}
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
