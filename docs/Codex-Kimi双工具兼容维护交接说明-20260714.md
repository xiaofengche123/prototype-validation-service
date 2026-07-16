# Codex / Kimi 双工具兼容维护与生产 Skill 交接说明

> 日期：2026-07-14  
> 项目根目录：`C:\work-project\psm-project\psm-ui\kimi-skill-project`  
> 面向对象：后续使用 Kimi、Codex 或 Claude 维护本项目的执行者  
> 本文目的：记录当前真实结构、用户明确要求、Codex 兼容改造经验、已完成验证、Kimi 后续操作要求和防回归规则。

---

## 1. 最高优先级原则

以下原则来自用户明确要求，优先级高于根据目录名、提交时间或工具习惯做出的任何推断：

1. `skills/` 下每一个含 `SKILL.md` 的目录都是生产 Skill，全部有效。
2. 不存在“看到新目录就默认旧目录已废弃”的规则。
3. `prototype-*` 与 `erp-prototype-*` 是两套并行生产方案，不是旧版与新版关系。
4. `prototype-*` 服务 Zhonglv 项目；`erp-prototype-*` 服务 ERP 项目。
5. `template-wizard`、`template-distill`、`template-calibrate` 是生产模板工作流，同样不能删除或忽略。
6. 项目必须同时兼容 Codex 和 Kimi；维护某一个工具入口时，不能破坏另一个工具的使用方式。
7. 工具专属入口只负责“发现、路由、界面元数据”，不得复制或分叉主 Skill 的业务规则。
8. 完整业务规则的唯一来源始终是 `skills/<skill-name>/`。
9. 未经用户或明确项目决策授权，任何 AI 工具都不得自行把生产 Skill 标记为废弃、旧版、兼容别名或候选删除项。
10. 如果工具发现机制有冲突，应增加轻量入口或修复路由，不得通过删除另一套生产 Skill 来消除冲突。

这十条是本项目后续维护的底线。

---

## 2. 当前生产 Skill 清单

截至 2026-07-14，`skills/` 下共有 11 个生产 Skill。

### 2.1 Zhonglv 项目 Skill（4 个）

| Skill | 主要职责 | 后续衔接 |
|---|---|---|
| `prototype-guide` | 从口述需求、PRD、截图或旧 HTML 开始，做输入分诊、信息确认、模板选择、逐页组织和批次恢复 | 生成阶段衔接 `prototype-site` |
| `prototype-site` | 按确认规格生成或更新 Zhonglv/PSM 静态原型站点 | 可继续进入 `prototype-to-vue3` |
| `prototype-vue3-framework` | 创建或修复隔离的 Vue 3.4 + Ant Design Vue 4 mock 演示框架 | 为 `prototype-to-vue3` 提供目标框架 |
| `prototype-to-vue3` | 把静态站点中已注册页面转换为 Vue3 页面、mock API 和菜单数据 | 在对应 Vue3 演示框架中验收 |

标准链路：

```text
prototype-guide
  -> prototype-site
  -> 必要时 prototype-vue3-framework
  -> prototype-to-vue3
```

### 2.2 ERP 项目 Skill（4 个）

| Skill | 主要职责 | 后续衔接 |
|---|---|---|
| `erp-prototype-guide` | 面向高端 ERP 风格，从需求、PRD、截图或旧 HTML 做输入分诊、确认、拆页和恢复 | 生成阶段衔接 `erp-prototype-site` |
| `erp-prototype-site` | 按确认规格生成 XinPlat / Ant Design 5 现代浅色风格静态原型 | 可继续进入 `erp-prototype-to-vue3` |
| `erp-prototype-vue3-framework` | 创建或修复高端 ERP 隔离 Vue3 mock 演示框架 | 为 `erp-prototype-to-vue3` 提供目标框架 |
| `erp-prototype-to-vue3` | 把已注册 ERP 静态页转换为 Vue3 页面、mock API 和菜单数据 | 在 ERP Vue3 演示框架中验收 |

标准链路：

```text
erp-prototype-guide
  -> erp-prototype-site
  -> 必要时 erp-prototype-vue3-framework
  -> erp-prototype-to-vue3
```

### 2.3 模板生产 Skill（3 个）

