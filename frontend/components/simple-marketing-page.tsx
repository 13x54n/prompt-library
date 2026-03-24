import type { ReactNode } from 'react'

type SimpleMarketingPageProps = {
    title: string
    description: string
    children?: ReactNode
}

export function SimpleMarketingPage({ title, description, children }: SimpleMarketingPageProps) {
    return (
        <>
            <main className="min-h-screen bg-background px-6 pb-20 pt-28 lg:px-12">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{description}</p>
                </div>
                {children ? (
                    <div className="mx-auto mt-12 w-full max-w-5xl">{children}</div>
                ) : null}
            </main>
        </>
    )
}
