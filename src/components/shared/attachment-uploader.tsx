
'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, File as FileIcon, Trash2, Download, Eye, Loader2, AlertCircle, Pencil, CropIcon, Upload, RotateCw, RotateCcw } from 'lucide-react';
import { FilePdfIcon } from '@/components/icons/file-pdf-icon';
import { FileAudioIcon } from '@/components/icons/file-audio-icon';
import { FileVideoIcon } from '@/components/icons/file-video-icon';
import { Label } from '@/components/ui/label';
import { Slider } from '../ui/slider';

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

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const AttachmentViewerDialog = ({ src, name, mimeType }: { src: string; name: string, mimeType: string }) => {
    if (!src) return null;
    return (
        <DialogContent className="max-w-md lg:max-w-2xl xl:max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{name}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow flex items-center justify-center bg-muted/50 rounded-lg overflow-auto relative">
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
          toast({ variant: 'destructive', title: 'File Too Large', description: `The file size cannot exceed ${formatFileSize(maxSize)}.` });
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

    const fileTypeIconProps = useMemo(() => {
        switch(fileType) {
            case 'pdf': return { icon: FilePdfIcon, className: 'text-red-500' };
            case 'audio': return { icon: FileAudioIcon, className: 'text-orange-500' };
            case 'video': return { icon: FileVideoIcon, className: 'text-blue-500' };
            default: return { icon: FileIcon, className: 'text-gray-500' };
        }
    }, [fileType]);

    const FileTypeIcon = fileTypeIconProps.icon;
    
    const hints = [
        config.allowedMimeTypes ? `Types: ${config.allowedMimeTypes.join(', ').toUpperCase()}` : null,
        config.maxSize ? `Max size: ${formatFileSize(config.maxSize)}` : null,
    ].filter(Boolean).join(' | ');

    return (
      <div>
        <div className="flex justify-between items-end">
            <div>
                <Label htmlFor={config.name} required={config.required} className="text-sm font-medium">
                    {config.label}
                </Label>
                {hints && <p className="text-xs text-muted-foreground">{hints}</p>}
            </div>
            
             {!value && (
                <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled || isLoading} className="shrink-0">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                </Button>
            )}
        </div>

        <div className="mt-2">
            <input
                type="file"
                ref={inputRef}
                id={config.name}
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
                disabled={disabled || isLoading}
                accept={config.allowedMimeTypes?.join(',')}
            />

            {isLoading && (
                 <Card className="flex items-center gap-4 p-4 h-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="flex-grow space-y-1">
                        <p className="text-sm font-semibold">Uploading file...</p>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
                </Card>
            )}

            {!isLoading && value && fileSrc && (
                <Card className="flex items-center gap-4 p-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary flex-shrink-0">
                         {fileType === 'image' ? (
                             <Image src={fileSrc} alt={config.label} width={48} height={48} className="h-full w-full rounded-md object-cover" />
                        ) : (
                            <FileTypeIcon className={cn("h-8 w-8", fileTypeIconProps.className)} />
                        )}
                    </div>
                    <div className="flex-grow space-y-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold">{value.fileInfo.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(value.fileInfo.size)}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <Dialog>
                             <TooltipProvider>
                                <Tooltip><TooltipTrigger asChild><DialogTrigger asChild><Button size="icon" variant="ghost"><Eye/></Button></DialogTrigger></TooltipTrigger><TooltipContent><p>View</p></TooltipContent></Tooltip>
                                <Tooltip><TooltipTrigger asChild><a href={fileSrc} download={value.fileInfo.name}><Button size="icon" variant="ghost" asChild><span className="flex items-center justify-center"><Download/></span></Button></a></TooltipTrigger><TooltipContent><p>Download</p></TooltipContent></Tooltip>
                                <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={handleDelete}><Trash2 className="text-destructive"/></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>
                            </TooltipProvider>
                            <AttachmentViewerDialog src={fileSrc!} name={value.fileInfo.name} mimeType={value.fileInfo.type} />
                        </Dialog>
                    </div>
                </Card>
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