| Skill | 主要职责 | 使用建议 |
|---|---|---|
| `template-wizard` | 中文小步问答入口；判断文件状态、组织引擎输入、推进确认门和跨会话恢复 | 不熟悉模板流程时优先使用 |
| `template-distill` | 从旧 Vue 系统、UI 设计交付物或高质量静态原型提炼风格包 | 熟悉流程时可直接调用 |
| `template-calibrate` | 用批次页面、问题分类和七步回灌协议把风格包校准成生产级 Skill 家族 | 长任务，以台账文件为状态源 |

标准链路：

```text
template-wizard（推荐交互入口）
  -> template-distill
  -> template-calibrate
```

模板三件套不是 Zhonglv 或 ERP Skill 的替代品。它们负责生产和校准新的风格家族。

---

## 3. 双工具兼容架构

### 3.1 唯一规则源

```text
skills/<skill-name>/
├── SKILL.md
├── agents/openai.yaml
├── references/
├── assets/
└── scripts/（若存在）
```

所有业务硬规则、工作流、自检要求、模板和脚本都维护在这里。

### 3.2 Codex 发现入口

Codex 项目级入口位于：

```text
.agents/skills/<skill-name>/
├── SKILL.md
└── agents/openai.yaml
```

当前 `.agents/skills/` 必须与 `skills/` 一一对应，共 11 个同名目录。

Codex 入口 `SKILL.md` 应保持轻量，只包含：

1. 与主 Skill 相同的 `name`。
2. 足以稳定触发的 `description`。
3. 明确要求完整读取 `../../../skills/<skill-name>/SKILL.md`。
4. 明确要求从主 Skill 所在目录解析相对引用。
5. 明确禁止在入口中复制或改写业务流程。

Codex 入口不是主 Skill 的副本。

### 3.3 Kimi 项目入口

Kimi 当前通过以下文件获得项目路由：

```text
.kimi-code/AGENTS.md
```

Kimi 的完整执行规则仍应读取：

```text
skills/<skill-name>/SKILL.md
```

如果当前 Kimi 版本支持额外的原生 Skill 注册机制，可以增加工具专属轻量入口，但必须遵守：

- 不移动主 Skill。
- 不复制完整业务规则。
- 不删除 `.agents/skills/`。
- 不把 Codex 入口当成 Kimi 的业务规则源。
- 新增入口后验证 Codex 与 Kimi 两边都仍可使用全部 11 个 Skill。

### 3.4 Claude 入口

Claude 使用项目根 `CLAUDE.md` 及其自身 Skill 发现机制。模板三件套历史上写死过 `.claude/skills/` 检查；现已改成按当前工具判断：

- Codex：检查 `.agents/skills/`。
- Claude：检查 `.claude/skills/`。
- Kimi：检查项目指令入口。

后续不得再把共享主 Skill 改回只支持某一个工具的固定路径。

---

## 4. 当前已完成的 Codex 兼容改造

### 4.1 已补齐 11 个 Codex 入口

当前 `.agents/skills/` 应包含：

```text
prototype-guide
prototype-site
prototype-vue3-framework
prototype-to-vue3
erp-prototype-guide
erp-prototype-site
erp-prototype-vue3-framework
erp-prototype-to-vue3
template-wizard
template-distill
template-calibrate
```

入口名称集合必须与 `skills/` 完全一致。

### 4.2 已修复界面元数据

所有主 Skill 和 Codex 入口的 `agents/openai.yaml` 已按 Codex 规范检查：

- `display_name` 存在。
- `short_description` 使用引号，长度在 25–64 字符之间。
- `default_prompt` 使用引号。
- `default_prompt` 显式包含对应 `$skill-name`。
- ERP Skill 的界面名称不再错误显示成 PSM。

### 4.3 已修复模板三件套的工具绑定问题

此前模板主 Skill 存在以下问题：

- 规则写死“必须注册到 `.claude/skills/`”。
- `template-wizard` 启动时只检查 `.claude/skills/`。
- Codex 或 Kimi 调用时可能被错误阻塞。

现已改为按当前工具检查入口。

### 4.4 已修复 `template-calibrate` frontmatter

发现并修复了两个 Codex/YAML 兼容问题：

1. 描述中包含未加引号的冒号，导致 YAML 解析失败。
2. 描述中使用 `<pack-id>`，Codex 校验器禁止 frontmatter 描述出现尖括号。

