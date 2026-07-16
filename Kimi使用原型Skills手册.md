# Kimi 使用原型 Skills 手册

## 1. 从正确目录启动

所有同事都应从下面这个目录启动 Kimi：

```powershell
cd C:\work-project\psm-project\psm-ui\kimi-skill-project
```

首次拉到本次兼容文件后，请关闭旧会话并从该目录新开 Kimi 会话。旧会话可能仍按旧版 `.kimi-code/AGENTS.md` 的详细剧本执行。

项目中的完整公共规则位于 `skills/`；Kimi 直接读取这里的主 `SKILL.md`。`.agents/skills/` 是 Codex 专用发现入口，Kimi 不需要也不应读取它。

## 2. 确认能读到 4 个 Skill

在 Kimi 中可以直接用自然语言调用，例如：

```text
使用 prototype-guide，根据我的业务需求逐页确认并生成 PSM 原型。
```

如果 Kimi 没有自动进入对应 Skill 流程，可补充要求：

```text
请先完整读取 skills/prototype-guide/SKILL.md，再按其中规则执行。
```

## 3. 四个 Skill 怎么选

| Skill | 什么时候用 | 不负责什么 |
|---|---|---|
| `prototype-guide` | 输入还是需求描述、PRD、截图或旧 HTML，需要访谈、拆页、确认和编排 | 不应跳过确认，直接假定所有页面规格 |
| `prototype-site` | 已经有一份确认过的单页/批次规格，需要生成或更新静态原型站点 | 不负责从模糊需求重新做产品访谈 |
| `prototype-vue3-framework` | 需要创建或修复承载原型的隔离 Vue3 + Ant Design Vue 4 mock 演示壳 | 不用于改造生产 `psm-ui` 的 Vue2 工程 |
| `prototype-to-vue3` | 静态页已生成并在菜单中注册，需要转换为 Vue3 页面、mock API 和菜单记录 | 不负责未注册页，也不替代静态原型确认 |

建议在提示词中显式写出 Skill 名，例如“使用 prototype-guide”。显式调用最容易得到稳定、可复现的流程。

## 4. 常用提示词

### 4.1 从产品需求开始

```text
使用 prototype-guide，根据 docs/某某需求.md 帮我梳理并生成原型。
先识别页面清单和待确认项，按流程从首批 1 页开始，不要跳过确认。
```

### 4.2 从旧 HTML 重做原型

```text
使用 prototype-guide，把我提供的旧 HTML 作为双输入之一进行翻译。
保留业务数量和交互语义，先判断哪些文件是内嵌组件；内嵌组件合入宿主页，不注册独立菜单。
```

旧 HTML 建议每批 2–3 页；复杂页面单页处理。若要提取旧系统视觉，请明确选择风格 B，并要求视觉覆盖写入 `theme.css`。

### 4.3 已有确认规格，直接生成静态页

```text
使用 prototype-site，根据 prompts/BMSP01-供应商准入申请.md 更新对应静态页。
只处理这个提示词文件，完成后运行提示词和站点校验，并更新交接状态。
```

### 4.4 初始化 Vue3 演示框架

```text
使用 prototype-vue3-framework，在隔离目录创建可运行的 Vue3 mock 演示框架。
不要修改生产 psm-ui 的 Vue2 代码。
```

### 4.5 把静态原型转成 Vue3

```text
使用 prototype-to-vue3，把已注册的 BMSP01 静态原型转换到现有 Vue3 演示框架，
生成页面、mock API 和菜单记录，并按 Skill 的校验要求验收。
```

### 4.6 接着上次进度继续

```text
使用 prototype-guide，先读取 prototype-state.json、prototype-handoff.md
和 prototype-change-log.md，从未完成批次继续；不要重复已经确认的首轮访谈。
```

如果当前阶段已经是明确的静态页生成，也可把 `prototype-guide` 换成 `prototype-site`。

