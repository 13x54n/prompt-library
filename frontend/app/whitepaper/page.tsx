import type { Metadata } from 'next'
import { SimpleMarketingPage } from '@/components/simple-marketing-page'
import { HeroHeader } from '@/components/header'
import { PdfEmbed } from '@/components/pdf-embed'

export const metadata: Metadata = {
    title: 'Lightpaper',
    description: 'How Maple connects natural language to Solana dApps.',
}

export default function WhitepaperPage() {
    return (
        <>
            <HeroHeader />
            <SimpleMarketingPage
                title="Lightpaper"
                description="You describe what you want in plain language. Maple interprets the intent, suggests safe execution paths for Solana dApps, and helps you confirm transactions—so you spend less time clicking through UIs and more time shipping."
            >
                <PdfEmbed src="/Maple_Lightpaper.pdf" title="Maple lightpaper" />
            </SimpleMarketingPage>
        </>
    )
}
