import type { Metadata } from 'next'
import { SimpleMarketingPage } from '@/components/simple-marketing-page'

export const metadata: Metadata = {
    title: 'Explore',
    description: 'Browse prompts and Solana dApp actions in the Maple library.',
}

export default function ExplorePage() {
    return (
        <SimpleMarketingPage
            title="Explore"
            description="Discover curated prompts and on-chain actions you can run through natural language. Filter by category, chain, and risk profile to find what fits your workflow."
        />
    )
}
