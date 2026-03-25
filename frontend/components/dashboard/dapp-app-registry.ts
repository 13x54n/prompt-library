import {
  CATEGORY_LAUNCHER,
  DEFAULT_CATEGORY_ID,
  type CategoryId,
} from "./dapp-marketplace-category-data";

export type AppReview = {
  user: string;
  rating: number;
  date: string;
  title: string;
  body: string;
};

export type AppDetail = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  developer: string;
  categoryLabel: string;
  logo: string;
  heroImage: string;
  ratingAverage: number;
  ratingCount: number;
  reviews: AppReview[];
};

const U1 =
  "https://images.unsplash.com/photo-1773546057870-ba1b62601d1e?q=80&w=1200&auto=format&fit=crop";
const U2 =
  "https://images.unsplash.com/photo-1774028156717-6b9f92babd2d?q=80&w=1200&auto=format&fit=crop";

const L_JUP =
  "https://imgs.search.brave.com/VEvcOvt1TH152rqhypMcSltQxhmA9RPldcpedvGTiSA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YWxjaGVteS5jb20v/ZGFwcHMvX25leHQv/aW1hZ2U_dXJsPWh0/dHBzOi8vcmVzLmNs/b3VkaW5hcnkuY29t/L2FsY2hlbXktd2Vi/c2l0ZS9pbWFnZS91/cGxvYWQvdjE3MTA1/MzgyNzYvZGFwcC1z/dG9yZS9kYXBwLWxv/Z29zL0p1cGl0ZXIu/anBnJnc9NjQwJnE9/NzU";
const L_TENSOR = "https://s2.coinmarketcap.com/static/img/coins/64x64/30449.png";
const L_ME =
  "https://imgs.search.brave.com/yByfX8Rm004KJ-4awiUUSabyS2DTHrADM8RWttPthY0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZXMu/Y2xvdWRpbmFyeS5j/b20vZGd2bnV3c3By/L2ltYWdlL3VwbG9h/ZC92MTY3OTkwMTQz/Ni9lYXJuLXNwb25z/b3JzL3JlY21LNllu/ejhITXBhNVdrLnBu/Zw";
const L_PH =
  "https://imgs.search.brave.com/0egHIE1mIZIt7rBoFFzoV7qwv6vAWozE51ALc-qxu3M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YnJhbmRmZXRjaC5p/by9pZF9IS0l5dFVi/L3cvNDAwL2gvNDAw/L3RoZW1lL2Rhcmsv/aWNvbi5qcGVnP2M9/MWJ4aWQ2NE11cDdh/Y3pld1NBWU1YJnQ9/MTY2NzgxMjY4MzU2/MA";
const L_MARINADE =
  "https://imgs.search.brave.com/6sAypFNpcEjZVd5qxpyx9VS7Ayqw5blIz5uQwT5qKLM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YWxjaGVteS5jb20v/ZGFwcHMvX25leHQv/aW1hZ2U_dXJsPWh0/dHBzOi8vcmVzLmNs/b3VkaW5hcnkuY29t/L2FsY2hlbXktd2Vi/c2l0ZS9pbWFnZS91/cGxvYWQvdjE2OTQ2/NzU0NDEvZGFwcC1z/dG9yZS9kYXBwLWxv/Z29zL01hcmluYWRl/JTIwRmluYW5jZS5q/cGcmdz02NDAmcT03/NQ";
const L_DRIFT =
  "https://imgs.search.brave.com/G_Jv_BO9TCqtxUEXzAIZGv0ZyEKz4klTaCIFBivs3zw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zMy1z/eW1ib2wtbG9nby50/cmFkaW5ndmlldy5j/b20vY3J5cHRvL1hU/VkNEUklGVC0tYmln/LnN2Zw";

function reviewsFor(
  appName: string,
  seed: number,
): AppReview[] {
  const base = [
    {
      user: "sol_builder",
      rating: 5,
      date: "2025-03-02",
      title: "Exactly what I needed",
      body: `${appName} is fast and the UX feels native. No complaints after two weeks of daily use.`,
    },
    {
      user: "nft_coffee",
      rating: 4,
      date: "2025-02-18",
      title: "Solid, minor nitpicks",
      body: `Great overall. Would love clearer error copy when transactions fail — otherwise five stars.`,
    },
    {
      user: "validator_cat",
      rating: 5,
      date: "2025-01-30",
      title: "Reliable on mobile",
      body: `Works well on Safari iOS. Signing flows are smooth compared to other dApps I've tried.`,
    },
  ];
  return base.map((r, i) => ({
    ...r,
    rating: (seed + i) % 3 === 0 ? 4 : 5,
  }));
}

