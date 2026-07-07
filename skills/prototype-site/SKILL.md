---
name: prototype-site
description: Generate or update PSM-style static prototype sites with a shared shell, Chinese page paths, incremental menu registration, data-action/data-modal/data-nav IR markers, and pages that can be mechanically converted to Vue 3 (Ant Design Vue 4). Use when you need to create prototype pages, add pages to an existing prototype site, preserve shared shell/assets, or prepare static pages for prototype-to-vue3 conversion into the Vue3 demo framework (prototype-vue3-framework).
---

# Prototype Site

Create high-fidelity PSM "绿星链通" static prototype pages inside a shared-shell site. The shell is copied once; every business page contains only page content and is registered in `menu.config.js`.

## Resources

- Copy the site shell from `assets/framework/`.
- Start business pages from `assets/page-template.html`.
- Read `references/interaction-ir.md` when implementing `data-page`, `data-action`, `data-modal`, or `data-nav`.
- Read `references/psm-ui-profile.md` when checking naming, style tokens, component conventions, or Vue conversion readiness.
- Read `references/visual-parity.md` before creating any page that may be converted to Vue.
- Read `references/manual.md` only when the request needs more examples or troubleshooting detail.

## Hard Rules

- **门一：目标兼容性检查（每次生成前必须执行）**。收到"一模一样""像素级""完全复刻""完全一致""换 UI 风格""换组件库""换样式框架"等信号 → **立即停止，不许开始读取文件或生成** → 用大白话讲清楚为什么做不到、给出 A/B/C 三选一，等用户选定再继续。用户选定后立刻照做，不追问"你确定吗"。
- **门二：资源过载检查（每次生成前必须执行）**。如果涉及多个文件或混合材料，先用 `ls`/`find`/Glob 数文件数量（不读全文）→ 页面文件 >15 个或材料类型 ≥3 类 → 输出四段式诊断报告（我看到的[具体数字] / 会带来的问题 / 我的建议 / 需要你确认），等用户表态。不默认拒绝。
- Write static pages as `pages/<分组中文名>/<页面中文名>.html`.
- Keep `data-page="<英文编码>"` on the page root. The code is the bridge to Vue.
- Business page `<head>` links only `../../assets/app.css`; do not add an inline `<style>`. **B 路线（提炼旧版风格）也不例外：所有自定义样式必须写入 `assets/theme.css`，绝不允许在页面里写 `<style>` 块或内联 `style="..."`。**
- Do not duplicate shell markup in business pages: no `top-header`, `sidebar`, or `page-tabs`.
- Use the shared primary color `#1565c0`; do not introduce `#0052d9`.
- Use data-driven tables: arrays plus render functions, then call `PR.bindActions()` after rendering.
- Every button has `data-action`; modal triggers use `data-modal`; cross-page navigation uses `data-nav`, not `location.href`.
- Update `menu.config.js` idempotently by `code`; do not duplicate menu rows.
- Do not modify existing `index.html` or `assets/*` when adding or updating pages.
- Treat the static prototype as the future Vue page's visual source of truth. Use stable `prototype-*` structure classes so conversion can preserve the approved layout instead of redesigning it.
- The shared shell's multi-tab bar must not expose a native horizontal scrollbar. When many menu pages are open, keep the tab list scrollable with left/right arrow buttons and hidden scrollbar styling.
- The business content area must never create a page-level horizontal scrollbar. Wide tables, comparison matrices, timelines, charts, or cards may scroll only inside their own component wrapper, never by widening `body`, `#page-content`, grid columns, or the shell iframe.
- For grid/flex layouts that contain tables or chart-like widgets, use shrink-safe tracks and children: `minmax(0,1fr)` instead of bare `1fr`, and ensure grid/flex children have `min-width:0`. Do not put a `table` with a large `min-width` directly in a grid child unless it is wrapped by a local scroll container.
- Do not blindly apply the global wide-table minimum width to every table. Narrow 3-6 column tables in cards, side panels, dashboards, or adjustment pages must use a fit-table style (`min-width:0`, `table-layout:fixed`, wrapping cells) so they fill the card cleanly without unnecessary horizontal scrollbars.
- Prototype pages are demo artifacts: avoid large empty bands. If a layout creates obvious blank space, add realistic summary cards, checklists, recommendations, history, or explanatory metrics that match the business page instead of leaving dead area.
- Cards placed in the same visual row should normally align to the same height when their content lengths are close, especially paired analysis/calculator, operation/timeline, or form/preview cards. Use `align-items:stretch`, `height:100%`, and flex column card bodies instead of leaving ragged card bottoms.
- Pages that contain final workflow actions, save/submit/approve buttons, or other bottom action groups must use a fixed bottom operation bar. Add `has-fixed-actions` to `#page-content`, use `.fixed-bottom-bar` for the button group, and keep the buttons fixed to the business viewport bottom. Do not leave bottom action bars as ordinary in-flow cards or `position:sticky` elements that move or jitter during vertical scrolling.

## Workflow

**0. 门一检查（目标兼容性，每次生成前必须执行，不可跳过）**
  - 扫描用户输入是否包含"一模一样""像素级""完全复刻""完全一致""1:1还原""换 UI 风格""换组件库""换样式框架"等信号词。
  - 命中 → **立即停止**，不要读任何文件，不要开始任何生成。用大白话输出：
    > "你要的效果和我实际能做到的有差距——我是统一规范生成引擎，不是复制引擎。给你三个选项：
    >  **A** 用我的默认绿星链通风格做（最快，但样子和旧版不像）
    >  **B** 我从旧页面提炼一套风格（theme.css），尽量接近原来的样子（需要多看几页，耗时更长）
    >  **C** 直接把旧文件复制进站点（最快、最像，但里面的技术标记会丢失，研发以后没法直接转成 Vue 代码）
    >  你选哪个？"
  - 等用户选定后，立刻照做，不追问、不劝说。

