import type { Metadata } from 'next'
import { SimpleMarketingPage } from '@/components/simple-marketing-page'

export const metadata: Metadata = {
    title: 'Featured',
    description: 'Highlighted prompts and integrations from the Maple team and partners.',
}

export default function FeaturedPage() {
    return (
        <SimpleMarketingPage
            title="Featured"
            description="See hand-picked prompts, templates, and partner integrations updated regularly. Start here for battle-tested flows before you build your own."
        />
    )
}
