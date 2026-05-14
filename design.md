# Sysnotes by JFL Design System

## Overview

Status: Post Phase 8

Sysnotes by JFL is a minimalist changelog website for publishing release notes and website changes. The current public page is quiet, editorial, and scan-first: it favors generous spacing, clear hierarchy, thin borders, muted text, and a single high-visibility accent color.

The site uses Next.js 15, React 19, Tailwind CSS 3, and CSS tokens in `app/globals.css`.

Architecture boundaries:

- `/` is the frozen Sysnotes changelog. Do not edit `app/page.tsx` or `components/header.tsx` for tenant/admin work.
- `/[slug]/*` is the isolated tenant standalone branded page.
- `/admin/*` is the server-protected admin portal.
- Tenant releases publish only to `/[slug]/*`, never to `/`.

Persistence boundaries:

- `getTenantService()` and `getReleaseService(slug)` are server-only services.
- V1 persistence is file-based under `data/*.json`.
- Browser admin screens use tenant API routes for tenant identity and releases.
- Server-side tenant data must not use `localStorage`.

Brand status: Implemented

The product name is `Sysnotes by JFL`. The wordmark should render as two weights:

- `Sysnotes`: semibold
- `by JFL`: normal weight at a slightly reduced size

All former `Systnotes` references should be treated as legacy spelling and replaced with `Sysnotes by JFL`.

## Priority Map

### P0: Implemented Source Of Truth

- Public changelog page structure
- Header navigation
- Hero content
- Latest release panel
- Summary metrics
- Release notes list
- Web changes cards
- Global font stack, base colors, and selection styling
- Brand rename to `Sysnotes by JFL`

### P1: Implemented Design System Foundation

- CSS custom property token architecture
- Migration away from raw hex values in JSX
- Component-level tokens for header, hero, metrics, releases, cards, and footer
- Tenant-aware accent tokens for future white-label identity

### P2: Implemented Public Page Additions

- Footer
- Footer navigation
- Copyright and secondary brand line

### P3: Implemented Admin Portal V1

- Admin identity components
- `/admin/identity` route
- Brand name editing
- Logo upload
- Accent color selection
- Live preview
- File-backed tenant persistence through API routes

## Design Intent

Status: Implemented, with planned tenant extension

- Present release information clearly without visual clutter.
- Make the newest release immediately visible in the first viewport.
- Support fast scanning through repeated structures: version, date, title, summary, tags.
- Keep the interface neutral and product-focused rather than promotional.
- Use restrained contrast, simple divisions, and whitespace as the main layout tools.
- Planned: enable white-label identity per tenant through logo, colors, and brand name without breaking the editorial tone.

## Token Architecture

Status: Implemented for public page, planned for admin persistence

The public page now uses CSS custom properties for color and component styling instead of raw hex values in JSX. The design system follows a three-layer token structure:

```text
Primitive raw values
  -> Semantic purpose aliases
  -> Component-specific tokens
```

Current rule: public page component code should reference semantic or component tokens for colors, while primitive raw values stay centralized in `app/globals.css`.

### Primitive Tokens

Status: Implemented

```css
:root {
  /* Background primitives */
  --color-cream-50: #fbfbf7;
  --color-cream-100: #f7f7f3;
  --color-white: #ffffff;

  /* Text primitives */
  --color-ink-950: #171717;

  /* Opacity-based muted text */
  --color-ink-opacity-45: rgba(0, 0, 0, 0.45);
  --color-ink-opacity-50: rgba(0, 0, 0, 0.50);
  --color-ink-opacity-55: rgba(0, 0, 0, 0.55);
  --color-ink-opacity-60: rgba(0, 0, 0, 0.60);
  --color-ink-opacity-62: rgba(0, 0, 0, 0.62);
  --color-ink-opacity-65: rgba(0, 0, 0, 0.65);
  --color-ink-opacity-70: rgba(0, 0, 0, 0.70);

  /* Border primitives */
  --color-border-subtle: rgba(0, 0, 0, 0.10);
  --color-border-light: rgba(0, 0, 0, 0.15);

  /* Accent primitives */
  --color-lime-300: #d7ef7d;
  --color-lime-900: #263400;

  /* Tag surface */
  --color-tag-bg: #f0f0ea;
}
```

### Semantic Tokens

Status: Implemented

