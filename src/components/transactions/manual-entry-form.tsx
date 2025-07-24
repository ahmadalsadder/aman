
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import type { Passenger } from '@/types/live-processing';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const manualTransactionSchema = z.object({
  passengerId: z.string().min(1, "A passenger must be selected."),
  passportVerified: z.boolean().refine(val => val === true, {
    message: "You must verify the passport."
  }),
  visaVerified: z.boolean(),
  biometricsVerified: z.boolean().refine(val => val === true, {
    message: "You must verify the biometrics."
  }),
  officerNotes: z.string().optional(),
  finalDecision: z.enum(['Approved', 'Rejected', 'Manual Review'], {
    required_error: "A final decision is required."
  }),
});

type FormValues = z.infer<typeof manualTransactionSchema>;

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || 'N/A'}</p>
  </div>
);

export function ManualEntryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);

  useEffect(() => {
    const fetchPassengers = async () => {
        const result = await api.get<Passenger[]>('/data/passengers');
        if (result.isSuccess && result.data) {
            setPassengers(result.data);
        }
    };
    fetchPassengers();
  }, []);

  const passengerOptions = useMemo(() => 
    passengers.map(p => ({
      value: p.id,
      label: `${p.firstName} ${p.lastName} (${p.passportNumber})`
    })), [passengers]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(manualTransactionSchema),
    defaultValues: {
      passengerId: '',
      passportVerified: false,
      visaVerified: false,
      biometricsVerified: false,
      officerNotes: '',
    },
  });

  const passengerId = form.watch('passengerId');

  React.useEffect(() => {
    if (passengerId) {
      const passenger = passengers.find(p => p.id === passengerId) || null;
      setSelectedPassenger(passenger);
      // Reset verification status when passenger changes
      form.resetField('passportVerified');
      form.resetField('visaVerified');
      form.resetField('biometricsVerified');
    } else {
      setSelectedPassenger(null);
    }
  }, [passengerId, form, passengers]);

  const needsVisaCheck = useMemo(() => {
    if (!selectedPassenger) return false;
    // Example logic: UAE nationals don't need visa check
    return selectedPassenger.nationality !== 'United Arab Emirates';
  }, [selectedPassenger]);

  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    console.log("Manual Transaction Data:", data);

    // In a real app, you would submit this to a backend.
    // For now, we'll just simulate a delay and show a success toast.
    setTimeout(() => {
      toast({
        title: "Transaction Recorded",
        description: `The transaction for ${selectedPassenger?.firstName} ${selectedPassenger?.lastName} has been processed with decision: ${data.finalDecision}.`,
        variant: 'success',
      });
      setIsLoading(false);
      router.push('/transactions');
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: Passenger Selection & Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Select Passenger</CardTitle>
                <CardDescription>Find the passenger to process.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="passengerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passenger</FormLabel>
                      <Combobox
                        options={passengerOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a passenger..."
                        searchPlaceholder="Search by name or passport..."
                        noResultsText="No passenger found."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {selectedPassenger && (
              <Card className="animate-in fade-in-50 duration-500">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedPassenger.profilePicture} data-ai-hint="portrait professional" />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedPassenger.firstName} {selectedPassenger.lastName}</CardTitle>
                    <CardDescription>{selectedPassenger.passportNumber}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />
                  <DetailItem label="Nationality" value={selectedPassenger.nationality} />
                  <DetailItem label="Date of Birth" value={selectedPassenger.dateOfBirth} />
                  <DetailItem label="Risk Level" value={selectedPassenger.riskLevel} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: Verification & Decision */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>2. Officer Verification</CardTitle>
                <CardDescription>Manually confirm checks are complete.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="passportVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!selectedPassenger} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Passport Verified</FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  {needsVisaCheck && (
                    <FormField
                      control={form.control}
                      name="visaVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!selectedPassenger} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Visa Verified</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="biometricsVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!selectedPassenger} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Biometrics Verified</FormLabel>
                           <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Final Decision</CardTitle>
                <CardDescription>Record the final outcome and any notes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="officerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Officer Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add any relevant notes..." {...field} disabled={!selectedPassenger} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalDecision"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Final Decision</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                          disabled={!selectedPassenger}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Approved" /></FormControl>
                            <FormLabel className="font-normal">Approve Entry</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Rejected" /></FormControl>
                            <FormLabel className="font-normal">Reject Entry</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="Manual Review" /></FormControl>
                            <FormLabel className="font-normal">Refer to Supervisor (Manual Review)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {selectedPassenger?.riskLevel === 'High' && (
                    <Alert variant="destructive">
                        <AlertTitle>High Risk Passenger</AlertTitle>
                        <AlertDescription>This passenger is flagged as high-risk. Proceed with caution and follow protocol.</AlertDescription>
                    </Alert>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/transactions')}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !selectedPassenger}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Transaction
            </Button>
        </div>
      </form>
    </Form>
  );
}