正文中的路径示例仍可保留 `<pack-id>`；仅 frontmatter 使用 `pack-id`。

---

## 5. 本次最重要的经验教训

### 5.1 不能按前缀推断生命周期

曾发生过一次错误判断：把 `erp-prototype-*` 当成 `prototype-*` 的替代版本，并删除了 Zhonglv 的 Codex 入口。用户随后明确指出两套分别服务不同项目。

正确做法是：

1. 先枚举 `skills/` 下所有目录。
2. 阅读每个 `SKILL.md` 的 `name`、`description` 和交叉引用。
3. 阅读项目路由文件和用户说明。
4. 如果仍不明确，向用户确认用途。
5. 在确认之前只增加兼容入口，不删除生产入口。

### 5.2 “主 Skill 存在”不等于“工具能发现”

需要分别检查：

- 主 Skill 是否存在并有效。
- 当前工具是否有发现入口。
- 入口是否指向正确主 Skill。
- 入口名称是否与主 Skill 名称一致。
- 工具是否在新会话启动时重新扫描入口。

### 5.3 共享规则不能写死单一工具

共享 `SKILL.md` 中如果直接写死 `.claude/skills/`、`.agents/skills/` 或某个工具专有命令，就可能阻塞其他工具。

推荐写法：

```text
按当前工具检查 Skill 是否可发现：Codex 检查 .agents/skills，Claude 检查 .claude/skills，Kimi 检查项目指令入口。
```

只有工具入口文件可以使用工具专属路径。

### 5.4 不应只运行 frontmatter 校验

一个生产 Skill 的验证至少分为四层：

1. 结构：`SKILL.md` 与 frontmatter 合法。
2. 发现：工具入口存在、名称集合一致、跳转目标存在。
3. 资源：引用的模板、脚本和关键资料存在。
4. 执行：脚本语法、站点校验、框架构建或代表性流程运行通过。

### 5.5 Windows 编码会造成误判

Windows Python 默认 GBK 时，中文 `SKILL.md` 可能出现 `UnicodeDecodeError`。运行 Codex Skill 校验前应设置：

```powershell
$env:PYTHONUTF8 = '1'
```

GBK 解码错误不等于 Skill frontmatter 错误。设置 UTF-8 后仍失败，才根据 YAML 错误继续修复。

---

## 6. 已完成的测试与结果

### 6.1 Skill 结构

- 11 个主 Skill 全部通过 `quick_validate.py`。
- 11 个 Codex 入口全部通过 `quick_validate.py`。
- 主 Skill 和 Codex 入口名称集合检查结果：`11 == 11`。
- 11 条 Codex 入口到主 `SKILL.md` 的路径全部有效。

### 6.2 `openai.yaml`

共检查 22 份：

- 11 份主 Skill 元数据。
- 11 份 Codex 入口元数据。

名称、描述长度、引号和 `$skill-name` 默认提示词均通过。

### 6.3 静态原型模板

Zhonglv 与 ERP 两套 `prototype-site` 模板都实际运行了 `check-site.js`：

- Zhonglv：C1–C10 全部通过。
- ERP：C1–C10 全部通过。

两套 `check-site.js`、`check-prompts.js` 均通过 Node 语法检查。

### 6.4 模板脚本

`template-distill/assets/measure-tokens.js` 通过 Node 语法检查。

### 6.5 Vue3 框架

两套 Vue3 模板均在 `C:\tmp` 隔离副本中进行真实验证：

- Zhonglv：`npm install` 成功，安装 857 个包；`npm run build` 成功。
- ERP：`npm install` 成功，安装 857 个包；`npm run build` 成功。

构建仅有 webpack bundle 体积建议警告，没有编译错误。隔离测试目录已清理，生产 Skill 目录未残留 `node_modules` 或 `dist`。

---

## 7. 全量验证命令

以下命令从项目根执行。

### 7.1 校验所有主 Skill 和 Codex 入口

```powershell
cd C:\work-project\psm-project\psm-ui\kimi-skill-project
$env:PYTHONUTF8 = '1'
$validator = 'C:\Users\sharp\.codex\skills\.system\skill-creator\scripts\quick_validate.py'

Get-ChildItem .\skills -Directory | ForEach-Object {
  python $validator $_.FullName
}

Get-ChildItem .\.agents\skills -Directory | ForEach-Object {
  python $validator $_.FullName
}
```

