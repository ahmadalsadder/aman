'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Fingerprint, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Background } from '@/components/background';


export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('LoginPage');
  
  const formSchema = z.object({
    email: z.string().min(1, { message: t('usernameRequiredError') }),
    password: z.string().min(1, { message: t('passwordRequiredError') }),
  });

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const { formState } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('unknownError'));
      }
      setLoading(false);
    }
  }

  const handleBiometricLogin = () => {
    toast({
      title: 'Feature Not Available',
      description: 'Biometric login is currently disabled and will be available in a future update.',
    });
  };

  const getFieldStatus = (fieldName: 'email' | 'password') => {
    if (formState.errors[fieldName]) return 'error';
    if (formState.touchedFields[fieldName] && !formState.errors[fieldName]) return 'success';
    return 'default';
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-4">
      <Background />
      <Card className="z-10 w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-bold">{t('titleAman')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('usernameLabel')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="officer.jones" 
                        {...field} 
                        status={getFieldStatus('email')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center justify-between">
                        <FormLabel required>{t('passwordLabel')}</FormLabel>
                        <a href="#" className="text-sm font-medium text-primary hover:underline">
                            {t('forgotPassword')}
                        </a>
                    </div>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder="••••••••"
                        {...field}
                        status={getFieldStatus('password')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>{t('demoCredentials')}</AlertTitle>
                <AlertDescription>
                  {t('demoCredentialsMessage')}
                </AlertDescription>
              </Alert>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t('signingInButton') : t('signInButton')}
              </Button>
            </form>
          </Form>
           <Separator className="my-6" />
           <Button variant="outline" className="w-full" onClick={handleBiometricLogin}>
              <Fingerprint className="mr-2 h-4 w-4" />
              {t('biometricLogin')}
           </Button>
        </CardContent>
      </Card>
    </main>
  );
}
