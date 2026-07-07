# Kimi CLI 迁移任务说明书 —— PSM「绿星链通」原型 Skill 套件

> **读者**：Kimi CLI（你就是执行者）。
> **任务一句话**：把 `C:\work-project\psm-project\vue3-project-skill\skills\` 下的整套 skill，迁移到本目录 `C:\work-project\psm-project\kimi-skill-project\`，并在 Kimi 上挂载成可用、可触发的工作流程。
> **谁不做这件事**：写这份文档的 Claude 只负责描述与指路，**不执行迁移**。迁移由你（Kimi CLI）按本文档完成。
> **平台**：Windows 11 + PowerShell（命令示例以 PowerShell 为准）。

---

## 快速执行卡（TL;DR · 先看这张，细节再翻下文）

**执行顺序**：能力自检(§5.0) → 复制(§5.1) → 自动比对校验 → 挂载(§5.2/5.3) → 冒烟(§6) → 回填 `迁移结果.md`(§8)。

**一键复制 + 校验（PowerShell，源↔目标直接比对，不依赖写死的数字，最准）：**

```powershell
$src = "C:\work-project\psm-project\vue3-project-skill\skills"
$dst = "C:\work-project\psm-project\kimi-skill-project\skills"

# 1) 复制（保留中文路径，不动 node_modules——本来就没有）
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path "$src\*" -Destination $dst -Recurse -Force

