import { CircleDollarSignIcon } from "../ui/circle-dollar-sign";
import { RouteIcon } from "../ui/route";
import { ChessPawnIcon } from "../ui/chess-pawn";
import { CpuIcon } from "../ui/cpu";
import { UsersIcon } from "../ui/users";
import { BrainIcon } from "../ui/brain";

export type CategoryId =
  | "defi"
  | "nfts"
  | "games"
  | "infra"
  | "social"
  | "dao";

export const DEFAULT_CATEGORY_ID: CategoryId = "defi";

const CATEGORY_SET = new Set<CategoryId>([
  "defi",
  "nfts",
  "games",
  "infra",
  "social",
  "dao",
]);

export function parseCategoryId(value: string | null): CategoryId {
  if (value && CATEGORY_SET.has(value as CategoryId)) {
    return value as CategoryId;
  }
  return DEFAULT_CATEGORY_ID;
}

/** Strict: use for URL segments — invalid values should trigger `notFound()`. */
export function parseCategoryParam(segment: string): CategoryId | null {
  if (CATEGORY_SET.has(segment as CategoryId)) {
    return segment as CategoryId;
  }
  return null;
}

export type DiscoverRow = {
  name: string;
  tag: string;
  logo: string;
  slug: string;
};

export type EditorialRow = {
  label: string;
  sublabel: string;
  logo: string;
  image: string;
  description: string;
  slug: string;
};

export type FavoriteRow = { name: string; cat: string; slug: string };

/** Animated category chips: all use the same responsive wrapper + optional `size` prop. */
export type CategoryLauncherIcon =
  | typeof CircleDollarSignIcon
  | typeof RouteIcon
  | typeof ChessPawnIcon
  | typeof CpuIcon
  | typeof UsersIcon
  | typeof BrainIcon;

export type CategoryTabContent = {
  discoverTop: DiscoverRow[];
  editorialItems: EditorialRow[];
  featuredNew: EditorialRow[];
  favorites: FavoriteRow[];
};

export const CATEGORY_LAUNCHER: {
  id: CategoryId;
  label: string;
  icon: CategoryLauncherIcon;
}[] = [
  { id: "defi", label: "DeFi", icon: CircleDollarSignIcon },
  { id: "nfts", label: "NFTs", icon: RouteIcon },
  { id: "games", label: "Games", icon: ChessPawnIcon },
  { id: "infra", label: "Infra", icon: CpuIcon },
  { id: "social", label: "Social", icon: UsersIcon },
  { id: "dao", label: "DAO", icon: BrainIcon },
];

/** Shared imagery for editorial / featured cards (varied by category). */
const U1 =
  "https://images.unsplash.com/photo-1773546057870-ba1b62601d1e?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const U2 =
  "https://images.unsplash.com/photo-1774028156717-6b9f92babd2d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const U3 =
  "https://images.unsplash.com/photo-1773929651401-04db346329dd?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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

const DISCOVER_DEFI: DiscoverRow[] = [
  { name: "Jupiter", tag: "DEX · Aggregator", logo: L_JUP, slug: "jupiter" },
  { name: "Tensor", tag: "NFT Marketplace", logo: L_TENSOR, slug: "tensor" },
  { name: "Magic Eden", tag: "NFTs · Drops", logo: L_ME, slug: "magic-eden" },
  { name: "Phantom", tag: "Wallet", logo: L_PH, slug: "phantom" },
  { name: "Marinade", tag: "Liquid staking", logo: L_MARINADE, slug: "marinade" },
  { name: "Drift", tag: "Perpetuals", logo: L_DRIFT, slug: "drift" },
];

const EDITORIAL_DEFI: EditorialRow[] = [
  {
    label: "Jupiter",
    sublabel: "GET",
    logo: L_JUP,
    image: U1,
    description: "Swap routes across Solana DEXs",
    slug: "jupiter",
  },
  {
    label: "Tensor",
    sublabel: "GET",
    logo: L_TENSOR,
    image: U2,
    description: "Trade NFTs with pro tools",
    slug: "tensor",
  },
  {
    label: "Magic Eden",
    sublabel: "GET",
    logo: L_ME,
    image: U3,
    description: "Discover collections & drops",
    slug: "magic-eden",
  },
];

const FAVORITES_DEFI: FavoriteRow[] = [
  { name: "Marinade", cat: "Liquid staking", slug: "marinade" },
  { name: "Drift", cat: "Perps", slug: "drift" },
  { name: "Meteora", cat: "Liquidity", slug: "meteora" },
];

