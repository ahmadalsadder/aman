'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, File as FileIcon, Trash2, Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import { FilePdfIcon } from '@/components/icons/file-pdf-icon';
import { FileAudioIcon } from '@/components/icons/file-audio-icon';
import { FileVideoIcon } from '@/components/icons/file-video-icon';

type OutputType = 'base64' | 'bytes';

interface AttachmentUploaderProps {
  initialSrc?: string | null;
  attachmentName?: string;
  allowedMimeTypes?: string[];
  maxSize?: number; // in bytes
  onUpload?: (data: { content: string | ArrayBuffer; extension: string; mimeType: string }) => void;
  onDelete?: () => void;
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


export function AttachmentUploader({
  initialSrc = null,
  attachmentName = 'Attachment',
  allowedMimeTypes = [],
  maxSize, // in bytes
  onUpload,
  onDelete,
  outputType = 'base64',
  disabled = false,
}: AttachmentUploaderProps) {
  const [fileSrc, setFileSrc] = useState<string | null>(initialSrc);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFileSrc(initialSrc);
  }, [initialSrc]);
  
  const getFileExtension = (fileName: string) => {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Validation
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
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: `Please upload a file of type: ${allowedMimeTypes.join(', ')}`,
      });
      return;
    }

    if (maxSize && selectedFile.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: `The file size cannot exceed ${Math.round(maxSize / 1024 / 1024)}MB.`,
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 95) {
                clearInterval(interval);
                return prev;
            }
            return prev + 5;
        });
    }, 100);

    try {
        const dataUri = await fileToDataUri(selectedFile);
        setFile(selectedFile);
        setFileSrc(dataUri);

        if (onUpload) {
            let content: string | ArrayBuffer;
            if (outputType === 'bytes') {
                content = await fileToArrayBuffer(selectedFile);
            } else {
                content = dataUri;
            }
            onUpload({ content, extension: getFileExtension(selectedFile.name), mimeType: selectedFile.type });
        }
        clearInterval(interval);
        setUploadProgress(100);
        toast({
            variant: 'success',
            title: 'Upload Successful',
            description: `'${selectedFile.name}' has been prepared.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'There was an error processing the file.',
        });
        clearInterval(interval);
        setUploadProgress(0);
    } finally {
        setIsLoading(false);
    }
  }, [allowedMimeTypes, maxSize, onUpload, outputType, toast]);
  
  const handleDelete = () => {
    setFile(null);
    setFileSrc(null);
    setUploadProgress(0);
    if(inputRef.current) inputRef.current.value = '';
    if (onDelete) onDelete();
  }

  const fileType = useMemo(() => {
    if (!file && !fileSrc) return 'none';
    const mime = file?.type || '';
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('video/')) return 'video';
    return 'other';
  }, [file, fileSrc]);

  const FileTypeIcon = useMemo(() => {
    switch(fileType) {
        case 'pdf': return FilePdfIcon;
        case 'audio': return FileAudioIcon;
        case 'video': return FileVideoIcon;
        default: return FileIcon;
    }
  }, [fileType]);

  const triggerFileSelect = () => inputRef.current?.click();

  return (
    <Card className={cn('overflow-hidden', disabled && 'bg-muted/50')}>
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        disabled={disabled}
      />
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="relative flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-secondary"
            onClick={!disabled ? triggerFileSelect : undefined}
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : fileSrc && fileType === 'image' ? (
              <Image src={fileSrc} alt={attachmentName} layout="fill" objectFit="cover" className="rounded-lg" />
            ) : fileSrc ? (
              <FileTypeIcon className="h-10 w-10 text-primary" />
            ) : (
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="w-full space-y-2">
            <h4 className="font-semibold">{attachmentName}</h4>
            <div className="text-xs text-muted-foreground truncate">
                {file ? file.name : (fileSrc ? "Existing file" : "No file selected")}
            </div>
             {isLoading || uploadProgress > 0 ? (
                <Progress value={uploadProgress} className="h-2" />
            ) : (
                 <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={triggerFileSelect} disabled={disabled}>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {fileSrc ? 'Change' : 'Upload'}
                    </Button>
                    {fileSrc && (
                         <Dialog>
                           <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>View</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button size="sm" variant="ghost" disabled={disabled} onClick={handleDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Delete</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" asChild>
                                        <a href={fileSrc} download={file?.name || attachmentName}>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Download</p></TooltipContent>
                            </Tooltip>
                           </TooltipProvider>
                           <AttachmentViewerDialog src={fileSrc} name={file?.name || attachmentName} mimeType={file?.type || ''} />
                        </Dialog>
                    )}
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
