import type { Metadata } from 'next'
import { SimpleMarketingPage } from '@/components/simple-marketing-page'

export const metadata: Metadata = {
    title: 'How it Works',
    description: 'How Maple connects natural language to Solana dApps.',
}

export default function HowItWorksPage() {
    return (
        <SimpleMarketingPage
            title="How it Works"
            description="You describe what you want in plain language. Maple interprets the intent, suggests safe execution paths for Solana dApps, and helps you confirm transactions—so you spend less time clicking through UIs and more time shipping."
        />
    )
}