### 7.2 检查两边名称集合

```powershell
$main = Get-ChildItem .\skills -Directory | Sort-Object Name | ForEach-Object Name
$codex = Get-ChildItem .\.agents\skills -Directory | Sort-Object Name | ForEach-Object Name
Compare-Object $main $codex
```

正确结果：没有任何输出。

### 7.3 Zhonglv 静态站点模板

```powershell
cd .\skills\prototype-site\assets\framework
node ..\check-site.js
```

### 7.4 ERP 静态站点模板

```powershell
cd .\skills\erp-prototype-site\assets\framework
node ..\check-site.js
```

### 7.5 脚本语法

```powershell
node --check .\skills\prototype-site\assets\check-site.js
node --check .\skills\prototype-site\assets\check-prompts.js
node --check .\skills\erp-prototype-site\assets\check-site.js
node --check .\skills\erp-prototype-site\assets\check-prompts.js
node --check .\skills\template-distill\assets\measure-tokens.js
```

### 7.6 Vue3 模板构建原则

不要直接在生产 Skill 的 `assets/framework-template/` 中安装依赖。复制到 `C:\tmp` 后再构建：

```powershell
$source = 'C:\work-project\psm-project\psm-ui\kimi-skill-project\skills\prototype-vue3-framework\assets\framework-template'
$target = 'C:\tmp\prototype-vue3-framework-smoke'
Copy-Item -Recurse -LiteralPath $source -Destination $target
cd $target
npm install --no-audit --no-fund
npm run build
```

ERP 模板将源路径替换成 `erp-prototype-vue3-framework`。测试结束后只删除经过绝对路径核验的 `C:\tmp` 副本，不删除生产模板。

---

## 8. Kimi 接手后的必做检查

Kimi 下一步操作时，应先完成以下只读检查，再改文件。

### 8.1 确认项目根

工作目录必须是：

```text
C:\work-project\psm-project\psm-ui\kimi-skill-project
```

### 8.2 必读文件

按顺序读取：

1. `AGENTS.md`
2. `.kimi-code/AGENTS.md`
3. 本文档
4. `Kimi使用原型Skills手册.md`
5. 当前任务涉及的 `skills/<skill-name>/SKILL.md`

注意：当前 `Kimi使用原型Skills手册.md` 在本次 Codex 修复前仍只介绍 Zhonglv 4 个 Skill，属于待更新文档。Kimi 接手时应把它更新为 11 个生产 Skill 的双项目结构，但不能删除原有 Zhonglv 内容。

### 8.3 盘点数量

Kimi 应确认：

```text
skills/              = 11 个生产 Skill
.agents/skills/      = 11 个 Codex 入口
```

如果 Kimi 自身需要额外入口，应新增 Kimi 轻量入口，并使其覆盖全部 11 个 Skill；不得减少上述两个数量。

### 8.4 Kimi 路由冒烟测试

建议新会话分别输入以下只读提示词，不生成业务页面：

```text
请读取 skills/prototype-guide/SKILL.md，只说明它服务哪个项目、何时使用，不执行生成。
```

```text
请读取 skills/erp-prototype-guide/SKILL.md，只说明它服务哪个项目、何时使用，不执行生成。
```

```text
请读取 skills/template-wizard/SKILL.md，只说明它如何衔接两个模板引擎，不开始访谈。
```

预期：

- 第一条识别为 Zhonglv 原型引导。
- 第二条识别为 ERP 高端原型引导。
- 第三条识别为模板向导，并知道 `template-distill`、`template-calibrate`。
- 不应把任何一套称为废弃版。

### 8.5 Kimi 真实执行测试建议

在不修改生产工程的隔离目录中，至少做三条代表性测试：

1. Zhonglv：用 `prototype-site` 在临时站点生成或校验 1 个页面。
2. ERP：用 `erp-prototype-site` 在另一临时站点生成或校验 1 个页面。
3. 模板：用 `template-wizard` 做文件状态判断，确认不会因缺少 `.claude/skills/` 而错误阻塞 Kimi。

测试产物应放在明确的临时目录，测试后记录结果，再清理临时产物。

---

## 9. Kimi 后续修改边界

### 可以做

