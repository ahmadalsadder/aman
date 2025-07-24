
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Transaction, Passenger } from '@/types/live-processing';
import { api } from '@/lib/api';

import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { FlightDetailsCard } from '../components/flight-details-card';
import { VehicleDetailsCard } from '@/app/(modules)/landport/transactions/components/vehicle-details-card';
import { VesselDetailsCard } from '@/app/(modules)/seaport/transactions/components/vessel-details-card';

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    {value != null && <p className="text-sm font-medium">{value}</p>}
    {children}
  </div>
);

const statusConfig: { [key: string]: { icon: React.ElementType, color: string } } = {
  Completed: { icon: CheckCircle2, color: 'text-green-500' },
  Pending: { icon: AlertCircle, color: 'text-yellow-500' },
  Warning: { icon: AlertCircle, color: 'text-yellow-500' },
  Failed: { icon: XCircle, color: 'text-red-500' },
  Skipped: { icon: ChevronRight, color: 'text-muted-foreground' },
};


function TripInformationCard({ transaction }: { transaction: Transaction }) {
    if (!transaction.tripInformation) return null;

    switch (transaction.tripInformation.type) {
        case 'airport':
            return <FlightDetailsCard details={transaction.tripInformation} />;
        case 'landport':
            return <VehicleDetailsCard details={transaction.tripInformation} />;
        case 'seaport':
            return <VesselDetailsCard details={transaction.tripInformation} />;
        default:
            return null;
    }
}

