
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import type { Passenger, Transaction, WorkflowStep } from '@/types/live-processing';
import { assessPassengerRisk, type AssessPassengerRiskOutput } from '@/ai/flows/assess-risk-flow';
import { extractPassportData, type PassportDataOutput } from '@/ai/flows/extract-passport-data-flow';
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

type ProcessingStep = 'upload_document' | 'confirm_new_passenger' | 'match_found' | 'capture_photo' | 'analyzing' | 'review' | 'completed';
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

const NATIONALITIES_REQUIRING_VISA = ['Jordan'];

function ScanCard({ title, onScan, scannedImage, onClear, disabled, loading }: { title: string; onScan: (file: File) => void, scannedImage?: string | null, onClear: () => void, disabled?: boolean, loading?: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center">
            <input type="file" ref={inputRef} onChange={(e) => e.target.files && onScan(e.target.files[0])} className="hidden" accept="image/*" />
            
            <div className="flex h-32 w-full items-center justify-center rounded-md bg-secondary">
                {scannedImage ? <Image src={scannedImage} alt={`${title} preview`} width={160} height={120} className="h-32 w-auto rounded-md object-contain" /> : <ScanLine className="h-12 w-12 text-muted-foreground" />}
            </div>

            {scannedImage && <p className="text-sm font-medium">{title} Preview</p>}
            
            <div className="w-full space-y-2">
                <Button type="button" size="lg" onClick={() => inputRef.current?.click()} disabled={disabled || loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                    {scannedImage ? 'Re-scan Document' : 'Scan Document'}
                </Button>
                {scannedImage && <Button type="button" variant="ghost" size="sm" onClick={onClear} className="w-full">Clear Scan</Button>}
            </div>
        </div>
    )
}

function CaptureCard({ title, icon: Icon, onCapture, capturedImage, onClear, disabled }: { title: string; icon: React.ElementType, onCapture: () => void, capturedImage?: string | null, onClear: () => void, disabled?: boolean }) {
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
                    {capturedImage ? 'Retake' : 'Capture'}
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

export function LiveProcessingFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload_document');
  const [workflow, setWorkflow] = useState<{ id: string, name: string, status: InternalWorkflowStatus, Icon: React.ElementType }[]>([]);

  const [selectedPassenger, setSelectedPassenger] = useState<Partial<Passenger> | null>(null);
  const [existingPassenger, setExistingPassenger] = useState<Passenger | null>(null);
  const [updateChoice, setUpdateChoice] = useState<UpdateChoice | null>(null);
  
  const [visaCheckResult, setVisaCheckResult] = useState<'valid' | 'invalid' | 'not_required' | null>(null);

  const [extractedData, setExtractedData] = useState<PassportDataOutput | null>(null);
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
  const [aiResult, setAiResult] = useState<AssessPassengerRiskOutput | null>(null);
  const [finalDecision, setFinalDecision] = useState<'Approved' | 'Rejected' | ''>('');
  const [officerNotes, setOfficerNotes] = useState('');

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
        addLog(`Passport scan captured. Extracting data via AI...`);
        
        const result = await extractPassportData({ passportPhotoDataUri: dataUri });
        setExtractedData(result);
        
        const countryLabel = countries.find(c => c.value === result.nationality)?.label || result.nationality;
        const needsVisa = NATIONALITIES_REQUIRING_VISA.includes(countryLabel);
        let isVisaValid = false;

        const newWorkflow = [
            { id: 'doc_scan', name: 'Document Scan', status: 'in-progress' as InternalWorkflowStatus, Icon: ScanLine },
        ];

        if (needsVisa) {
            newWorkflow.push({ id: 'visa_check', name: 'Visa Check', status: 'pending', Icon: FileWarning });
            const visaResult = await api.get<{ passportNumber: string, nationality: string, visaType: string, expiryDate: string }[]>(`/data/visa-database`);
            if (visaResult.isSuccess && visaResult.data) {
                const visaHolder = visaResult.data.find(v => v.passportNumber === result.passportNumber && v.nationality === countryLabel);
                isVisaValid = !!visaHolder;
            }
            setVisaCheckResult(isVisaValid ? 'valid' : 'invalid');
        } else {
             newWorkflow.push({ id: 'visa_check', name: 'Visa Check', status: 'skipped', Icon: FileWarning });
            setVisaCheckResult('not_required');
        }

        newWorkflow.push(
            { id: 'identity_confirmation', name: 'Identity Confirmation', status: 'pending' as InternalWorkflowStatus, Icon: UserCheck },
            { id: 'biometric_capture', name: 'Biometric Capture', status: 'pending', Icon: Fingerprint },
            { id: 'security_ai_checks', name: 'Security & AI Checks', status: 'pending', Icon: ShieldAlert },
            { id: 'officer_review', name: 'Officer Review', status: 'pending', Icon: User }
        );
        
        setWorkflow(newWorkflow);
        updateStepStatus('doc_scan', 'completed');
        updateStepStatus('visa_check', needsVisa ? (isVisaValid ? 'completed' : 'failed') : 'skipped');

        const passengerResult = await api.get<Passenger[]>(`/data/passengers`);
        if(passengerResult.isSuccess && passengerResult.data) {
            const existingMatch = passengerResult.data.find(p => p.passportNumber === result.passportNumber);
        
            if (existingMatch) {
                addLog(`Passenger match found for ${result.firstName} ${result.lastName}.`);
                setExistingPassenger(existingMatch);
                setCurrentStep('match_found');
            } else {
                setCurrentStep('confirm_new_passenger');
                addLog(`Data extracted for new passenger: ${result.firstName} ${result.lastName}`);
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch passenger data.' });
        }


    } catch (error) {
        console.error("Data Extraction Error:", error);
        toast({ variant: 'destructive', title: 'Data Extraction Failed', description: 'Could not read data from the document. Please try again with a clearer image.' });
    } finally {
        setIsScanning(false);
    }
  }

  const handleConfirmNewPassenger = () => {
    if (!extractedData) return;
    const countryLabel = countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality;
    const passportCountryLabel = countries.find(c => c.value === extractedData.passportCountry)?.label || extractedData.passportCountry;

    const passengerFromScan: Partial<Passenger> = {
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
    
    updateStepStatus('identity_confirmation', 'completed');
    setSelectedPassenger(passengerFromScan);
    addLog(`Officer confirmed record for new passenger ${passengerFromScan.firstName}.`);
    setCurrentStep('capture_photo');
  }

  const handleMatchDecision = (choice: UpdateChoice) => {
    if (!existingPassenger || !extractedData) return;
    
    setUpdateChoice(choice);
    addLog(`Officer selected option: ${choice}`);
    
    let passengerForNextStep: Partial<Passenger> = {};
    const nationalityLabel = countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality;
    const passportCountryLabel = countries.find(c => c.value === extractedData.passportCountry)?.label || extractedData.passportCountry;

    switch(choice) {
        case 'update_all':
            passengerForNextStep = {
                ...existingPassenger,
                ...extractedData,
                nationality: nationalityLabel,
                passportCountry: passportCountryLabel,
                profilePicture: passportScan || '',
            };
            break;
        case 'update_images':
            passengerForNextStep = { ...existingPassenger, profilePicture: passportScan || '' };
            break;
    }
    updateStepStatus('identity_confirmation', 'completed');
    setSelectedPassenger(passengerForNextStep);
    setCurrentStep('capture_photo');
  };

  const handleCapture = (biometricType: keyof typeof biometricCaptures) => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            toast({
                variant: 'destructive',
                title: 'Camera Error',
                description: 'The camera feed is not ready yet. Please wait a moment and try again.'
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
    if (!selectedPassenger || !passportScan || !biometricCaptures.face) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Face Scan is required to proceed.' });
        return;
    }
    updateStepStatus('biometric_capture', 'completed');
    setCurrentStep('analyzing');
    addLog('Starting AI analysis...');
    try {
        const result = await assessPassengerRisk({
            passengerDetails: {
                nationality: selectedPassenger.nationality || '',
                dateOfBirth: selectedPassenger.dateOfBirth || '',
                riskLevel: selectedPassenger.riskLevel || 'Low',
            },
            passportPhotoDataUri: passportScan,
            livePhotoDataUri: biometricCaptures.face,
        });
        updateStepStatus('security_ai_checks', 'completed');
        setAiResult(result);
        setCurrentStep('review');
        addLog('AI analysis complete.');
    } catch (error) {
        console.error("AI Analysis Error:", error);
        toast({ variant: 'destructive', title: 'AI Analysis Failed' });
        updateStepStatus('security_ai_checks', 'failed');
        setCurrentStep('capture_photo'); // Go back a step on failure
    }
  }

  const saveTransactionAndPassenger = useCallback(async (decision: 'Approved' | 'Rejected' | 'Manual Review', status: 'Completed' | 'Failed' | 'Pending', passengerToSave: Partial<Passenger>) => {
    if(!passengerToSave || (!aiResult && status !== 'Pending' && decision !== 'Manual Review') || !extractedData) {
        toast({ variant: 'destructive', title: 'Missing Data', description: 'Cannot complete transaction due to missing data.' });
        return null;
    }
    
    const riskScore = aiResult ? aiResult.riskScore : (visaCheckResult === 'invalid' ? 75 : 50);
    const triggeredRules = aiResult ? aiResult.alerts : (visaCheckResult === 'invalid' ? ['Visa Required - Not Found'] : []);
    const finalNotes = officerNotes || (status === 'Pending' ? 'Passenger requires visa but none was found. Escalated to Duty Manager.' : '');
    
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
    };
    
    const result = await api.post('/data/transactions', transactionData);

    if (result.isSuccess) {
        return result.data as Transaction;
    } else {
        toast({ title: 'Save Failed', description: result.errors?.[0]?.message || 'Could not save the transaction data.', variant: 'destructive' });
        return null;
    }
  }, [updateChoice, extractedData, passportScan, biometricCaptures, workflow, officerNotes, user, aiResult, visaCheckResult, existingPassenger]);

  const handleCompleteTransaction = async () => {
    if(!finalDecision) {
        toast({ variant: 'destructive', title: 'Decision Required', description: 'Please select Approve or Reject.' });
        return;
    }
    const status = finalDecision === 'Approved' ? 'Completed' : 'Failed';
    const transaction = await saveTransactionAndPassenger(finalDecision, status, selectedPassenger!);
    
    if (transaction) {
      updateStepStatus('officer_review', 'completed');
      addLog(`Transaction completed by officer. Decision: ${finalDecision}.`);
      setCurrentStep('completed');
      toast({ variant: 'success', title: 'Transaction Complete', description: `Passenger processed and record saved. Decision: ${finalDecision}`});
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
        toast({ title: "Transferred to Duty Manager", description: `Transaction ${transaction.id} sent for supervisor review.` });
        router.push('/duty-manager');
      }
    } else {
      toast({ variant: 'destructive', title: 'Missing Data', description: 'Could not transfer to duty manager due to missing passenger data.' });
    }
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
                toast({ variant: 'destructive', title: 'Camera access denied.' });
            }
        }
    };
    getCamera();
    return () => {
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [currentStep, toast]);
  
  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const renderContent = () => {
    switch (currentStep) {
        case 'upload_document':
            return (
                <motion.div {...motionProps} key="scan">
                    <CardHeader><CardTitle>1. Scan Document</CardTitle><CardDescription>Place the passenger's passport on the scanner or upload an image to begin.</CardDescription></CardHeader>
                    <CardContent>
                        <ScanCard title="Passport" onScan={handlePassportScan} scannedImage={passportScan} onClear={() => setPassportScan(null)} loading={isScanning} />
                    </CardContent>
                </motion.div>
            )
        case 'match_found':
            if (!existingPassenger || !extractedData) return null;
            return (
                <motion.div {...motionProps} key="match">
                    <CardHeader>
                        <CardTitle>Passenger Match Found</CardTitle>
                        <CardDescription>An existing record was found. Please review and choose how to proceed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-secondary/30">
                                <CardHeader><CardTitle className="text-base">Existing Record</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <DetailItem label="Name" value={`${existingPassenger.firstName} ${existingPassenger.lastName}`} />
                                    <DetailItem label="Nationality" value={existingPassenger.nationality} />
                                    <DetailItem label="DOB" value={existingPassenger.dateOfBirth} />
                                    <DetailItem label="Passport #" value={existingPassenger.passportNumber} />
                                    <DetailItem label="Gender" value={existingPassenger.gender} />
                                    <DetailItem label="Issue Date" value={existingPassenger.passportIssueDate} />
                                    <DetailItem label="Expiry Date" value={existingPassenger.passportExpiryDate} />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-base">New Scanned Data</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    <DetailItem label="Name" value={`${extractedData.firstName} ${extractedData.lastName}`} />
                                    <DetailItem label="Nationality" value={countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality} />
                                    <DetailItem label="DOB" value={extractedData.dateOfBirth} />
                                    <DetailItem label="Passport #" value={extractedData.passportNumber} />
                                    <DetailItem label="Gender" value={extractedData.gender} />
                                    <DetailItem label="Issue Date" value={extractedData.passportIssueDate} />
                                    <DetailItem label="Expiry Date" value={extractedData.passportExpiryDate} />
                                </CardContent>
                            </Card>
                        </div>
                        {visaCheckResult === 'invalid' ? (
                             <div className="space-y-4">
                                <Alert variant="destructive">
                                    <FileWarning className="h-4 w-4" />
                                    <AlertTitle>Action Required: Missing Valid Visa</AlertTitle>
                                    <AlertDescription>
                                        This passenger requires a visa, but a valid one was not found. This transaction must be escalated.
                                    </AlertDescription>
                                </Alert>
                                <Button className="w-full" onClick={handleTransferToDutyManager} variant="destructive">
                                    <ShieldAlert className="mr-2 h-4 w-4" /> Transfer to Duty Manager
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 rounded-md border p-4">
                               <h4 className="font-semibold">Choose Action</h4>
                               <p className="text-sm text-muted-foreground">Select how to proceed with this passenger.</p>
                               <div className="flex flex-col gap-2 pt-2">
                                 <Button onClick={() => handleMatchDecision('update_all')} className="w-full justify-start">Update All Info with Scan & Proceed</Button>
                                 <Button variant="outline" onClick={() => handleMatchDecision('update_images')} className="w-full justify-start">Update Images Only & Proceed</Button>
                               </div>
                            </div>
                        )}
                         <Button variant="ghost" className="w-full" onClick={() => resetState()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back & Re-scan
                         </Button>
                    </CardContent>
                </motion.div>
            )
        case 'confirm_new_passenger':
            if (!extractedData) return null;
            return (
                <motion.div {...motionProps} key="confirm">
                    <CardHeader><CardTitle>2. Confirm New Passenger</CardTitle><CardDescription>Please verify the data extracted from the document.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                             <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16"><AvatarImage src={passportScan || ''} data-ai-hint="portrait professional" /><AvatarFallback><User /></AvatarFallback></Avatar>
                                <div><CardTitle>{extractedData.firstName} {extractedData.lastName}</CardTitle><CardDescription>{extractedData.passportNumber}</CardDescription></div>
                            </CardHeader>
                             <CardContent className="grid grid-cols-2 gap-4 pt-4">
                                <DetailItem label="First Name" value={extractedData.firstName} />
                                <DetailItem label="Last Name" value={extractedData.lastName} />
                                <DetailItem label="Passport Number" value={extractedData.passportNumber} />
                                <DetailItem label="Nationality" value={countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality} />
                                <DetailItem label="Date of Birth" value={extractedData.dateOfBirth} />
                                <DetailItem label="Gender" value={extractedData.gender} />
                                <DetailItem label="Issuing Country" value={countries.find(c => c.value === extractedData.passportCountry)?.label || extractedData.passportCountry} />
                                <DetailItem label="Date of Issue" value={extractedData.passportIssueDate} />
                                <DetailItem label="Date of Expiry" value={extractedData.passportExpiryDate} />
                            </CardContent>
                        </Card>
                        {visaCheckResult === 'invalid' ? (
                            <div className="space-y-4">
                                <Alert variant="destructive">
                                    <FileWarning className="h-4 w-4" />
                                    <AlertTitle>Action Required: Missing Valid Visa</AlertTitle>
                                    <AlertDescription>
                                        This passenger requires a visa, but a valid one was not found. This transaction must be escalated.
                                    </AlertDescription>
                                </Alert>
                                <Button className="w-full" onClick={handleTransferToDutyManager} variant="destructive">
                                    <ShieldAlert className="mr-2 h-4 w-4" /> Transfer to Duty Manager
                                </Button>
                            </div>
                        ) : (
                             <div className="flex flex-col gap-2 sm:flex-row">
                                <Button variant="outline" className="w-full" onClick={() => resetState()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Re-scan Document
                                </Button>
                                <Button className="w-full" onClick={handleConfirmNewPassenger}>
                                    Confirm & Proceed <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                             </div>
                        )}
                    </CardContent>
                </motion.div>
            )
        case 'capture_photo':
            return (
                <motion.div {...motionProps} key="capture">
                    <CardHeader><CardTitle>3. Capture Biometrics</CardTitle><CardDescription>Take live biometric scans of the passenger. Face scan is required.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            {!hasCameraPermission && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md"><p className="text-white">Camera not available</p></div>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <CaptureCard title="Face Scan" icon={ScanFace} onCapture={() => handleCapture('face')} capturedImage={biometricCaptures.face} onClear={() => handleClearBiometric('face')} disabled={!hasCameraPermission} />
                            <CaptureCard title="Left Iris" icon={ScanEye} onCapture={() => handleCapture('leftIris')} capturedImage={biometricCaptures.leftIris} onClear={() => handleClearBiometric('leftIris')} disabled={!hasCameraPermission} />
                            <CaptureCard title="Right Iris" icon={ScanEye} onCapture={() => handleCapture('rightIris')} capturedImage={biometricCaptures.rightIris} onClear={() => handleClearBiometric('rightIris')} disabled={!hasCameraPermission} />
                            <CaptureCard title="Fingerprint" icon={Fingerprint} onCapture={() => handleCapture('fingerprint')} capturedImage={biometricCaptures.fingerprint} onClear={() => handleClearBiometric('fingerprint')} disabled={!hasCameraPermission}/>
                        </div>
                        <div className="space-y-2">
                            <Button className="w-full" disabled={!biometricCaptures.face} onClick={handleStartAnalysis}>
                                Next: Analyze Data <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => setCurrentStep(existingPassenger ? 'match_found' : 'confirm_new_passenger')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </div>
                    </CardContent>
                </motion.div>
            )
        case 'analyzing':
            return (
                <motion.div {...motionProps} key="analyzing" className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Scan className="h-16 w-16 animate-pulse text-primary" />
                    <h2 className="mt-4 text-xl font-semibold">Analyzing...</h2>
                    <p className="text-muted-foreground">AI is assessing risk based on the provided data. Please wait.</p>
                </motion.div>
            )
        case 'review':
            if (!aiResult) return null;
            return (
                <motion.div {...motionProps} key="review">
                    <CardHeader>
                        <CardTitle>4. Officer Review & Decision</CardTitle>
                        <CardDescription>Review the AI assessment and make a final decision.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card className="bg-secondary/50">
                            <CardHeader><CardTitle className="text-lg">AI Risk Assessment</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Risk Score</Label>
                                    <div className="flex items-center gap-4">
                                        <Progress value={aiResult?.riskScore} className="h-4" />
                                        <span className="font-bold text-lg">{aiResult?.riskScore}</span>
                                    </div>
                                </div>
                                <DetailItem label="AI Recommendation" value={aiResult?.recommendation} />
                                <DetailItem label="Assessment Summary" value={aiResult?.assessment} />
                                {aiResult?.alerts && aiResult.alerts.length > 0 && (
                                    <div className="space-y-2">
                                        {aiResult.alerts.map((alert, i) => (
                                            <Alert key={`alert-${i}`} variant={aiResult.riskScore > 50 ? 'destructive' : 'default'}>
                                                <ShieldAlert className="h-4 w-4" />
                                                <AlertTitle>{alert}</AlertTitle>
                                            </Alert>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {visaCheckResult === 'invalid' ? (
                            <div className="space-y-4">
                                <Alert variant="destructive">
                                    <FileWarning className="h-4 w-4" />
                                    <AlertTitle>Action Required: Missing Valid Visa</AlertTitle>
                                    <AlertDescription>
                                        This passenger requires a visa, but a valid one was not found. This transaction must be escalated.
                                    </AlertDescription>
                                </Alert>
                                <Button className="w-full" onClick={handleTransferToDutyManager} variant="destructive">
                                    <ShieldAlert className="mr-2 h-4 w-4" /> Transfer to Duty Manager
                                </Button>
                            </div>
                        ) : (
                            <>
                                <RadioGroup onValueChange={(v) => setFinalDecision(v as any)} value={finalDecision}>
                                    <Label className="font-semibold">Final Decision</Label>
                                    <div className="flex gap-4">
                                        <Label htmlFor="approve" className="flex items-center gap-2 rounded-md border p-3 flex-1 has-[input:checked]:border-primary"><RadioGroupItem value="Approved" id="approve" /> Approve</Label>
                                        <Label htmlFor="reject" className="flex items-center gap-2 rounded-md border p-3 flex-1 has-[input:checked]:border-destructive"><RadioGroupItem value="Rejected" id="reject" /> Reject</Label>
                                    </div>
                                </RadioGroup>
                                <Textarea placeholder="Add officer notes (optional)..." value={officerNotes} onChange={(e) => setOfficerNotes(e.target.value)} />
                                <div className="flex flex-col gap-2 sm:flex-row-reverse">
                                    <Button className="w-full sm:flex-1" onClick={handleCompleteTransaction} disabled={!finalDecision}>
                                        Complete Transaction
                                    </Button>
                                </div>
                            </>
                        )}

                        <Button variant="outline" className="w-full" onClick={() => setCurrentStep('capture_photo')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Capture
                        </Button>
                    </CardContent>
                </motion.div>
            )
         case 'completed':
            return (
                <motion.div {...motionProps} key="completed" className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h2 className="mt-4 text-xl font-semibold">Transaction Completed</h2>
                    <p className="text-muted-foreground">The transaction has been successfully recorded.</p>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={resetState}><RefreshCw className="mr-2 h-4 w-4" /> Start New Transaction</Button>
                        <Button variant="outline" asChild><Link href="/transactions">View All Transactions</Link></Button>
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
                        <CardTitle>Processing Workflow</CardTitle>
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
                                    {step.status === 'skipped' && <p className="text-xs text-muted-foreground italic">Skipped</p>}
                                </div>
                                </li>
                            )
                            })}
                        </ul>
                    </CardContent>
                </Card>
                {selectedPassenger && (
                    <Card className="animate-in fade-in-50 duration-500">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16"><AvatarImage src={selectedPassenger.profilePicture} data-ai-hint="portrait professional" /><AvatarFallback><User /></AvatarFallback></Avatar>
                            <div><CardTitle>{selectedPassenger.firstName} {selectedPassenger.lastName}</CardTitle><CardDescription>{selectedPassenger.passportNumber}</CardDescription></div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <DetailItem label="Nationality" value={selectedPassenger.nationality} />
                            <DetailItem label="Risk Level" value={selectedPassenger.riskLevel} />
                        </CardContent>
                    </Card>
                )}
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