**1. 门二检查（资源过载，每次生成前必须执行，不可跳过）**
  - 用 `ls`/`find`/Glob 扫描输入涉及的文件数量，不读取全文。
  - 页面源文件 >15 个或材料类型 ≥3 类 → 输出四段式诊断报告：
    > "**我看到的输入**：[具体数字，如34个html文件 + 1份PRD + 1份编码表]
    >  **这样输入会带来的问题**：[可能超出单次任务安全范围/质量衰减]
    >  **我的建议**：[是否拆分成独立提示词文件，按3-5页/批推进]
    >  **需要你确认**：[等一个明确选择]"
  - 用户表态后立刻执行。用户说"全做"就直接照做，不反复劝说。

**1.5 批量状态检查（新增，仅批量模式）**
  - 检查目标目录是否存在 `handoff.md` / `progress.md` / `prompts/*.md`
  - 存在 → **进入恢复流程**：读取 handoff.md 获取进度，从待办页面继续，不得重新拆分
  - 不存在 → 继续正常流程（拆分 → 生成）
  - **核心原则**：文件是唯一的可信状态源，对话记忆不可靠

**2. 执行生成（以下为原有步骤）**
2.1 Ensure the target site exists. If `index.html` is missing, copy everything from `assets/framework/` into the target directory. If the site exists, only fill missing framework files and do not overwrite `menu.config.js` or `pages/*`.
2.2 Determine page code, group Chinese name, page Chinese name, page type, query fields, table columns, statuses, actions, modals, and navigation targets. Fill missing business details conservatively and mark them as `【补位】` in the page spec card.
2.3 Create or update `pages/<分组中文名>/<页面中文名>.html` from `assets/page-template.html`. Keep only business content and runtime scripts that use `../../assets/page-runtime.js`. Add `prototype-page` to the `data-page` root and use `prototype-card`, `prototype-card-head`, `prototype-query-grid`, `prototype-table-wrap`, and related classes from `references/visual-parity.md`.
2.4 Register the page in `menu.config.js` as `{ code, cname, group, icon, file }`, where `file` is `<分组中文名>/<页面中文名>.html`.
2.5 Check horizontal overflow while designing each page: if any section needs more width than the viewport, constrain it to a card/table/chart wrapper with local `overflow-x:auto`; do not allow the whole business page or shell iframe to scroll horizontally.
2.6 If the page has bottom workflow actions, place them in `.fixed-bottom-bar` and add enough root padding via `has-fixed-actions` so the last content section is not covered.
2.7 Run the self-check before delivery.

**2.8 生成后强制自检（新增，批量模式）**
  - 每页生成后，对比 `prompts/<编码>-<页面名>.md` 检查：
    - `data-page` 编码是否与提示词一致
    - 表格列数、列名是否与提示词一致
    - 查询条件数、类型是否与提示词一致
    - 操作按钮数、文案是否与提示词一致
    - 跳转目标编码是否在 menu.config.js 中已注册（或已标记占位）
  - 不一致 → 记录到 `progress.md` 偏差清单，标记是否需要重做
  - 关键项（编码、表格列、跳转目标）不一致 → **强制重做**：删除产物、回滚 menu.config.js、重新生成

**3. 批次结束动作（新增，批量模式）**
  - 更新 `handoff.md`：已完成清单、待办清单、踩坑记录、下一批建议
  - 更新 `progress.md`：本批执行日志、累计问题、中断恢复点
  - 执行 6.4 的折中方案：重读 SKILL.md / flow.md 关键规则
  - 问 PM：是否继续 / 是否新会话

## Self-Check

- The page path is Chinese and the root `data-page` is the English code.
- The page has no shell markup, no inline style block, and no hard-coded table rows.
- All actions, modals, and navigation targets have IR markers and working stubs or implementations.
- `menu.config.js` has one row per `code`, and every `file` points to a real page.
- `index.html` and `assets/*` remain unchanged after adding pages.
- If the shell/framework is intentionally updated, verify the multi-tab bar uses arrow-button scrolling and no visible native horizontal scrollbar appears under the tabs.
- The page uses `prototype-*` classes and records visual intent such as field grouping, table columns, widths/alignment, status keys, action placement, and modal layout.
- At desktop shell width, `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth` for each business page. If a table is wider than its card, only `.prototype-table-wrap` / `.table-wrap` may have `scrollWidth > clientWidth`.
- On pages with side panels or multi-column layouts, cards align to the same content width and do not spill past the right edge; long text, tags, and table minimum widths must not force outer-page horizontal scrolling.
- Narrow tables that can reasonably fit in their card must not show a horizontal scrollbar. Only genuinely wide tables with many columns may scroll inside their local wrapper.
- At common desktop shell height, the first screen and lower sections should not contain large unexplained empty rectangles; fill demo pages with realistic business content density.
- Same-row cards should be visually even unless the business meaning requires different heights. Check paired cards in two-column sections for ragged bottoms and stretch them when the difference is small.
- Bottom workflow operation bars remain fixed at the bottom of the business viewport while the page scrolls vertically, and the last content section can still scroll fully above the bar.
- If this page completes a batch (batch mode), the handoff document (`handoff-template.md`) has been updated with the completed page, any style fixes discovered, and workspace change overview.
- If the target site has `assets/theme.css`, it must not contain layout rules (`display` / `grid` / `position` / `width` — skin-only overrides such as colors, fonts, border-radius, shadows are allowed).
- **（新增，批量模式）** 本页产物与 `prompts/<编码>-<页面名>.md` 的提示词一致：编码、表格列、查询条件、操作按钮、跳转目标均已核对。
