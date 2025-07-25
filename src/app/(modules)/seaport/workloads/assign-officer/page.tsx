
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientPageHeader } from '@/components/shared/gradient-page-header';
import { UserCog } from 'lucide-react';

export default function AssignOfficerPage() {
    return (
        <div className="space-y-6">
            <GradientPageHeader
                title="Assign Officer"
                description="This page is under construction."
                icon={UserCog}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The functionality to assign officers to specific shifts will be available here in a future update.</p>
                </CardContent>
            </Card>
        </div>
    );
}
