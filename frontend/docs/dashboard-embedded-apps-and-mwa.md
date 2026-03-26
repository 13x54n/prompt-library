# Dashboard embedded apps and MWA

Maintainer notes for Home multitasking (iframes), state persistence, and how that relates to the Mobile Wallet Adapter (MWA) in the Maple **shell**.

## How dashboard apps are configured

- **`components/dashboard/dapp-app-registry.ts`**
  - **`APP_DETAILS`** — storefront metadata (name, copy, logos, reviews).
  - **`SITE_URL_BY_SLUG`** — URL loaded inside the Home launcher `<iframe>` for each slug (e.g. `https://jup.ag`).
  - **`PURCHASED_APP_SLUGS`** — slugs that appear in the signed-in user’s Home library.
- To add an app: extend `APP_DETAILS`, add a `SITE_URL_BY_SLUG` entry, and include the slug in `PURCHASED_APP_SLUGS` if it should show on Home.
- **Home vs Explore:** opening from Home calls `openApp(slug)` on `DashboardAppWindowsContext` and uses the drawer / iframe stack. Marketplace app detail uses separate modal/drawer flows.

## State persistence (scroll and in-app UI)

- **Mechanism:** There is **one `<iframe>` per `DashboardAppWindow` id** until the user closes that window. Iframes are stacked; only the active window is visible (`opacity` / `z-index` / `pointer-events`). Inactive instances stay mounted so the browser keeps each document’s scroll and client state.
- **Important:** The title bar must not wrap the iframe stack in a **different** React subtree when minimizing (`chrome` toggles on `DashboardHomeAppSurface` while the iframe container stays the same parent). Remounting the stack would reload embeds.
- **Cross-origin:** Maple cannot read `iframe.contentWindow` scroll for third-party URLs. Persistence comes from **keeping the iframe alive**, not from saving scroll in React state or `sessionStorage`.
- **Full reload:** Everything is cleared unless you add optional `sessionStorage` for the window list only (iframes would still reload).
- **Routing:** `components/dashboard/dashboard-windows-shell.tsx` plus `app/dashboard/layout.tsx` mount `DashboardAppWindowsProvider` and `DashboardAppDrawerStack` for all `/dashboard/*` routes so multitasking survives Explore / Build navigation.

## MWA vs embedded dApps

- **MWA registration** lives in `components/wallet/solana-wallet-provider.tsx`: `registerMwa` with `appIdentity` (`name`, `uri`, `icon`), `chains`, `authorizationCache`, `chainSelector`, and `onWalletNotFound`. That connection is for the **Maple host** (dashboard shell).
- **`MapleWalletMultiButton`** (`components/wallet/maple-wallet-multi-button.tsx`) prefers the MWA adapter when available and connects in the same gesture where possible (typical on Android with a compatible wallet app).
- **Embedded iframes** run on **their own origins**. The wallet session in Maple **does not** automatically apply inside those frames. Each dApp handles connect (extension, its own MWA/deeplink flows, etc.). Bridging host ↔ iframe wallets would need an explicit design (`postMessage`, same-origin embeds, or future wallet-standard integration).

## Iframe sandbox

- Home launcher iframes in `components/dashboard/dashboard-app-drawer-stack.tsx` use a `sandbox` attribute (scripts, same-origin, forms, popups, downloads). Tightening or loosening flags changes what embedded sites can do; coordinate with product/security if you change it.
