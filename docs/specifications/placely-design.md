# Placely Frontend Design System Spec (Timespent - Default Theme Only)

This specification documents the default Timespent theme currently implemented in the Placely frontend codebase.

---

## 🎨 Design Tokens

### 1. Color System Specifications

*   **Primary Action**: `#ff383c` (Vivid Red) — Used for buttons, hover icons, and critical focus states.
*   **Primary Dark**: `#dc143c` (Crimson) — Visually darker state for button hover/active states.
*   **Secondary Accent**: `#ffd400` (Yellow) — Highlights and playful badge highlights.
*   **Background**: `#fcfcfc` (Off-white) — Page-level canvas backing.
*   **Surface Card**: `#ffffff` (Pure White) — Boxed surfaces and floating blocks.
*   **Border Subtle**: `#e6e6e6` (Light Gray) — Hairline separators and container edges.
*   **Text Muted**: `#8e8e93` (Gray) — Captions, labels, timestamps.
*   **Text Foreground**: `#1f1f1f` (Charcoal) — Primary headings and body copy.

---

### 2. Geometry & Shadow Tokens

*   **Card Corner Radius**: `24px` — Rounded profile for cards and major containers.
*   **Button Corner Radius**: `9999px` — Full pill/capsule shapes for buttons.
*   **Soft Shadow**: `0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)` — Elevates floating surface cards.
*   **Tactile Shadow**: `0 4px 0 0 rgba(0, 0, 0, 0.05)` — Placed under buttons to convey depth.

---

### 3. Typography Stack

Fonts are loaded globally in [layout.tsx](file:///c:/Placely/src/app/layout.tsx).

*   **Display & Main Headings**: Bricolage Grotesque (`var(--font-bricolage)`)
*   **Subheadings & Body Sans**: Inter (`var(--font-inter)`)

---

## 🧱 Key Global Components

### Expandable Sidebar
*   **Location**: [sidebar.tsx](file:///c:/Placely/src/components/navigation/sidebar.tsx) & [admin-sidebar.tsx](file:///c:/Placely/src/components/navigation/admin-sidebar.tsx)
*   **Behavior**: Sits at `80px` wide, expanding to `260px` on hover via transition `duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]`.
*   **Active States**: Pinned navigation links draw a left-aligned vertical indicator bar (`h-6 w-1.5 rounded-r-full bg-primary`) and use low-opacity active color backing: `bg-primary/10 text-primary`.

### Cards & Stat Blocks
*   **StatCard** ([stat-card.tsx](file:///c:/Placely/src/components/ui/stat-card.tsx)): Floating cards utilizing interactive micro-animations. Contains:
    *   Uppercase `.section-label` text trackers.
    *   Interactive icon buckets (`flex h-11 w-11 items-center justify-center rounded-xl bg-background border border-border-subtle text-primary transition-all`). On hover: transitions background to primary and icon to white.
    *   Dynamic Trends: Green up-trends (`bg-emerald-50 text-emerald-600`) or red down-trends (`bg-primary/5 text-primary`).
    *   An absolute-positioned background decorative gradient (`h-32 w-32 bg-primary/5 rounded-full blur-3xl`) that glows/brightens (`group-hover:bg-primary/10`) on hover.
