# Prototype Validation Service

AI 驱动的原型验证服务。通过 Claude Code Skills 体系，让非技术产品经理用自然语言驱动 AI 自动生成高保真静态原型页面，生成的页面可直接转换为 Vue 3（Ant Design Vue）生产代码。

## 解决的问题

产品经理画原型有三个痛点：
1. **画图慢** — 用 Figma/Axure 画一个管理后台页面需要半天
2. **说不清** — 给 UI/研发描述需求，对方理解偏差大
3. **转码难** — 静态原型和 Vue 代码之间的鸿沟要手动弥补

本项目的解法：PM 用业务语言说需求 → AI 生成高保真原型（含交互标记）→ 机械式转换为 Vue 组件。

## 核心架构

```
产品经理（自然语言描述需求）
        │
        ▼
┌── prototype-guide ─────────────────┐
│  Skill: 对话引导 + 输入检查         │
│  把业务需求翻译成原型规格            │
│  - 8 种页面模板自动选型             │
│  - 信息充分性检查（缺什么问什么）     │
│  - 批量输入分诊（ >15 页自动拆分）   │
└──────────┬─────────────────────────┘
           │ 内部委托
           ▼
┌── prototype-site ──────────────────┐
│  Skill: 生成引擎                    │
│  产出带 IR 标记的高保真静态页面       │
│  - data-page / data-action          │
│  - data-modal / data-nav            │
│  - 绿星链通 UI 规范（#1565c0）       │
│  - 自动注册菜单 (menu.config.js)    │
└──────────┬─────────────────────────┘
           │
           ▼
┌── prototype-to-vue3 ──────────────┐
│  Skill: 静态原型 → Vue 3 转换      │
│  读取 IR 标记机械式生成组件代码      │
│  Ant Design Vue 4 + Composition API│
└───────────────────────────────────┘
```

## 页面模板体系

| 页型 | 适用场景 |
|---|---|
| 列表查询页 | 带筛选条件 + 表格 + 分页的列表 |
| 填表录入页 | 表单提交，含校验和提交逻辑 |
| 审批流转页 | 多状态审批 + 审批操作 + 流转记录 |
| 数据看板页 | 多图表 + 指标卡片 + 数据概览 |
| 方案对比页 | 多列对比 + 差异高亮 |
| 详情查看页 | 信息展示 + 关联数据 + 操作入口 |
| 参数配置页 | 开关/输入框/下拉框配置 |
| 复杂清单页 | 树形结构 + 多层级数据展示 |

## 生成结果展示

12 个已生成原型页面（`/pages/`）：

```
pages/
├── 基础信息管理/
│   └── 供应商准入申请.html
├── 风险管理/
│   ├── 风险驾驶舱.html
│   ├── 统计报表.html
│   ├── 风险监督场景.html
│   ├── 风险管理清单.html
│   ├── 风险登记录入.html
│   ├── 风险事件详情.html
│   └── 等级调整审核.html
└── 任务管理/
    ├── 任务驾驶舱.html
    ├── 任务管理列表.html
    └── 任务创建.html
```

打开 `index.html` 即可浏览全部页面。

## 多工具适配

项目支持跨 AI 工具运行（Claude Code / Kimi / Codex / DeepSeek）：

- `.claude/skills/` — Claude Code 原生 Skills（`.claude/skills/` 格式）
- `skills/` — 工具无关的 Skills 定义（供 Kimi 等非 Claude 工具使用）
- `AGENTS.md` / `CLAUDE.md` — Claude Code 项目级指令
- `.kimi-code/AGENTS.md` — Kimi Code 项目级指令
- `docs/skills深度优化/` — 多工具适配设计方案

核心设计原则：**单一真源、只编排指路、不复制内容**。`skills/` 目录定义规则主体，`.claude/skills/` 包含平台适配层。

## 项目结构

```
prototype-validation-service/
├── .claude/skills/           Claude Code Skills (5个)
│   ├── prototype-guide/       PM 对话引导
│   ├── prototype-site/        原型页面生成引擎
│   ├── prototype-to-vue3/     静态页面 → Vue 3 转换
│   └── prototype-vue3-framework/  Vue 3 项目框架
├── skills/                   工具无关 Skills 定义
├── pages/                    生成的原型页面
├── assets/                   共享资源（CSS/JS）
├── devproject/               Vue 3 开发环境
│   ├── src/                  业务组件
│   └── public/               静态资源
├── docs/                     设计文档 + 优化记录
├── test-01/                  原型生成测试案例
│   ├── 提示词文件/            54 个页面的提示词模板
│   └── 手动测试手册.md
├── smoke-test/               冒烟测试站点
├── pmtest/                   PM 手动测试案例
├── index.html                原型站点入口
├── menu.config.js            菜单配置
├── CLAUDE.md                 Claude Code 项目指令
└── AGENTS.md                 Kimi Code 项目指令
```

## 关键技术点

**IR（Interaction Representation）标记体系**：原型页面承载的结构化交互标记，是原型→ Vue 之间转换的桥梁。

| 标记 | 含义 | 示例 |
|---|---|---|
| `data-page="code"` | 页面编码 | `<div id="page-content" data-page="supplier-apply">` |
| `data-action` | 操作按钮 | `<button data-action="save">保存</button>` |
| `data-modal` | 弹窗触发 | `<button data-modal="approve-dialog">审核</button>` |
| `data-nav` | 页面跳转 | `<span data-nav="supplier-list">查看列表</span>` |

转换时，`prototype-to-vue3` 读取这些标记自动生成对应的 Vue 组件逻辑，无需人工解读。

**硬约束体系**：
- 原型页面 `<head>` 只 link 一个 `app.css`，禁止内联 `<style>`
- 主色 `#1565c0`，禁止引入其它色系
- 底部操作栏必须固定（`has-fixed-actions` + `fixed-bottom-bar`）
- 页面禁止横向滚动，宽表格需外层容器 `overflow-x: auto`
- 菜单注册幂等（按 `code` 去重）

这些约束是为了保证：AI 生成的页面能稳定地被下一个 AI（prototype-to-vue3）理解和转换。本质上是一个 **AI 到 AI 的契约设计**。

## 快速开始

### 前置条件
- Claude Code CLI
- 或任意支持 Markdown 的 AI 编码工具

### 使用流程

1. 克隆本项目
2. 在 Claude Code 中打开项目
3. 用自然语言描述你的原型需求

```
"帮我做一个供应商管理列表页，
支持按名称和状态筛选，
列表显示供应商名称、联系人、资质状态、最后更新日期，
操作列有查看详情和编辑按钮"
```

Claude Code 会自动加载 `prototype-guide` Skill，引导你完成模板选型、信息确认、页面生成。

## 设计决策

| 决策 | 选择 | 原因 |
|---|---|---|
| 生成格式 | 静态 HTML + JS | 零依赖，浏览器直接打开，PM 无需安装任何工具 |
| Skill 分层 | guide/site/to-vue3 三层 | 职责分离：引导→生成→转换，各层独立演进 |
| 多人协作 | 逐页推进 + 交接文档 | PM 和 AI 之间需要确认点，不能一次全量冲 |
| 转换方式 | 机械式（规则驱动） | 不用 AI 再理解一遍，规则匹配即可，稳定可靠 |
| 颜色系统 | 单一主色 | 减少 AI 自由发挥空间，保证视觉一致性 |

## 许可

MIT
