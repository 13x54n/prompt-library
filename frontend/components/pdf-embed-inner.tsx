'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import useMeasure from 'react-use-measure'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString()

type PdfEmbedInnerProps = {
    src: string
    title?: string
}

export function PdfEmbedInner({ src, title = 'PDF document' }: PdfEmbedInnerProps) {
    const [ref, bounds] = useMeasure()
    const [numPages, setNumPages] = useState<number>()
    const width = bounds.width > 0 ? Math.min(bounds.width, 920) : undefined

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                >
                    Open or download PDF
                </a>
            </p>
            <div
                ref={ref}
                className="overflow-hidden rounded-xl border border-border bg-muted/30 p-4 shadow-sm md:p-6"
            >
                {width ? (
                    <Document
                        file={src}
                        loading={
                            <p className="py-16 text-center text-sm text-muted-foreground">Loading PDF…</p>
                        }
                        error={
                            <p className="py-16 text-center text-sm text-destructive">
                                Could not load this PDF. Try the link above.
                            </p>
                        }
                        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                    >
                        {numPages
                            ? Array.from({ length: numPages }, (_, i) => (
                                  <Page
                                      key={i + 1}
                                      pageNumber={i + 1}
                                      width={width}
                                      className="mx-auto mb-4 shadow-sm last:mb-0 [&_canvas]:h-auto [&_canvas]:max-w-full"
                                      aria-label={`${title} — page ${i + 1}`}
                                  />
                              ))
                            : null}
                    </Document>
                ) : (
                    <div className="min-h-[min(85vh,900px)] w-full" aria-hidden />
                )}
            </div>
        </div>
    )
}