- 更新 `Kimi使用原型Skills手册.md`，补齐 ERP 与模板三件套。
- 完善 `.kimi-code/AGENTS.md` 的 Kimi 路由说明。
- 根据 Kimi 实际发现机制增加轻量入口。
- 修复确实影响 Kimi 执行的工具绑定问题。
- 增加 Kimi 冒烟测试记录。

### 不可以做

- 删除或移动 `skills/` 下任何生产 Skill。
- 删除 `.agents/skills/` 下 Codex 入口。
- 把 `prototype-*` 改成 ERP 的兼容别名。
- 把 `erp-prototype-*` 改成 Zhonglv 的新版名称。
- 只为 Kimi 复制一套完整业务规则。
- 为了让 Kimi 通过而破坏 Codex 的 frontmatter、入口路径或 `openai.yaml`。
- 在没有用户明确授权时修改生产 Vue2 `psm-ui`。
- 把构建产生的 `node_modules`、`dist` 或临时日志留在 Skill 模板目录。

---

## 10. 新增或修改 Skill 的同步协议

以后新增生产 Skill 时，应按以下顺序执行：

1. 在 `skills/<new-name>/` 创建或更新主 Skill。
2. 确认目录名与 frontmatter `name` 完全一致。
3. 创建或更新 `agents/openai.yaml`。
4. 为 Codex 创建 `.agents/skills/<new-name>/` 轻量入口。
5. 为 Kimi 更新 `.kimi-code/AGENTS.md` 或实际发现入口。
6. 为 Claude 更新必要入口，但不要把共享规则写死为 Claude 专用。
7. 更新 Codex/Kimi 使用手册和本交接文档中的清单。
8. 全量校验所有主 Skill，不只校验新 Skill。
9. 全量校验所有工具入口。
10. 比较主 Skill 与入口名称集合。
11. 运行新增 Skill 的代表性脚本或构建测试。
12. 在新 Codex 和新 Kimi 会话中分别做发现冒烟测试。

修改已有 Skill 时同样要执行受影响的步骤。

---

## 11. Git 工作区注意事项

本项目当前工作区不是纯净状态。后续 Kimi 操作必须先执行：

```powershell
git -C C:\work-project\psm-project\psm-ui status --short
```

已知情况：

- ERP 四个主 Skill 是 Claude 新增内容，目前可能仍显示为未跟踪目录。
- ERP 与模板三件套的 Codex 入口可能显示为未跟踪目录。
- 两个 HTML 使用手册的删除状态在本次 Codex 修复前已经存在，本次没有恢复或修改它们。
- 不得使用 `git reset --hard`、`git checkout --` 等命令清理用户改动。
- 不得因为文件未跟踪就认定它不是生产内容。

任何可能覆盖用户改动的操作都应停止并先确认。

---

## 12. 文档权威性与冲突处理

如果现有历史文档出现冲突，按以下顺序判断：

1. 用户当前明确要求。
2. 项目根 `AGENTS.md` 的当前生产路由。
3. 本文记录的双工具兼容原则。
4. 当前主 `skills/<skill-name>/SKILL.md`。
5. 工具专属入口文件。
6. 旧交接文档或历史测试记录。

`docs/Codex兼容改造交接说明-20260713.md`、旧版 Kimi/Codex 手册等文件可能只覆盖当时的 4 个 Skill。它们可作为历史经验参考，但不能据此否定后来新增且仍在 `skills/` 下的生产 Skill。

---

## 13. 最终验收清单

每次完成兼容修改后，逐项确认：

- [ ] `skills/` 下所有目录都被视为生产 Skill。
- [ ] Zhonglv 4 个 Skill 完整存在。
- [ ] ERP 4 个 Skill 完整存在。
- [ ] 模板 3 个 Skill 完整存在。
- [ ] `skills/` 与 `.agents/skills/` 名称集合一致。
- [ ] Codex 入口全部指向同名主 Skill。
- [ ] Kimi 路由覆盖全部 11 个 Skill。
- [ ] 没有共享规则写死成单一工具路径。
- [ ] 所有主 Skill 与 Codex 入口通过结构校验。
- [ ] 所有 `openai.yaml` 的默认提示词包含对应 `$skill-name`。
- [ ] Zhonglv 和 ERP 静态模板校验通过。
- [ ] 两套 Vue3 模板至少完成语法检查；重大修改后完成隔离构建。
- [ ] 模板三件套的代表性脚本或状态判断通过。
- [ ] 没有在生产 Skill 目录留下 `node_modules`、`dist` 或测试产物。
- [ ] 没有覆盖与当前任务无关的用户改动。
- [ ] Codex 新会话发现测试通过。
- [ ] Kimi 新会话发现与路由测试通过。

