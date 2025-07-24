
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Transaction } from '@/types/live-processing';
import { useTranslations } from 'next-intl';

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTransactionDialog({ transaction, isOpen, onOpenChange, onConfirm }: DeleteTransactionDialogProps) {
  const t = useTranslations('Transactions');
  if (!transaction) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDialogDescription', { passengerName: transaction.passengerName, transactionId: transaction.id })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('deleteDialogCancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">
            {t('deleteDialogConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
