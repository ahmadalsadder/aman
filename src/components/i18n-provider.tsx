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
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    const storedLocale = (localStorage.getItem('locale') as Locale) || 'en';
    setLocale(storedLocale);

    const newDirection = storedLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = storedLocale;
    document.documentElement.dir = newDirection;

    const event = new CustomEvent('locale-changed', { detail: storedLocale });
    window.dispatchEvent(event);
  }, []);

  useEffect(() => {
    if (locale) {
      getMessages(locale).then(setMessages);
    }
  }, [locale]);

  if (!messages) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