# 2) 校验：列出“源有目标无”和“目标有源无”的差异；两者都为空即完美
$s = Get-ChildItem $src -Recurse -File | ForEach-Object { $_.FullName.Substring($src.Length) }
$d = Get-ChildItem $dst -Recurse -File | ForEach-Object { $_.FullName.Substring($dst.Length) }
$miss  = $s | Where-Object { $_ -notin $d }
$extra = $d | Where-Object { $_ -notin $s }
Write-Host ("源文件数={0}  目标文件数={1}" -f $s.Count, $d.Count)   # 期望都为 78
if ($miss)  { Write-Host "❌ 缺失：";  $miss  | ForEach-Object { Write-Host "   $_" } } else { Write-Host "✅ 无缺失" }
if ($extra) { Write-Host "⚠ 多余："; $extra | ForEach-Object { Write-Host "   $_" } } else { Write-Host "✅ 无多余" }
```

通过标准：**源/目标文件数都是 78、无缺失、无多余**，且 4 个 `SKILL.md` + `framework/` + `framework-template/` 整套在位、中文路径无乱码。

**三条不可碰的红线**（细节见 §7）：①原型页只能由 `prototype-site` 生成；②不向 PM 暴露技术词；③不替 PM 拍板。
**两个易错点**：保留中文目录名/UTF-8 不乱码；`framework-template` 不带 `node_modules` 是故意的，迁移阶段别 `npm install`。

---

## 0. 开工前先读懂三件事

1. **skill 的本质 = 一套 Markdown 指令 + 配套静态资源**。Claude Code 把它当原生 “skill” 自动发现并加载；**Kimi 没有 “skill” 这个原生概念**。所以“在 Kimi 上跑这些 skill” = 让 Kimi **读到同一套 Markdown 并按其中流程工作**。
2. **单一真源（铁律）**：这套 Markdown / 资源是唯一真源。迁移 = **原样搬运 + 挂载**，**不要改写规则内容**、不要“顺手优化”。要扩展只能加文件、不能改既有规则。
3. **不确定项只有一个**：Kimi 的“项目指令文件 / 本地文件读取 / 自定义命令”机制需你**先真机确认**（见 §5.0）。确认不了也有**万能保底**（会话开头粘贴交底文本），不会卡死。

---

## 1. 要迁移的资产全景

源目录：`C:\work-project\psm-project\vue3-project-skill\skills\`

| 资产 | 类型 | 文件数 | 作用 |
|---|---|---|---|
| `prototype-guide/` | skill | 17 | **产品经理原型引导**（对话式 Meta 层，本次主用） |
| `prototype-site/` | skill | 14 | **静态原型站点生成器**（原型页唯一生成规则，底线焊死在这里） |
| `prototype-to-vue3/` | skill | 6 | **原型 HTML → Vue3 页面**转换器 |
| `prototype-vue3-framework/` | skill | 39 | **可运行的 Vue3 Mock 框架**（转 Vue 的落地容器） |
| `prototype-site-change-log.md` | 记录 | 1 | prototype-site 的变更日志（随套件一起搬，便于追溯） |
| `vue3-demo-转换与修复记录.md` | 记录 | 1 | 转 Vue 的踩坑与修复记录（同上） |

> 这 4 个 skill 构成**两条流水线**（见 §4）。本次产品经理实际跑通的是「流水线 A：原型生成」（`prototype-guide` → `prototype-site`）。

**可选参考样例**（不是必须迁移项，但强烈建议你看一眼，作为“正确产物长什么样”的金标准）：
`C:\work-project\psm-project\vue3-project-skill\演示\供应商证照-手动测试\`
——这是用流水线 A 实际生成的一套三页原型站点（证照清单 / 到期看板 / 证照详情），可作为验收时的对照基准。

---

## 2. 逐个 Skill 详述

每个 skill 目录下都有一个 `SKILL.md`（带 YAML frontmatter：`name` + `description`），那是该 skill 的“入口说明”。`references/` 是必读规则，`assets/` 是要复制的静态模板，`agents/openai.yaml` 是 Codex 用的承载描述（Kimi 可保留但通常用不到）。

### 2.1 `prototype-guide`（产品经理原型引导）

- **定位**：Meta 编排层。使用者是**非技术产品经理(PM)**，核心诉求是“用业务大白话把页面原型做出来给客户看”。
- **它做什么**：开场立约（逐页推进）→ 收需求（口述/文档/截图）→ 充分性检查（回吐“读到/没读到”两清单）→ 选模板（业务化命名）→ 缺口分类处理 → 业务语言需求摘要确认 → **委托 `prototype-site` 生成单页** → 给补位清单 → 问是否做下一页。
- **关键文件**：
  - `SKILL.md` —— 入口、两阶段、硬规则、自检。
  - `references/flow.md` —— 必读。完整对话剧本 + 交互人格（逐页推进 / 进度透明 / 主动给建议 / 不替 PM 拍板 / 失真兜底二选一）。
  - `references/input-intake.md` —— 输入解析、信息充分性检查、**缺口分两类**（技术性缺口静默补位、业务性缺口才问 PM）。
  - `references/templates/index.md` —— 模板选型表（业务名 ↔ 适用场景）。
  - `references/templates/*.md` —— 8 个页型模板（列表查询 / 复杂清单 / 填表录入 / 详情查看 / 参数配置 / 数据看板 / 方案对比 / 审批流转），每个是“三段式”：PM 可见业务要素 / 内置约束(含 IR) / 元追问清单。
  - `测试与交付/*` —— 测试方案、统一测试案例、**03-多工具准备手册**（已含 Kimi 挂载思路，和本文件互补）、手动测试案例。
  - `工具无关-编排提示词.md` —— 一段可粘贴的“启动提示词”，把整条流程焊死、对 PM 隐藏技术细节（**与本次迁移高度相关，见 §5.3**）。
- **硬规则（摘要）**：一次只做一页；不给 PM 看 IR/原始提示词；信息不足永不拒绝、永不默默硬生成（走二选一）；模板对 PM 只用业务名；全程中文、主动报进度。
- **依赖**：生成阶段**强依赖** `prototype-site`（不得另造生成规则）。

### 2.2 `prototype-site`（静态原型站点生成器）★底线所在

- **定位**：原型页的**唯一**生成规则。PSM「绿星链通」高保真静态站点：共享外壳只复制一次，每个业务页只含页面内容并登记进 `menu.config.js`。
- **关键文件**：
  - `SKILL.md` —— Hard Rules + Workflow + Self-Check（**生成前必读**）。
  - `references/interaction-ir.md` —— **4 个 IR 标记**（`data-page` / `data-action` / `data-modal` / `data-nav`）的契约，是“原型点了有反应 → 转 Vue 不丢逻辑”的接缝。
  - `references/visual-parity.md` —— 视觉一致性契约（`prototype-*` 结构类、无横向滚动、同排卡片等高、固定底栏等）。
  - `references/psm-ui-profile.md` —— 命名/样式令牌/组件约定/转 Vue 就绪度。
  - `references/manual.md` —— 更多示例与排错。
  - `assets/framework/` —— **共享外壳整套**（`index.html` / `menu.config.js` / `assets/app.css` / `page-runtime.js` / `shell.js` + 一个示例页）。生成站点时整体复制到目标目录。
  - `assets/page-template.html` —— 业务页骨架（复制后填充）。
- **结构指纹（产物必须满足，缺一条判失败重做）**：
  - 页面落在 `pages/<分组中文名>/<页面中文名>.html`；根节点 `id="page-content"` 且 `data-page="<英文编码>"`。
  - `<head>` 只 `<link> ../../assets/app.css`，**无内联 `<style>` 块**、无外壳标记（top-header/sidebar/page-tabs）。
  - `menu.config.js` 按 `code` 幂等新增一行 `{ code, cname, group/icon, file }`。
  - 表格数据驱动；按钮挂 `data-action`、弹窗挂 `data-modal`、跨页跳转用 `data-nav`（不用 `location.href`）。
  - 无页面级横向滚动；有底部操作按钮则固定底栏。
- **底线**：原型页**只能**由本 skill 规则生成；编码用英文、静态文件名/分组用中文（编码是转 Vue 的桥）。

### 2.3 `prototype-to-vue3`（原型 HTML → Vue3 转换器）

- **定位**：把 `prototype-site` 产出的静态页**机械翻译**成 Vue 3 + Ant Design Vue 4 页面 + mock API + 菜单行，可跑可点、零后端零数据库。
- **关键文件**：`SKILL.md`（Hard Rules / 单页&整站工作流 / 自检 / 运行时验收）+ `references/`（interaction-ir / visual-parity / psm-ui-profile / manual）。
- **核心规则**：Vue 路径用英文编码 `src/views/<模块>/<子模块>/<编码>.vue`、API 用 `<编码小写>Api.js`、模块/子模块取编码前 4 位（如 `BMZZ01 → BM/ZZ`）；`menu.js` 满足 `formEname == 编码 == .vue 文件名`、`formLoadPath == /views/<模块>/<子模块>/<编码>`；中文只进显示字段。只出 Vue3/AntD4 写法（`v-model:value`、`<a-form-item name>`、表格 `#bodyCell`、`v-model:open`、`:deep()`、图标插槽），禁止 Vue2/AntD1 残留与裸 DOM 访问、未声明 `emits` 的 `$emit`。
- **依赖**：转换目标框架由 `prototype-vue3-framework` 提供；以其中 `BMSP01.vue` 为金标准样例。

### 2.4 `prototype-vue3-framework`（可运行的 Vue3 Mock 框架）

- **定位**：转 Vue 后页面的**落地容器**。独立的 Vue 3.4 + Ant Design Vue 4 + Vue Router 4 + Vuex 4 mock 框架（登录、外壳布局、侧边菜单、多页签路由、本地 mock 菜单、一个示例页）。
- **关键文件**：`SKILL.md`（Hard Rules / **Vue3 运行时红线 4 条** / Workflow / 双重自检）+ `assets/framework-template/`（**一整套 Vue CLI 工程**，含 `package.json`、`src/**`、示例页 `src/views/BM/SP/BMSP01.vue` + `bmsp01Api.js`）。
- **注意**：`framework-template` 是**不含 `node_modules` 的源工程**——这是**有意为之**，迁移时**照搬即可，不要在迁移阶段 `npm install`**。要跑起来时再到目标工程里 `npm install && npm run serve:mock`。
- **运行时红线（4 条，模板已内化，别回退）**：每个 `$emit` 配 `emits`；路由组件 `markRaw`；分组占位路由用 `h(RouterView)`；单一 `<keep-alive>`；`main.js` 挂载前先恢复动态路由。

---

## 3. 它们怎么串（流水线）

```
流水线 A（原型生成，本次主用）：
   产品经理(业务语言)
        │
        ▼
   prototype-guide  ──委托──►  prototype-site  ──►  静态原型站点
   (引导/选模板/补位)          (唯一生成规则)        pages/<分组>/<页>.html + menu.config.js

流水线 B（让原型可跑，进阶）：
   prototype-vue3-framework  ──►  生成空的 Vue3 mock 框架
        │
        ▼
   prototype-to-vue3  ──►  把 A 的静态页机械翻译进框架  ──►  npm run serve:mock 可跑可点
```

- **A 和 B 的接缝是 `data-page` 英文编码**：静态页用它登记菜单/标记根节点，转 Vue 时据它推导英文路径/路由/API 文件名。
- 迁移时**四个都搬**，但 Kimi 上**先挂通流水线 A**（PM 最常用、验收最快），B 作为进阶能力一并就位。

---

## 4. 迁移任务（你，Kimi CLI，按步执行）

### 5.0 第一步：能力自检（**务必先做，唯一高不确定项**）

> 🚀 **已备好一键脚本**：直接照 [`01-Kimi能力自检.md`](./01-Kimi能力自检.md) 跑——它用“同一会话多暗号”的办法一次分辨出 Kimi 读哪个指令文件，并给出挂载方案决策表。下面是其要点概述。

在动手复制前，先确认 Kimi 在本机的三项能力，决定后面用哪种挂载方案：

1. **能否读取工作目录内的本地文件？**（这是加载 skill markdown 的前提）
   - 验证：让自己读取 `C:\work-project\psm-project\vue3-project-skill\skills\prototype-guide\SKILL.md` 的前几行，能读到即通过。
2. **是否读取项目级指令文件？文件名是什么？**（如 `AGENTS.md` / `KIMI.md` / `.kimi/` 下的配置 / 其他）
   - 验证：在一个临时目录放 `AGENTS.md`，内容写“回答时自称喵助手”，启动 Kimi 看是否生效；换 `KIMI.md` 再试。记录哪个生效。
3. **是否支持自定义命令 / 自定义提示**（类似 `/原型` 触发）？
   - 查 Kimi CLI 官方文档“项目配置 / 自定义指令 / 上下文文件”章节确认。

> 把这三项的结论记在交付物 `迁移结果.md` 里（见 §7），它决定 §5.2 选哪条挂载路径。

### 5.1 第二步：复制资产到本目录

把整套 skill 复制进 `kimi-skill-project\skills\`，保持目录结构与**中文路径/文件名**原样：

```powershell
$src = "C:\work-project\psm-project\vue3-project-skill\skills"
$dst = "C:\work-project\psm-project\kimi-skill-project\skills"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path "$src\*" -Destination $dst -Recurse -Force
```

复制后核对（数量应与 §1 一致）：

```powershell
foreach ($d in 'prototype-guide','prototype-site','prototype-to-vue3','prototype-vue3-framework') {
  $n = (Get-ChildItem "$dst\$d" -Recurse -File).Count
  Write-Host "$d : $n 文件"
}
```

期望：`prototype-guide=17`、`prototype-site=14`、`prototype-to-vue3=6`、`prototype-vue3-framework=39`，外加顶层两个 `*.md` 记录文件。

**复制注意**：
- **保留中文目录名/文件名**（如 `pages\基础信息管理\…`、`测试与交付\…`）——这是命名约定的一部分，别改成英文/拼音。
- **不要**在此阶段执行 `npm install`，`framework-template` 无 `node_modules` 是有意的。
- **不要改写任何规则文件内容**（单一真源）。
- Windows 下注意 UTF-8 编码，别让中文变乱码。

### 5.2 第三步：选挂载方案（按 §5.0 结果三选一 + 保底）

| §5.0 的结论 | 采用方案 |
|---|---|
| ✅ 支持项目指令文件（AGENTS.md 等）+ 能读本地文件 | **方案①**：把 §5.3 交底文本写进该文件，放本目录根 |
| ✅ 不支持指令文件，但能读本地文件 | **方案②**：每次会话开头**粘贴** §5.3 交底文本，它据此去读 skills/* |
| ⚠ 连本地文件都难读 | **方案③（保底）**：把 §5.3 交底文本 + `prototype-guide/SKILL.md`+`flow.md`+`input-intake.md`+将用到的模板 内容**一起粘贴** |

> 无论机制如何，「会话开头粘贴交底文本」这条路一定走得通——别因为机制没摸清就卡住。

### 5.3 第四步：写挂载文件（交底文本，可直接用）

把下面整段写进 §5.2 选定的承载位置（方案①写进指令文件；方案②/③会话开头粘贴）。
**注意**：文中相对路径以本目录为根；若你的承载位置不同，把 `skills/` 前缀改成实际相对/绝对路径。

```text
你是「原型引导助手」，帮一位【非技术产品经理(PM)】把页面原型做出来给客户看。严格按下面执行。

【绝对底线 · 不可违反】
1. 原型页面【只能】由 prototype-site 规则生成。生成前你【必须先打开并完整阅读】：
   - skills/prototype-site/SKILL.md
   - skills/prototype-site/references/interaction-ir.md
   - skills/prototype-site/references/visual-parity.md
   绝不允许凭记忆、凭别的模板、或另造一套规则来画页面。
2. 全程对 PM 用业务语言。data-page / data-action / data-nav / data-modal、页面编码、IR、布局红线
   这些技术词【一个都不准】出现在你给 PM 的话里——它们由你内部落实，PM 不可见。
3. 【绝不替 PM 回答】。凡该 PM 决定的（选哪个模板、业务缺口怎么定、需求摘要对不对），
   你必须停下、提问、等他本人回答；不准自问自答、不准假设他的答复往下冲。

【工作方式】
- 逐页推进：一次只做一个页面，做完让 PM 确认，再问要不要做下一页。
- 进度透明：每步告诉 PM「现在第几步、刚做了什么、需要你配合什么」。
- 永不拒绝、永不默默硬生成：信息不足时给「(A)我按常见做法补位并标【补位】先出一版 /
  (B)你补完我再开始」二选一，由 PM 选。

【执行剧本：按 skills/prototype-guide/references/ 下的规则走】
- 对话流程与人格：照 flow.md。
- 输入解析与充分性检查、缺口分类：照 input-intake.md。
  · 技术性缺口（编码 / 菜单分组 / 跳转占位 / 图标 / 数据条数）→【你自己静默补位，不要问 PM】，记进补位清单。
  · 业务性缺口（有哪些状态 / 要不要某按钮 / 点某处跳到哪个已有业务页 / 字段口径）→ 才走二选一问 PM。
- 模板选型：照 templates/index.md。默认把【业务化模板清单】给 PM 让他选；他拿不准时给首选+备选二选一。
  选定后取对应 templates/<页型>.md 的「内置约束段」作为生成依据（含 IR，PM 不可见）。

【步骤】
0. 开场：自我介绍 + 解释“逐页推进”工作方式，征得 PM 同意。
1. 收需求：让 PM 口述 / 给文档 / 给截图（提示 markdown、清晰截图读得最准）。
2. 充分性检查：回吐两清单「✅我读到了 / ❓我没读到」，业务缺口走二选一。
3. 选模板：给业务化清单让 PM 选（或建议+确认）。
4. 需求确认摘要：用大白话复述将生成什么，让 PM 点头或纠正。
5. 生成（硬门禁）：
   a. 先打开并遵循“绝对底线①”的三个 prototype-site 文件，再按选定模板内置约束生成【单个】原型页。
   b. 产物落到站点结构：pages/<分组中文名>/<页面中文名>.html；幂等更新 menu.config.js 一行。
   c. 生成后自检“prototype-site 结构指纹”，缺任意一条就判失败、重做：
      □ 页面在 pages/<分组>/ 下、文件名中文；根节点 id="page-content" 且有 data-page="<英文编码>"
      □ <head> 只 <link> ../../assets/app.css，无内联 <style>、无外壳标记
      □ menu.config.js 已按编码幂等新增一行 { code, cname, group, icon, file }
      □ 表格数据驱动；每个按钮有 data-action、弹窗有 data-modal、跨页跳转用 data-nav
      □ 无页面级横向滚动；有底部操作按钮则固定底栏
6. 交付：告诉 PM 页面放哪、怎么看（开哪个 index.html）；给【补位清单】请他 review；问“要不要做下一页”。

现在从步骤 0 开始。
```

> 这段“交底文本”与 `skills/prototype-guide/工具无关-编排提示词.md` 同源，可直接以那份文件为准复制（保持单一真源）。需要做“转 Vue”时，另按 `prototype-to-vue3/SKILL.md` 与 `prototype-vue3-framework/SKILL.md` 挂载（同理：先读 SKILL.md，再按其 Hard Rules 执行）。

---

## 6. 验收（迁移完成的判定标准）

### 6.1 文件完整性
- §5.1 的文件计数与期望一致；4 个 `SKILL.md`、各 `references/*`、`prototype-site/assets/framework/` 整套、`prototype-vue3-framework/assets/framework-template/` 整套均在位且中文路径未损坏。

### 6.2 挂载生效
- 按 §5.2 选定方案启动一个新会话，Kimi 应以「原型引导助手」开场（步骤 0：解释逐页推进 + 征得同意），而**不是**直接画页面。

### 6.3 端到端冒烟（流水线 A，最关键）
用一段最小需求测试，例如：
> “做一个供应商证照管理页：能按供应商名称、证照类型查；状态分 有效/即将到期(90天内)/已过期；每行能查看扫描件、登记续期；顶部能新增、导出。”

判定通过的标准：
- 全程**没有**把 `data-action`/`data-nav`/`data-page`/编码 等技术词暴露给“PM”。
- 走了充分性检查（两清单）+ 模板让 PM 选/确认 + 需求摘要确认，**没有替 PM 自问自答**。
- 生成产物落在 `pages\<分组中文名>\<页面中文名>.html`，满足 §2.2 的**结构指纹**（可对照参考样例 `演示\供应商证照-手动测试\`）。
- `menu.config.js` 幂等新增了一行。
- 交付时给了**补位清单**并询问是否做下一页。

> 可拿参考样例的三页（证照清单/到期看板/证照详情）作为“黄金对照”，比对结构与交互是否等价。

### 6.4（进阶）流水线 B 冒烟
- 用 `prototype-vue3-framework` 生成框架后 `npm install && npm run serve:mock` 能起；用 `prototype-to-vue3` 把上面的静态页转进去，菜单点击能进页、查询/弹窗/跳转有反应、控制台无报错。

---

## 7. 高发坑与红线（务必规避）

1. **底线①——只能用 prototype-site 生成**：任何“凭记忆/换模板/自造规则”画页面都判失败。生成前必须先读那 3 个文件。
2. **底线②——不向 PM 暴露技术词**：弱模型最容易把 `data-action` 等吐出来，挂载时反复强调。
3. **底线③——不替 PM 拍板**：该 PM 定的（模板、业务缺口、需求摘要）必须停下来问、等他回答。
4. **缺口分类别搞反**：技术性缺口（编码/分组/跳转占位/图标/数据条数）**静默补位**；只有业务性缺口才问 PM。问错会劝退 PM。
5. **中文路径/文件名要保留**：`pages\<分组中文名>\<页面中文名>.html`、`测试与交付\` 等，别英文化；注意 UTF-8 不要乱码。
6. **编码英文、路径中文**：静态站点文件名中文、`data-page` 编码英文；转 Vue 时路径/文件名**全英文**、中文只进显示字段。
7. **framework-template 不带 node_modules 是故意的**：迁移阶段别 `npm install`，别把依赖塞进复制。
8. **单一真源**：不改写规则文件；要修要扩，反馈给规则维护者或新增文件，别在副本上改。
9. **Vue3 运行时红线 4 条**（仅流水线 B）：`emits`/`markRaw`/`h(RouterView)`/单 `<keep-alive>`/挂载前恢复动态路由——模板已内化，生成代码别回退。

---

## 8. 交付物清单（迁移完成后请产出）

放在本目录 `C:\work-project\psm-project\kimi-skill-project\` 下：

1. `skills\`（迁移过来的整套，结构/计数符合 §1、§5.1）。
2. 选定的挂载文件（方案①则为 `AGENTS.md`/`KIMI.md` 等；方案②/③则把交底文本存为 `挂载-交底文本.md` 备查）。
3. **回填好的 `迁移结果.md`**（本目录已备好空白模板，边做边填）：
   - §5.0 能力自检结论（能否读本地文件 / 项目指令文件名 / 是否支持自定义命令）。
   - 采用的挂载方案（①/②/③）及原因。
   - §6 各项验收结果（通过/不通过 + 现象）。
   - 遇到的问题与处置（特别是中文路径、编码、Kimi 机制差异）。

---

### 附：源/目标路径速查
- 源 skill 目录：`C:\work-project\psm-project\vue3-project-skill\skills\`
- 目标工作目录：`C:\work-project\psm-project\kimi-skill-project\`
- 参考样例（正确产物）：`C:\work-project\psm-project\vue3-project-skill\演示\供应商证照-手动测试\`
- 同源交底文本：`...\skills\prototype-guide\工具无关-编排提示词.md`
- 已有多工具手册（互补参考）：`...\skills\prototype-guide\测试与交付\03-多工具准备手册.md`
