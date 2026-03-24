'use client'

import dynamic from 'next/dynamic'

import { cn } from '@/lib/utils'

type PdfEmbedProps = {
    src: string
    title?: string
    className?: string
}

const PdfEmbedInner = dynamic(
    () => import('./pdf-embed-inner').then((mod) => mod.PdfEmbedInner),
    {
        ssr: false,
        loading: () => (
            <div className={cn('rounded-xl border border-border bg-muted/30 py-16 text-center')}>
                <p className="text-sm text-muted-foreground">Loading PDF viewer…</p>
            </div>
        ),
    },
)

export function PdfEmbed({ src, title, className }: PdfEmbedProps) {
    return (
        <div className={cn(className)}>
            <PdfEmbedInner src={src} title={title} />
        </div>
    )
}
