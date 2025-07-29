
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { LookupItem } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

export const columns: ColumnDef<LookupItem>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "value",
    header: "Default Value (English)",
    cell: ({ row }) => {
        const enTranslation = row.original.translations.find(t => t.language === 'en');
        return enTranslation ? enTranslation.value : 'N/A';
    }
  },
  {
    accessorKey: "parentId",
    header: "Parent ID",
    cell: ({ row }) => row.original.parentId || 'N/A'
  },
  {
    accessorKey: "isEnabled",
    header: "Enabled",
    cell: ({ row }) => (
        row.original.isEnabled 
            ? <Check className="h-5 w-5 text-green-500" />
            : <X className="h-5 w-5 text-destructive" />
    )
  },
  {
    accessorKey: "displayOrder",
    header: "Display Order",
  },
]
