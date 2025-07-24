
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, File as FileIcon, Trash2, Download, Eye, Loader2, AlertCircle, Pencil, RotateCcw, RotateCw, CropIcon } from 'lucide-react';
import { FilePdfIcon } from '@/components/icons/file-pdf-icon';
import { FileAudioIcon } from '@/components/icons/file-audio-icon';
import { FileVideoIcon } from '@/components/icons/file-video-icon';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

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


const ImageEditorDialog = ({ src, onSave, onCancel }: { src: string, onSave: (dataUri: string) => void, onCancel: () => void }) => {
    const [crop, setCrop] = useState<Crop>();
    const [rotation, setRotation] = useState(0);
    const imgRef = useRef<HTMLImageElement>(null);

    function handleSaveCrop() {
        if (!crop || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = Math.floor(crop.width * scaleX);
        canvas.height = Math.floor(crop.height * scaleY);
        const ctx = canvas.getContext('2d');

        if (!ctx) return;
        
        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.drawImage(
            imgRef.current,
            cropX,
            cropY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        onSave(canvas.toDataURL('image/jpeg'));
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop(
              {
                unit: '%',
                width: 90,
              },
              1, // aspect ratio 1:1
              width,
              height
            ),
            width,
            height
          );
        setCrop(newCrop);
    }

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>Edit Image</DialogTitle></DialogHeader>
            <div className="flex justify-center my-4">
                <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    aspect={1}
                >
                    <Image
                        ref={imgRef}
                        src={src}
                        alt="Crop preview"
                        onLoad={onImageLoad}
                        style={{ transform: `rotate(${rotation}deg)` }}
                        width={500}
                        height={500}
                        className="max-h-[60vh] object-contain"
                    />
                </ReactCrop>
            </div>
            <div className="flex items-center gap-4">
                <Label htmlFor="rotation" className="flex items-center gap-2"><RotateCw className="h-4 w-4"/> Rotation</Label>
                <Slider id="rotation" min={0} max={360} step={1} value={[rotation]} onValueChange={(value) => setRotation(value[0])} />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSaveCrop}><CropIcon className="mr-2 h-4 w-4"/> Save Changes</Button>
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
    const [isEditorOpen, setIsEditorOpen] = useState(false);


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

    const handleSaveEdit = (editedDataUri: string) => {
        if (value) {
            onFileChange({
                ...value,
                content: editedDataUri,
            });
            toast({ title: 'Image Edited', description: 'Your changes have been saved.' });
        }
        setIsEditorOpen(false);
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
        <Card id={config.name} className={cn('mt-2 overflow-hidden', disabled && 'bg-muted/50')}>
            <input
                type="file"
                ref={inputRef}
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
                disabled={disabled}
            />
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-secondary" onClick={() => !disabled && inputRef.current?.click()}>
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : fileSrc && fileType === 'image' ? <Image src={fileSrc} alt={config.label} layout="fill" objectFit="cover" className="rounded-lg" /> : value ? <FileTypeIcon className="h-10 w-10 text-primary" /> : <UploadCloud className="h-10 w-10 text-muted-foreground" />}
                    </div>
                    <div className="w-full space-y-2">
                        <p className="text-xs text-muted-foreground truncate">{value?.fileInfo.name || "No file selected"}</p>
                        {isLoading || (uploadProgress > 0 && uploadProgress < 100) ? <Progress value={uploadProgress} className="h-2" /> : (
                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled}>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    {value ? 'Change' : 'Upload'}
                                </Button>
                                {value && (
                                    <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                                        <TooltipProvider>
                                            <Dialog>
                                                {fileSrc &&
                                                    <Tooltip><TooltipTrigger asChild><DialogTrigger asChild><Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button></DialogTrigger></TooltipTrigger><TooltipContent><p>View</p></TooltipContent></Tooltip>
                                                }
                                                <AttachmentViewerDialog src={fileSrc!} name={value.fileInfo.name} mimeType={value.fileInfo.type} />
                                            </Dialog>
                                            {fileType === 'image' && (
                                                <Tooltip><TooltipTrigger asChild><Button size="sm" variant="ghost" onClick={() => setIsEditorOpen(true)}><Pencil className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip>
                                            )}
                                            <Tooltip><TooltipTrigger asChild><Button size="sm" variant="ghost" disabled={disabled} onClick={handleDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>
                                            {fileSrc && 
                                                <Tooltip><TooltipTrigger asChild><Button size="sm" variant="ghost" asChild><a href={fileSrc} download={value.fileInfo.name}><Download className="h-4 w-4" /></a></Button></TooltipTrigger><TooltipContent><p>Download</p></TooltipContent></Tooltip>
                                            }
                                        </TooltipProvider>
                                        {fileType === 'image' && fileSrc && (
                                            <ImageEditorDialog src={fileSrc} onSave={handleSaveEdit} onCancel={() => setIsEditorOpen(false)} />
                                        )}
                                    </Dialog>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
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
