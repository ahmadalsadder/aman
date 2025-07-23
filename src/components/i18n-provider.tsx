'use client';
import { useEffect, useState, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Loader2 } from 'lucide-react';

type Locale = 'en' | 'es' | 'ar';
type Direction = 'ltr' | 'rtl';

async function getMessages(locale: Locale) {
  return (await import(`@/messages/${locale}.json`)).default;
}

export function I18nProvider({ children }: { children: (locale: Locale, direction: Direction) => ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const [direction, setDirection] = useState<Direction>('ltr');
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    const storedLocale = (localStorage.getItem('locale') as Locale) || 'en';
    setLocale(storedLocale);
    setDirection(storedLocale === 'ar' ? 'rtl' : 'ltr');
  }, []);

  useEffect(() => {
    if (locale) {
      getMessages(locale).then(setMessages);
    }
  }, [locale]);
  
  // This effect runs on the client and sets the language switcher state
  useEffect(() => {
    const event = new CustomEvent('locale-changed', { detail: locale });
    window.dispatchEvent(event);
  }, [locale]);

  if (!messages) {
    return (
      <html lang="en" dir="ltr">
        <body>
          <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </body>
      </html>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children(locale, direction)}
    </NextIntlClientProvider>
  );
}