export default function TransactionDetailsPage() {
  const params = useParams<{ id: string, module: string }>();
  const router = useRouter();
  const transactionId = params.id;
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  
  const module = useMemo(() => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[1] || 'airport';
  }, []);

  useEffect(() => {
    if (!transactionId) return;
    const fetchTransaction = async () => {
        setLoading(true);
        const result = await api.get<{ transaction: Transaction }>(`/data/transactions/${transactionId}`);
        if(result.isSuccess && result.data) {
            setTransaction(result.data.transaction);
        } else {
            setTransaction(null);
        }
        setLoading(false);
    }
    fetchTransaction();
  }, [transactionId]);


  const documentImages = useMemo(() => {
    if (!transaction?.passportScan) return [];
    return [
      { name: 'Passport Photo', url: transaction.passportScan, hint: 'passport photo id' },
    ].filter(doc => doc.url);
  }, [transaction]);

  const biometricImages = useMemo(() => {
    if (!transaction?.biometrics) return [];
    return [
      { name: 'Face Scan', url: transaction.biometrics.face, hint: 'face scan' },
      { name: 'Left Iris', url: transaction.biometrics.leftIris, hint: 'left iris scan' },
      { name: 'Right Iris', url: transaction.biometrics.rightIris, hint: 'right iris scan' },
      { name: 'Fingerprint', url: transaction.biometrics.fingerprint, hint: 'fingerprint scan' },
    ].filter(doc => doc.url);
  }, [transaction]);
  
  const allDocuments = useMemo(() => [...documentImages, ...biometricImages], [documentImages, biometricImages]);

  const [mainDocument, setMainDocument] = useState<any>(null);
  
  useEffect(() => {
    if (allDocuments.length > 0 && !mainDocument) {
      setMainDocument(allDocuments[0]);
    }
  }, [allDocuments, mainDocument]);

  if (loading) {
    return (
       <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle>Transaction Not Found</CardTitle>
          <CardDescription>The requested transaction does not exist.</CardDescription>
          <Button onClick={() => router.push(`/${module}/transactions`)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
        </Card>
      </div>
    );
  }

  const transactionStatusBadge: {[key: string]: string} = {
    Completed: 'bg-green-500/80 text-white border-green-600',
    'In Progress': 'bg-blue-500/80 text-white border-blue-600',
    Failed: 'bg-red-500/80 text-white border-red-600',
    Pending: 'bg-yellow-500/80 text-black border-yellow-600',
  };

  const riskBadge: {[key: string]: string} = {
    Low: 'bg-green-500 text-white',
    Medium: 'bg-yellow-500 text-black',
    High: 'bg-red-500 text-white',
  };

  const getRiskLevel = (score: number): keyof typeof riskBadge => {
    if (score > 75) return 'High';
    if (score > 40) return 'Medium';
    return 'Low';
  };
  const riskLevel = getRiskLevel(transaction.riskScore);
  const passenger = transaction?.passenger as Passenger | undefined;

  return (
    <div className="flex flex-col gap-6">
      <GradientPageHeader
        title={`Entry_${transaction.id}`}
        description="Transaction Details"
        icon={FileText}
      >
        <div className="flex gap-2">
            <Badge className={cn("border-transparent", transactionStatusBadge[transaction.status])}>{transaction.status}</Badge>
            <Badge className="border-white/30 bg-white/20 text-white">{transaction.entranceType}</Badge>
        </div>
      </GradientPageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader><CardTitle>Workflow Steps</CardTitle></CardHeader>
            <CardContent>
               <ul className="space-y-0">
                {transaction.workflow?.map((step: any, index: number) => {
                  const config = statusConfig[step.status];
                  const isLastStep = index === (transaction.workflow?.length ?? 0) - 1;
                  return (
                    <li key={step.id} className="relative flex gap-4 pb-8">
                      {!isLastStep && <div className="absolute left-4 top-5 -translate-x-1/2 h-full w-px bg-border" />}
                      <div className={cn("relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                          step.status === 'Completed' ? 'bg-green-100 dark:bg-green-900' :
                          step.status === 'Warning' || step.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          step.status === 'Failed' ? 'bg-red-100 dark:bg-red-900' : 
                          step.status === 'Skipped' ? 'bg-gray-100 dark:bg-gray-700' : ''
                      )}>
                          {config ? <step.Icon className={cn("h-5 w-5", config.color)} /> : <step.Icon className="h-5 w-5" />}
                      </div>
                      <div className="flex-grow pt-1">
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs text-muted-foreground">{step.timestamp}</p>
                      </div>
                    </li>
                  )
                }) ?? <p className="text-sm text-muted-foreground">No workflow steps available.</p>}
              </ul>
            </CardContent>
          </Card>
          <TripInformationCard transaction={transaction} />
        </div>

        {/* Middle Column */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader><CardTitle>Document Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center rounded-lg border bg-muted p-4 h-96">
                {mainDocument?.url ? (
                  <Image src={mainDocument.url} alt={mainDocument.name} width={400} height={300} className="max-h-full w-auto object-contain" data-ai-hint={mainDocument.hint} />
                ) : <p className="text-muted-foreground">No document selected</p>}
              </div>
              <p className="text-center text-sm text-muted-foreground">{mainDocument?.name ? `${mainDocument.name} - Click thumbnail to view` : ''}</p>
              
              {documentImages.length > 0 && (
                  <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Document Images</h4>
                      <div className="relative px-12">
                          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                              <CarouselContent>
                                  {documentImages.map((doc: any, index) => (
                                      <CarouselItem key={index} className="basis-1/3 md:basis-1/4">
                                          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setMainDocument(doc)}>
                                              <Image src={doc.url!} alt={doc.name} width={150} height={100} className={cn("rounded-md border-2 object-cover aspect-[3/2]", mainDocument?.name === doc.name ? 'border-primary' : 'border-transparent')} data-ai-hint={doc.hint} />
                                              <span className="text-xs text-center text-muted-foreground">{doc.name}</span>
                                          </div>
                                      </CarouselItem>
                                  ))}
                              </CarouselContent>
                              <CarouselPrevious />
                              <CarouselNext />
                          </Carousel>
                      </div>
                  </div>
              )}

              {biometricImages.length > 0 && (
                  <div className="space-y-2">
                      <Separator className="my-4" />
                      <h4 className="font-medium text-sm text-muted-foreground">Biometric Images</h4>
                       <div className="relative px-12">
                          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                              <CarouselContent>
                                  {biometricImages.map((doc: any, index) => (
                                      <CarouselItem key={index} className="basis-1/3 md:basis-1/4">
                                          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setMainDocument(doc)}>
                                              <Image src={doc.url!} alt={doc.name} width={150} height={100} className={cn("rounded-md border-2 object-cover aspect-[3/2]", mainDocument?.name === doc.name ? 'border-primary' : 'border-transparent')} data-ai-hint={doc.hint} />
                                              <span className="text-xs text-center text-muted-foreground">{doc.name}</span>
                                          </div>
                                      </CarouselItem>
                                  ))}
                              </CarouselContent>
                              <CarouselPrevious />
                              <CarouselNext />
                          </Carousel>
                      </div>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-4">
          {passenger && (
            <Card>
              <CardHeader className="items-center text-center">
                  <Avatar className="h-20 w-20 mb-2">
                      <AvatarImage src={passenger.profilePicture} alt={passenger.firstName} data-ai-hint="portrait professional" />
                      <AvatarFallback><User className="h-10 w-10"/></AvatarFallback>
                  </Avatar>
                  <CardTitle>{passenger.firstName} {passenger.lastName}</CardTitle>
                  <Button asChild size="sm" disabled>
                    <Link href={`/${module}/passengers/${passenger.id}/edit`}>View Passenger Profile</Link>
                  </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <DetailItem label="Passport Number" value={passenger.passportNumber} />
                <DetailItem label="Nationality" value={passenger.nationality} />
                <DetailItem label="Date of Birth" value={passenger.dateOfBirth} />
                <DetailItem label="Gender" value={passenger.gender} />
              </CardContent>
            </Card>
          )}
           <Card>
            <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-center">
                <Badge className={cn("text-lg", riskBadge[riskLevel])}>{riskLevel} Risk ({transaction.riskScore})</Badge>
                <Progress value={transaction.riskScore} />
                <p className="text-sm text-muted-foreground">Processing Duration: {transaction.duration}</p>
                 <Separator />
                <div className="text-left space-y-2 pt-2">
                    <p className="text-sm font-medium">Triggered Rules:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {transaction.triggeredRules?.map((rule, i) => <li key={i}>{rule.alert}</li>) ?? <li>No rules triggered.</li>}
                    </ul>
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Officer Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">"{transaction.notes || 'No notes provided.'}"</p>
              {transaction.officerName && <p className="text-right text-xs font-semibold mt-2">- {transaction.officerName}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-start items-center mt-4">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Transactions
        </Button>
      </div>
    </div>
  );
}