```css
:root {
  /* Surfaces */
  --surface-page: var(--color-cream-100);
  --surface-header: var(--color-cream-50);
  --surface-card: var(--color-white);

  /* Text roles */
  --text-primary: var(--color-ink-950);
  --text-muted-1: var(--color-ink-opacity-45);
  --text-muted-2: var(--color-ink-opacity-50);
  --text-muted-3: var(--color-ink-opacity-55);
  --text-muted-4: var(--color-ink-opacity-60);
  --text-muted-5: var(--color-ink-opacity-62);
  --text-muted-6: var(--color-ink-opacity-65);
  --text-muted-7: var(--color-ink-opacity-70);

  /* Borders */
  --border-subtle: var(--color-border-subtle);
  --border-light: var(--color-border-light);

  /* Accent */
  --accent-bg: var(--color-lime-300);
  --accent-text: var(--color-lime-900);

  /* Tags */
  --tag-bg: var(--color-tag-bg);
}
```

### Tenant Identity Tokens

Status: Implemented defaults, planned persistence

```css
:root {
  --tenant-brand-name: "Sysnotes by JFL";
  --tenant-logo-url: none;
  --tenant-accent-bg: var(--accent-bg);
  --tenant-accent-text: var(--accent-text);
}
```

Planned tenant theming behavior:

- The admin portal writes `--tenant-*` values to a per-tenant CSS override record.
- Components reference `--tenant-accent-bg` instead of `--accent-bg` where identity-aware coloring applies.
- Identity-aware areas include the Live badge, text selection, status pills, and admin save button.
- Neutral palette, typography, spacing, and layout remain global.

### Component Tokens

Status: Implemented for public components, planned for admin components

```css
:root {
  /* Header */
  --header-bg: var(--surface-header);
  --header-border: var(--border-subtle);
  --header-link-color: var(--text-muted-5);
  --header-link-hover: var(--text-primary);

  /* Hero */
  --hero-pill-bg: var(--tag-bg);
  --hero-pill-text: var(--text-muted-4);
  --hero-card-bg: var(--surface-card);
  --hero-card-shadow: 0 24px 70px rgba(0, 0, 0, 0.08);
  --hero-badge-bg: var(--tenant-accent-bg);
  --hero-badge-text: var(--tenant-accent-text);

  /* Metric */
  --metric-border: var(--border-subtle);
  --metric-value-color: var(--text-primary);
  --metric-label-color: var(--text-muted-5);

  /* Release row */
  --release-divider: var(--border-subtle);
  --release-version-color: var(--text-muted-5);
  --release-date-color: var(--text-muted-4);
  --release-title-color: var(--text-primary);
  --release-summary-color: var(--text-muted-5);
  --release-tag-bg: var(--tag-bg);
  --release-tag-text: var(--text-muted-4);

  /* Web change card */
  --card-bg: var(--surface-card);
  --card-border: var(--border-light);
  --card-label-color: var(--text-muted-5);
  --card-body-color: var(--text-muted-4);

  /* Footer */
  --footer-bg: var(--surface-header);
  --footer-border: var(--border-subtle);
  --footer-text: var(--text-muted-5);
  --footer-link-color: var(--text-muted-4);
  --footer-link-hover: var(--text-primary);

  /* Admin portal */
  --admin-sidebar-bg: var(--surface-card);
  --admin-sidebar-border: var(--border-light);
  --admin-input-border: var(--border-light);
  --admin-input-focus: var(--tenant-accent-bg);
  --admin-save-bg: var(--tenant-accent-bg);
  --admin-save-text: var(--tenant-accent-text);
  --admin-preview-border: var(--border-subtle);
}
```

## Public Page Structure

### Header

Status: Implemented

The header is a slim top navigation bar on an off-white surface.

- Brand wordmark: `Sysnotes` semibold and `by JFL` normal at slightly reduced size
- Desktop navigation links: `Releases`, `Web changes`, `Summary`
- Mobile behavior: navigation links are hidden below the `sm` breakpoint
- Styling: bottom border, compact vertical padding, centered max-width container

Implemented token mapping:

- Background: `--header-bg`
- Border: `--header-border`
- Link color: `--header-link-color`
- Link hover: `--header-link-hover`

### Hero

Status: Implemented

The hero introduces the product purpose and pairs the main message with a latest-release summary panel.

Left column:

