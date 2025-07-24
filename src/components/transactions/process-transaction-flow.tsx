'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { testCases } from '@/lib/test-cases';
import type { TestCase, ProcessingWorkflowStep, Passenger } from '@/types/live-processing';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  Hourglass,
  ChevronRight,
  ShieldAlert,
  Info,
  RefreshCw,
  User,
  Fingerprint, ScanEye, ScanFace, ScanLine
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type SimulationStatus = 'idle' | 'running' | 'completed';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || 'N/A'}</p>
  </div>
);

const BiometricCaptureItem = ({ label, icon: Icon, onCapture, status }: { label: string; icon: React.ElementType; onCapture: () => void; status: 'pending' | 'capturing' | 'captured' }) => {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-secondary">
        {status === 'captured' ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <Icon className="h-8 w-8 text-muted-foreground" />}
      </div>
      <p className="text-sm font-medium">{label}</p>
      <Button size="sm" onClick={onCapture} disabled={status !== 'pending'}>
        {status === 'pending' && 'Capture'}
        {status === 'capturing' && <Loader2 className="animate-spin" />}
        {status === 'captured' && 'Captured'}
      </Button>
    </div>
  );
};

export function ProcessTransactionFlow() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workflow, setWorkflow] = useState<ProcessingWorkflowStep[]>([]);
  const [passengerData, setPassengerData] = useState<Partial<Passenger> | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [biometricStatuses, setBiometricStatuses] = useState<{ face: 'pending' | 'capturing' | 'captured', iris: 'pending' | 'capturing' | 'captured', fingerprint: 'pending' | 'capturing' | 'captured' }>({ face: 'pending', iris: 'pending', fingerprint: 'pending' });
  const [finalOutcome, setFinalOutcome] = useState<{ riskScore: number; outcome: string; alerts: TestCase['alerts'] } | null>(null);

  const selectedTestCase = useMemo(() => testCases.find(c => c.id === selectedCaseId), [selectedCaseId]);

  const addLog = useCallback((message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const updateWorkflowStep = useCallback((index: number, updates: Partial<ProcessingWorkflowStep>) => {
    setWorkflow(prev => {
        const newWorkflow = [...prev];
        if (newWorkflow[index]) {
            newWorkflow[index] = { ...newWorkflow[index], ...updates };
        }
        return newWorkflow;
    })
  }, []);

  const resetSimulation = () => {
    setSimulationStatus('idle');
    setSelectedCaseId(null);
  }

  const startSimulation = () => {
    if (!selectedTestCase) return;

    // Reset all state for a fresh run
    setSimulationStatus('running');
    setCurrentStepIndex(0);
    setPassengerData(selectedTestCase.passenger);
    setWorkflow(selectedTestCase.workflowTemplate.map(step => ({ ...step, status: 'pending' })));
    setLog([`${new Date().toLocaleTimeString()}: Simulation started for scenario: ${selectedTestCase.scenario}`]);
    setBiometricStatuses({ face: 'pending', iris: 'pending', fingerprint: 'pending' });
    setFinalOutcome(null);
  };

  const handleContinueManualStep = useCallback(() => {
    updateWorkflowStep(currentStepIndex, { status: 'completed' });
    setCurrentStepIndex(prev => prev + 1);
  }, [currentStepIndex, updateWorkflowStep]);

  useEffect(() => {
    if (simulationStatus !== 'running' || !selectedTestCase) {
      return;
    }

    if (currentStepIndex >= selectedTestCase.workflowTemplate.length) {
      if (simulationStatus === 'running' && workflow.every(s => s.status === 'completed' || s.status === 'skipped')) {
        addLog("All workflow steps processed. Calculating final outcome...");
        setFinalOutcome({
          riskScore: selectedTestCase.finalRiskScore,
          outcome: selectedTestCase.expectedOutcome,
          alerts: selectedTestCase.alerts,
        });
        setSimulationStatus('completed');
      }
      return;
    }

    const currentStepTemplate = selectedTestCase.workflowTemplate[currentStepIndex];
    const currentWorkflowStep = workflow[currentStepIndex];

    if (!currentWorkflowStep) return;

    // If step is pending, set it to in-progress. The effect will re-run to handle the logic.
    if (currentWorkflowStep.status === 'pending') {
      updateWorkflowStep(currentStepIndex, { status: 'in-progress' });
      addLog(`Starting step: ${currentStepTemplate.name}`);
      return;
    }

    // If step is now in-progress, handle its logic.
    if (currentWorkflowStep.status === 'in-progress') {
      const isManualStep = currentStepTemplate.id === 'biometric_capture' || currentStepTemplate.id === 'data_confirmation';

      // If it's a manual step, we just wait for user action. Nothing to do in the effect.
      if (isManualStep) {
        return;
      }

      // If it's an automatic step, set the timer to complete it.
      const durationMs = (parseFloat(currentStepTemplate.duration.replace('s', '')) || 1) * 500;

      const timer = setTimeout(() => {
        if (currentStepTemplate.id === 'visa_check' && selectedTestCase.passenger.nationality === 'United Arab Emirates') {
          updateWorkflowStep(currentStepIndex, { status: 'skipped', details: <p className="text-xs italic text-muted-foreground">Not required for UAE nationals.</p> });
          addLog(`Step '${currentStepTemplate.name}' skipped.`);
        } else {
          updateWorkflowStep(currentStepIndex, { status: 'completed' });
          addLog(`Step '${currentStepTemplate.name}' completed.`);
        }
        setCurrentStepIndex(prevIndex => prevIndex + 1);
      }, durationMs);

      return () => clearTimeout(timer);
    }
  }, [simulationStatus, currentStepIndex, selectedTestCase, workflow, addLog, updateWorkflowStep]);

  
  const handleCaptureBiometric = (type: keyof typeof biometricStatuses) => {
    setBiometricStatuses(prev => ({ ...prev, [type]: 'capturing' }));
    addLog(`Capturing ${type}...`);
    setTimeout(() => {
        setBiometricStatuses(prev => ({ ...prev, [type]: 'captured' }));
        addLog(`${type} capture successful.`);
    }, 1000);
  };
  
  const allBiometricsCaptured = Object.values(biometricStatuses).every(s => s === 'captured');

  const renderCurrentStepContent = () => {
    if (simulationStatus !== 'running' || !workflow.length || !workflow[currentStepIndex]) return null;
    const step = workflow[currentStepIndex];

    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
    };
    
    switch (step.id) {
        case 'document_scan':
            return <motion.div {...motionProps} key="docScan">
                <CardHeader><CardTitle>Document Scan</CardTitle><CardDescription>Simulating passport scan...</CardDescription></CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4 h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Reading MRZ and E-Passport Chip...</p>
                    <Progress value={50} className="w-full animate-pulse" />
                </CardContent>
            </motion.div>;
            
        case 'data_confirmation':
            return <motion.div {...motionProps} key="dataConfirm">
                 <CardHeader><CardTitle>Data Confirmation</CardTitle><CardDescription>Please verify the extracted data.</CardDescription></CardHeader>
                 <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                       <DetailItem label="First Name" value={passengerData?.firstName} />
                       <DetailItem label="Last Name" value={passengerData?.lastName} />
                       <DetailItem label="Passport #" value={passengerData?.passportNumber} />
                       <DetailItem label="Nationality" value={passengerData?.nationality} />
                       <DetailItem label="Date of Birth" value={passengerData?.dateOfBirth} />
                       <DetailItem label="Expiry Date" value={passengerData?.passportExpiryDate} />
                    </div>
                    <Button className="w-full" onClick={handleContinueManualStep}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm Data
                    </Button>
                 </CardContent>
            </motion.div>
        
        case 'biometric_capture':
            return <motion.div {...motionProps} key="bioCapture">
                 <CardHeader><CardTitle>Biometric Capture</CardTitle><CardDescription>Capture live biometrics from the passenger.</CardDescription></CardHeader>
                 <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <BiometricCaptureItem label="Face Scan" icon={ScanFace} onCapture={() => handleCaptureBiometric('face')} status={biometricStatuses.face} />
                        <BiometricCaptureItem label="Iris Scan" icon={ScanEye} onCapture={() => handleCaptureBiometric('iris')} status={biometricStatuses.iris} />
                        <BiometricCaptureItem label="Fingerprint" icon={Fingerprint} onCapture={() => handleCaptureBiometric('fingerprint')} status={biometricStatuses.fingerprint} />
                    </div>
                    <Button 
                        className="w-full" 
                        disabled={!allBiometricsCaptured}
                        onClick={handleContinueManualStep}
                    >
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                 </CardContent>
            </motion.div>

        case 'security_verification':
        case 'visa_check':
        case 'blacklist_check':
             return <motion.div {...motionProps} key="securityCheck">
                <CardHeader><CardTitle>Security Verification</CardTitle><CardDescription>Running automated checks...</CardDescription></CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4 h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Checking against security databases...</p>
                </CardContent>
            </motion.div>
            
        default:
            return <motion.div {...motionProps} key="default">
                <CardContent className="flex flex-col items-center justify-center gap-4 h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Processing...</p>
                </CardContent>
            </motion.div>
    }
  }

  if (simulationStatus === 'idle') {
    return (
      <Card className="mx-auto max-w-lg text-center animate-in fade-in-50 duration-500">
        <CardHeader>
          <CardTitle>Select a Test Case</CardTitle>
          <CardDescription>Choose a scenario to begin the transaction simulation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedCaseId}>
            <SelectTrigger><SelectValue placeholder="Select a scenario..." /></SelectTrigger>
            <SelectContent>
              {testCases.map((c) => <SelectItem key={c.id} value={c.id}>{c.scenario}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={startSimulation} disabled={!selectedCaseId} className="w-full">
            <Play className="mr-2 h-4 w-4" /> Start Transaction
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Column: Workflow & Passenger */}
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Processing Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
                {workflow.map((step, index) => {
                    const statusIcon = {
                        pending: <Hourglass className="h-4 w-4 text-muted-foreground" />,
                        'in-progress': <Loader2 className="h-4 w-4 animate-spin text-primary" />,
                        completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                        skipped: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
                        failed: <XCircle className="h-4 w-4 text-destructive" />,
                    };
                    return (
                        <li key={`${step.id}-${index}`} className={cn("flex items-start gap-3 transition-all", index > currentStepIndex && simulationStatus !== 'completed' && "opacity-50")}>
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                             {statusIcon[step.status]}
                           </div>
                           <div>
                            <p className={cn("font-medium", index === currentStepIndex && simulationStatus !== 'completed' && "text-primary")}>{step.name}</p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                            {step.details}
                           </div>
                        </li>
                    )
                })}
            </ul>
          </CardContent>
        </Card>
        {passengerData && (
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={passengerData.profilePicture} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{passengerData.firstName} {passengerData.lastName}</CardTitle>
                        <CardDescription>{passengerData.passportNumber}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )}
      </div>

      {/* Middle Column: Current Step */}
      <div className="lg:col-span-1">
        <Card className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {renderCurrentStepContent()}
            {simulationStatus === 'completed' && finalOutcome && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key="finalOutcome">
                    <CardHeader className="text-center">
                        <CardTitle>Transaction Completed</CardTitle>
                        <CardDescription>Final outcome of the simulation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <div className={cn("rounded-lg p-4", 
                            finalOutcome.outcome === 'APPROVED' && "bg-green-100 dark:bg-green-900",
                            finalOutcome.outcome === 'REJECTED' && "bg-red-100 dark:bg-red-900",
                            finalOutcome.outcome === 'MANUAL_REVIEW' && "bg-yellow-100 dark:bg-yellow-900"
                        )}>
                            <p className="text-sm font-semibold">Final Decision</p>
                            <p className="text-2xl font-bold">{finalOutcome.outcome}</p>
                        </div>
                        <div>
                             <p className="text-sm font-semibold">Risk Score</p>
                            <p className="text-2xl font-bold">{finalOutcome.riskScore}</p>
                            <Progress value={finalOutcome.riskScore} />
                        </div>
                        <div className="space-y-2">
                           {finalOutcome.alerts.map((alert, i) => (
                             <Alert key={i} variant={alert.variant}>
                                {alert.variant === 'destructive' ? <ShieldAlert className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                <AlertTitle>{alert.title}</AlertTitle>
                                <AlertDescription>{alert.description}</AlertDescription>
                            </Alert>
                           ))}
                        </div>
                        <Button onClick={resetSimulation} className="w-full">
                           <RefreshCw className="mr-2 h-4 w-4" /> Start New Simulation
                        </Button>
                    </CardContent>
                </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Right Column: Logs */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Simulation Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto rounded-md bg-muted p-2 font-mono text-xs">
              {log.map((entry, i) => <p key={i}>{entry}</p>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
