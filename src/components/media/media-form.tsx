

'use client';

import React, { useRef, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Media, MediaFile } from '@/types/live-processing';
import { nanoid } from 'nanoid';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const languages = [
  { value: 'English', label: 'English' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Urdu', label: 'Urdu' },
];

const mediaFileSchema = z.object({
  id: z.string(),
  language: z.string().min(1, "Language is required."),
  fileName: z.string().min(1, "File is required."),
  fileType: z.string().min(1, "File type is required."),
  fileUrl: z.string(),
  content: z.string().optional(),
  fileBytes: z.instanceof(ArrayBuffer).optional(),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  localizedName: z.string().optional(),
  type: z.enum(['Audio', 'Image', 'Video'], { required_error: "A media type is required." }),
  mediaFiles: z.array(mediaFileSchema).min(1, "At least one media file is required."),
  description: z.string().optional(),
});

export type MediaFormValues = z.infer<typeof formSchema>;

interface MediaFormProps {
  onSave: (data: MediaFormValues) => void;
  isLoading: boolean;
  mediaToEdit?: Media | null;
}

const MAX_SIZES = {
    Image: 2 * 1024 * 1024, // 2MB
    Audio: 5 * 1024 * 1024, // 5MB
    Video: 10 * 1024 * 1024, // 10MB
};

const ALLOWED_MIME_TYPES = {
    Image: 'image/*',
    Audio: 'audio/*',
    Video: 'video/*',
};

type OutputType = 'bytes' | 'base64';

function MandatoryFieldLabel({ children }: { children: React.ReactNode }) {
    return <FormLabel>{children} <span className="text-destructive">*</span></FormLabel>;
}

export function MediaForm({ onSave, isLoading, mediaToEdit }: MediaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!mediaToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentLanguage, setCurrentLanguage] = React.useState('English');
  const [outputType, setOutputType] = useState<OutputType>('bytes');

  const form = useForm<MediaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mediaToEdit || {
      name: '',
      localizedName: '',
      type: undefined,
      description: '',
      mediaFiles: [],
    },
  });
  
  const mediaType = useWatch({ control: form.control, name: 'type' });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mediaFiles",
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && mediaType) {
        const maxSize = MAX_SIZES[mediaType];
        const allowedMimePattern = ALLOWED_MIME_TYPES[mediaType];

        if (!file.type.startsWith(allowedMimePattern.split('/')[0])) {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: `Please select a valid ${mediaType.toLowerCase()} file.`,
            });
            return;
        }

        if (file.size > maxSize) {
            toast({
                variant: 'destructive',
                title: 'File Too Large',
                description: `The file size cannot exceed ${maxSize / 1024 / 1024}MB.`,
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
             const newFile: MediaFile = {
                id: nanoid(),
                language: currentLanguage,
                fileName: file.name,
                fileType: file.type,
                fileUrl: '', // This can be generated server-side
             };

             if (outputType === 'bytes') {
                newFile.fileBytes = reader.result as ArrayBuffer;
             } else {
                newFile.content = reader.result as string;
             }
             append(newFile);
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not process the selected file.' });
        }

        if (outputType === 'bytes') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsDataURL(file);
        }
    }
     if (event.target) {
        event.target.value = '';
    }
  };

  const onSubmit = (data: MediaFormValues) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle>Media Details</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><MandatoryFieldLabel>Name (English)</MandatoryFieldLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="localizedName" render={({ field }) => ( <FormItem><FormLabel>Name (Localized)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="type" render={({ field }) => ( <FormItem><MandatoryFieldLabel>Media Type</MandatoryFieldLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent>{['Audio', 'Image', 'Video'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                </div>
                 <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="A brief description of the media content..." /></FormControl><FormMessage /></FormItem> )} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Media Files</CardTitle><CardDescription>Attach one or more files for different languages.</CardDescription></CardHeader>
            <CardContent>
                 <div className="mb-4 space-y-2">
                    <Label>File Output Format</Label>
                    <RadioGroup defaultValue="bytes" onValueChange={(value: string) => setOutputType(value as OutputType)} className="flex items-center gap-4">
                         <div className="flex items-center space-x-2">
                           <RadioGroupItem value="bytes" id="r-bytes" />
                           <Label htmlFor="r-bytes">File Bytes (Default)</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <RadioGroupItem value="base64" id="r-base64" />
                           <Label htmlFor="r-base64">Base64 String</Label>
                         </div>
                    </RadioGroup>
                 </div>
                 <div className="flex items-end gap-2 mb-4">
                    <div className="flex-grow">
                        <Label>Language</Label>
                        <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{languages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept={mediaType ? ALLOWED_MIME_TYPES[mediaType] : ''}
                    />
                    <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={!mediaType}><PlusCircle className="mr-2 h-4 w-4" /> Attach</Button>
                 </div>
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{field.fileName}</TableCell>
                                    <TableCell>{field.language}</TableCell>
                                    <TableCell>{field.fileType}</TableCell>
                                    <TableCell>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {fields.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No files attached.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                 </div>
                 <FormField control={form.control} name="mediaFiles" render={() => <FormMessage className="mt-2" />} />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Save Media'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