- Pill label: `Release notes and website changes`
- Large headline explaining the product value
- Supporting paragraph describing the changelog use case

Right column:

- Latest release card with `aria-label="Latest release"`
- Version number
- `Live` status badge
- Release title, summary, and tags

Desktop layout uses two columns. Smaller screens stack the content naturally.

Implemented token mapping:

- Pill background: `--hero-pill-bg`
- Pill text: `--hero-pill-text`
- Card background: `--hero-card-bg`
- Card shadow: `--hero-card-shadow`
- Badge background: `--hero-badge-bg`
- Badge text: `--hero-badge-text`

### Summary Metrics

Status: Implemented

The summary section displays three lightweight metrics:

- `12` releases shipped
- `38` changes tracked
- `99.9%` website uptime

Each metric uses a top border, large value text, and uppercase tracking for the label.

Implemented token mapping:

- Border: `--metric-border`
- Value: `--metric-value-color`
- Label: `--metric-label-color`

### Release Notes

Status: Implemented

The release notes section is the primary content area. Each release follows the same information pattern:

- Version
- Date
- Title
- Summary
- Tags

Rows are separated by thin dividers. On large screens each row uses a three-column grid: metadata, release content, and right-aligned tags. On smaller screens the grid collapses into a stacked layout.

Reference pattern:

- Omnify and LaunchNotes both use date-grouped release lists with category tags and clear version or date anchors.
- Sysnotes by JFL follows this scannable structure without adopting heavier visual chrome.

### Web Changes

Status: Implemented

The web changes section summarizes broader site improvements in compact bordered cards.

Current categories:

- Navigation
- Content
- Design
- Performance

Cards use white backgrounds, thin borders, uppercase labels, and readable body text. They do not use shadows.

### Footer

Status: Implemented

The footer is a slim bar matching the header's off-white surface, separated from the content above by a top border.

Layout:

- Single row on desktop
- Stacked on mobile

Left side:

- Brand wordmark: `Sysnotes` semibold and `by JFL` normal at 85% size
- Copyright line: `Copyright {year} JFL. All rights reserved.`

Center on desktop:

- Navigation links: `Releases`, `Web changes`, `Summary`
- Links transition from `--footer-link-color` to `--footer-link-hover`

Right side on desktop:

- Muted secondary text, such as `Built for clarity.`

Implemented styling:

- Background: `--footer-bg`
- Border: `--footer-border`
- Text: `--footer-text`
- Padding: `py-6`, matching the header's compact rhythm

## Admin Portal Page

Status: Implemented with file-backed tenant persistence v1

### Purpose

The Admin Portal allows account owners to set a custom company identity: logo, accent colors, and brand name. These values override the default `Sysnotes by JFL` branding without changing the underlying editorial layout.

V1 behavior:

- Saves identity settings through `/api/tenant/[slug]/identity`.
- Persists tenant identity to `data/tenant-[slug].json`.
- Applies saved values to the Admin Portal preview and tenant standalone pages.
- Keeps the public homepage frozen and independent of tenant identity.
- Requires an authenticated admin session for mutation routes.

### Route

```text
/admin/identity
```

Authentication is handled through NextAuth credentials and middleware for `/admin/*`. Tenant API mutation routes also require a session.

### Component Inventory

Status: Implemented

The admin identity surface is split into reusable components and used by the `/admin/identity` route.

Files:

- `components/admin/identity-types.ts`
- `components/admin/brand-identity-form.tsx`
- `components/admin/brand-identity-preview.tsx`
- `components/admin/index.ts`

Responsibilities:

- `TenantIdentity` model and default values
- Hex color normalization and readable text-color derivation
- Identity validation
- Brand name input
- Logo file input with type and size checks
- Accent color picker plus hex text input
- Save button state
- Live preview for wordmark/logo and Live badge

### Layout

Status: Implemented

Two-column layout at `lg` and above; single-column stacked layout on smaller screens.

Left column: edit panel

- Section heading: `Company Identity`
- Supporting text: `Customize how your changelog appears to visitors.`
- Brand name input
- Logo upload input
- Accent color input
- Save button

Right column: live preview

- Scaled-down preview of the header and Live badge
- Uppercase `Preview` label
- Reactive updates as the user edits form values
- Visual-only preview; navigation links inside the preview are inactive

### Input Groups

Status: Implemented

Brand name:

