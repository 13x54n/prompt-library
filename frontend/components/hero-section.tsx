import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from './header'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { ChevronRight } from 'lucide-react'
import { logos } from '@/components/logo-cloud'
import PremiumButton from './premium-button'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-x-hidden">
                <section>
                    <div className="relative">
                        <div className="aspect-2/3 relative z-10 flex flex-col justify-end px-6 lg:aspect-video">
                            <div className="mx-auto w-full pb-6 lg:px-12 lg:pb-32">
                                <div className="max-w-3xl">
                                    <h1 className="text-balance text-5xl md:text-6xl xl:text-7xl">Agentic interface for Solana dApps.</h1>
                                    <p className="mt-6 text-balance text-lg">Your agentic layer for Solana dApps — a smarter way to discover, execute, earn, and manage blockchain actions through natural language.</p>

                                    <div className="mt-8 flex items-center gap-2">
                                            <PremiumButton/>

                                        <Button
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5">
                                            <Link href="#link">
                                                <span className="text-nowrap">Learn More</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="aspect-2/3 pointer-events-none absolute inset-1 overflow-hidden rounded-3xl border border-black/10 lg:aspect-video lg:rounded-[3rem] dark:border-white/5">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="not-dark:invert size-full -scale-x-100 object-cover"
                                src="https://videos.pexels.com/video-files/35968183/15249566_1920_1080_30fps.mp4"
                            />
                        </div>
                    </div>
                </section>
                <section className="bg-background py-6">
                    <div className="group relative m-auto max-w-7xl px-6">
                        <div className="flex flex-col items-center md:flex-row">
                            <div className="md:max-w-44 md:border-r md:pr-6">
                                <p className="text-end text-sm">Powering the Solana Ecosystem</p>
                            </div>
                            <div className="**:fill-foreground relative py-6 md:w-[calc(100%-11rem)]">
                                <InfiniteSlider
                                    speedOnHover={20}
                                    speed={40}
                                    gap={112}>
                                    {logos.map((logo) => (
                                        <img
                                            alt={logo.alt}
                                            className="pointer-events-none h-6 w-auto max-w-[120px] shrink-0 select-none object-contain md:h-7 dark:brightness-0 dark:invert"
                                            height="auto"
                                            key={logo.alt}
                                            loading="lazy"
                                            src={logo.src}
                                            width="auto"
                                        />
                                    ))}
                                </InfiniteSlider>

                                <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                                <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                                <ProgressiveBlur
                                    className="pointer-events-none absolute left-0 top-0 h-full w-20"
                                    direction="left"
                                    blurIntensity={1}
                                />
                                <ProgressiveBlur
                                    className="pointer-events-none absolute right-0 top-0 h-full w-20"
                                    direction="right"
                                    blurIntensity={1}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
