---
name: erp-prototype-site
description: Generate or update ERP-style (XinPlat / Ant Design 5 modern light) static prototype sites from a confirmed single-page specification, a detailed prompt file, or an erp-prototype-guide handoff. Use for shared-shell pages, Chinese page paths, idempotent menu registration, interaction IR, and Vue3 conversion readiness. Do not bypass erp-prototype-guide when raw PM requirements, documents, screenshots, or old HTML still need business confirmation.
---

# ERP Prototype Site

Create high-fidelity "高端ERP"（XinPlat / Ant Design 5 现代浅色，主色 #1677ff）static prototype pages inside a shared-shell site. The shell is copied once; every business page contains only page content and is registered in `menu.config.js`.

## Resources

- Copy the site shell from `assets/framework/`.
- Start business pages from `assets/page-template.html`.
- Read `references/interaction-ir.md` when implementing `data-page`, `data-action`, `data-modal`, or `data-nav`.
- Read `references/psm-ui-profile.md` when checking naming, style tokens, component conventions, or Vue conversion readiness.
- Read `references/visual-parity.md` before creating any page that may be converted to Vue.
- Read `references/html-input-spec.md` whenever the input is an old HTML prototype page (translation layer: shell stripping, quantified extraction, embedded-component detection, post-generation parity check).
- Read `references/manual.md` only when the request needs more examples or troubleshooting detail.

## Hard Rules

- **门一：目标兼容性检查（每次生成前必须执行）**。收到"一模一样""像素级""完全复刻""完全一致""换 UI 风格""换组件库""换样式框架"等信号 → **立即停止，不许开始读取文件或生成** → 用大白话讲清楚为什么做不到、给出 A/B/C 三选一，等用户选定再继续。用户选定后立刻照做，不追问"你确定吗"。
- **门二：资源过载检查（每次生成前必须执行）**。如果涉及多个文件或混合材料，先用 `ls`/`find`/Glob 数文件数量（不读全文）→ 页面文件 >15 个或材料类型 ≥3 类 → 输出四段式诊断报告（我看到的[具体数字] / 会带来的问题 / 我的建议 / 需要你确认），等用户表态。不默认拒绝。
- **编码格式硬规则**：New page codes MUST match `^[A-Z]{2}[A-Z]{2}[0-9]{2}$` (2-letter module + 2-letter submodule + 2-digit sequence, e.g. `BMSP01`). Before assigning a new code, READ `menu.config.js` first: reuse existing module/submodule prefixes when the page belongs there, take max sequence + 1, and never duplicate an existing code. **旧编码兼容**：当输入来自旧系统/旧原型且已带 7~8 位编码（如 `FXGLQD01`）时沿用旧编码（兼容格式 `^[A-Z]{2,6}[0-9]{2}$`），不强行改成 6 位；新增页面仍一律用 6 位规范编码。
- **占位编码规则**：Navigation placeholder targets (`data-nav` to a page that does not exist yet) use a normal 6-char code (never a `-DETAIL` style suffix), are NOT registered in `menu.config.js`, and MUST be listed as `【补位】…占位` in the spec card.
- Write static pages as `pages/<分组中文名>/<页面中文名>.html`.
- Keep `data-page="<英文编码>"` on the page root. The code is the bridge to Vue.
- Business page `<head>` links only `../../assets/app.css`; do not add an inline `<style>`. `app.css` imports `theme.css`, so B 路线的皮肤覆盖写入 `assets/theme.css` 后会自动生效。禁止任意内联布局样式；仅允许原生表格列宽/对齐和数据驱动色点等无法稳定类化的 `width`、`text-align`、`background` 属性。
- Do not duplicate shell markup in business pages: no `top-header`, `sidebar`, or `page-tabs`.
- Use the shared primary color `#1677ff`; do not introduce `#0052d9` or `#1565c0` (legacy palettes from other skill lineages).
- Use data-driven tables: arrays plus render functions, then call `PR.bindActions()` after rendering.
- Every button has `data-action`; modal triggers use `data-modal`; cross-page navigation uses `data-nav`, not `location.href`.
- Update `menu.config.js` idempotently by `code`; do not duplicate menu rows.
- Do not modify existing `index.html` or existing rules in `assets/*` when adding or updating pages. **例外（样式扩展区）**：当标准类无法实现页面必需的视觉效果（抽屉、开关、雷达图、选中态卡片等）时，允许在 `assets/app.css` 末尾的 `/* === 站点扩展区（只增不改） === */` 区块**追加**新类——绝不允许修改或删除既有规则，新增的类必须记入 handoff.md 供后续页面复用。皮肤级覆盖（颜色/字体/圆角/阴影）仍走 `theme.css`。
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
    >  **A** 用我的默认高端ERP风格做（最快，但样子和旧版不像）
    >  **B** 我从旧页面提炼一套风格（theme.css），尽量接近原来的样子（需要多看几页，耗时更长）
    >  **C** 直接把旧文件复制进站点（最快、最像，但里面的技术标记会丢失，研发以后没法直接转成 Vue 代码）
    >  你选哪个？"
  - 等用户选定后，立刻照做，不追问、不劝说。

