# UI Design Contract: Swarajya Commerce UI/UX & Motion Redesign

> **Phase 6 Design Specification**  
> Synthesizing **UI/UX Pro Max** (Design Intelligence, Accessibility, Typography) and **UI-Motion** (Named Motion Seeds: Spring, Silk, Snap, Pulse).

---

## 1. Brand Identity & Design System Foundations

### 1.1 Brand Archetype: Sovereign Modern Commerce
- **Tone & Mood:** Sovereign, precision-crafted, high-velocity, authoritative, unobtrusive.
- **Visual Style:** Minimalist obsidian dark-mode with layered glassmorphic depth, razor-thin borders (`1px border-zinc-800/80`), and high-contrast typography.
- **Brand Accent:** 
  - Primary Accent: **Electric Indigo** (`#6366f1` / `indigo-500`) with subtle glow accents (`shadow-indigo-500/20`).
  - Warm Sovereign Highlight: **Saffron Gold** (`#f59e0b` / `amber-500`) for verified badges, loyalty points, and premium collection highlights.
  - Success Indicator: **Emerald** (`#10b981` / `emerald-400`) for in-stock inventory and completed transactions.

### 1.2 Color Palette Specifications (WCAG 2.1 AA Compliant)

| Token Name | Tailwind Class | Hex Value | Purpose | Contrast vs Background |
| :--- | :--- | :--- | :--- | :--- |
| `background-deep` | `bg-zinc-950` | `#09090b` | Root page background | Base |
| `background-surface` | `bg-zinc-900/70` | `#18181b` | Cards, modals, drawers | 1.3:1 (structure) |
| `background-elevated`| `bg-zinc-850` | `#202024` | Hover states, active dropdowns | 2.1:1 |
| `border-subtle` | `border-zinc-800/70` | `#27272a` | Dividing lines, card borders | 1.8:1 |
| `border-active` | `border-zinc-700` | `#3f3f46` | Focused inputs, hover borders | 3.2:1 |
| `text-primary` | `text-zinc-50` | `#fafafa` | Primary headings, titles, prices | 16.8:1 (AAA Pass) |
| `text-secondary` | `text-zinc-400` | `#a1a1aa` | Metadata, descriptions, breadcrumbs| 7.1:1 (AAA Pass) |
| `text-muted` | `text-zinc-500` | `#71717a` | Captions, timestamps, disabled text | 4.6:1 (AA Pass) |
| `accent-primary` | `text-indigo-400` | `#818cf8` | CTAs, active pills, links | 8.4:1 (AAA Pass) |

### 1.3 Typography System
- **Display Font:** Inter / System Sans with negative tracking (`tracking-tight` / `-0.025em`) for punchy editorial presence.
- **Body Font:** Inter with regular tracking, generous line-height (`leading-relaxed` / `1.6`) for reading comfort.
- **Scale:**
  - Hero Display: `text-4xl md:text-6xl font-extrabold tracking-tight`
  - Section Headings: `text-2xl md:text-3xl font-bold tracking-tight`
  - Card Titles: `text-base font-semibold text-zinc-100`
  - Body Text: `text-sm text-zinc-300 leading-relaxed`
  - Microcopy / Labels: `text-xs font-medium uppercase tracking-wider text-zinc-400`

---

## 2. Motion Design Tokens (UI-Motion Specification)

Following the **Single Seed per Context** rule:
- **Silk (Smooth & Fluid):** Reserved for page enters, modal/dialog reveals, cart slide-over drawer, and accordion expansions.
- **Snap (Instant & Decisive):** Used for navigation tabs, facet filter toggles, variant pills, and dropdowns.
- **Spring (Tactile & Alive):** Applied to primary CTA presses, "Add to Cart" confirmation bursts, and heart/favorite buttons.
- **Pulse (Heartbeat Indicator):** Looping live inventory dots (`pulse-beat`) indicating real-time stock levels.
- **Shimmer (Directional Progress):** High-elegance skeleton loading sweeps across cards while assets resolve.

### Motion Parameter Matrix

