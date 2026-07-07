# prototype-site Skill 修改记录

记录范围：`vue3-project-skill/skills/prototype-site`

用途：后续如果 `prototype-to-vue3`、Vue3 框架相关 skill 或其它原型生成 skill 需要同步体验约束，可先阅读本文件，判断是否需要同步修改。

## 当前已覆盖的体验约束

- 业务内容区禁止页面级水平滚动；只允许表格、矩阵、图表等组件内部按需横向滚动。
- 外壳多页签禁止原生水平滚动条；页签过多时使用左右方向按钮滚动。
- 窄表禁止无意义横向滚动；3-6 列小表应自然铺满卡片。
- 演示页避免大块空白；用业务相关摘要、建议、校验、历史、指标补足内容密度。
- 同排卡片默认等高对齐，尤其是分析/计算器、审批/时间线这类 paired cards。
- 页面底部工作流操作栏固定在业务视口底部，不随页面滚动或抖动。

## 本轮原型页面修复参考清单

这些页面属于已生成站点 `vue3-project-skill/prototype-pages` 的修复对象，不属于 skill 文件本身；记录在这里是为了后续其它 skill 或 Claude 接手时有验收样本。

- 页签栏方向按钮滚动：`prototype-pages/index.html`、`prototype-pages/assets/app.css`、`prototype-pages/assets/shell.js`
- 页面级横向滚动/表格局部滚动：`BMGY03`、`BSRS05`、`BSRS06`、`BSCX03`、`BSCX04`
- BSCX03 页面重构参考：`psm-ui/src/views/BS/CX/BSCX03.vue`、`psm-ui/src/api/bscx03Api.js`
- BMGY03 页面重构参考：`psm-ui/src/views/BM/GY/BMGY03.vue`、`psm-ui/src/api/bmgy03Api.js`
- BMGY02 页面重构参考：`psm-ui/src/views/BM/GY/BMGY02.vue`、`psm-ui/src/api/bmgy02Api.js`
- 底部操作栏固定：`BMGY02`、`BSRS01`、`BSRS02`、`BSRS03`、`BSRS05`、`BSRS06`、`BSRS08`、`BSCX01`、`BSCX03`、`BSCX04`、`BSCX05`、`BMCP01`

## 接手验收建议

- 打开 10 个以上菜单页，确认页签区域无原生横向滚动条，左右方向按钮可滚动且激活页签可见。
- 对每个重点页面执行 `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth`，确认没有业务页面级横向滚动。
- 检查窄表：能一屏展示的 3-6 列表格不应出现横向滚动条；只有列数多或内容确实过宽的表格才允许局部滚动。
- 滚动到页面中段和底部，确认固定底部操作栏不抖动、不遮挡最后内容。
- 检查同排卡片底部是否齐平，尤其是 BSCX04、BSCX05。
- 本轮由于内置 Browser 插件缺少 `scripts/browser-client.mjs`，最终没有完成截图级浏览器复核；已完成 HTML 结构和按钮 IR 静态检查，接手者建议补一次可视化验收。

## 2026-06-25：业务内容区禁止页面级水平滚动

### 背景

静态原型中部分页面使用宽表格、左右分栏、矩阵或对比组件时，表格的 `min-width` 会把 grid/flex 容器撑宽，导致整个业务 iframe 出现水平滚动条。客户反馈页面整体横向滚动条观感差，要求系统内容区整体不能出现水平滚动条；只有表格、矩阵、图表等单独组件确实需要时，才允许在组件内部滚动。

### 已修改文件

- `prototype-site/SKILL.md`
- `prototype-site/references/visual-parity.md`
- `prototype-site/assets/framework/assets/app.css`

### 关键规则

- 业务内容区不得产生页面级水平滚动条。
- 宽表、矩阵、图表、对比卡片只能在自己的 wrapper 内横向滚动。
- grid/flex 多列布局中，包含表格或图表的列必须具备收缩能力：
  - 使用 `minmax(0,1fr)`，不要裸用 `1fr`。
  - grid/flex 子项加 `min-width:0`。
  - 宽表必须包在 `prototype-table-wrap` / `table-wrap` 内。
- 自检项增加：
  - 页面级：`document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth`
  - 局部宽表允许：只有 `.prototype-table-wrap` / `.table-wrap` 可出现 `scrollWidth > clientWidth`。

### 对其它 skill 的同步建议

