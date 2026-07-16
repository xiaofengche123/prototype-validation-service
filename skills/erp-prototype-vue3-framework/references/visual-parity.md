# Visual Parity Layer

The framework template must provide a shared style layer that lets converted Vue pages closely match confirmed HTML prototypes.

## Required Asset

`src/assets/styles/prototype-parity.scss` defines global prototype-compatible classes and Ant Design Vue 4 overrides under `.prototype-page`.

Import it from `src/assets/styles/global.scss` after the base AntD overrides.

## Responsibilities

- Keep tokens aligned with `variables.scss` and static prototype `assets/app.css`.
- Provide reusable styles for `prototype-page`, cards, query grid, stats, status tabs, tables, batch bars, modal forms, buttons, links, and status tags.
- Avoid page-specific business selectors in this shared file.
- Converted pages should need only small page-specific styles; layout fidelity should come from this shared layer.

## 体验约束（同步自 erp-prototype-site 的 visual-parity 规范）

共享层 `prototype-parity.scss` 必须提供以下体验约束，转换页才能直接套类而不写一次性样式：

- **禁止页面级横向滚动**：`prototype-page` 根、`prototype-card`、多列子项都要 `min-width:0`，多列容器用 `repeat(n,minmax(0,1fr))`，不允许整页出现横向滚动条；宽表/图表只能在自己的 wrapper 内滚动。
- **多列行 + 同排卡片等高**：提供 `prototype-cols`（含 `cols-3`、`cols-sidebar`），`align-items:stretch`，行内 `prototype-card` 取 `height:100%` + 纵向 flex，`prototype-card-body` 取 `flex:1`，让排行榜/计算器、审批/时间线这类 paired cards 底边对齐。
- **窄表 fit-table**：提供 `prototype-table.fit-table`（`min-width:0` + `table-layout:fixed` + 单元格换行），3-6 列小表铺满卡片、不强制横向滚动；只有真正宽的数据集才用 `:scroll="{ x }"`。
- **固定底部操作栏**：提供 `has-fixed-actions`（预留底部 padding）+ `fixed-bottom-bar`（含 `.spacer`/`.center`/`.between`）。框架里业务页位于会滚动的 `a-layout-content` 内、左侧有可折叠固定侧栏，所以底栏用内容滚动区内的 **sticky 底栏**（不是视口级 `position:fixed`），自动尊重内容左右边界、跟随侧栏折叠、不抖动。
- **多页签禁止原生横向滚动条**：`MultiTab.vue` 用 `a-tabs`，AntD 4 在页签溢出时自带 nav 操作区（更多/滚动）并自动把激活页签滚入可视区，**不会**产生浏览器原生横向滚动条。维护时不要在 `.multi-tab` 外再套会产生原生横向滚动条的 wrapper，也不要自造与 AntD nav 冲突的滚动条。

## Ant Design Vue 4 注意

- AntD Vue 4 基础重置样式来自 `ant-design-vue/dist/reset.css`（main.js 引入），不再是 1.x 的 `antd.css`。
- 选择器类名沿用 4.x：如下拉框是 `.ant-select-selector`（1.x 是 `.ant-select-selection`），页签是 `.ant-tabs-nav`/`.ant-tabs-tab`（1.x 是 `.ant-tabs-bar`/`.ant-tabs-card-bar`）。
- 组件内深度覆盖 AntD 皮肤用 `:deep(.ant-xxx)`（不是 `::v-deep`）。
- 颜色一律用 `variables.scss` 的 `$变量`，主色 `#1677ff`，禁止离群 `#0052d9`。
