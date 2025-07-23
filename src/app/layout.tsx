import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/i18n-provider';
import { LoaderProvider } from '@/components/loader-provider';
import { GlobalLoader } from '@/components/global-loader';

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
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Readex+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <I18nProvider>
          <AuthProvider>
            <LoaderProvider>
              <GlobalLoader />
              {children}
              <Toaster />
            </LoaderProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
