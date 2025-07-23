import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/i18n-provider';

export const metadata: Metadata = {
  title: 'Guardian Gate Unified',
  description: 'Unified Security and Access Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <I18nProvider>
      {(locale, direction) => (
        <html lang={locale} dir={direction} suppressHydrationWarning>
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
              rel="stylesheet"
            />
          </head>
          <body className="font-body antialiased">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </body>
        </html>
      )}
    </I18nProvider>
  );
}
