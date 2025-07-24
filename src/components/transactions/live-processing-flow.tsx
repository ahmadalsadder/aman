
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import type { Passenger, Transaction, WorkflowStep, TripInformation } from '@/types/live-processing';
import { useAuth } from '@/hooks/use-auth';
import { countries } from '@/lib/countries';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import {
  Loader2,
  User,
  CheckCircle2,
  XCircle,
  Hourglass,
  ChevronRight,
  Trash,
  Camera,
  FileImage,
  ShieldAlert,
  RefreshCw,
  Scan,
  UserCheck,
  ScanLine,
  ArrowLeft,
  ScanFace,
  ScanEye,
  Fingerprint,
  Users,
  FileWarning,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import type { Module } from '@/types';
import { FlightDetailsCard } from '@/app/(modules)/airport/transactions/components/flight-details-card';
import { VehicleDetailsCard } from '@/app/(modules)/landport/transactions/components/vehicle-details-card';
import { VesselDetailsCard } from '@/app/(modules)/seaport/transactions/components/vessel-details-card';
import { extractPassportData } from '@/ai/flows/extract-passport-data-flow';

type ProcessingStep = 'upload_document' | 'confirm_new_passenger' | 'capture_photo' | 'analyzing' | 'review' | 'completed';
type UpdateChoice = 'update_all' | 'update_images';
type InternalWorkflowStatus = 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

function ScanCard({ title, onScan, scannedImage, onClear, disabled, loading }: { title: string; onScan: (file: File) => void, scannedImage?: string | null, onClear: () => void, disabled?: boolean, loading?: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations('LiveProcessingFlow');

    return (
        <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center">
            <input type="file" ref={inputRef} onChange={(e) => e.target.files && onScan(e.target.files[0])} className="hidden" accept="image/*" />
            
            <div className="flex h-32 w-full items-center justify-center rounded-md bg-secondary">
                {scannedImage ? <Image src={scannedImage} alt={`${title} preview`} width={160} height={120} className="h-32 w-auto rounded-md object-contain" /> : <ScanLine className="h-12 w-12 text-muted-foreground" />}
            </div>

            {scannedImage && <p className="text-sm font-medium">{t('scanCard.preview', { title })}</p>}
            
            <div className="w-full space-y-2">
                <Button type="button" size="lg" onClick={() => inputRef.current?.click()} disabled={disabled || loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                    {scannedImage ? t('scanCard.rescan') : t('scanCard.scan')}
                </Button>
                {scannedImage && <Button type="button" variant="ghost" size="sm" onClick={onClear} className="w-full">{t('scanCard.clear')}</Button>}
            </div>
        </div>
    )
}

function CaptureCard({ title, icon: Icon, onCapture, capturedImage, onClear, disabled }: { title: string; icon: React.ElementType, onCapture: () => void, capturedImage?: string | null, onClear: () => void, disabled?: boolean }) {
    const t = useTranslations('LiveProcessingFlow');
    return (
        <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-secondary">
                {capturedImage ? (
                    <Image src={capturedImage} alt={`${title} preview`} width={64} height={64} className="h-16 w-16 rounded-md object-cover" />
                ) : (
                    <Icon className="h-8 w-8 text-muted-foreground" />
                )}
            </div>
            <p className="text-sm font-medium">{title}</p>
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onCapture} disabled={disabled}>
                    <Camera className="mr-2 h-4 w-4" />
                    {capturedImage ? t('captureCard.retake') : t('captureCard.capture')}
                </Button>
                {capturedImage && (
                    <Button type="button" variant="destructive" size="icon" onClick={onClear}>
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || 'N/A'}</p></div>
);

export function LiveProcessingFlow({ module }: { module: Module }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const t = useTranslations('LiveProcessingFlow');
  
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload_document');
  const [workflow, setWorkflow] = useState<{ id: string, name: string, status: InternalWorkflowStatus, Icon: React.ElementType }[]>([]);

  const [selectedPassenger, setSelectedPassenger] = useState<Partial<Passenger> | null>(null);
  const [existingPassenger, setExistingPassenger] = useState<Passenger | null>(null);
  const [updateChoice, setUpdateChoice] = useState<UpdateChoice | null>(null);
  
  const [visaCheckResult, setVisaCheckResult] = useState<'valid' | 'invalid' | 'not_required' | null>(null);

  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [passportScan, setPassportScan] = useState<string | null>(null);
  
  const [biometricCaptures, setBiometricCaptures] = useState<{
    face: string | null;
    leftIris: string | null;
    rightIris: string | null;
    fingerprint: string | null;
  }>({
    face: null,
    leftIris: null,
    rightIris: null,
    fingerprint: null,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [finalDecision, setFinalDecision] = useState<'Approved' | 'Rejected' | ''>('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [approvedAlerts, setApprovedAlerts] = useState<Record<string, boolean>>({});
  const [tripInfo, setTripInfo] = useState<TripInformation | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isWorkflowVisible = workflow.length > 0;
  
  const addLog = useCallback((message: string) => { console.log(message) }, []);

  const resetState = () => {
    setCurrentStep('upload_document');
    setWorkflow([]);
    setSelectedPassenger(null);
    setExistingPassenger(null);
    setUpdateChoice(null);
    setVisaCheckResult(null);
    setExtractedData(null);
    setPassportScan(null);
    setBiometricCaptures({ face: null, leftIris: null, rightIris: null, fingerprint: null });
    setAiResult(null);
    setFinalDecision('');
    setOfficerNotes('');
    setApprovedAlerts({});
  }
  
  const updateStepStatus = useCallback((stepId: string, status: InternalWorkflowStatus) => {
    setWorkflow(prev => prev.map(step => step.id === stepId ? { ...step, status } : step));
  }, []);

  const handlePassportScan = async (file: File) => {
    setIsScanning(true);
    addLog('Scanning passport photo...');
    try {
        const dataUri = await fileToDataUri(file);
        setPassportScan(dataUri);
        
        const extracted = await extractPassportData({ passportPhotoDataUri: dataUri });
        if (!extracted) {
            throw new Error('AI extraction returned no data.');
        }

        setExtractedData(extracted);
        setCurrentStep('confirm_new_passenger');
        addLog(`Passport scan captured and data extracted. Waiting for confirmation to proceed.`);

    } catch (error) {
        console.error("Data URI or Extraction Error:", error);
        toast({ variant: 'destructive', title: t('toast.extractionFailedTitle'), description: t('toast.extractionFailedDescription') });
    } finally {
        setIsScanning(false);
    }
}

  const handleCapture = (biometricType: keyof typeof biometricCaptures) => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            toast({
                variant: 'destructive',
                title: t('toast.cameraErrorTitle'),
                description: t('toast.cameraErrorDescription')
            });
            return;
        }

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const dataUri = canvas.toDataURL('image/jpeg', 0.8);
          setBiometricCaptures(prev => ({...prev, [biometricType]: dataUri}));
          addLog(`Captured ${biometricType}.`);
        }
    }
  };
  
  const handleClearBiometric = (biometricType: keyof typeof biometricCaptures) => {
    setBiometricCaptures(prev => ({...prev, [biometricType]: null}));
  }

  const handleStartAnalysis = async () => {
    if (!passportScan || !biometricCaptures.face) {
      toast({ variant: 'destructive', title: t('toast.missingInfoTitle'), description: t('toast.missingInfoDescription') });
      return;
    }
    setCurrentStep('analyzing');
    addLog('Starting comprehensive analysis via API...');
  
    try {
      const apiResponse = await api.post('/api/process-transaction', {
        module: module,
        passportScan,
        livePhoto: biometricCaptures.face,
      });
  
      if (apiResponse.isSuccess && apiResponse.data) {
        const { riskResult, existingPassenger, visaCheckResult, workflow, extractedData, tripInformation } = apiResponse.data as any;
  
        setAiResult(riskResult);
        setExtractedData(extractedData);
        setExistingPassenger(existingPassenger || null);
        setVisaCheckResult(visaCheckResult);
        setWorkflow(workflow);
        setTripInfo(tripInformation || null);
  
        let passengerForDisplay: Partial<Passenger> = {
            ...extractedData,
            nationality: countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality,
            passportCountry: countries.find(c => c.value === extractedData.passportCountry)?.label || extractedData.passportCountry,
            profilePicture: passportScan || '',
        };

        if (existingPassenger) {
            passengerForDisplay = { ...passengerForDisplay, ...existingPassenger };
        }
        setSelectedPassenger(passengerForDisplay);
  
        if (riskResult.alerts.length > 0) {
          setFinalDecision('Rejected');
        }
  
        setCurrentStep('review');
        addLog('API analysis complete. Ready for officer review.');
      } else {
        throw new Error(apiResponse.errors?.[0]?.message || 'API call failed');
      }
    } catch (error) {
      console.error("API Analysis Error:", error);
      toast({ variant: 'destructive', title: t('toast.analysisFailedTitle') });
      setCurrentStep('capture_photo');
    }
  };

  const saveTransactionAndPassenger = useCallback(async (decision: 'Approved' | 'Rejected' | 'Manual Review', status: 'Completed' | 'Failed' | 'Pending', passengerToSave: Partial<Passenger>) => {
    if(!passengerToSave || (!aiResult && status !== 'Pending' && decision !== 'Manual Review') || !extractedData) {
        toast({ variant: 'destructive', title: t('toast.missingDataTitle'), description: t('toast.missingDataDescription') });
        return null;
    }
    
    const riskScore = aiResult ? aiResult.riskScore : (visaCheckResult === 'invalid' ? 75 : 50);
    const triggeredRules = aiResult ? aiResult.alerts.map((alert: string) => ({ alert, acknowledged: approvedAlerts[alert] || false })) : (visaCheckResult === 'invalid' ? [{alert: t('alert.visaRequired'), acknowledged: false}] : []);
    const finalNotes = officerNotes || (status === 'Pending' ? t('alert.escalatedNotes') : '');
    
    const finalWorkflow: WorkflowStep[] = workflow.map(step => ({
        id: step.id,
        name: step.name,
        status: step.status === 'in-progress' ? 'Pending' :
                step.status === 'failed' ? 'Failed' :
                step.status === 'skipped' ? 'Skipped' : 'Completed',
        timestamp: new Date().toLocaleString(),
    }));

    const transactionData = {
        passenger: passengerToSave,
        decision,
        status,
        riskScore,
        triggeredRules,
        notes: finalNotes,
        workflow: finalWorkflow,
        updateChoice: updateChoice,
        biometrics: biometricCaptures,
        passportScan: passportScan,
        officer: user?.fullName,
        tripInformation: tripInfo
    };
    
    const result = await api.post('/data/transactions', transactionData);

    if (result.isSuccess) {
        return result.data as Transaction;
    } else {
        toast({ title: t('toast.saveFailedTitle'), description: result.errors?.[0]?.message || t('toast.saveFailedDescription'), variant: 'destructive' });
        return null;
    }
  }, [updateChoice, extractedData, passportScan, biometricCaptures, workflow, officerNotes, user, aiResult, visaCheckResult, approvedAlerts, t, tripInfo]);

  const handleCompleteTransaction = async () => {
    if(!finalDecision) {
        toast({ variant: 'destructive', title: t('toast.decisionRequiredTitle'), description: t('toast.decisionRequiredDescription') });
        return;
    }
    const status = finalDecision === 'Approved' ? 'Completed' : 'Failed';
    const transaction = await saveTransactionAndPassenger(finalDecision, status, selectedPassenger!);
    
    if (transaction) {
      updateStepStatus('officer_review', 'completed');
      addLog(`Transaction completed by officer. Decision: ${finalDecision}.`);
      setCurrentStep('completed');
      toast({ variant: 'success', title: t('toast.transactionCompleteTitle'), description: t('toast.transactionCompleteDescription', { decision: finalDecision })});
    }
  }
  
  const handleTransferToDutyManager = async () => {
    let passengerRecord = selectedPassenger;
  
    if (!passengerRecord && extractedData) {
      const countryLabel = countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality;
      const passportCountryLabel = countries.find(c => c.value === extractedData.passportCountry)?.label || extractedData.passportCountry;
      passengerRecord = {
        id: `P${Date.now()}`,
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        passportNumber: extractedData.passportNumber,
        nationality: countryLabel,
        dateOfBirth: extractedData.dateOfBirth,
        passportIssueDate: extractedData.passportIssueDate,
        passportExpiryDate: extractedData.passportExpiryDate,
        passportCountry: passportCountryLabel,
        gender: extractedData.gender,
        riskLevel: 'Low',
        profilePicture: passportScan || '',
      };
    }
  
    if (passengerRecord) {
      const transaction = await saveTransactionAndPassenger('Manual Review', 'Pending', passengerRecord);
      if (transaction) {
        toast({ title: t('toast.transferredTitle'), description: t('toast.transferredDescription', { id: transaction.id }) });
        router.push('/duty-manager');
      }
    } else {
      toast({ variant: 'destructive', title: t('toast.missingDataTitle'), description: t('toast.transferFailedDescription') });
    }
  };

  const handleAcknowledgeAlert = (alert: string) => {
    const newApprovedAlerts = { ...approvedAlerts, [alert]: true };
    setApprovedAlerts(newApprovedAlerts);
  
    if (aiResult && Object.keys(newApprovedAlerts).length === aiResult.alerts.length) {
      if (finalDecision === 'Rejected') {
          setFinalDecision('Approved');
      }
    }
  };

  const handleBackToCapture = () => {
    setApprovedAlerts({});
    setCurrentStep('capture_photo');
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCamera = async () => {
        if (currentStep === 'capture_photo') {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
                setHasCameraPermission(true);
            } catch (err) {
                setHasCameraPermission(false);
                toast({ variant: 'destructive', title: t('toast.cameraDeniedTitle') });
            }
        }
    };
    getCamera();
    return () => {
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [currentStep, toast, t]);
  
  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const allAlertsAcknowledged = aiResult ? aiResult.alerts.every((alert: string) => approvedAlerts[alert]) : true;
  const hardStop = visaCheckResult === 'invalid';

  const renderContent = () => {
    switch (currentStep) {
        case 'upload_document':
            return (
                <motion.div {...motionProps} key="scan">
                    <CardHeader><CardTitle>{t('uploadDocument.title')}</CardTitle><CardDescription>{t('uploadDocument.description')}</CardDescription></CardHeader>
                    <CardContent>
                        <ScanCard title={t('uploadDocument.passport')} onScan={handlePassportScan} scannedImage={passportScan} onClear={() => setPassportScan(null)} loading={isScanning} />
                    </CardContent>
                </motion.div>
            )
        case 'confirm_new_passenger':
            if (!extractedData) return null;
            return (
                <motion.div {...motionProps} key="confirm">
                    <CardHeader><CardTitle>{t('confirmNew.title')}</CardTitle><CardDescription>{t('confirmNew.description')}</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                             <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16"><AvatarImage src={passportScan || ''} data-ai-hint="portrait professional" /><AvatarFallback><User /></AvatarFallback></Avatar>
                                <div><CardTitle>{extractedData.firstName} {extractedData.lastName}</CardTitle><CardDescription>{extractedData.passportNumber}</CardDescription></div>
                            </CardHeader>
                             <CardContent className="grid grid-cols-2 gap-4 pt-4">
                                <DetailItem label={t('common.firstName')} value={extractedData.firstName} />
                                <DetailItem label={t('common.lastName')} value={extractedData.lastName} />
                                <DetailItem label={t('common.passportNo')} value={extractedData.passportNumber} />
                                <DetailItem label={t('common.nationality')} value={countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality} />
                                <DetailItem label={t('common.dob')} value={extractedData.dateOfBirth} />
                                <DetailItem label={t('common.gender')} value={extractedData.gender} />
                                <DetailItem label={t('common.issuingCountry')} value={countries.find(c => c.value === extractedData.passportCountry)?.label || extractedData.passportCountry} />
                                <DetailItem label={t('common.issueDate')} value={extractedData.passportIssueDate} />
                                <DetailItem label={t('common.expiryDate')} value={extractedData.passportExpiryDate} />
                            </CardContent>
                        </Card>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button className="w-full" onClick={() => setCurrentStep('capture_photo')}>
                                {t('common.confirmAndProceed')} <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="destructive" className="w-full" onClick={() => resetState()}>
                                <XCircle className="mr-2 h-4 w-4" /> {t('common.cancelTransaction')}
                            </Button>
                        </div>
                    </CardContent>
                </motion.div>
            )
        case 'capture_photo':
            return (
                <motion.div {...motionProps} key="capture">
                    <CardHeader><CardTitle>{t('capturePhoto.title')}</CardTitle><CardDescription>{t('capturePhoto.description')}</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            {!hasCameraPermission && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md"><p className="text-white">{t('capturePhoto.cameraNotAvailable')}</p></div>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <CaptureCard title={t('capturePhoto.faceScan')} icon={ScanFace} onCapture={() => handleCapture('face')} capturedImage={biometricCaptures.face} onClear={() => handleClearBiometric('face')} disabled={!hasCameraPermission} />
                            <CaptureCard title={t('capturePhoto.leftIris')} icon={ScanEye} onCapture={() => handleCapture('leftIris')} capturedImage={biometricCaptures.leftIris} onClear={() => handleClearBiometric('leftIris')} disabled={!hasCameraPermission} />
                            <CaptureCard title={t('capturePhoto.rightIris')} icon={ScanEye} onCapture={() => handleCapture('rightIris')} capturedImage={biometricCaptures.rightIris} onClear={() => handleClearBiometric('rightIris')} disabled={!hasCameraPermission} />
                            <CaptureCard title={t('capturePhoto.fingerprint')} icon={Fingerprint} onCapture={() => handleCapture('fingerprint')} capturedImage={biometricCaptures.fingerprint} onClear={() => handleClearBiometric('fingerprint')} disabled={!hasCameraPermission}/>
                        </div>
                        <div className="space-y-2">
                            <Button className="w-full" disabled={!biometricCaptures.face} onClick={handleStartAnalysis}>
                                {t('capturePhoto.next')} <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                             <div className="flex flex-col sm:flex-row gap-2">
                                <Button variant="outline" className="w-full" onClick={() => setCurrentStep('confirm_new_passenger')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('common.back')}
                                </Button>
                                <Button variant="destructive" className="w-full" onClick={resetState}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {t('common.cancelTransaction')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </motion.div>
            )
        case 'analyzing':
            return (
                <motion.div {...motionProps} key="analyzing" className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Scan className="h-16 w-16 animate-pulse text-primary" />
                    <h2 className="mt-4 text-xl font-semibold">{t('analyzing.title')}</h2>
                    <p className="text-muted-foreground">{t('analyzing.description')}</p>
                </motion.div>
            )
        case 'review':
            if (!aiResult) return null;
            return (
                <motion.div {...motionProps} key="review">
                    <CardHeader>
                        <CardTitle>{t('review.title')}</CardTitle>
                        <CardDescription>{t('review.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {existingPassenger && (
                             <Card className="bg-secondary/30">
                                <CardHeader><CardTitle className="text-base">{t('matchFound.existingRecord')}</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     <div className="space-y-2 rounded-md border p-4">
                                       <h4 className="font-semibold">{t('matchFound.chooseAction')}</h4>
                                       <p className="text-sm text-muted-foreground">{t('matchFound.chooseActionDescription')}</p>
                                       <RadioGroup onValueChange={(v) => setUpdateChoice(v as any)} defaultValue={updateChoice || 'update_images'} className="flex flex-col gap-2 pt-2">
                                         <Label htmlFor="update_all" className="flex items-center gap-2 rounded-md border p-3 flex-1 has-[input:checked]:border-primary"><RadioGroupItem value="update_all" id="update_all" /> {t('matchFound.updateAll')}</Label>
                                         <Label htmlFor="update_images" className="flex items-center gap-2 rounded-md border p-3 flex-1 has-[input:checked]:border-primary"><RadioGroupItem value="update_images" id="update_images" /> {t('matchFound.updateImages')}</Label>
                                       </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="bg-secondary/50">
                            <CardHeader><CardTitle className="text-lg">{t('review.aiAssessment')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>{t('review.riskScore')}</Label>
                                    <div className="flex items-center gap-4">
                                        <Progress value={aiResult?.riskScore} className="h-4" />
                                        <span className="font-bold text-lg">{aiResult?.riskScore}</span>
                                    </div>
                                </div>
                                <DetailItem label={t('review.aiRecommendation')} value={aiResult?.recommendation} />
                                <DetailItem label={t('review.assessmentSummary')} value={aiResult?.assessment} />
                                {aiResult?.alerts && aiResult.alerts.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="font-semibold">{t('review.alerts.title')}</Label>
                                        {aiResult.alerts.map((alert: string, i: number) => (
                                            <div key={`alert-${i}`} className="flex items-center gap-2">
                                                <Alert variant={aiResult.riskScore > 50 ? 'destructive' : 'default'} className="flex-grow flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <ShieldAlert className="h-4 w-4" />
                                                        <AlertTitle>{alert}</AlertTitle>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant={approvedAlerts[alert] ? "secondary" : "outline"}
                                                        onClick={() => handleAcknowledgeAlert(alert)}
                                                        disabled={approvedAlerts[alert] || hardStop}
                                                        className="ml-4"
                                                    >
                                                        {approvedAlerts[alert] ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                                                        {approvedAlerts[alert] ? t('review.alerts.acknowledged') : t('review.alerts.acknowledge')}
                                                    </Button>
                                                </Alert>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <div className="space-y-4">
                            <Textarea placeholder={t('review.notesPlaceholder')} value={officerNotes} onChange={(e) => setOfficerNotes(e.target.value)} />
                            
                            {hardStop ? (
                                <>
                                    <Alert variant="destructive">
                                        <FileWarning className="h-4 w-4" />
                                        <AlertTitle>{t('alert.missingVisaTitle')}</AlertTitle>
                                        <AlertDescription>{t('alert.missingVisaDescription')}</AlertDescription>
                                    </Alert>
                                    <Button className="w-full" variant="default" onClick={handleTransferToDutyManager}>
                                        <ShieldAlert className="mr-2 h-4 w-4" /> {t('matchFound.transfer')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <RadioGroup onValueChange={(v) => setFinalDecision(v as any)} value={finalDecision}>
                                        <Label className="font-semibold">{t('review.finalDecision')}</Label>
                                        <div className="flex gap-4">
                                            <Label htmlFor="approve" className="flex items-center gap-2 rounded-md border p-3 flex-1 has-[input:checked]:border-primary"><RadioGroupItem value="Approved" id="approve" /> {t('review.approve')}</Label>
                                            <Label htmlFor="reject" className="flex items-center gap-2 rounded-md border p-3 flex-1 has-[input:checked]:border-destructive"><RadioGroupItem value="Rejected" id="reject" /> {t('review.reject')}</Label>
                                        </div>
                                    </RadioGroup>
                                    <div className="flex flex-col gap-2 sm:flex-row-reverse">
                                        <Button className="w-full sm:flex-1" onClick={handleCompleteTransaction} disabled={!finalDecision || !allAlertsAcknowledged}>
                                            {t('review.complete')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" className="w-full" onClick={handleBackToCapture}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('review.backToCapture')}
                            </Button>
                             <Button variant="destructive" className="w-full" onClick={resetState}>
                                <XCircle className="mr-2 h-4 w-4" />
                                {t('common.cancelTransaction')}
                            </Button>
                        </div>
                    </CardContent>
                </motion.div>
            )
         case 'completed':
            return (
                <motion.div {...motionProps} key="completed" className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h2 className="mt-4 text-xl font-semibold">{t('completed.title')}</h2>
                    <p className="text-muted-foreground">{t('completed.description')}</p>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={resetState}><RefreshCw className="mr-2 h-4 w-4" /> {t('completed.startNew')}</Button>
                        <Button variant="outline" asChild><Link href="/transactions">{t('completed.viewAll')}</Link></Button>
                    </div>
                </motion.div>
            )
    }
  }

  const statusIcon = (status: InternalWorkflowStatus) => {
    switch (status) {
        case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'in-progress': return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
        case 'failed': return <XCircle className="h-5 w-5 text-destructive" />;
        case 'skipped': return <CheckCircle2 className="h-5 w-5 text-muted-foreground" />;
        case 'pending':
        default:
            return <Hourglass className="h-5 w-5 text-muted-foreground" />;
    }
  }
  
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isWorkflowVisible && (
            <div className="lg:col-span-1 space-y-6">
                <Card className="animate-in fade-in-50 duration-500">
                    <CardHeader>
                        <CardTitle>{t('workflow.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-0">
                            {workflow.map((step, index) => {
                            const isLastStep = index === workflow.length - 1;
                            const isActive = workflow[index].status !== 'pending' && (isLastStep || workflow[index + 1].status === 'pending');
                            return (
                                <li key={step.id} className="relative flex gap-4 pb-8">
                                {!isLastStep && <div className="absolute left-4 top-5 -translate-x-1/2 h-full w-px bg-border" />}
                                <div className={cn("relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-secondary")}>
                                    {statusIcon(step.status)}
                                </div>
                                <div className="flex-grow pt-1">
                                    <p className={cn("font-medium text-sm", isActive && 'text-primary')}>{step.name}</p>
                                    {step.status === 'skipped' && <p className="text-xs text-muted-foreground italic">{t('workflow.skipped')}</p>}
                                </div>
                                </li>
                            )
                            })}
                        </ul>
                    </CardContent>
                </Card>
                {extractedData && (
                    <Card className="animate-in fade-in-50 duration-500">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16"><AvatarImage src={passportScan || ''} data-ai-hint="portrait professional" /><AvatarFallback><User /></AvatarFallback></Avatar>
                            <div><CardTitle>{extractedData.firstName} {extractedData.lastName}</CardTitle><CardDescription>{extractedData.passportNumber}</CardDescription></div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <DetailItem label={t('common.nationality')} value={countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality} />
                            <DetailItem label={t('common.riskLevel')} value={selectedPassenger?.riskLevel || 'N/A'} />
                        </CardContent>
                    </Card>
                )}
                {tripInfo && module === 'airport' && <FlightDetailsCard details={tripInfo} />}
                {tripInfo && module === 'landport' && <VehicleDetailsCard details={tripInfo} />}
                {tripInfo && module === 'seaport' && <VesselDetailsCard details={tripInfo} />}
            </div>
        )}

        <div className={cn(isWorkflowVisible ? "lg:col-span-2" : "lg:col-span-3")}>
            <Card className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </Card>
        </div>
    </div>
  );
}
