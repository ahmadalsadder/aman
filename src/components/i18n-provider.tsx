
'use client';
import { useEffect, useState, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Loader2 } from 'lucide-react';

type Locale = 'en' | 'es' | 'ar';

async function getMessages(locale: Locale) {
  return (await import(`@/messages/${locale}.json`)).default;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const storedLocale = (localStorage.getItem('locale') as Locale) || 'en';
    setLocale(storedLocale);
  }, []);

  useEffect(() => {
    if (locale) {
      const newDirection = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
      document.documentElement.dir = newDirection;
      getMessages(locale).then(setMessages);
      const event = new CustomEvent('locale-changed', { detail: locale });
      window.dispatchEvent(event);
    }
  }, [locale]);

  if (!messages) {
    // Only render a loading spinner (NO <html> or <body> here)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // No <html> or <body> in client component!
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
