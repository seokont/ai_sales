import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LangProvider } from '@/lib/language-context';
import { SiteMeta } from '@/components/site-meta';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aisw.online';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Seller Widget — AI sales assistant for your website',
    template: '%s — AI Seller Widget',
  },
  description:
    'Embed a smart sales chat widget: knowledge base, product recommendations, lead capture, Telegram alerts. English, Ukrainian, Russian, and Hebrew.',
  keywords: [
    'AI chat widget',
    'sales assistant',
    'chatbot',
    'ecommerce',
    'leads',
    'knowledge base',
    'Telegram',
    'embed widget',
  ],
  authors: [{ name: 'AI Seller Widget' }],
  creator: 'AI Seller Widget',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['uk_UA', 'ru_RU', 'he_IL'],
    url: siteUrl,
    siteName: 'AI Seller Widget',
    title: 'AI Seller Widget — AI sales assistant for your website',
    description:
      'Embed a smart sales chat widget: knowledge base, product recommendations, lead capture, Telegram alerts.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Seller Widget — AI sales assistant for your website',
    description:
      'Embed a smart sales chat widget: knowledge base, leads, Telegram. Multi-language dashboard and widget.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      en: `${siteUrl}/`,
      uk: `${siteUrl}/`,
      ru: `${siteUrl}/`,
      he: `${siteUrl}/`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <LangProvider>
          <SiteMeta />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
