---
name: template-calibrate
description: Calibrate a style pack into a production-quality prototype/Vue skill family through batched page runs. Instantiates the family (batch 0: swap style-bound layer, build the Vue-side golden page, run parity checks), then iterates archetype-organized batches with mandatory problem triage and a 7-step feed-back protocol, until convergence criteria are met and the pack is frozen at v1.0. Also use to re-calibrate an existing family that has drifted from its style pack. Long-running and multi-session: all state lives in ledger files under xdocs/模板校准/<pack-id>/.
---

# Template Calibrate (模板校准)

Turn a style pack draft (from `template-distill`) into a converged, frozen style pack plus a new three-skill family whose prototype and Vue outputs stay visually consistent. The quality mechanism is the calibration loop: run real pages through the pipeline, triage every problem, and feed generalizable fixes back into the contract, projections, templates, and skill rules — atomically.

## Resources

- Copy working-file templates from `assets/`: `执行台账-模板.md`, `验收记录-模板.md`, `待议清单-模板.md`, `接手说明-模板.md`, `单页提示词-模板.md`, `批次计划-模板.md`.
- Read `references/manual.md` for full walkthrough cases (batch 0, batch loop, feed-back protocol, convergence, re-calibration of a drifted family).
- The pack's `parity-checklist.md` and `CHANGELOG.md` formats come from `template-distill` assets.
- The three-skill family scaffold is the existing layered skills (`prototype-site`, `prototype-vue3-framework`, `prototype-to-vue3`); their style-independent layers are reused as-is.
- ⚠️ **使用前确保本 skill 已注册到 `.claude/skills/`**（Windows: `mklink /j` 目录联结，Mac/Linux: `ln -s` 软链接）。仅放在 `skills/` 目录不会被系统识别。

## Working Directory (fixed)

```text
xdocs/模板校准/<pack-id>/
  批次计划.md
  执行台账.md        # per-page state machine — the resume point for any session
  验收记录.md        # per-batch build/test/manual acceptance
  待议清单.md        # deferred problems awaiting executor ruling
  接手说明.md        # single entry point for session handoff
  prompts/<页面编码>-<页面名称>.md
  html/<页面编码>-<页面名称>.html
```

## Hard Rules

- **Version-stamp check first.** At session start, verify the family's derived copies carry the same `pack-id@version` as the style pack. Mismatch means someone edited out-of-band: reconcile (re-derive from contract) before any page work.
- **Never edit derived copies directly.** The only legal route for any style change is the feed-back protocol below, starting from `contract.md`.
- **State lives in files, not in conversation.** Update `执行台账.md` at every page-state transition (未开始/生成中/待评审/已通过/需返工/暂停). Any session must be resumable from `接手说明.md` + the ledgers alone.
- Batches are organized by page archetype (标准列表 / 多区块输入 / 图表分析 / 审批流转 / 配置矩阵 / 向导流程 / 看板), 3-5 pages per batch, low-risk archetypes first, non-standard ones last.
- **Every problem found gets triaged into exactly one of three classes** — no silent fixes:
  1. `仅本页修复` — fix the page, note it in the ledger;
  2. `可泛化 → 回灌` — run the full feed-back protocol;
  3. `存疑挂起` — record in `待议清单.md`; executor rules at batch end.
- **Feed-back protocol (atomic, all 7 steps or none):**
  1. Edit `contract.md` (if values/tokens/mappings involved) and bump its version;
  2. Sync all downstream projections — 分别更新：
     - 原型侧：`prototype/app.css`（契约投影）
     - Vue 侧：`vue/prototype-parity.scss` / `vue/variables.scss`（单 skill 模式跳过）
     - 页面模板：`prototype/page-template.html`（及 skill 的 `assets/page-template.html`）
  3. Run `parity-checklist.md` in full;
  4. Sync the family's derived copies and version stamps;
  5. If it is a rule rather than a value: add it to the relevant skill's SKILL.md hard rules + self-check;
  6. Append a section to the pack `CHANGELOG.md` (背景/关键规则/已改文件/下游影响);
  7. Decide whether completed pages need rework; if so, register rework rows in the ledger.
