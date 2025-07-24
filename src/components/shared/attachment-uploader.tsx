
'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import 'react-image-crop/dist/ReactCrop.css';


import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, File as FileIcon, Trash2, Download, Eye, Loader2, AlertCircle, Pencil, CropIcon } from 'lucide-react';
import { FilePdfIcon } from '@/components/icons/file-pdf-icon';
import { FileAudioIcon } from '@/components/icons/file-audio-icon';
import { FileVideoIcon } from '@/components/icons/file-video-icon';
import { Label } from '@/components/ui/label';

type OutputType = 'base64' | 'bytes';

interface AttachmentConfig {
  name: string;
  label: string;
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  required?: boolean;
}

interface FileData {
  content: string | ArrayBuffer;
  fileInfo: {
    name: string;
    type: string;
    size: number;
  };
}

interface AttachmentUploaderProps {
  configs: AttachmentConfig[];
  initialFiles?: Record<string, string | null>;
  onFilesChange: (files: Record<string, FileData | null>) => void;
  outputType?: OutputType;
  disabled?: boolean;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = error => reject(error);
    });
};

const AttachmentViewerDialog = ({ src, name, mimeType }: { src: string; name: string, mimeType: string }) => {
    if (!src) return null;
    return (
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{name}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden relative">
                {mimeType.startsWith('image/') ? (
                    <Image src={src} alt={name} layout="fill" objectFit="contain" />
                ) : mimeType === 'application/pdf' ? (
                    <iframe src={src} className="w-full h-full" title={name} />
                ) : mimeType.startsWith('video/') ? (
                     <video src={src} controls className="max-w-full max-h-full" />
                ) : mimeType.startsWith('audio/') ? (
                    <audio src={src} controls className="w-full" />
                ) : (
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                        <p className="mt-4">No preview available for this file type.</p>
                        <p className="text-sm text-muted-foreground">You can download it to view.</p>
                    </div>
                )}
            </div>
             <DialogFooter>
                <Button asChild variant="outline">
                    <a href={src} download={name}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </a>
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};


const getFileExtension = (fileName: string) => {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}

function SingleUploader({ config, value, onFileChange, outputType, disabled }: {
    config: AttachmentConfig;
    value: FileData | null;
    onFileChange: (fileData: FileData | null) => void;
    outputType: OutputType;
    disabled?: boolean;
}) {
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = useCallback(async (selectedFile: File | null) => {
        if (!selectedFile) return;

        const { allowedMimeTypes = [], maxSize } = config;

        const extension = getFileExtension(selectedFile.name);
        const criticalExtensions = ['exe', 'dll', 'bat', 'sh', 'cmd'];
        if (criticalExtensions.includes(extension.toLowerCase())) {
            toast({
                variant: 'destructive',
                title: 'Unsupported File Type',
                description: 'For security reasons, executable files are not allowed.',
            });
            return;
        }

        if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(selectedFile.type)) {
          toast({ variant: 'destructive', title: 'Invalid File Type', description: `Please upload a file of type: ${allowedMimeTypes.join(', ')}` });
          return;
        }
    
        if (maxSize && selectedFile.size > maxSize) {
          toast({ variant: 'destructive', title: 'File Too Large', description: `The file size cannot exceed ${Math.round(maxSize / 1024 / 1024)}MB.` });
          return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress(prev => (prev >= 95 ? prev : prev + 5));
        }, 100);

        try {
            const content = outputType === 'bytes' ? await fileToArrayBuffer(selectedFile) : await fileToDataUri(selectedFile);
            onFileChange({
                content,
                fileInfo: { name: selectedFile.name, type: selectedFile.type, size: selectedFile.size },
            });
            clearInterval(interval);
            setUploadProgress(100);
            toast({ variant: 'success', title: 'Upload Successful', description: `'${selectedFile.name}' has been prepared.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'There was an error processing the file.' });
            clearInterval(interval);
            setUploadProgress(0);
        } finally {
            setIsLoading(false);
        }
    }, [config, onFileChange, outputType, toast]);

    const handleDelete = () => {
        onFileChange(null);
        if(inputRef.current) inputRef.current.value = '';
    };

    const fileSrc = useMemo(() => {
        if (!value) return null;
        if (typeof value.content === 'string') return value.content;
        return null;
    }, [value]);

    const fileType = useMemo(() => {
        const mime = value?.fileInfo.type || '';
        if (mime.startsWith('image/')) return 'image';
        if (mime === 'application/pdf') return 'pdf';
        if (mime.startsWith('audio/')) return 'audio';
        if (mime.startsWith('video/')) return 'video';
        return 'other';
    }, [value]);
    
    const FileTypeIcon = useMemo(() => {
        switch(fileType) {
            case 'pdf': return FilePdfIcon;
            case 'audio': return FileAudioIcon;
            case 'video': return FileVideoIcon;
            default: return FileIcon;
        }
    }, [fileType]);

    return (
      <div>
        <Label htmlFor={config.name} className={cn(config.required && "after:content-['*'] after:text-destructive after:ml-1")}>{config.label}</Label>
        <div 
            className={cn(
                'group relative mt-2 flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary/50 transition-colors hover:border-primary hover:bg-primary/5', 
                disabled && 'cursor-not-allowed !border-muted !bg-muted/50 hover:border-muted',
                fileType === 'image' && fileSrc && 'border-solid'
            )}
            onClick={() => !disabled && inputRef.current?.click()}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
                disabled={disabled}
            />

            {isLoading && (
                <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-semibold">Uploading...</p>
                    <Progress value={uploadProgress} className="h-1 w-24" />
                </div>
            )}

            {!isLoading && !value && (
                <div className="text-center text-muted-foreground">
                    <UploadCloud className="mx-auto h-10 w-10" />
                    <p className="mt-2 font-semibold">Click to upload</p>
                    <p className="text-xs">or drag and drop</p>
                </div>
            )}
            
            {!isLoading && value && fileSrc && (
                 <>
                    {fileType === 'image' ? (
                         <Image src={fileSrc} alt={config.label} layout="fill" objectFit="cover" className="rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-primary">
                            <FileTypeIcon className="h-12 w-12" />
                            <p className="text-sm font-semibold text-center max-w-full truncate px-4">{value.fileInfo.name}</p>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Dialog>
                             <TooltipProvider>
                                <Tooltip><TooltipTrigger asChild><DialogTrigger asChild><Button size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white"><Eye/></Button></DialogTrigger></TooltipTrigger><TooltipContent><p>View</p></TooltipContent></Tooltip>
                                <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white" onClick={(e) => {e.stopPropagation(); handleDelete()}}><Trash2 /></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>
                                <Tooltip><TooltipTrigger asChild><a href={fileSrc} download={value.fileInfo.name} onClick={e => e.stopPropagation()}><Button size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white" asChild><span className="flex items-center justify-center"><Download/></span></Button></a></TooltipTrigger><TooltipContent><p>Download</p></TooltipContent></Tooltip>
                            </TooltipProvider>
                            <AttachmentViewerDialog src={fileSrc!} name={value.fileInfo.name} mimeType={value.fileInfo.type} />
                        </Dialog>
                    </div>
                </>
            )}

        </div>
      </div>
    );
}

export function AttachmentUploader({
  configs,
  initialFiles = {},
  onFilesChange,
  outputType = 'base64',
  disabled = false,
}: AttachmentUploaderProps) {
  const [files, setFiles] = useState<Record<string, FileData | null>>(() => {
    const initialState: Record<string, FileData | null> = {};
    configs.forEach(config => {
        const initialContent = initialFiles[config.name];
        if (initialContent) {
            initialState[config.name] = {
                content: initialContent,
                fileInfo: { name: `Initial ${config.label}`, type: 'image/png', size: 0 } // Mock fileInfo
            };
        } else {
            initialState[config.name] = null;
        }
    });
    return initialState;
  });

  const handleFileChange = (name: string, fileData: FileData | null) => {
    const newFiles = { ...files, [name]: fileData };
    setFiles(newFiles);
    onFilesChange(newFiles);
  };
  
  return (
    <div className="space-y-4">
        {configs.map(config => (
            <SingleUploader 
                key={config.name}
                config={config}
                value={files[config.name]}
                onFileChange={(fileData) => handleFileChange(config.name, fileData)}
                outputType={outputType}
                disabled={disabled}
            />
        ))}
    </div>
  );
}
