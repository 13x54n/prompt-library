import type { Metadata } from 'next'
import { SimpleMarketingPage } from '@/components/simple-marketing-page'

export const metadata: Metadata = {
    title: 'About',
    description: 'About Maple — the agentic layer for Solana dApps.',
}

export default function AboutPage() {
    return (
        <SimpleMarketingPage
            title="About"
            description="Maple is building an agentic interface for Solana dApps: discovery, execution, and portfolio context in one place. We focus on clarity, safety, and developer-friendly tooling so teams can ship conversational experiences without sacrificing control."
        />
    )
}