如果其它 skill 会生成 Vue 页面、Ant Design Vue 表格、左右分栏、看板页、对比页，需要同步以下约束：

- Vue 页面根容器和内容卡片要避免外层横向溢出。
- `a-table` 的 `scroll.x` 应只作用于表格区域，不应撑宽页面布局。
- 转 Vue 时保留“页面无整体横向滚动、表格局部滚动”的验收项。

## 2026-06-25：外壳页签栏改为方向按钮滚动

### 背景

共享外壳的多页签栏打开较多菜单后，会显示浏览器原生水平滚动条。客户反馈该滚动条明显且不美观，要求保留滚动能力，但不要显示原生滚动条，改为左右方向按钮控制页签滚动。

### 已修改文件

- `prototype-site/SKILL.md`
- `prototype-site/assets/framework/index.html`
- `prototype-site/assets/framework/assets/app.css`
- `prototype-site/assets/framework/assets/shell.js`

### 实现方式

- `index.html` 的 `.page-tabs` 中增加左右按钮：
  - `#tabScrollLeft`
  - `#tabScrollRight`
- `.tab-list` 保持横向滚动能力，但隐藏原生滚动条：
  - `scrollbar-width:none`
  - `-ms-overflow-style:none`
  - `.tab-list::-webkit-scrollbar{display:none}`
- `.page-tabs.has-overflow` 时显示方向按钮。
- `shell.js` 增加：
  - 判断页签是否溢出。
  - 根据滚动位置禁用左/右按钮。
  - 点击按钮按容器宽度比例平滑滚动。
  - 切换页签时自动把当前激活页签滚入可视区域。

### 关键规则

- 外壳 multi-tab 不允许出现原生水平滚动条。
- 多页签溢出时必须用左右方向按钮滚动。
- 当前激活页签应保持可见。

### 对其它 skill 的同步建议

如果其它 skill 会生成或维护 Vue3 框架外壳、多页签组件、`MultiTab.vue`、`BasicLayout.vue` 或原型站点 shell，需要检查是否也存在原生页签滚动条。建议同步：

- 多页签栏隐藏原生滚动条。
- 使用左右箭头、按钮或类似控件滚动。
- 激活页签自动滚入可视区域。
- 验收时多打开 10 个以上菜单页，确认没有底部原生横向滚动条。

## 后续维护建议

- 以后每次修改 `prototype-site` 的硬规则、模板资产、视觉契约或自检口径，都在本文件追加一节。
- 如果修改只影响某个已生成站点，也要判断是否需要同步到 `prototype-site/assets/framework`，避免下一次复制模板又回到旧行为。
- 如果修改影响 Vue 转换结果，需要同时提醒检查 `prototype-to-vue3` 相关 skill 是否需要同步。

## 2026-06-25：底部操作栏固定在业务视口底部

### 背景

多个业务输入、输出和模型配置页面把“保存、校验、提交、审批、返回”等底部按钮做成普通内容卡片或 sticky 区块。客户反馈垂直滚动时底部按钮会跟着内容移动或抖动，体验不稳定；BMGY03 中固定在底部的按钮栏效果较好，需要统一为站点规范。

### 已修改文件

- `prototype-site/SKILL.md`
- `prototype-site/references/visual-parity.md`
- `prototype-site/assets/framework/assets/app.css`

### 关键规则

- 有最终工作流动作的页面必须使用固定底部操作栏。
- 页面根容器添加 `has-fixed-actions`，为固定底栏预留底部空间。
- 按钮组使用 `.fixed-bottom-bar`，固定到业务 iframe / 页面视口底部。
- 底部操作栏不得做成普通 in-flow 卡片，也不要使用会随滚动位置变化的 `position: sticky`。
- 固定底栏内需要左右分组时使用 `.spacer`，居中布局使用 `.fixed-bottom-bar.center`。
- 验收时必须滚动页面中段和底部，确认按钮栏不抖动、不遮挡最后内容。

### 对其它 skill 的同步建议

如果其它 skill 会生成 Vue 页面、审批页、录入页、配置页或 Ant Design Vue 表单页，需要同步以下约束：

- Vue 页面中的底部动作区建议使用固定 footer/action bar，而不是放在页面流底部。
- 固定底栏需要和内容容器配套预留 padding-bottom。
- 转换到 Vue 时要检查 `a-layout-content`、抽屉/iframe/业务容器内的定位参照，确保按钮固定在业务内容视口底部，而不是浏览器窗口外层错误位置。

