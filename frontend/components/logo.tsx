import { cn } from '../lib/utils'

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
	return (
		<div className="flex items-center gap-2">
			<LogoIcon className={className} />
			<span className="font-bold">Maple</span>
		</div>
	)
}

export const LogoIcon = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
	return (
		<img src="/logo.png" alt="Logo" width={30} height={30} className={className} />
	)
}
