# Design system guidelines

Prefer shared primitives in `src/app/components/ui/` and interaction recipes in `src/app/components/ui/interaction.ts` over ad-hoc Tailwind on clickable elements.

## Interactive controls

Every clickable control should use one of:

1. `Button` / `buttonVariants` from `ui/button`
2. A named recipe from `ui/interaction` (`iconButtonClass`, `chipButtonClass`, `filterTriggerBaseClass`, `interactiveSurfaceClass`, etc.)
3. A Radix primitive (`DropdownMenu`, `Select`, `Tabs`, …)

Do **not** invent one-off `hover:` classes on raw `<button>` for chrome controls.

### State rules

| State | Expectation |
|---|---|
| **Hover** | Visible surface or color change (`bg-surface-hover`, `bg-muted`, border, or text) |
| **Focus-visible** | Ring (global theme rule + component rings) |
| **Active / pressed** | Slightly stronger fill or scale on cards |
| **Disabled** | Opacity + `pointer-events-none` / `disabled:` |
| **Selected / open** | Distinct from idle; still allow hover when idle |

Do **not** globalize `:hover` on all `button` elements in CSS — that fights primary fills and selected states.

### Recipes (quick map)

| Need | Use |
|---|---|
| Primary / outline / ghost / link actions | `Button` |
| Icon-only chrome (top bar, close) | `iconButtonClass` or `Button size="icon" variant="ghost"` |
| Chip / suggestion | `ReportChipButton` / `chipButtonClass` |
| Chip remove (X) | `chipRemoveClass` |
| Compact list-toolbar filter trigger | `listFilterTriggerClass` |
| Full-width select dropdown trigger | `selectTriggerClass` |
| Menu / dropdown option row | `menuItemClass` |
| Pagination chevron / page number | `paginationControlClass` |
| Clear / text action | `textLinkActionClass` |
| Outline Back / secondary | `outlineControlClass` |
| Clickable card / row | `interactiveSurfaceClass` + `interactiveCardProps` |
| Segmented pills | `segmentPillClass` |

### PR checklist

- [ ] New clickables use `Button`, `ui/interaction` recipes, or Radix — not bare Tailwind hover
- [ ] Idle hover present (not only selected/open styles)
- [ ] Focus-visible still works (do not remove outline/ring without a replacement)
- [ ] Backdrop dismiss overlays do not need hover

See `ui/InteractionShowcase.tsx` for a live reference of the recipes.
