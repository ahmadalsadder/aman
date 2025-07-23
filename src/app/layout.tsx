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
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </I18nProvider>
  );
}
