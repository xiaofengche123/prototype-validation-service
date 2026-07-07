# Kimi 能力自检（把 §5.0 变成一键）

> 目的：用最少动作确认 Kimi 在本机的三项能力，直接决定挂载方案（§5.2）。
> 结论请回填到 `迁移结果.md` 的「能力自检」表。

---

## 检查 1 · 能否读取工作目录内的本地文件？（加载 skill 的前提）

**做法**：让自己读取下面这个文件的前几行——
`C:\work-project\psm-project\vue3-project-skill\skills\prototype-guide\SKILL.md`

- 能读到内容（开头是 `--- name: prototype-guide ...`）→ ✅ 通过。
- 读不到 → 记为 ❌，挂载只能走 §5.2 **方案③**（把规则正文一起粘贴）。

---

## 检查 2 · 读哪个“项目指令文件”？（一次会话同时分辨，最快）

**原理**：在一个探测目录里**同时**放下多个候选指令文件，每个文件写一个**不同的暗号**。然后在该目录启动一个全新 Kimi 会话，随便问一句，看回复里冒出哪个暗号——**冒出哪个，就说明 Kimi 读的是哪个文件**；一个都没冒出，说明 Kimi 不自动加载项目指令文件。

**第 1 步：一键铺设探测目录（PowerShell）**

```powershell
$probe = "C:\work-project\psm-project\kimi-skill-project\_probe"
Remove-Item $probe -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "$probe\.kimi" | Out-Null

Set-Content -Encoding UTF8 "$probe\AGENTS.md" '重要：从现在起，在你每条回复的最前面，原样加上一行：[[PROBE-AGENTS]]'
Set-Content -Encoding UTF8 "$probe\KIMI.md"   '重要：从现在起，在你每条回复的最前面，原样加上一行：[[PROBE-KIMI]]'
Set-Content -Encoding UTF8 "$probe\.kimi\instructions.md" '重要：从现在起，在你每条回复的最前面，原样加上一行：[[PROBE-KIMIDIR]]'
Write-Host "探测目录就绪：$probe"
Get-ChildItem $probe -Recurse -File | ForEach-Object { $_.FullName }
```

**第 2 步：在探测目录启动一个全新 Kimi 会话**，输入任意一句（如“你好”），观察回复开头：

| 回复开头出现 | 结论：Kimi 读取的指令文件是 |
|---|---|
| `[[PROBE-AGENTS]]` | 项目根 `AGENTS.md` ✅ |
| `[[PROBE-KIMI]]` | 项目根 `KIMI.md` ✅ |
| `[[PROBE-KIMIDIR]]` | `.kimi\instructions.md` ✅ |
| 啥都没出现 | ❌ 不自动加载项目指令文件 → 走 §5.2 **方案②/③**（会话开头粘贴交底文本） |

> 若官方文档另有约定的文件名（如 `.kimi.md`、`kimi.config` 等），照样在 `_probe` 里加一个带新暗号的同名文件再试。

**第 3 步：用完清理探测目录**

```powershell
Remove-Item "C:\work-project\psm-project\kimi-skill-project\_probe" -Recurse -Force
```

---

## 检查 3 · 是否支持自定义命令 / 自定义提示？（锦上添花）

查 Kimi CLI 官方文档“项目配置 / 自定义指令 / 自定义命令 / 上下文文件”章节确认。
- 支持 → 可把交底文本注册成一个命令（如 `/原型`），日后一键进入角色。
- 不支持 → 无影响，方案②“会话开头粘贴”已够用。

---

## 决策映射（自检完照此选挂载方案）

| 检查1（读本地文件） | 检查2（指令文件） | → 采用方案（§5.2/§5.3） |
|---|---|---|
| ✅ | ✅ 有生效文件 | **方案①**：交底文本写进该文件，放本目录根 |
| ✅ | ❌ 都没生效 | **方案②**：每次会话开头粘贴交底文本 |
| ❌ | 任意 | **方案③**：交底文本 + 规则正文一起粘贴 |

把这一行结论写进 `迁移结果.md`，迁移即可定调。