## 5. 标准工作流

### 新需求

```text
原始需求/PRD/截图
  -> prototype-guide 访谈、拆页、确认
  -> prototype-site 生成共享外壳静态页
  -> 提示词校验 + 站点校验
  -> 更新状态与交接文件
```

### 旧系统页面迁移

```text
旧 HTML + 业务说明
  -> prototype-guide 识别宿主页和内嵌组件
  -> 确认风格 A/B/C 与页面规格
  -> prototype-site 生成静态页
  -> 必要时 prototype-vue3-framework
  -> prototype-to-vue3
```

## 6. 重要规则

- 新编码使用 6 位格式；旧系统编码可保留 `^[A-Z]{2,6}[0-9]{2}$`。
- 旧编码转 Vue 路径时，先去掉末尾两位数字，再按字母部分拆模块和子模块；不要截取前 4 位。
- 普通独立页必须注册菜单；内嵌组件不注册菜单。
- 页面 head 只引用 `assets/app.css`，由 `app.css` 在首部且仅一次导入 `theme.css`。
- `theme.css` 只放皮肤和视觉覆盖，不放布局规则。
- 页面禁止 `<style>` 块和任意内联布局样式；仅在规则允许的数据驱动场景使用白名单属性。
- 文档输入通常 3–5 页/批，旧 HTML 通常 2–3 页/批，复杂页面单页处理，首次试跑 1 页。
- 生产 `psm-ui` 是 Vue2 工程。除非任务明确要求生产改造，否则 Vue3 两个 Skill 只操作隔离演示框架。

## 7. 校验命令

### 7.1 检查提示词

在项目根目录执行指定文件校验：

```powershell
node .\skills\prototype-site\assets\check-prompts.js prompts\BMSP01-供应商准入申请.md
```

只检查旧 HTML 来源的提示词：

```powershell
node .\skills\prototype-site\assets\check-prompts.js --html-only prompts\BMSP01-供应商准入申请.md
```

不传具体文件时会扫描默认提示词目录；续跑单批次时更推荐显式传文件，避免被无关历史批次阻塞。

### 7.2 检查静态站点

先进入待验收静态站点的根目录，确保当前目录下有 `menu.config.js`、`assets/` 和 `pages/`，再执行：

```powershell
node C:\work-project\psm-project\psm-ui\kimi-skill-project\skills\prototype-site\assets\check-site.js
```

看到 C1–C10 全部通过，才能写“自动校验通过”。如果环境不能执行 Node，应在交接说明里明确写“未自动校验”。

## 8. 输出和续跑文件

以具体任务的输出目录为准，常见内容包括：

- `prompts/`：逐页生成提示词；
- `pages/`：静态原型页面；
- `assets/app.css`、`assets/theme.css`：公共布局样式与主题皮肤；
- `menu.config.js`：独立页面菜单注册；
- `prototype-state.json`：机器可读进度；
- `prototype-handoff.md`：给下一位同事/下一轮会话的交接；
- `prototype-change-log.md`：变更记录。

续跑前先读状态和交接文件，不要只凭对话上下文猜进度。

## 9. 常见问题

### Kimi 没有按 Skill 流程执行

确认 Kimi 是从 `C:\work-project\psm-project\psm-ui\kimi-skill-project` 启动，而不是从上层 `psm-project` 或 `psm-ui` 启动；上层目录可能会加载到另一套 Skill。

### 需要强制读取主 Skill

如果 Kimi 只读了 `.kimi-code/AGENTS.md` 就开始执行，可补一句：

```text
请按 skills/prototype-guide/SKILL.md 的完整规则执行，不要只按 AGENTS.md 路由文件简化执行。
```

### Codex 还能不能使用

可以。公共规则仍在原来的 `skills/`；Codex 新增的是 `.agents/skills` 轻量入口。Codex 同事应继续从本目录启动，并参考 `Codex使用原型Skills手册.md`。
