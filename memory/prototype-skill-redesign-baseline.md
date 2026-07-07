---
name: prototype-skill-redesign-implemented
description: Completed implementation of 05 design document changes across 8 files in prototype-guide and prototype-site skills on 2026-07-06
metadata:
  type: project
---

# Prototype Skill Redesign - Implementation Complete (2026-07-06)

Implemented design document `docs/skills深度优化/05-原型Skill流程改造设计方案（多工具版）.md` into skill files.

## Files modified (8 total)

### L0: `skills/prototype-guide/SKILL.md`
- Added "治理元规则" section at the very top (design doc Section 2): skill informs but never refuses; user decides
- Three sub-rules: 只讲一次, 表态即执行, 脏活自己扛
- Changed hard rule "一次只做一页" to "默认逐页推进，用户坚持批量时提醒风险后照做"
- Added handoff-template.md and new input-intake.md sections to Resources list

### L1: `skills/prototype-guide/references/input-intake.md`
- Added Section 6: 输入分诊 (input triage) — 3-type classification table before Step 0
- Added Section 7: 两道门检查 (two gates) — Gate 1 goal compatibility, Gate 2 resource overload, diagnostic report format
- Added Section 8: 拆分流程 (splitting process) — proposal, per-page prompt file format, batch confirmation (3-5 pages/batch)

### L2: `skills/prototype-guide/references/flow.md`
- Added Step -1: 输入分诊 before Step 0
- Added "批次与会话管理" section after Step 7 (6.1 硬规则 re-read, 6.2 交接文档, 6.3 清会话控制权, 6.4 折中方案)
- Updated red lines: "不一次做多页" → "默认逐页推进...提醒风险后照做并留痕"; added "只产出信息不产出拒绝"
- Replaced `flow.html` with redirect note (was stale MPE export, now points to flow.md)

### L3: `skills/prototype-site/SKILL.md`
- Self-check: added "handoff document updated if batch complete"
- Self-check: added "target site theme.css must not contain layout rules (display/grid/position/width)"

### L4: `skills/prototype-site/assets/framework/assets/app.css`
- Backfilled ~25 categories of component styles from test-01/result/assets/theme.css:
  .page-header, .title-badge, .st-count, enhanced pager, .type-tag variants, .op-btns, .stat-card.rich + icons + trends, .prototype-steps, .recommend-* components, .tip-box, .info-grid, .filter-list, .level-tag variants, .dt-select/.dt-input, layout grids (.two-col-grid, .dash-grid-21), .form-col, .radio-group, form textarea + .field-block, chart styles, rank/progress, scene bars, efficiency chart, pie chart, utility classes, stat card color variants

### L5: `skills/prototype-guide/工具无关-编排提示词.md`
- Added input triage + two gates + splitting + batch/session management references to [执行剧本]
- Renumbered steps: added Step 2 (输入分诊), Step 5 (两道门检查); old steps shifted accordingly
- Updated [工作方式] with "只诊断不拦截" rule
- Updated Step 8 (交付) with batch handoff note

### L6: `skills/prototype-guide/测试与交付/03-多工具准备手册.md`
- Updated 工作交底文本 with new rules (items 5-6)
- Added Section 3.4: DeepSeek — capability verification as first step
- Added Section 3.5: per-tool notes for new mechanisms (Claude Code/Kimi/Codex/DeepSeek)
- Added Section 3.6: degradation path for tools without Shell/file capabilities

### L7: `skills/prototype-guide/references/handoff-template.md` (NEW)
- Created handoff document template with 7 sections: basic info, completed pages, batch pitfalls, todo pages, next steps, workspace changes overview, per-page prompt file directory

## Key design principles enforced
- Skill never refuses, only informs; user decides (governance meta-rule)
- Quantitative thresholds: >15 pages = high risk, 6-15 = medium, ≤5 = low
- 3-5 pages per batch, with handoff doc between batches
- Per-page task file re-read as hard rule for batch mode
- Degradation path: ask user for numbers when tool lacks Shell/file capability

## Test plan

Manual test plan created at `test-01/手动测试手册-05方案验证.md` with 6 test groups:
- **S** (2 cases): Single page regression — verify old flow still works
- **G1** (1 case): Gate 1 — goal compatibility check (pixel-perfect demand → A/B/C paths)
- **G2** (3 cases): Gate 2 — resource overload check (>15 files → diagnose, user-override, no false trigger)
- **SPLIT** (2 cases): Splitting + batch — produce per-page prompt files, skip-split path
- **HANDOFF** (2 cases): Handoff doc produced, new session resume without re-asking requirements
- **META** (3 cases): Governance meta-rule — no nagging, one warning only, proactive help
- **STYLE** (2 cases): Component library regression — new classes usable, old styles intact

Plus 10-step execution order recommendation.