| Motion Keyword | CSS / Tailwind Transition | Easing Curve | Duration | Trigger / Context |
| :--- | :--- | :--- | :--- | :--- |
| `silk-enter` | `transition-all opacity-0 translate-y-3` &rarr; `opacity-100 translate-y-0` | `cubic-bezier(0.16, 1, 0.3, 1)` | 350ms | Sheet / Dialog / Page mount |
| `silk-drawer` | `translate-x-full` &rarr; `translate-x-0` | `cubic-bezier(0.25, 1, 0.5, 1)` | 400ms | Cart Drawer slide-over |
| `snap-tab` | `transition-colors duration-150` | `ease-out` | 150ms | Variant selector / Category tab |
| `spring-press`| `active:scale-[0.97]` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 180ms | Primary CTA buttons |
| `card-lift` | `hover:-translate-y-1 hover:shadow-2xl hover:border-zinc-700` | `cubic-bezier(0.16, 1, 0.3, 1)` | 250ms | Product card hover |
| `shimmer` | `bg-gradient-to-r via-zinc-800/50 to-transparent animate-pulse`| Linear | 1200ms | Async skeleton placeholders |

---

## 3. Screen-by-Screen Component Specifications

### 3.1 Storefront Header & Global Navigation
- **Backdrop:** `sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/70`.
- **Search Dialog:** Instant `⌘K` / `Ctrl+K` shortcut trigger with blurred backdrop overlay and auto-focused predictive input.
- **Cart Badge:** Pulsing numerical pill indicating live item count with bouncy entrance on cart mutation.
- **Navigation Links:** Underline indicator sliding between active category handles.

### 3.2 Product Card Redesign (`ProductCard`)
- **Aspect Ratio:** Fixed `aspect-[4/5]` for consistent, high-fashion editorial balance.
- **Image Treatment:** Image scale transition on hover (`group-hover:scale-105 duration-500 ease-out`).
- **Stock Chip:** Real-time indicator:
  - In Stock: `text-emerald-400 bg-emerald-500/10 border-emerald-500/20` with a subtle green pulse dot.
  - Low Stock (< 10 units): `text-amber-400 bg-amber-500/10 border-amber-500/20` ("Only X left").
- **Quick Action:** Quick "Add to Bag" button slides up from the card bottom on hover (`translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100`).

### 3.3 Product Detail Page (PDP)
- **Gallery Grid:** Sticky split layout on desktop (2-column staggered image showcase with zoomable high-res thumbnails).
- **Variant Selector:** Distinctive tactile pills with instant state change, price auto-calculation, and crossed-out states for depleted variants.
- **Urgency & Inventory Badge:** Clear, honest inventory notice (e.g. `14 items left in stock`).
- **Sticky Add-to-Cart Bar:** Mobile bottom floating bar ensuring primary CTA is permanently within thumb reach.

### 3.4 Slide-Over Cart Drawer (`CartDrawer`)
- **Entrance:** Smooth right-to-left Silk slide with backdrop-blur dimming.
- **Shipping Threshold Meter:** Visual animated progress bar:
  - Calculation: $\min(100, (\text{subtotal} / 10000) \times 100)$
  - Message: *"Add $18.00 more for Free Worldwide Express Delivery"*
- **Item Cards:** Thumbnail, title, selected variant chips, quantity micro-stepper (`-` / `+`), and instant trash action.
- **Express Checkout CTA:** Prominent primary button showing total price with lock icon (`Secure Checkout`).

### 3.5 Customer Portal (`/account`)
- **Layout:** High-clarity tabbed navigation (Recent Orders, Saved Addresses, Profile).
- **Fulfillment Tracker:** Visual 4-stage tracking stepper (`Ordered` &rarr; `Processing` &rarr; `Dispatched` &rarr; `Delivered`) with direct courier link.

### 3.6 Merchant Command Center (`/admin`)
- **KPI Cards:** Redesigned with micro sparkline visualizations and percentage change deltas.
- **Revenue Chart:** Gradient area curve with interactive date hover and dollar tooltips.
- **Top Sellers Leaderboard:** Rank badges (`#1`, `#2`, `#3`) with revenue bars.

---

## 4. Accessibility & Touch Standards (UI/UX Pro Max Rules)
- **Touch Targets:** All interactive elements (`<button>`, `<a>`, `<input>`) have a minimum tap target of **44x44px**.
- **Focus Rings:** High-visibility outline on keyboard navigation (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950`).
- **Screen Reader Support:** Explicit `aria-label` on all icon-only buttons (Search, Cart, Close Drawer, Increment/Decrement).
- **Form Error States:** Inline red validation messages positioned adjacent to input fields with `role="alert"`.
