# Visual Parity Contract

HTML prototypes are the visual source of truth for converted Vue pages. Create prototype pages so their structure can be mapped to Vue without redesign.

## Structural Classes

Use these classes consistently in static pages:

- `prototype-page` on the business root, together with `data-page`.
- `prototype-card` for each card-like section.
- `prototype-card-head`, `prototype-title`, `prototype-actions` for section headers.
- `prototype-query-grid` and `prototype-field` for query forms and modal forms.
- `prototype-stat-row` and `prototype-stat-card` for metric cards.
- `prototype-list-toolbar`, `prototype-batch-bar`, `prototype-status-tabs`, `prototype-status-tab`.
- `prototype-table-wrap` around tables.
- `prototype-modal-form` for two-column modal body layout.

Existing legacy classes such as `card`, `card-head`, `query-grid`, `stat-row`, `list-card`, and `status-tabs` may remain for backward compatibility, but new pages must include the `prototype-*` classes.

## Visual Rules

- Encode visual intent in the markup: table column width, text alignment, status key, tab key, and modal form fields.
- Keep card header height, card spacing, table header height, row height, button size, status tab shape, and modal width consistent with `assets/app.css`.
- Do not use one-off inline layout styles. Allow only unavoidable native table width/alignment and data-driven color values (`width`, `text-align`, `background`); prefer stable classes for everything else.
- Do not create visual patterns that are hard to reproduce in Vue/Ant Design Vue.
- Use the same status keys in static and Vue pages so tags can map mechanically.
- Do not allow page-level horizontal scrolling in the shell content area. The prototype page itself must fit the viewport width; only intentionally wide widgets may scroll inside their own wrapper.
- Wrap wide tables in `prototype-table-wrap` / `table-wrap` and keep their horizontal overflow local to that wrapper. Never let a table's `min-width`, a comparison matrix, or a chart placeholder set the width of the whole page.
- Use wide-table minimum widths only for genuinely wide datasets. For narrow 3-6 column tables, use fit-table behavior: `min-width:0`, `table-layout:fixed`, normal cell wrapping, and column widths that fill the card without creating unnecessary horizontal scrollbars.
- For multi-column layouts, use shrink-safe CSS such as `grid-template-columns:minmax(0,1fr) 340px` or `repeat(2,minmax(0,1fr))`, and ensure direct grid/flex children have `min-width:0`. Bare `1fr` tracks with wide tables can create outer horizontal scrollbars.
- For narrow side panels, use fixed or bounded widths only when the main column is `minmax(0,1fr)`; otherwise collapse to one column at smaller widths.
- Keep demonstration pages visually populated. When a section leaves a large empty area, prefer adding business-relevant summary cards, recommendation blocks, checklists, timelines, or metrics over leaving blank whitespace.
- In same-row card groups, use equal-height alignment by default. Paired cards such as ranking/calculator, approval operation/timeline, form/preview, or chart/list should share a common bottom edge when their heights are close. Implement with stretch grid/flex rows and card bodies that can flex vertically.
- Keep bottom workflow action bars fixed to the business viewport bottom. For save/submit/approve/return action groups at the end of a page, add `has-fixed-actions` on the page root and render the button group with `.fixed-bottom-bar`; do not use an ordinary card or sticky footer that moves with the page content.

## Chart Component Style Rules

图表组件（柱形图、折线图、饼图等）必须遵循以下样式规范，确保文字不被覆盖、布局不溢出：

### 柱形图/折线图容器（`.chart-line`）

| 属性 | 规范值 | 说明 |
|------|--------|------|
| `.chart-line` `padding-bottom` | `32px` | 底部留白必须 ≥ 32px，给 X 轴文字足够空间 |
| `.chart-y-axis` `bottom` | `32px` | 与 padding-bottom 同步 |
| `.chart-grid` `bottom` | `32px` | 与 padding-bottom 同步 |
| `.chart-area` `left` | `36px` | 避开 Y 轴标签区 |
| `.chart-area` `right` | `0` | 明确右边界 |
| `.chart-area` `bottom` | `32px` | 避开 X 轴文字区 |
| `.chart-area` `top` | `0` | 保持顶部对齐 |
| `.chart-x-axis` `height` | `28px` | X 轴区域高度 |
| `.chart-x-axis` `align-items` | `flex-start` | 文字顶部对齐，不居中 |
| `.chart-x-axis` `padding-top` | `6px` | 文字顶部留空 |

### 柱状图文字（`.efficiency-chart`）

| 属性 | 规范值 | 说明 |
|------|--------|------|
| `.efficiency-bar` `gap` | `2px` | 元素间距必须 ≤ 2px |
| `.efficiency-bar-value` `margin-bottom` | `0` | 禁止额外下边距 |
| `.efficiency-bar-label` `margin-top` | `0` | 禁止额外上边距 |

> 这些规范已写入 `assets/app.css` 模板，生成新页面时直接使用。修改图表样式时同步更新此规范和 `app.css`。

## Overflow Check

Before delivery, verify each touched business page at the normal shell viewport:

```js
document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth
```

If this is false, find the overflowing component and either:

- move overflow into a local wrapper (`prototype-table-wrap`, chart wrapper, or matrix wrapper),
- change grid tracks from `1fr` to `minmax(0,1fr)`,
- add `min-width:0` to grid/flex children, or
- reduce fixed side-panel widths / switch to a single-column layout at that breakpoint.

Also inspect each table with a visible scrollbar. If it has only a few columns and could fit naturally, remove the wide-table minimum width and make it a fit-table. Local horizontal scroll is acceptable only when the data is genuinely too wide.

For each two-column or multi-card row, visually check the card bottoms. If adjacent cards differ only because of padding/body layout, stretch them to equal height; do not leave uneven card bottoms in dense operational pages.

For pages with bottom actions, scroll to the middle and bottom of the page and verify the operation bar stays fixed, does not jitter, and does not cover the final content because the page root has bottom padding.

## Vue Conversion Expectations

Converted Vue pages must preserve the same section order, grouping, labels, table columns, action placement, status tab placement, and modal layout. Ant Design Vue components provide behavior; the `prototype-*` classes preserve the visual form.