function app(
  slug: string,
  name: string,
  tagline: string,
  description: string,
  developer: string,
  categoryLabel: string,
  logo: string,
  heroImage: string,
  ratingAverage: number,
  ratingCount: number,
  seed: number,
): AppDetail {
  return {
    slug,
    name,
    tagline,
    description,
    developer,
    categoryLabel,
    logo,
    heroImage,
    ratingAverage,
    ratingCount,
    reviews: reviewsFor(name, seed),
  };
}

/** Curated storefront metadata + reviews (Maple directory is illustrative). */
const APP_DETAILS: AppDetail[] = [
  app(
    "jupiter",
    "Jupiter",
    "Best price swaps on Solana",
    "Jupiter aggregates liquidity across Solana DEXs so you get better routes, less slippage, and a simple swap experience from one place.",
    "Jupiter Team",
    "DeFi",
    L_JUP,
    U1,
    4.8,
    12400,
    1,
  ),
  app(
    "tensor",
    "Tensor",
    "Pro NFT trading",
    "Tensor brings limit orders, collection-wide bids, and pro charts to Solana NFTs.",
    "Tensor Labs",
    "NFTs",
    L_TENSOR,
    U2,
    4.6,
    8200,
    2,
  ),
  app(
    "magic-eden",
    "Magic Eden",
    "Discover and trade NFTs",
    "Browse curated drops, secondary markets, and launchpads with a marketplace tuned for collectors.",
    "Magic Eden",
    "NFTs",
    L_ME,
    U1,
    4.7,
    15300,
    3,
  ),
  app(
    "phantom",
    "Phantom",
    "The friendly crypto wallet",
    "Hold tokens and NFTs, connect to dApps, and sign with a wallet built for mainstream users.",
    "Phantom",
    "Wallet",
    L_PH,
    U2,
    4.9,
    42000,
    4,
  ),
  app(
    "marinade",
    "Marinade Finance",
    "Liquid staking on Solana",
    "Stake SOL while keeping liquidity through mSOL — participate in DeFi without locking up capital.",
    "Marinade DAO",
    "DeFi",
    L_MARINADE,
    U1,
    4.5,
    3100,
    5,
  ),
  app(
    "drift",
    "Drift",
    "Perps and spot on Solana",
    "Trade perpetuals and spot with cross-margin and deep liquidity in a single interface.",
    "Drift Protocol",
    "DeFi",
    L_DRIFT,
    U2,
    4.4,
    5600,
    6,
  ),
  app(
    "meteora",
    "Meteora",
    "Liquidity infrastructure",
    "Dynamic pools and liquidity tooling for builders launching markets on Solana.",
    "Meteora",
    "DeFi",
    L_JUP,
    U1,
    4.5,
    900,
    7,
  ),
  app(
    "star-atlas",
    "Star Atlas",
    "Space MMO on Solana",
    "Explore a grand strategy universe with ships, factions, and an on-chain economy.",
    "ATMTA",
    "Games",
    L_JUP,
    U2,
    4.3,
    2100,
    8,
  ),
  app(
    "aurory",
    "Aurory",
    "RPG with collectible Nefties",
    "Turn-based battles, quests, and NFT creatures in a polished game loop.",
    "Aurory Studio",
    "Games",
    L_TENSOR,
    U1,
    4.5,
    1800,
    9,
  ),
  app(
    "defi-land",
    "Defi Land",
    "Simulation meets DeFi",
    "Farm, craft, and progress in a metaverse that connects to real protocols.",
    "Defi Land",
    "Games",
    L_ME,
    U2,
    4.2,
    950,
    10,
  ),
  app(
    "step",
    "Step",
    "Move to earn",
    "Track activity and earn rewards with a fitness layer tied to your wallet.",
    "Step Labs",
    "Games",
    L_PH,
    U1,
    4.1,
    720,
    11,
  ),
  app(
    "genopets",
    "Genopets",
    "Pet battles & evolution",
    "Raise a spirit animal and battle others in a mobile-first experience.",
    "Genopets",
    "Games",
    L_MARINADE,
    U2,
    4.4,
    1100,
    12,
  ),
  app(
    "mini-royale",
    "Mini Royale",
    "Fast-paced FPS",
    "Arcade shooter sessions with seasonal cosmetics and quick matchmaking.",
    "Indie Royale",
    "Games",
    L_DRIFT,
    U1,
    4.0,
    640,
    13,
  ),
  app(
    "helius",
    "Helius",
    "Solana RPC & webhooks",
    "Low-latency RPC, webhooks, and APIs for production apps.",
    "Helius",
    "Infra",
    L_JUP,
    U2,
    4.8,
    2400,
    14,
  ),
  app(
    "quicknode",
    "QuickNode",
    "Multi-chain infrastructure",
    "Endpoints, analytics, and tooling for teams shipping at scale.",
    "QuickNode",
    "Infra",
    L_TENSOR,
    U1,
    4.7,
    1800,
    15,
  ),
  app(
    "triton",
    "Triton",
    "RPC for builders",
    "Reliable Solana RPC with predictable performance for bots and backends.",
    "Triton One",
    "Infra",
    L_ME,
    U2,
    4.3,
    420,
    16,
  ),
  app(
    "genesysgo",
    "GenesysGo",
    "Storage & RPC",
    "Decentralized storage paired with network access for Solana apps.",
    "GenesysGo",
    "Infra",
    L_PH,
    U1,
    4.2,
    380,
    17,
  ),
  app(
    "shyft",
    "Shyft",
    "Indexing & GraphQL",
    "Query wallets, NFTs, and transactions with a unified data layer.",
    "Shyft",
    "Infra",
    L_MARINADE,
    U2,
    4.6,
    890,
    18,
  ),
  app(
    "ironforge",
    "Ironforge",
    "Developer tooling",
    "Ship faster with templates, testing utilities, and deployment helpers.",
    "Ironforge",
    "Infra",
    L_DRIFT,
    U1,
    4.1,
    210,
    19,
  ),
  app(
    "dialect",
    "Dialect",
    "Wallet messaging",
    "Notifications and chat that feel native to how users already sign in.",
    "Dialect",
    "Social",
    L_JUP,
    U2,
    4.5,
    1500,
    20,
  ),
  app(
    "access",
    "Access",
    "Token-gated access",
    "Create passes and gated experiences for your community.",
    "Access Labs",
    "Social",
    L_TENSOR,
    U1,
    4.3,
    620,
    21,
  ),
  app(
    "grape",
    "Grape",
    "Memberships for DAOs",
    "On-chain membership and tooling for creators and communities.",
    "Grape",
    "Social",
    L_ME,
    U2,
    4.4,
    780,
    22,
  ),
  app(
    "bonfida",
    "Bonfida",
    "Solana name service",
    "Human-readable names and profiles tied to your wallet.",
    "Bonfida",
    "Social",
    L_PH,
    U1,
    4.2,
    2100,
    23,
  ),
  app(
    "solana-id",
    "Solana ID",
    "Identity layer",
    "Portable identity primitives for apps that need verified users.",
    "Solana Foundation",
    "Social",
    L_MARINADE,
    U2,
    4.0,
    340,
    24,
  ),
  app(
    "wordcel",
    "Wordcel",
    "On-chain publishing",
    "Publish long-form content with censorship resistance and subscriptions.",
    "Wordcel",
    "Social",
    L_DRIFT,
    U1,
    4.3,
    410,
    25,
  ),
  app(
    "realms",
    "Realms",
    "DAO governance",
    "Create proposals, vote, and manage treasuries with Realms.",
    "Realms DAO",
    "DAO",
    L_JUP,
    U2,
    4.6,
    3200,
    26,
  ),
  app(
    "squads",
    "Squads",
    "Multisig wallets",
    "Team-controlled wallets with policy and spending controls.",
    "Squads Protocol",
    "DAO",
    L_TENSOR,
    U1,
    4.7,
    2800,
    27,
  ),
  app(
    "streamflow",
    "Streamflow",
    "Vesting & payroll",
    "Automate token vesting, payroll, and streaming payments.",
    "Streamflow",
    "DAO",
    L_ME,
    U2,
    4.5,
    1500,
    28,
  ),
];

const BY_SLUG = new Map(APP_DETAILS.map((a) => [a.slug, a]));

export function getAppDetail(slug: string): AppDetail | null {
  return BY_SLUG.get(slug) ?? null;
}

export function getAllAppSlugs(): string[] {
  return APP_DETAILS.map((a) => a.slug);
}

/** Full directory for dashboard home and similar views. */
export function getAllAppDetails(): AppDetail[] {
  return APP_DETAILS.slice();
}

/** Map storefront category label to browse route segment (e.g. for deep links). */
export function categoryLabelToCategoryId(label: string): CategoryId {
  const match = CATEGORY_LAUNCHER.find((c) => c.label === label);
  if (match) return match.id;
  if (label === "Wallet") return "infra";
  return DEFAULT_CATEGORY_ID;
}

