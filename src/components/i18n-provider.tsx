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
    return (
      <html lang="en">
        <body>
          <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </body>
      </html>
    );
  }
  
  const I18nRoot = ({ children }: { children: React.ReactNode }) => (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      {children}
    </html>
  );

  return (
    <I18nRoot>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nRoot>
  );
}