**0.5 HTML 输入翻译层（仅当输入为旧 HTML 页面时触发，执行规范见 `references/html-input-spec.md`）**
  - 识别输入信号：`.html` 文件路径、粘贴的 HTML 代码、`<div id="page-content">` 等。
  - **完整读取旧 HTML 全文**后再提取，禁止只读开头或凭文件名猜测（实测会导致页面主题跑偏）。
  - **内嵌组件识别（先于一切）**：含 `window.self !== window.top` iframe 检测脚本、或文件名带"内嵌-"前缀 → 是嵌入组件，不生成独立页面、不注册菜单，按 html-input-spec.md §4 整合进宿主页面（弹窗须补触发按钮、状态 Tab 须补对应 mock 数据）。
  - 外壳剥离：识别并移除 header/sidebar/tabs 等外壳元素，提取主内容区。剥离外壳 ≠ 压缩内容。
  - 结构化提取：按 html-input-spec.md §3 执行——先数出**数量守恒清单**（查询字段数/表格列数/数据行数/页签数/弹窗数/交互点），再逐区块提取明细（选项值逐个抄录、列名逐列列出），并写**业务说明段**（页面性质五选一，防语义偏差）。
  - 写成提示词文件：`prompts/<编码>-<页面名>.md`，**并把剥壳后的业务内容落盘为 `prompts/<编码>-<页面名>.source.html`**（双输入生成的第二输入）。长度以信息完整为准（通常 100~300 行；源文件 >300 行的提示词 ≥100 行，>800 行的 ≥200 行），一句话摘要或 30 行以内的结构摘要视为不合格输入，禁止用于生成。
  - **提示词质量门（生成前必过）**：按 html-input-spec.md §3.5 逐项核验（数量守恒有具体数字、选项值逐个抄录、业务说明段存在等）。有 JS 运行时则只校验本页或本批：`node <skill>/assets/check-prompts.js prompts/<编码>-<页面名>.md [...]`；需要审计目录内全部 HTML 输入时用 `--html-only`。修完所有 ✗ 才继续；无运行时（纯对话工具）人工过 §3.5 检查表。**不达标退回重新提取，禁止带病进入生成。**
  - 编码分配：先读 menu.config.js → 顺延序号；旧编码按兼容规则沿用（见硬规则）。
  - 页面类型推断：按组件组合推断（查询区+表格→列表查询页等）。
  - 向用户展示提取摘要，确认后进入步骤 2 充分性检查。
  - **生成阶段执行双输入（html-input-spec.md §8）**：每页生成时同时读提示词（结构索引）+ 剥壳源文件（细节兜底，选项值/mock 数据/交互逻辑直接从源里抄）；源文件 >800 行走分块对照，脚本区单独整块读入。**质量优先于速度与 token：禁止为省 token 跳过双输入。** 除双输入外，后续步骤 2~7 与文档输入一致。
  - **批次收紧（HTML 输入模式）**：每批 2~3 页；剥壳后 >800 行的复杂页单页一批；首批只做 1 页，交付对比报告全 ✓ 后再扩批。

**1. 门二检查（资源过载，每次生成前必须执行，不可跳过）**
  - 用 `ls`/`find`/Glob 扫描输入涉及的文件数量，不读取全文。
  - 页面源文件 >15 个或材料类型 ≥3 类 → 输出四段式诊断报告：
    > "**我看到的输入**：[具体数字，如34个html文件 + 1份PRD + 1份编码表]
    >  **这样输入会带来的问题**：[可能超出单次任务安全范围/质量衰减]
    >  **我的建议**：[是否拆分成独立提示词文件；文档输入按3-5页/批，旧 HTML 按2-3页/批推进]
    >  **需要你确认**：[等一个明确选择]"
  - 用户表态后立刻执行。用户说"全做"就直接照做，不反复劝说。
  - **若输入为旧 HTML 页面目录（多个文件）**：同样触发门二，拆分后每页走翻译层。

