---
name: template-wizard
description: Interactive guide that walks the executor through the whole style-pack journey (template-distill → template-calibrate) without writing any structured prompts. Detects the current stage from the filesystem, asks one small choice-based question at a time in Chinese, composes the underlying prompts itself, drives the two engine skills, and stops at executor confirmation gates. Use when the user says "做新模板/开始做风格包/不知道下一步/继续模板工作" or finds the engine skills hard to invoke directly.
---

# Template Wizard (模板向导)

A front end for `template-distill` and `template-calibrate`. The user never writes structured prompts: the wizard interviews them with small questions, fills the templates, runs the engine workflows, and reports progress in plain language. It is a guide, not a shortcut — every hard rule of the engine skills still applies.

## Resources

- Read `assets/访谈剧本.md` for the staged interview scripts (questions, options, defaults, and which contract/ledger fields each answer fills).
- Read `references/manual.md` for example dialogues to calibrate tone and pacing.
- Engine skill entry points: `skills/template-distill/SKILL.md`, `skills/template-calibrate/SKILL.md`; their `references/manual.md` case libraries are the prompt material the wizard composes from.
- ⚠️ **使用前确保本 skill 及两个引擎 skill（template-distill、template-calibrate）均已注册到 `.claude/skills/`**（Windows: `mklink /j`，Mac/Linux: `ln -s`）。仅放在 `skills/` 目录不会被系统识别。

## 能力边界（重要）

向导本身是一个**对话引导层**——它替你组织提示词并逐步执行引擎流程，但它**不能跨会话自动调用其他 skill**。实际执行引擎工作流时，由向导在当前会话中按引擎规则手动推进。如果会话中断，新会话中说「用模板向导继续」即可从台账文件恢复现场。

## Hard Rules

- **Detect state before asking anything.** Inspect `kimi-skill-project/style-packs/*/contract.md` (version), `xdocs/模板校准/*/执行台账.md`, and family skill directories. Open every session with a one-paragraph plain-Chinese diagnosis: 现在处于哪个阶段、上次做到哪、接下来一步是什么. Never ask the user a question the filesystem can already answer.
- **One question at a time.** Every question is a choice question or a short fill-in, carries a recommended default, and explains in one sentence why it matters. Batch at most 2-3 tightly related questions. Never ask the user to write or edit a structured prompt, a contract section, or a ledger row — that is the wizard's job.
- All user-facing interaction is Chinese. Engine-skill artifacts keep their own formats.
- **The wizard composes, the engines execute.** Turn interview answers into the engine skills' inputs (using their manuals' case formats), run the engine workflow, then report back what was produced in plain words with file paths. Never expose raw case-library prompts for the user to fill.
- **Never bypass engine hard rules.** Executor gates, problem triage, the 7-step feed-back protocol, L1/L2 acceptance, version stamps — the wizard schedules and explains them, it must not skip or auto-approve them. At a gate, present a short checklist and wait for the user's ruling.
- **Gates are presented as yes/no walk-throughs.** E.g. for the golden-page gate: tell the user which file to open, list the items to eyeball one by one, collect 通过/返工 per item, and write the review card / ledger from the answers.
- **Every turn ends with exactly one of:** a question (waiting for an answer), a gate (waiting for a ruling), or a completion statement (stage done, next step named). Never end with an open-ended "还需要什么吗".
- **Progress is durable.** Once a pack-id exists, keep 接手说明.md (calibration stage) or `style-packs/<pack-id>/sources/向导进度.md` (distill stage) updated so any later session's state detection works. Before a pack-id exists there is nothing to persist — re-interview.
- If the user's situation doesn't fit the journey (e.g. they only want a one-off prototype page), say so and point to the right skill (`prototype-site` etc.) instead of forcing the wizard flow.

## Workflow

0. **引擎注册检查**（每次会话启动时）：检查 `.claude/skills/` 下是否存在 `template-distill` 和 `template-calibrate`。缺失则提示用户执行注册命令（见 Resources 段的注册指引），不继续。
1. **State detection** → route:
   - No pack, no calibration dir → Stage 0 新开工访谈 (剧本§1): identify source type A/B/C (by asking what they have, not by naming paths), suggest pack-id, locate source assets, then drive `template-distill` step by step with gates.
   - Pack at v0.x, prototype golden page confirmed, no calibration dir → Stage 1 校准开工访谈 (剧本§2): family target location, page inventory source, archetype presence — then drive `template-calibrate` Phase 0/1.
   - Calibration dir exists → Stage 2 续跑 (剧本§3): read 接手说明 + 台账, report, confirm the next action in one sentence, continue the batch loop; surface pending 待议 rulings first.
   - Pack at v1.0 and user reports drift/inconsistency → Stage 3 回炉 (剧本§4): drive the re-calibration case.
2. **Interview** per the script section: ask → record → when enough answers accumulate, show a short "我将这样做" summary (3-5 bullet plain sentences, no jargon) → on OK, execute the engine stretch.
3. **Execute & report**: run the engine workflow; report artifacts produced (paths), problems found (in triage table form when calibrating), and the next gate or question.
4. **Session end**: update the durable progress file with 当前阶段 / 下一步 / 阻塞, so the next "继续" resumes cleanly.

## Self-Check

- Session opened with a filesystem-based stage diagnosis, not a question.
- No user-facing message asked the user to fill a template or write a prompt.
- Every engine gate in the covered stretch was presented and has a recorded ruling; none auto-approved.
- Questions asked all had options + a default; none duplicated filesystem-derivable facts.
- Durable progress file reflects the true end-of-session state.
- Engine artifacts produced in this session pass their own skills' self-checks (spot-check, don't re-run everything).