```text
Label: Brand name
Input type: text
Placeholder: e.g. Acme Corp
Token: --tenant-brand-name
Behavior: replaces the default text wordmark
```

Logo:

```text
Label: Logo
Input type: file
Accept: image/png, image/svg+xml, image/webp
Constraint: max 512 KB
Token: --tenant-logo-url
Behavior: hides text wordmark and replaces it with a logo image at max-height 28px
```

Accent color:

```text
Label: Accent color
Input type: color picker plus hex text input
Default: #d7ef7d
Token: --tenant-accent-bg
Derived token: --tenant-accent-text
Behavior: applies to Live badge, selection highlight, save button, and status pills
```

### Component States

Status: Implemented in components

| State | Background | Border | Text |
| --- | --- | --- | --- |
| Input default | `--surface-card` | `--admin-input-border` | `--text-primary` |
| Input focus | `--surface-card` | `--admin-input-focus` at 2px | `--text-primary` |
| Save button default | `--admin-save-bg` | none | `--admin-save-text` |
| Save button hover | slightly darkened `--admin-save-bg` | none | `--admin-save-text` |
| Save button disabled | `--tag-bg` | none | `--text-muted-5` |

### Save Behavior

Status: Implemented with file-backed tenant persistence v1

On save, the component:

1. Validate brand name, logo size and type, and accent color format.
2. Calls the provided `onSave` callback with the normalized identity.
3. Shows inline success state with `Identity saved`.
4. Returns the save button to normal after 2 seconds.
5. Avoids full page reload.

The route-level adapter:

- Loads tenant identity through the tenant API.
- Falls back to default identity if no tenant identity has been saved yet.
- Writes normalized identity JSON through the tenant API on save.

Tenant identity applies to `/[slug]/*` only. The root changelog remains the Sysnotes changelog.

### Accessibility

Status: Implemented

- All inputs have visible labels.
- Color picker is paired with a hex text input so keyboard-only users can enter a value directly.
- Save button is disabled until at least one field is modified.
- Preview panel has `aria-label="Brand identity preview"`.

## Visual System

### Colors

Status: Implemented values and token names

| Token | Value | Use |
| --- | --- | --- |
| `--surface-page` | `#f7f7f3` | Page background |
| `--surface-header` | `#fbfbf7` | Header and footer surface |
| `--surface-card` | `#ffffff` | Cards and panels |
| `--text-primary` | `#171717` | Primary text |
| `--text-muted-*` | `rgba(0, 0, 0, 0.45-0.70)` | Muted metadata and labels |
| `--border-subtle` | `rgba(0, 0, 0, 0.10)` | Dividers and section borders |
| `--border-light` | `rgba(0, 0, 0, 0.15)` | Card outlines |
| `--accent-bg` | `#d7ef7d` | Status, selection, active states |
| `--accent-text` | `#263400` | Text on accent |
| `--tag-bg` | `#f0f0ea` | Tag chips and pills |

The design avoids a saturated brand palette. Most visual emphasis comes from contrast, scale, and spacing. Tenant overrides should replace only `--tenant-accent-bg` and `--tenant-accent-text`; the neutral palette should remain preserved.

### Typography

Status: Implemented

Global font stack:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Typography scale:

| Role | Class | Notes |
| --- | --- | --- |
| Hero headline | `text-5xl`, `sm:text-6xl`, `lg:text-7xl` | Confident and large |
| Section heading | `text-4xl` | Semibold |
| Release title | `text-2xl` | Semibold |
| Body copy | `text-base` or `text-lg` | `leading-7` or `leading-8` |
| Metadata and nav | `text-sm` | Uppercase plus tracking for labels |
| Footer copyright | `text-sm` | Muted |
| Admin input label | `text-sm` | Semibold |

### Spacing

Status: Implemented for public page, footer, and admin

- Header padding: `py-5`
- Hero padding: `py-16` on small screens, `lg:py-24` on large screens
- Section padding: generally `py-16`
- Footer padding: `py-6`
- Admin portal content: `py-12`
- Max content width: `max-w-7xl`
- Horizontal page padding: `px-5`, increasing to `sm:px-8`

### Borders And Shape

Status: Implemented for public page, footer, and admin

Implemented:

- Header bottom border
- Section dividers
- Metric top borders
- Release row dividers
- Bordered web-change cards
- Bordered latest-release panel
- Footer top border
- Admin input borders
- Admin preview panel border