const DISCOVER_NFTS: DiscoverRow[] = [
  { name: "Tensor", tag: "Pro trading", logo: L_TENSOR, slug: "tensor" },
  { name: "Magic Eden", tag: "Marketplace", logo: L_ME, slug: "magic-eden" },
  { name: "Phantom", tag: "Collectibles", logo: L_PH, slug: "phantom" },
  { name: "Tensor", tag: "Rarity tools", logo: L_TENSOR, slug: "tensor" },
  { name: "Magic Eden", tag: "Launchpad", logo: L_ME, slug: "magic-eden" },
  { name: "Tensor", tag: "Bids", logo: L_TENSOR, slug: "tensor" },
];

const EDITORIAL_NFTS: EditorialRow[] = [
  {
    label: "Tensor",
    sublabel: "GET",
    logo: L_TENSOR,
    image: U2,
    description: "Trade NFTs with pro tools",
    slug: "tensor",
  },
  {
    label: "Magic Eden",
    sublabel: "GET",
    logo: L_ME,
    image: U3,
    description: "Discover collections & drops",
    slug: "magic-eden",
  },
  {
    label: "Phantom",
    sublabel: "GET",
    logo: L_PH,
    image: U1,
    description: "Hold your collectibles in one place",
    slug: "phantom",
  },
];

const FAVORITES_NFTS: FavoriteRow[] = [
  { name: "Tensor", cat: "Trading", slug: "tensor" },
  { name: "Magic Eden", cat: "Marketplace", slug: "magic-eden" },
  { name: "Phantom", cat: "Wallet", slug: "phantom" },
];

const DISCOVER_GAMES: DiscoverRow[] = [
  { name: "Star Atlas", tag: "MMO", logo: L_JUP, slug: "star-atlas" },
  { name: "Aurory", tag: "RPG", logo: L_TENSOR, slug: "aurory" },
  { name: "Defi Land", tag: "Simulation", logo: L_ME, slug: "defi-land" },
  { name: "Step", tag: "Move-to-earn", logo: L_PH, slug: "step" },
  { name: "Genopets", tag: "Pet battles", logo: L_MARINADE, slug: "genopets" },
  { name: "Mini Royale", tag: "FPS", logo: L_DRIFT, slug: "mini-royale" },
];

const EDITORIAL_GAMES: EditorialRow[] = [
  {
    label: "Star Atlas",
    sublabel: "GET",
    logo: L_JUP,
    image: U1,
    description: "Explore space in a Solana-native MMO",
    slug: "star-atlas",
  },
  {
    label: "Aurory",
    sublabel: "GET",
    logo: L_TENSOR,
    image: U2,
    description: "Turn-based RPG with collectible Nefties",
    slug: "aurory",
  },
  {
    label: "Defi Land",
    sublabel: "GET",
    logo: L_ME,
    image: U3,
    description: "Farm, craft, and trade in a metaverse",
    slug: "defi-land",
  },
];

const FAVORITES_GAMES: FavoriteRow[] = [
  { name: "Star Atlas", cat: "Space MMO", slug: "star-atlas" },
  { name: "Aurory", cat: "RPG", slug: "aurory" },
  { name: "Genopets", cat: "Pet battles", slug: "genopets" },
];

const DISCOVER_INFRA: DiscoverRow[] = [
  { name: "Helius", tag: "RPC & APIs", logo: L_JUP, slug: "helius" },
  { name: "QuickNode", tag: "Infrastructure", logo: L_TENSOR, slug: "quicknode" },
  { name: "Triton", tag: "RPC", logo: L_ME, slug: "triton" },
  { name: "GenesysGo", tag: "Storage", logo: L_PH, slug: "genesysgo" },
  { name: "Shyft", tag: "Data APIs", logo: L_MARINADE, slug: "shyft" },
  { name: "Ironforge", tag: "Developer tools", logo: L_DRIFT, slug: "ironforge" },
];

const EDITORIAL_INFRA: EditorialRow[] = [
  {
    label: "Helius",
    sublabel: "GET",
    logo: L_JUP,
    image: U1,
    description: "Fast RPC and webhooks for Solana builders",
    slug: "helius",
  },
  {
    label: "QuickNode",
    sublabel: "GET",
    logo: L_TENSOR,
    image: U2,
    description: "Multi-chain endpoints with analytics",
    slug: "quicknode",
  },
  {
    label: "Shyft",
    sublabel: "GET",
    logo: L_ME,
    image: U3,
    description: "GraphQL and NFT APIs for apps",
    slug: "shyft",
  },
];

const FAVORITES_INFRA: FavoriteRow[] = [
  { name: "Helius", cat: "RPC", slug: "helius" },
  { name: "QuickNode", cat: "Endpoints", slug: "quicknode" },
  { name: "Shyft", cat: "Indexing", slug: "shyft" },
];

