import { PrimaryItemGrid, type PrimaryItemGridProps } from './primary-item-grid'

export function PrimaryItemGridSection() {
  const values = {
    primary: {
      title: 'Agent Skills tailored for Solana Ecosystem.',
      description:
        'RAG-based agentic interfaces, skills for Solana dApps, protocols, and onchain actions. From idea generation to dApp creation, users interact with agentic interfaces integrated with web3 skills.',
      cta: {
        ctaEnabled: true,
        text: 'Learn more.',
        link: '/blocks',
        variant: 'default' as const,
        size: 'sm' as const,
      },
      media: {
        title: 'Bento section preview',
        url: 'https://assets.solanamobile.com/assets/at0v4HbWIGGTWMCdqqDwQOhI.mp4',
      },
    },
    items: [
      {
        title: 'Dynamic cards',
        description: 'Swap images and copy without breaking layout or spacing.',
        media: {
          title: 'Reusable cards media',
          url: 'https://images.unsplash.com/photo-1611310424006-42cf1e064288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
      },
      {
        title: 'Responsive by default',
        description:
          'Stacks on mobile and becomes a 3-column bento on larger screens.',
        media: {
          title: 'Responsive cards media',
          url: 'https://images.unsplash.com/photo-1712068944624-395e0948a71d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
      },
      {
        title: 'Clean visual hierarchy',
        description:
          'Primary content stands out while the supporting cards stay readable.',
        media: {
          title: 'Visual hierarchy media',
          url: 'https://images.unsplash.com/photo-1617020329399-a1fe5d8646d5?q=80&w=1077&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
      },
      {
        title: 'Extendable cards',
        description:
          'Add more cards, switch aspect ratios, and tune the spacing.',
        media: {
          title: 'Extendable cards media',
          url: 'https://images.unsplash.com/photo-1678567668518-fc22c9c76f1f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
      },
    ],
  } satisfies PrimaryItemGridProps

  return <PrimaryItemGrid primary={values.primary} items={values.items} />
}