只有全部满足，才能声明“双工具兼容完成”。

---

## 14. 给下一位 Kimi 操作者的直接指令

请先接受以下事实，不要重新推断：

```text
本项目有 11 个生产 Skill，全部有效。
prototype-* 服务 Zhonglv。
erp-prototype-* 服务 ERP。
template-* 服务模板生产。
Codex 与 Kimi 必须同时兼容。
任何入口改造都不得删除另一工具或另一项目的生产能力。
```

然后完成：

1. 全量读取并核对当前 11 个 Skill。
2. 更新仍只描述 4 个 Skill 的 Kimi 使用手册。
3. 在 Kimi 新会话中验证三类路由。
4. 如需新增 Kimi 入口，只做轻量跳转，不复制业务规则。
5. 修改后重跑本文第 7 节和第 13 节检查。
6. 把 Kimi 实测结果追加为新的测试记录，不覆盖本文的历史验证结果。


---

## 15. Kimi 实测记录（2026-07-14）

> 操作者：Kimi Code CLI  
> 工作目录：`C:\work-project\psm-project\psm-ui\kimi-skill-project`  
> 说明：本次为 Kimi 接手后的兼容性复核与文档更新，未生成业务页面，未修改生产 `psm-ui`，产物仅为更新后的 `Kimi使用原型Skills手册.md` 与本节测试记录。

### 15.1 接手前只读检查

1. **项目根确认**：工作目录为 `C:\work-project\psm-project\psm-ui\kimi-skill-project`。
2. **必读文件**：已按顺序读取 `AGENTS.md`、`.kimi-code/AGENTS.md`、本文档、`Kimi使用原型Skills手册.md`，以及全部 11 个 `skills/<skill-name>/SKILL.md`。
3. **数量盘点**：
   - `skills/` 下 11 个生产 Skill 全部存在。
   - `.agents/skills/` 下 11 个 Codex 入口全部存在。
   - 两边名称集合完全一致。
4. **双项目关系确认**：`prototype-*` 服务 Zhonglv；`erp-prototype-*` 服务 ERP；`template-*` 服务模板生产。未将任何一套误判为旧版或废弃版。

### 15.2 结构校验

使用 `C:\Users\sharp\.codex\skills\.system\skill-creator\scripts\quick_validate.py` 校验：

| 范围 | 数量 | 结果 |
|---|---|---|
| 主 Skill | 11 | 全部 `Skill is valid!` |
| Codex 入口 | 11 | 全部 `Skill is valid!` |

环境变量 `$env:PYTHONUTF8 = '1'` 已设置，未出现 GBK 解码错误。

### 15.3 名称集合比较

```powershell
$main = Get-ChildItem .\skills -Directory | Sort-Object Name | ForEach-Object Name
$codex = Get-ChildItem .\.agents\skills -Directory | Sort-Object Name | ForEach-Object Name
Compare-Object $main $codex
```

结果：无输出，两边名称完全一致。

### 15.4 Codex 入口指向检查

逐个检查 `.agents/skills/<name>/SKILL.md` 是否包含 `../../../skills/<name>/SKILL.md` 跳转：

| Skill | 跳转指向 | 结果 |
|---|---|---|
| erp-prototype-guide | `../../../skills/erp-prototype-guide/SKILL.md` | OK |
| erp-prototype-site | `../../../skills/erp-prototype-site/SKILL.md` | OK |
| erp-prototype-to-vue3 | `../../../skills/erp-prototype-to-vue3/SKILL.md` | OK |
| erp-prototype-vue3-framework | `../../../skills/erp-prototype-vue3-framework/SKILL.md` | OK |
| prototype-guide | `../../../skills/prototype-guide/SKILL.md` | OK |
| prototype-site | `../../../skills/prototype-site/SKILL.md` | OK |
| prototype-to-vue3 | `../../../skills/prototype-to-vue3/SKILL.md` | OK |
| prototype-vue3-framework | `../../../skills/prototype-vue3-framework/SKILL.md` | OK |
| template-calibrate | `../../../skills/template-calibrate/SKILL.md` | OK |
| template-distill | `../../../skills/template-distill/SKILL.md` | OK |
| template-wizard | `../../../skills/template-wizard/SKILL.md` | OK |

