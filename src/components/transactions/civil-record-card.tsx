
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/types/live-processing';
import { IdCard } from 'lucide-react';

const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {value != null && <p className="text-sm font-medium">{value}</p>}
      {children}
    </div>
  );

export function CivilRecordCard({ transaction }: { transaction: Transaction }) {
    if (!transaction.civilInformation) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <IdCard className="h-4 w-4" /> Civil Record
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <DetailItem label="File Type" value={transaction.civilInformation.fileType} />
                <DetailItem label="File Number" value={transaction.civilInformation.fileNumber} />
                <DetailItem label="National ID" value={transaction.civilInformation.nationalId} />
                <DetailItem label="File Expiry" value={transaction.civilInformation.fileExpiryDate} />
            </CardContent>
        </Card>
    );
}