**1.5 批量状态检查（新增，仅批量模式）**
  - 检查目标目录是否存在 `handoff.md` / `progress.md` / `prompts/*.md`
  - 存在 → **进入恢复流程**：读取 handoff.md 获取进度，从待办页面继续，不得重新拆分
  - 不存在 → 继续正常流程（拆分 → 生成）
  - **核心原则**：文件是唯一的可信状态源，对话记忆不可靠

**2. 执行生成（以下为原有步骤）**
2.1 Ensure the target site exists. If `index.html` is missing, copy everything from `assets/framework/` into the target directory. If the site exists, only fill missing framework files and do not overwrite `menu.config.js` or `pages/*`. Ensure `assets/theme.css` exists and `assets/app.css` imports it exactly once before all other CSS rules; this one-time compatibility repair is allowed because otherwise B-route skin overrides cannot load.
2.2 Determine page code, group Chinese name, page Chinese name, page type, query fields, table columns, statuses, actions, modals, and navigation targets. Fill missing business details conservatively and record every filled item as a `【补位】` line under the spec card's `补位项` section; record PM-confirmed items under `确认项`. The `补位项` section must never be empty — write `无` explicitly when nothing was filled in. Include status keys in the dedicated `状态key` line with the ⚠ warning that they are prototype-only placeholders.
2.3 Create or update `pages/<分组中文名>/<页面中文名>.html` from `assets/page-template.html`. Keep only business content and runtime scripts that use `../../assets/page-runtime.js`. Add `prototype-page` to the `data-page` root and use `prototype-card`, `prototype-card-head`, `prototype-query-grid`, `prototype-table-wrap`, and related classes from `references/visual-parity.md`.
2.4 Register the page in `menu.config.js` as `{ code, cname, group, icon, file }`, where `file` is `<分组中文名>/<页面中文名>.html`.
2.5 Check horizontal overflow while designing each page: if any section needs more width than the viewport, constrain it to a card/table/chart wrapper with local `overflow-x:auto`; do not allow the whole business page or shell iframe to scroll horizontally.
2.6 If the page has bottom workflow actions, place them in `.fixed-bottom-bar` and add enough root padding via `has-fixed-actions` so the last content section is not covered.
2.7 Run the self-check before delivery. If a JS runtime is available, run `node assets/check-site.js` from the site root and fix every ✗ until the script passes. If no runtime is available (chat-only tool), fill in the self-check table instead (see §Self-Check Table).