- **Acceptance gates:** L1 parity checklist is a hard gate (any mismatch blocks; run at batch 0, after every feed-back, before freezing). L2 dual-stack screenshot comparison (golden page + 1 sampled page per batch) is a soft gate: use browser tooling when available, degrade to executor eyeballing otherwise, record `部分通过` in the ledger — never let L2 block the pipeline.
- **The executor is the sole judge.** Confirmation gates (batch-0 golden pages, batch acceptance, 待议 rulings, convergence) are executor decisions recorded in the ledgers; do not proceed past a gate without the recorded ruling.
- Batch acceptance requires `npm test` + `npm run build` passing in the family framework, plus ledger/acceptance-record updates.
- **Convergence = both conditions:** (1) every archetype that exists in this project has ≥1 page passed (non-existent archetypes explicitly marked 不适用); (2) the latest full batch produced zero `可泛化 → 回灌` problems. Then freeze: contract → v1.0 (or bump minor for re-calibration), stamps updated, CHANGELOG freeze entry.
- Single-page pipeline follows the proven flow: 单页提示词 → 新原型 HTML（质量闸门，含生成后检查点）→ 转 Vue → mock 自检（含 Runtime Acceptance：直开路由、刷新不弹 404、主流程按钮无报错）→ 台账登记.
- Keep the tech stack fixed (Vue 3.4 + AntD 4); incompatibilities go to the contract §6 adjudication table, never to stack changes.

## Workflow

### Phase 0 — Start or resume

1. Read `接手说明.md` if the working directory exists (resume); otherwise create the working directory from `assets/` templates (fresh start).
2. Run the version-stamp check across pack and family. Reconcile if mismatched.
3. Confirm inputs: style pack draft (contract ≥ v0.1, prototype golden page confirmed), layered family scaffold available.

### Phase 1 — Batch 0: family instantiation

0. **外壳适配判定**（新增）：比对契约 §2 的布局模式与现有脚手架是否一致。
   - 一致 → 直接复用脚手架，进入步骤 1。
   - 不一致（如契约为顶导航但脚手架为侧边栏）→ 走**外壳重建子流程**：新建 `index.html`（新布局 shell）+ 适配 `shell.js`（导航渲染逻辑）+ 确认 `app.css` 包含新 shell 样式。完成后进入步骤 1。
   - 如果只需要原型产出能力（不做 Vue 三件套），Batch 0 仅实例化 `prototype-site` 变体，跳过步骤 2（Vue 投影）和 L2，台账中注明"单 skill 模式"。
1. Copy the scaffold into the new family location; replace the style-bound layer with pack-derived copies; stamp `pack-id@version` in every derived file header and each SKILL.md.
2. Create the `vue/` side of the pack（单 skill 模式跳过）: write `prototype-parity.scss` + `variables.scss` as projections of the contract; convert the prototype golden page to the Vue golden page via the family's `prototype-to-vue3`; run it under `serve:mock`.
3. Run L1 in full; run L2 on the golden pages (or degraded eyeballing).（单 skill 模式仅跑 L1）
4. Executor confirmation gate on the dual-stack golden pages. On pass: pack → v0.2, write 批次计划.md for batches 1..N by archetype.

### Phase 2 — Batches 1..N: calibration loop

For each batch: plan pages → for each page run the single-page pipeline → triage every problem (three classes) → run feed-back protocol for generalizable ones → batch acceptance (`npm test`/`npm run build`, L2 sample, ledger + acceptance record, 待议 rulings) → executor gate to enter the next batch.

### Phase 3 — Convergence and freeze

1. Check both convergence conditions against the ledger; if unmet, plan the next batch targeting uncovered archetypes.
2. On convergence: contract → v1.0 (freeze), sync stamps, CHANGELOG freeze entry, final L1 run, update `接手说明.md` to "已定版" with the maintenance rule: any later style change goes through the feed-back protocol and bumps minor version.

## Self-Check

- Working directory contains all six state files and they are current (no page in a state older than its artifacts).
- Every page row in the ledger has a full traceability chain: prompt file → HTML file → Vue path → acceptance status.
- No derived copy differs from its pack source (spot-check hashes); all version stamps match the pack version.
- Every CHANGELOG section maps to a contract version bump and vice versa; no style change exists outside the protocol.
- 待议清单 has no unresolved rows older than one batch.
- L1 was run at batch 0, after every feed-back, and before freeze — with recorded results.
- Convergence declared only with both conditions demonstrably met from ledger data.
- Family framework passes `npm test`, `npm run build`, and golden-page Runtime Acceptance at freeze time.