Rounded corners:

- Pills and status badges use `rounded-full`.
- Main content cards are square-edged, supporting the utilitarian editorial tone.
- Admin inputs use `rounded-md` to signal interactivity.

### Shadows

Status: Implemented

Only the latest-release hero panel uses a shadow:

```css
0 24px 70px rgba(0, 0, 0, 0.08)
```

The Admin Portal preview panel uses no shadow and is contained by its border only.

## Content Model

Status: Implemented public and tenant models

### Release

```ts
{
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  body?: string;
  tags: string[];
  status: "published" | "draft" | "private";
  shareToken?: string;
}
```

### Web Change

```ts
{
  label: string;
  change: string;
}
```

### Metric

```ts
{
  value: string;
  label: string;
}
```

### Tenant Identity

Status: Implemented

```ts
{
  slug: string;
  brandName: string;
  logoUrl: string | null;
  accentBg: string;
  accentText: string;
  colorScheme?: "light" | "dark";
  fontFamily?: "sans" | "serif" | "mono";
  badgePosition?: "left" | "right";
  comingSoon?: boolean;
  webhookUrl?: string;
}
```

### Subscriber

```ts
{
  email: string;
  slug: string;
  subscribedAt: string;
}
```

Tenant identity, tenant releases, and subscribers are persisted per tenant. The static root changelog data remains separate.

## Responsive Behavior

Status: Implemented public, footer, and admin behavior

Implemented:

- Header navigation hides on small screens.
- Hero uses a stacked layout by default and switches to a two-column grid at the `lg` breakpoint.
- Summary metrics stack by default and switch to three columns at `lg`.
- Release note rows stack by default and switch to a three-column grid at `lg`.
- Web change cards use one column by default and two columns from the `sm` breakpoint.
- Footer stacks brand and copyright above nav links on small screens.
- Footer switches to a single-row three-column layout at `lg`.
- Admin portal stacks edit panel above preview panel on small screens.
- Admin portal switches to side-by-side layout at `lg`.

The responsive strategy is content-first: sections remain readable when stacked and gain richer alignment only when viewport width allows.

## Interaction Details

Status: Implemented public and admin interactions

Implemented:

- Anchor links scroll smoothly because `html` uses `scroll-behavior: smooth`.
- Navigation links transition from muted black to full black on hover.
- Text selection uses `--tenant-accent-bg` and `--tenant-accent-text`.
- No complex animations, forms, menus, or client-side state are used on the public changelog page.
- Admin color picker and hex input stay in sync bidirectionally.
- Admin save button shows a transient `Identity saved` confirmation for 2 seconds after success.

## Accessibility Notes

Status: Implemented public and admin notes

Implemented:

- The latest release panel is marked with `aria-label="Latest release"`.
- Semantic sectioning is used through `main`, `section`, `nav`, `aside`, `article`, and `footer`.
- Links inherit color and remove underlines globally; hover cues rely on placement and contrast.
- Color contrast is strong for primary text; muted metadata intentionally uses lower contrast.
- Admin preview panel should use `aria-label="Brand identity preview"`.
- Admin inputs should have explicit `label` elements.
- Admin color picker should be paired with a hex text input for keyboard accessibility.

## Implementation Notes

Status: Current and planned

Current:

- Framework: Next.js 15 with React 19
- Styling: Tailwind CSS 3 plus global CSS
- Main page: `app/page.tsx`
- Global CSS: `app/globals.css`
- Metadata: `app/layout.tsx`
- Tailwind config: `tailwind.config.ts`
- Design tokens are defined in `app/globals.css` under `:root`.
- Public component colors use CSS variables through Tailwind arbitrary-value utilities.
- Most layout values are still applied through Tailwind utility classes.
- No custom Tailwind theme extension is currently defined.

Planned:

- Move the file-backed service implementations behind an external API when needed.
- Extend admin reset/export behavior for tenant data.

## Current Design Direction

Status: Active guidance

- Favor clarity over decoration.
- Keep surfaces mostly flat and neutral.
- Use borders, spacing, and type scale before adding new visual effects.
- Reserve the green accent or tenant override for status, selection, or high-priority emphasis.
- Keep release entries consistent so users can compare updates quickly.
- Admin identity overrides must not disrupt the typographic or spatial rhythm of the site. They affect brand tokens only, not layout or spacing.
