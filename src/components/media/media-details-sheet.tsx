
'use client';

import type { Media } from '@/types/live-processing';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface MediaDetailsSheetProps {
  media: Media | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const statusColors: { [key: string]: string } = {
  Active: 'bg-green-500/20 text-green-700 border-green-500/30',
  Inactive: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const typeColors: { [key: string]: string } = {
  Audio: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  Image: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  Video: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

function DetailItem({ label, value, className }: { label: string; value?: string | number | null; className?: string }) {
  if (!value) return null;
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function MediaDetailsSheet({ media, isOpen, onOpenChange }: MediaDetailsSheetProps) {
  if (!media) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">{media.name}</SheetTitle>
          <SheetDescription>{media.localizedName}</SheetDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className={cn(statusColors[media.status])}>{media.status}</Badge>
            <Badge variant="outline" className={cn(typeColors[media.type])}>{media.type}</Badge>
          </div>
        </SheetHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold">Attached Files</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Language</TableHead>
                            <TableHead>File Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(media.mediaFiles || []).map((file) => (
                            <TableRow key={file.id}>
                                <TableCell>{file.language}</TableCell>
                                <TableCell className="font-mono text-xs">{file.fileName}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon">
                                        <a href={file.fileUrl} download={file.fileName}>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
          
          <Separator />
            
          <div>
            <h3 className="mb-3 text-lg font-semibold">System Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Media ID" value={media.id} />
              <DetailItem label="Created By" value={media.createdBy} />
              <DetailItem label="Last Modified" value={media.lastModified} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
