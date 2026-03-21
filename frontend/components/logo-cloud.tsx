import { InfiniteSlider } from "@/components/ui/infinite-slider";

export function LogoCloud() {
	return (
		<div className="mask-[linear-gradient(to_right,transparent,black,transparent)] overflow-hidden py-4">
			<InfiniteSlider gap={42} reverse speed={80} speedOnHover={25}>
				{logos.map((logo) => (
					<img
						alt={logo.alt}
						className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
						height="auto"
						key={`logo-${logo.alt}`}
						loading="lazy"
						src={logo.src}
						width="auto"
					/>
				))}
			</InfiniteSlider>
		</div>
	);
}

export const logos = [
	{
		src: "https://framerusercontent.com/images/QThoKFcJCLeyRs4uS49nbUHuC9g.svg?width=246&height=60",
		alt: "Solana Seeker Phone",
	},
	// {
	// 	src: "https://imgs.search.brave.com/AafJ4xBdOOumn3RRCYFCqZppC9xqEiBWrrXGUFVVA14/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/ZnJlZWxvZ292ZWN0/b3JzLm5ldC93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMy8wNS9w/aGFudG9tLWxvZ28t/ZnJlZWxvZ292ZWN0/b3JzLm5ldF8ucG5n",
	// 	alt: "Phantom Logo",
	// },
	{
		src: "https://storage.efferd.com/logo/openai-wordmark.svg",
		alt: "OpenAI Logo",
	},
	// {
	// 	src: "https://storage.efferd.com/logo/turso-wordmark.svg",
	// 	alt: "Turso Logo",
	// },
	{
		src: "https://storage.efferd.com/logo/vercel-wordmark.svg",
		alt: "Vercel Logo",
	},
	{
		src: "https://storage.efferd.com/logo/github-wordmark.svg",
		alt: "GitHub Logo",
	},
	// {
	// 	src: "https://storage.efferd.com/logo/claude-wordmark.svg",
	// 	alt: "Claude AI Logo",
	// },
	// {
	// 	src: "https://storage.efferd.com/logo/clerk-wordmark.svg",
	// 	alt: "Clerk Logo",
	// },
];
