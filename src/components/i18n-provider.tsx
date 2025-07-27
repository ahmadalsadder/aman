'use client';
import { useEffect, useState, ReactNode } from 'react';
import { NextIntlClientProvider, useLocale, useTranslations } from 'next-intl';
import { Loader2, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

type Locale = 'en' | 'es' | 'ar';

async function getMessages(locale: Locale) {
  return (await import(`@/messages/${locale}.json`)).default;
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations('Header');

  const handleLocaleChange = (newLocale: string) => {
    localStorage.setItem('locale', newLocale);
    // This will cause a full page reload, which is necessary to re-render with the new locale from the root
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ar">العربية</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