const DISCOVER_SOCIAL: DiscoverRow[] = [
  { name: "Dialect", tag: "Messaging", logo: L_JUP, slug: "dialect" },
  { name: "Access", tag: "Passes", logo: L_TENSOR, slug: "access" },
  { name: "Grape", tag: "Communities", logo: L_ME, slug: "grape" },
  { name: "Bonfida", tag: "Names", logo: L_PH, slug: "bonfida" },
  { name: "Solana ID", tag: "Identity", logo: L_MARINADE, slug: "solana-id" },
  { name: "Wordcel", tag: "Publishing", logo: L_DRIFT, slug: "wordcel" },
];

const EDITORIAL_SOCIAL: EditorialRow[] = [
  {
    label: "Dialect",
    sublabel: "GET",
    logo: L_JUP,
    image: U1,
    description: "Wallet-native chat and notifications",
    slug: "dialect",
  },
  {
    label: "Access",
    sublabel: "GET",
    logo: L_TENSOR,
    image: U2,
    description: "Token-gated experiences for communities",
    slug: "access",
  },
  {
    label: "Grape",
    sublabel: "GET",
    logo: L_ME,
    image: U3,
    description: "Membership tools for DAOs and creators",
    slug: "grape",
  },
];

const FAVORITES_SOCIAL: FavoriteRow[] = [
  { name: "Dialect", cat: "Chat", slug: "dialect" },
  { name: "Access", cat: "Passes", slug: "access" },
  { name: "Grape", cat: "Communities", slug: "grape" },
];

const DISCOVER_DAO: DiscoverRow[] = [
  { name: "Realms", tag: "Governance", logo: L_JUP, slug: "realms" },
  { name: "Squads", tag: "Multisig", logo: L_TENSOR, slug: "squads" },
  { name: "Grape", tag: "DAO tooling", logo: L_ME, slug: "grape" },
  { name: "Streamflow", tag: "Vesting", logo: L_PH, slug: "streamflow" },
  { name: "Marinade", tag: "Liquid staking", logo: L_MARINADE, slug: "marinade" },
  { name: "Drift", tag: "Treasury", logo: L_DRIFT, slug: "drift" },
];

const EDITORIAL_DAO: EditorialRow[] = [
  {
    label: "Realms",
    sublabel: "GET",
    logo: L_JUP,
    image: U1,
    description: "On-chain proposals and DAO governance",
    slug: "realms",
  },
  {
    label: "Squads",
    sublabel: "GET",
    logo: L_TENSOR,
    image: U2,
    description: "Multisig and team wallets on Solana",
    slug: "squads",
  },
  {
    label: "Streamflow",
    sublabel: "GET",
    logo: L_ME,
    image: U3,
    description: "Token vesting and payroll for DAOs",
    slug: "streamflow",
  },
];

const FAVORITES_DAO: FavoriteRow[] = [
  { name: "Realms", cat: "Governance", slug: "realms" },
  { name: "Squads", cat: "Multisig", slug: "squads" },
  { name: "Streamflow", cat: "Vesting", slug: "streamflow" },
];

export const CATEGORY_TAB_CONTENT: Record<CategoryId, CategoryTabContent> = {
  defi: {
    discoverTop: DISCOVER_DEFI,
    editorialItems: EDITORIAL_DEFI,
    featuredNew: EDITORIAL_DEFI,
    favorites: FAVORITES_DEFI,
  },
  nfts: {
    discoverTop: DISCOVER_NFTS,
    editorialItems: EDITORIAL_NFTS,
    featuredNew: EDITORIAL_NFTS,
    favorites: FAVORITES_NFTS,
  },
  games: {
    discoverTop: DISCOVER_GAMES,
    editorialItems: EDITORIAL_GAMES,
    featuredNew: EDITORIAL_GAMES,
    favorites: FAVORITES_GAMES,
  },
  infra: {
    discoverTop: DISCOVER_INFRA,
    editorialItems: EDITORIAL_INFRA,
    featuredNew: EDITORIAL_INFRA,
    favorites: FAVORITES_INFRA,
  },
  social: {
    discoverTop: DISCOVER_SOCIAL,
    editorialItems: EDITORIAL_SOCIAL,
    featuredNew: EDITORIAL_SOCIAL,
    favorites: FAVORITES_SOCIAL,
  },
  dao: {
    discoverTop: DISCOVER_DAO,
    editorialItems: EDITORIAL_DAO,
    featuredNew: EDITORIAL_DAO,
    favorites: FAVORITES_DAO,
  },
};