## 2026-06-25：窄表禁止无意义横向滚动，演示页补足内容密度

### 背景

BSRS05、BSRS06 等页面中很多卡片只是 3-6 列的小表，但因为继承了全局宽表 `min-width:1100px`，每张卡片都出现横向滚动条，列间空隙很大。客户反馈这类表格如果能正常一行展示，就不应该强制横向滚动；同时演示页底部存在大块空白区域，观感不完整。

### 已修改文件

- `prototype-site/SKILL.md`
- `prototype-site/references/visual-parity.md`

### 关键规则

- 不要把全局宽表最小宽度盲目套到所有表格。
- 3-6 列窄表应使用 fit-table 行为：
  - `min-width:0`
  - `table-layout:fixed`
  - 单元格允许换行
  - 表格填满卡片但不产生无意义横向滚动条
- 只有真正列数多、内容宽的表格，才允许在局部 wrapper 内横向滚动。
- 原型是演示页，不能出现大块无业务含义空白。需要用业务相关内容补足：
  - 摘要卡片
  - 推荐方案
  - 校验清单
  - 历史时间线
  - 指标说明

### 对其它 skill 的同步建议

如果其它 skill 会把静态原型转换为 Vue/Ant Design Vue 页面，需要同步判断：

- `a-table :scroll="{ x: ... }"` 不应默认给所有表格加。
- 窄表应自然铺满卡片，避免每个小表都有横向滚动条。
- 看板和演示页面应保持合理内容密度，避免转换后保留大块空白。

## 2026-06-25：同排卡片默认等高对齐

### 背景

BSCX04 的“影子价格排行榜 / 如果会怎样计算器”和 BSCX05 的“审批操作 / 审批流程时间线”都是左右同排卡片。客户反馈当两张卡片高度差距不大时，如果底部不对齐，页面排版显得不整齐，已经作为问题提出。

### 已修改文件

- `prototype-site/SKILL.md`
- `prototype-site/references/visual-parity.md`

### 关键规则

- 同一视觉行中的卡片默认应等高对齐。
- 排行榜/计算器、审批操作/时间线、表单/预览、图表/列表这类 paired cards，内容高度接近时必须共享底部边界。
- 实现建议：
  - 外层 grid/flex 使用 `align-items:stretch`。
  - 卡片设置 `height:100%`。
  - 卡片 body 使用 `display:flex; flex-direction:column; flex:1`。
  - textarea、时间线、表格容器等主体区域按需 `flex:1`。

### 对其它 skill 的同步建议

Vue 转换或框架页生成时，检查两列卡片是否被 AntD card body 默认 padding/height 破坏等高。必要时给对应 row/card/body 增加 stretch 和 flex 布局，避免同排卡片底部参差。

## 2026-06-25：已把上述 5 节同步到 prototype-to-vue3 / prototype-vue3-framework

上面这一轮（页面级禁横向滚动、页签方向滚动、窄表 fit-table、固定底栏、同排卡片等高）此前只改了 `prototype-site`，下游两个 skill 未同步。本次已补齐：

- `prototype-vue3-framework/assets/framework-template/src/assets/styles/prototype-parity.scss`：新增 `prototype-cols`（含 `cols-3`/`cols-sidebar`，stretch 等高 + `minmax(0,1fr)` + 子项 `min-width:0`）、`prototype-card-body`（flex:1）、`prototype-table.fit-table`（窄表）、`has-fixed-actions` + `fixed-bottom-bar`；并给 `prototype-page`/`prototype-card` 补 `min-width:0`。
- 固定底栏在框架里改用「内容滚动区内 sticky 底栏」而非视口 `position:fixed`，因为业务页在会滚动的 `a-layout-content` 内、左侧有可折叠固定侧栏；视口级 fixed 会压到侧栏下。
- 页签方向滚动：框架 `MultiTab.vue` 用 `a-tabs`，AntD4 溢出时自带 nav 操作区且自动滚动激活页签入视，不产生原生横向滚动条，故未改组件代码，仅在 `visual-parity.md` 记录约束（勿外套产生原生滚动条的 wrapper）。
- `prototype-vue3-framework/references/visual-parity.md`、`prototype-to-vue3/references/visual-parity.md`、`prototype-to-vue3/SKILL.md` 均补充了对应规则与验收项。

后续如再改 `prototype-site` 硬规则，仍按本文件「后续维护建议」追加一节，并同步判断这两个下游 skill 是否需要跟改。