**2.8 生成后强制自检（新增，批量模式）**
  - 每页生成后，对比 `prompts/<编码>-<页面名>.md` 检查：
    - `data-page` 编码是否与提示词一致
    - 表格列数、列名是否与提示词一致
    - 查询条件数、类型是否与提示词一致
    - 操作按钮数、文案是否与提示词一致
    - 跳转目标编码是否在 menu.config.js 中已注册（或已标记占位）
  - **数量守恒核对（HTML 输入模式必做）**：对照提示词文件头部的"数量守恒清单"逐项核对表格列数/查询字段数/页签数/弹窗数/数据行数/交互点，通过标准与重做规则见 html-input-spec.md §7；剥离外壳后新页面业务内容行数 < 源页面 50% → 疑似缩水，必须排查后才能交付
  - **交付对比报告（HTML 输入模式每页必附）**：输出"源页面 vs 生成页"逐项对照表（格式见 html-input-spec.md §7），写进交付说明并追加到 progress.md；任何 ✗ 必须在交付前处理，不允许带 ✗ 交付让使用者自己发现
  - **交互闭环检查**：每个 `data-modal` 容器都有至少一个触发按钮（data-modal-target）；每个状态页签/筛选值切换后表格非空（mock 数据覆盖所有状态 key）；每个靠 JS 切换 `active` 类的组件，确认 app.css/theme.css 有对应显隐规则（如 `.sub-panel{display:none}` / `.sub-panel.active{display:block}`）
  - 不一致 → 记录到 `progress.md` 偏差清单，标记是否需要重做
  - 关键项（编码、表格列、跳转目标）不一致 → **强制重做**：删除产物、回滚 menu.config.js、重新生成
  - **编码唯一性检查**：扫描 menu.config.js 中所有 `code`，确保无重复登记。重复则删除错误项，保留正确项
  - **图表样式检查**：检查含 `.chart-line` / `.efficiency-chart` 的页面，验证 X 轴文字不被覆盖、柱形图不溢出、文字不偏下
  - **跳转功能测试**：在 index.html 中点击所有带 `data-nav` 的元素，验证能正常跳转到目标页面

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
- **编码唯一性**：menu.config.js 中所有 `code` 无重复，重复登记会导致页面加载失败
- **图表样式**：含 `.chart-line` / `.efficiency-chart` 的页面，X 轴文字可见、柱形图不溢出、文字位置居中
- **跳转功能**：所有 `data-nav` 元素点击后能正常跳转，无标记冲突导致的绑定失败
- `index.html` and `assets/*` remain unchanged after adding pages.
- If the shell/framework is intentionally updated, verify the multi-tab bar uses arrow-button scrolling and no visible native horizontal scrollbar appears under the tabs.
- The page uses `prototype-*` classes and records visual intent such as field grouping, table columns, widths/alignment, status keys, action placement, and modal layout.
- **编码合规性**：本页 `data-page` 与所有 `data-nav` 目标编码——新分配的须匹配 `^[A-Z]{2}[A-Z]{2}[0-9]{2}$`（6 位 2+2+2），沿用的旧编码须匹配兼容格式 `^[A-Z]{2,6}[0-9]{2}$`。新分配的编码在 `menu.config.js` 中无重复；占位目标未注册进 menu 且已记入规格卡补位项。
- **规格卡 2.0**：页面头部注释的规格卡含"状态key/确认项/补位项"三栏，补位项非空（无补位时显式写"无"）。对话中提到的每一条补位，都能在规格卡补位项栏找到对应行。状态 key 已列在规格卡"状态key"栏并带临时编码警示。
- At desktop shell width, `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth` for each business page. If a table is wider than its card, only `.prototype-table-wrap` / `.table-wrap` may have `scrollWidth > clientWidth`.
- On pages with side panels or multi-column layouts, cards align to the same content width and do not spill past the right edge; long text, tags, and table minimum widths must not force outer-page horizontal scrolling.
- Narrow tables that can reasonably fit in their card must not show a horizontal scrollbar. Only genuinely wide tables with many columns may scroll inside their local wrapper.
- At common desktop shell height, the first screen and lower sections should not contain large unexplained empty rectangles; fill demo pages with realistic business content density.
- Same-row cards should be visually even unless the business meaning requires different heights. Check paired cards in two-column sections for ragged bottoms and stretch them when the difference is small.
- Bottom workflow operation bars remain fixed at the bottom of the business viewport while the page scrolls vertically, and the last content section can still scroll fully above the bar.
- If this page completes a batch (batch mode), the handoff document (`handoff-template.md`) has been updated with the completed page, any style fixes discovered, and workspace change overview.
- If the target site has `assets/theme.css`, it must not contain layout rules (`display` / `grid` / `position` / `width` — skin-only overrides such as colors, fonts, border-radius, shadows are allowed).
- `assets/app.css` imports `./theme.css` exactly once before other rules; `theme.css` exists even when it contains only the skin-extension marker.
- **（新增，批量模式）** 本页产物与 `prompts/<编码>-<页面名>.md` 的提示词一致：编码、表格列、查询条件、操作按钮、跳转目标均已核对。
- **（HTML 输入模式）** 数量守恒清单逐项通过（html-input-spec.md §7）：表格列数/查询字段选项值/页签数/弹窗数与源页面一致，每个页签切换后有数据，每个弹窗有触发按钮，业务语义与"业务说明"段一致，无 <50% 缩水。
- **（HTML 输入模式）** 双输入已执行：`prompts/<编码>-<页面名>.source.html` 存在且生成时已读入（>800 行走了分块对照）；提示词质量门已过（check-prompts.js 全 ✓ 或人工过 §3.5 检查表并在 progress.md 留痕）；交付说明附了"源页面 vs 生成页"对比报告且全 ✓。
- **（内嵌组件）** 含 `window.self !== window.top` 检测脚本或"内嵌-"前缀的源文件未被生成为独立页面、未注册菜单，已按弹窗/Tab/区块形态整合进宿主页面。
