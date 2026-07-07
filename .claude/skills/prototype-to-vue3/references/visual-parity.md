# Visual Parity Contract

The confirmed HTML prototype is the visual source of truth. Conversion to Vue must be visually isomorphic: preserve layout structure first, then replace controls with Ant Design Vue components.

## Mapping Rules

- `prototype-page` remains the root class on the Vue page.
- `prototype-card` remains a card container. Prefer plain `<div class="prototype-card">` over relying on `a-card` defaults when the prototype has a custom header/body split.
- `prototype-card-head`, `prototype-title`, and `prototype-actions` remain explicit header markup.
- `prototype-query-grid` remains CSS grid. Do not convert it to unconstrained `a-form layout="inline"` flow.
- `prototype-stat-row` and `prototype-stat-card` remain visual metric cards.
- `prototype-status-tabs` and `prototype-status-tab` remain tab buttons unless AntD controls are fully styled to match.
- Native prototype tables may convert to `a-table`, but wrap with `prototype-table-wrap prototype-table` and apply prototype parity styles with `:deep()` deep selectors (Vue3 SFC; not `::v-deep`).
- Modal forms use `prototype-modal-form` to preserve the two-column body layout.

## Layout Overflow, Tables, and Action Bars

These constraints are synced from `prototype-site` (see `prototype-site-change-log.md`). The shared classes live in the framework's `prototype-parity.scss`; converted pages must use them instead of one-off styles.

- **No page-level horizontal scroll.** The converted page must fit the content viewport width. Only intentionally wide widgets (wide tables, charts, matrices) may scroll inside their own wrapper. Never let a table's width, a comparison matrix, or a chart placeholder set the width of the whole page.
- **`a-table` `:scroll="{ x }"` is opt-in, not default.** Apply `scroll.x` only to genuinely wide tables; the horizontal scroll must stay inside the table region, not widen the page. For narrow 3-6 column tables, add `class="prototype-table fit-table"` and **omit** `:scroll="{ x }"` so the table fills the card without an unnecessary horizontal scrollbar.
- **Shrink-safe multi-column layouts.** Convert two-column / sidebar prototype rows to `<div class="prototype-cols">` (or `cols-3` / `cols-sidebar`). It uses `repeat(n, minmax(0,1fr))` with `min-width:0` children so wide tables cannot create an outer horizontal scrollbar. Do not convert these to bare `1fr` grids or unconstrained flex.
- **Equal-height paired cards.** Cards in the same `prototype-cols` row align to a common bottom edge by default (stretch row + `height:100%` cards). For ranking/calculator, approval/timeline, form/preview, chart/list pairs, give the flexible body (textarea, timeline, table area) `prototype-card-body` (or `flex:1`) so bottoms stay even.
- **Fixed bottom action bar.** For final save/submit/approve/return action groups, add `has-fixed-actions` on the `prototype-page` root and render the buttons as `<div class="fixed-bottom-bar">` (use `.spacer` to split left/right groups, `.center` to center). In the framework this renders as a sticky bar pinned to the bottom of the scrolling `a-layout-content` — it respects the sider offset and follows sider collapse. Do **not** leave the action buttons as an ordinary in-flow card or a mid-page sticky block.
- **Keep demo pages visually populated.** When a section leaves a large empty area, add business-relevant summary cards, recommendation blocks, checklists, timelines, or metrics rather than shipping blank whitespace.

## Fidelity Checklist

- Card header height is 44px; section body padding is 16px.
- Query grid is four columns on desktop and does not collapse into a loose inline form.
- Table header is light blue, 42px high, centered, and uses the same typography.
- Table rows are 44px high with the same hover color.
- Buttons are 32px high; small buttons are 28px high.
- Status tabs and tags use the same shape, padding, and colors as the prototype.
- The converted page does not introduce a different layout density, extra card nesting, or AntD default spacing that changes the approved prototype.
- No page-level horizontal scrollbar: `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth` on the page. Only `.prototype-table-wrap` / wide `.prototype-table` regions may scroll horizontally.
- Narrow 3-6 column tables fill the card without a horizontal scrollbar (`fit-table`, no `:scroll="{ x }"`).
- Paired cards in the same row share a common bottom edge.
- Final workflow actions render as a fixed `fixed-bottom-bar` pinned to the content bottom (not an in-flow card), and the page root reserves bottom space via `has-fixed-actions`.

## Rejection Criteria

Reject the conversion if it only builds but visibly changes the approved layout: different card structure, different query field grid, different table density, missing status tabs, different modal layout, or action buttons moved to a different area. Also reject if the page introduces a page-level horizontal scrollbar, forces a horizontal scrollbar on a narrow table, leaves paired cards with uneven bottoms, or renders the final action buttons as an in-flow/mid-page block instead of a fixed bottom bar.
