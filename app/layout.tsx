import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { meta } from '@/lib/content';
import { asset } from '@/lib/base';
import './globals.css';

const cormorant = localFont({
  src: [
    { path: '../assets/fonts/cormorant-garamond.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/cormorant-garamond-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = localFont({
  src: '../assets/fonts/jost.woff2',
  weight: '300 500',
  variable: '--font-jost',
  display: 'swap',
});

const vibes = localFont({
  src: '../assets/fonts/great-vibes.woff2',
  weight: '400',
  variable: '--font-vibes',
  display: 'swap',
});

const cinzel = localFont({
  src: '../assets/fonts/cinzel.woff2',
  weight: '400',
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: meta.title,
  description: meta.description,
  openGraph: {
    type: 'website',
    title: 'Ronald & Amala',
    description: meta.ogDescription,
    images: [asset('/assets/og.jpg')],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230b1026'/%3E%3Cpath d='M16 7l3 6 6 3-6 3-3 6-3-6-6-3 6-3z' fill='%23e6c78d'/%3E%3C/svg%3E`,
  },
};

export const viewport: Viewport = {
  themeColor: '#04060f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${vibes.variable} ${cinzel.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