### 15.5 脚本语法检查

```powershell
node --check .\skills\prototype-site\assets\check-site.js
node --check .\skills\prototype-site\assets\check-prompts.js
node --check .\skills\erp-prototype-site\assets\check-site.js
node --check .\skills\erp-prototype-site\assets\check-prompts.js
node --check .\skills\template-distill\assets\measure-tokens.js
```

结果：全部 `OK`，无语法错误。

### 15.6 静态站点模板校验

#### Zhonglv `prototype-site`

在 `skills/prototype-site/assets/framework` 下执行 `node ..\check-site.js`：

- C1–C10 全部通过。
- 校验结果：✓ 全部通过。

#### ERP `erp-prototype-site`

在 `skills/erp-prototype-site/assets/framework` 下执行 `node ..\check-site.js`：

- C1–C10 全部通过。
- 校验结果：✓ 全部通过。

### 15.7 Kimi 路由冒烟测试

在同一 Kimi 会话中，对三类路由做了只读识别验证：

| 测试提示 | 预期 | 结果 |
|---|---|---|
| 读取 `skills/prototype-guide/SKILL.md`，说明服务哪个项目、何时使用 | 识别为 Zhonglv 原型引导 | 通过。服务 PSM / 绿星链通项目，用于口述需求、PRD、截图或旧 HTML 的输入分诊与逐页确认。 |
| 读取 `skills/erp-prototype-guide/SKILL.md`，说明服务哪个项目、何时使用 | 识别为 ERP 高端原型引导 | 通过。服务高端 ERP / XinPlat / Ant Design 5 项目，用于非技术 PM 的高端 ERP 原型引导。 |
| 读取 `skills/template-wizard/SKILL.md`，说明如何衔接两个模板引擎 | 识别为模板向导，并知道 `template-distill`、`template-calibrate` | 通过。`template-wizard` 是 `template-distill` 和 `template-calibrate` 的对话引导层，状态从文件系统检测，逐步驱动两个引擎 Skill。 |

三类路由均正确识别，未将任何一套称为废弃版。

### 15.8 文档更新

- 已更新 `Kimi使用原型Skills手册.md`：
  - 将 Skill 数量从 4 个扩展到 11 个。
  - 新增 ERP 项目 4 个 Skill 的说明、提示词和工作流。
  - 新增模板生产 3 个 Skill 的说明、提示词和工作流。
  - 保留并补充 Zhonglv 项目原有内容。
  - 新增 ERP 与模板的校验命令、输出文件说明和常见问题。
  - 明确 `prototype-*` 与 `erp-prototype-*` 的并行关系，禁止误判为旧版/新版。

### 15.9 未完成项与后续建议

1. **Vue3 模板隔离构建**：Codex 历史记录已验证 Zhonglv 与 ERP 两套 Vue3 模板在 `C:\tmp` 隔离副本中 `npm install` + `npm run build` 通过。Kimi 本次未重复该长时间构建；若后续对 Vue3 模板做重大修改，建议按第 7.6 节原则在 `C:\tmp` 中重跑。
2. **模板三件套代表性执行测试**：本次仅做了状态检测和规则读取验证；未实际跑 `template-distill` 或 `template-calibrate` 的完整流程。建议在真实风格包任务中验证 Kimi 不会因缺少 `.claude/skills/` 而错误阻塞。
3. **Kimi 原生入口**：当前 Kimi 通过 `.kimi-code/AGENTS.md` 项目指令覆盖全部 11 个 Skill，未发现需要新增轻量入口的情况。若后续 Kimi 版本提供原生 Skill 注册机制，应按第 10 节同步协议新增入口，并再次全量验证。

### 15.10 结论

- 11 个主 Skill 与 11 个 Codex 入口结构合法、名称一致、入口指向正确。
- Zhonglv 与 ERP 两套静态站点模板校验均通过。
- 关键脚本语法检查均通过。
- Kimi 路由识别正确，未发生工具绑定或项目混淆。
- `Kimi使用原型Skills手册.md` 已更新为覆盖全部 11 个生产 Skill 的双项目结构。

本次 Kimi 兼容性复核完成。
