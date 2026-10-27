import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AppProvider } from '@/components/providers/app-provider';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'FLIP AI – Il tuo assistente per il reselling', template: '%s · FLIP AI' },
  description:
    'Trova affari, stima profitto e ROI, crea annunci con l’AI e gestisci inventario e vendite del tuo business di reselling.',
  applicationName: 'FLIP AI',
  icons: { icon: '/icon.svg' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`dark ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
