import { digits, loader, Matrix, vu, wave } from "@/components/ui/matrix"

import type { CtaProps } from '@/components/flx/blocks/shared/cta/cta'
import { cn } from '@/lib/utils'
import PremiumButton from '@/components/premium-button'
import GlobeDemo from '@/components/globe-demo'
import { EvervaultCard } from "@/components/ui/evervault-card"

export type PrimaryItemMedia = {
  url: string
  title: string
}

export type PrimaryItem = {
  title: string
  description: string
  cta: CtaProps
  media: PrimaryItemMedia
}

export type GridItem = {
  title: string
  description: string
  media: PrimaryItemMedia
}

export interface PrimaryItemGridProps {
  className?: string
  primary: PrimaryItem
  items: GridItem[]
}

export function PrimaryItemGrid({
  className,
  primary,
  items,
}: Readonly<PrimaryItemGridProps>) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-2 md:grid-cols-3 max-w-7xl mx-auto', className)}
      aria-label="Primary item grid"
    >
      <article className="border border-border col-span-1 overflow-hidden rounded-lg p-6 md:col-span-2">
        <div className="grid h-full grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                {primary.title}
              </h2>
              <p className="text-muted-foreground text-sm whitespace-pre-line">
                {primary.description}
              </p>
            </div>

            <div className="flex">
              <PremiumButton text={primary.cta.text} />
            </div>
          </div>

          <div className="relative w-full md:h-full md:min-h-0">
            <div
              className={cn(
                'relative w-full overflow-hidden rounded-xl',
                'aspect-[4/3] sm:aspect-video',
                'md:absolute md:inset-0 md:aspect-auto md:h-full md:min-h-[12rem]'
              )}
            >
              <video
                src={primary.media.url}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              >
                <source src={primary.media.url} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </article>

      <article
        className="border border-border col-span-1 overflow-hidden rounded-lg p-6"
      >
        <div className="flex h-full min-w-0 flex-col gap-6">
          <GlobeDemo />

          <div className="space-y-1">
            <h3 className="text-base font-medium">Build, Use, and Monetize dApps.</h3>
            <p className="text-muted-foreground text-sm whitespace-pre-line">
              Build powerful dApps on our platform, connect them with MWA (Seeker Phone). Create, interact, and monitize for these experiences worldwide.
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}
