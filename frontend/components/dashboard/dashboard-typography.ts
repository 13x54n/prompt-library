/**
 * Dashboard typography — single scale (compact, consistent hierarchy).
 * Use these class strings instead of ad-hoc `text-*` in dashboard UI.
 */
export const dashboardTypography = {
  /** Masthead titles (Home, Today, Create) */
  pageTitle:
    "text-[1.25rem] font-semibold leading-tight tracking-tight sm:text-[1.5rem] md:text-[1.625rem]",

  /** Section headings (e.g. Top picks, About) */
  sectionTitle:
    "text-base font-semibold leading-tight tracking-tight sm:text-[1.125rem] sm:leading-none",

  /** Inline section labels inside drawers (About, Ratings & reviews) */
  drawerSection:
    "text-sm font-semibold tracking-tight sm:text-[0.9375rem]",

  /** “See all”, compact links */
  link: "text-xs font-semibold leading-none sm:text-sm",

  /** Category nav chips */
  chip: "text-xs font-semibold leading-none",

  /** List / row primary line */
  listPrimary: "truncate text-sm font-semibold leading-tight",

  /** List / row secondary */
  listMeta:
    "text-muted-foreground mt-0.5 truncate text-[11px] leading-tight sm:text-xs",

  /** Featured story card headline */
  featuredHeadline: "text-base font-semibold leading-tight text-white",

  /** Featured story card description */
  featuredSub: "mt-1 line-clamp-2 text-xs leading-snug text-white/75",

  /** App directory grid caption under icon */
  tileTitle:
    "w-full px-0.5 text-center text-[10px] font-medium leading-[1.25] text-foreground/90 line-clamp-2 sm:text-[11px]",

  /** Search fields */
  input: "text-xs sm:text-sm",

  /** Paragraph body (muted) */
  bodyMuted: "text-muted-foreground text-xs leading-relaxed sm:text-sm",

  /** Paragraph body on default foreground */
  body: "text-xs leading-relaxed sm:text-sm",

  /** Modal / drawer hero title */
  modalHeroTitle: "text-sm font-semibold leading-tight text-white sm:text-base",

  /** Modal / drawer hero tagline */
  modalHeroTagline:
    "mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/80 sm:text-xs",

  /** Large rating numeral */
  ratingScore: "text-xl font-semibold tabular-nums leading-none",

  /** Review title in list */
  reviewTitle: "truncate text-xs font-semibold sm:text-sm",

  /** Review paragraph */
  reviewBody: "text-xs leading-relaxed sm:text-sm text-foreground/90",

  /** Fine print footers */
  footnote:
    "text-muted-foreground text-center text-[10px] leading-relaxed sm:text-[11px]",

  /** Menu uppercase labels */
  menuLabel:
    "text-muted-foreground text-[10px] font-medium uppercase tracking-wider sm:text-[11px]",

  /** Monospace addresses */
  menuMono: "font-mono text-[11px] leading-snug break-all text-foreground/90 sm:text-xs",

  /** Loading / redirect copy */
  status: "text-muted-foreground text-xs",

  /** Primary pill CTAs (GET, Done) */
  cta: "text-xs font-semibold",

  /** Page subtitle under masthead */
  subtitle: "text-muted-foreground mt-2 max-w-md text-xs leading-snug sm:text-sm",

  /** Empty state message */
  empty: "text-muted-foreground px-1 py-8 text-center text-xs sm:text-sm",
} as const;
