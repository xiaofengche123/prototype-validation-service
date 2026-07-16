---
name: template-distill
description: Distill a style pack (visual contract + prototype-side golden page + parity checklist) from one of three sources — a running legacy Vue system, UI design deliverables (images/text/low-quality HTML), or high-quality static prototype pages. The style pack becomes the single source of truth for a new prototype/Vue skill family (prototype-site / prototype-vue3-framework / prototype-to-vue3 style-bound layers). Use when a new page style needs to be turned into templates, when extracting design tokens from an existing system, or when preparing input for template-calibrate.
---

# Template Distill (模板提炼)

Extract a **style pack draft** from a style source. The pack's `contract.md` is the single source of truth every downstream style file is derived from. This skill produces the prototype-side projection and golden page; the Vue-side projection and family instantiation belong to `template-calibrate`.

## Resources

- Copy `assets/contract-template.md` to start the visual contract.（三路径通用）
- Copy `assets/parity-checklist-template.md` to generate the numeric parity checklist.（三路径通用）
- Copy `assets/pack-changelog-template.md` as the pack `CHANGELOG.md`.（三路径通用）
- Use `assets/measure-tokens.js` in the browser console to harvest computed styles.（**仅路径 A**，路径 B/C 可忽略）
- Use `assets/golden-page-review-card.md` for the executor confirmation gate.（三路径通用）
- Read `references/manual.md` for full walkthrough cases of all three paths.
- The structural/IR/naming conventions of the target family are defined by the existing skills (`prototype-site` structure classes, `interaction-ir.md`, English page codes); this skill reuses them, never redefines them.
- ⚠️ **使用前确保本 skill 已注册到 `.claude/skills/`**（Windows: `mklink /j` 目录联结，Mac/Linux: `ln -s` 软链接）。仅放在 `skills/` 目录不会被系统识别。

## Output Layout (fixed)

```text
kimi-skill-project/style-packs/<pack-id>/
  contract.md                 # visual contract, single source of truth
  prototype/
    app.css                   # prototype-side projection of the contract
    page-template.html        # business page template (structure from scaffold, values from contract)
    golden/<黄金页>.html       # confirmed golden page
  parity-checklist.md         # generated from contract §3, one row per check item
  CHANGELOG.md                # pack change log
  sources/                    # evidence: screenshots, measured-value dumps, design images index
```

`<pack-id>` is English kebab-case (e.g. `lxlt-blue`, `audit-dark`). The `vue/` subdirectory is created later by `template-calibrate`.

## Hard Rules

- Every numeric entry in `contract.md` carries a provenance tag: `measured:computed-style` / `measured:design-image` / `given:prototype-css` / `extrapolated` / `filled:补位`. Entries tagged `extrapolated` or `filled` get elevated review weight during calibration.
- The target stack is fixed: Vue 3.4 + Ant Design Vue 4 + Vue Router 4 + Vuex 4. Anything the source style cannot express on this stack goes through the compatibility adjudication table (contract §6: 复刻/近似/放弃), never through silently changing the stack.
- **Path A (legacy Vue system)**: token values must come from rendered pages (computed styles or DevTools measurement), never from reading source stylesheets alone. Extract visual behavior, not code — no source component code enters the pack.
- **Path B (UI design deliverables)**: a low-quality HTML accompanying the design is a semantic reference only (which elements/interactions exist); **its CSS never enters the contract**. Build and confirm the golden page BEFORE distilling the contract. Contract §7 (design gaps) and §8 (extrapolation rules) are mandatory.
- **Path C (high-quality static prototypes)**: given pages are the visual acceptance baseline, not the template. Structural normalization is mandatory: strip shell, data-driven tables, `data-action/data-modal/data-nav` IR markers, `prototype-*` structural classes, no inline styles. Compare normalized vs given side by side before accepting.
- The golden page must pass the **executor confirmation gate** (one human: the executor) before the pack is declared v0.1. Record the gate with `assets/golden-page-review-card.md`.
- The six experience constraints (no page-level horizontal scroll, fit-table for narrow tables, equal-height paired cards, fixed bottom action bar, tab-bar arrow scrolling, demo content density) are style-independent and inherited from the family scaffold. The contract references them (§9); never copy or fork their text.
- Do not produce the Vue-side projection (`prototype-parity.scss` / `variables.scss`) here. That is `template-calibrate` batch-0 work, done against the confirmed contract.
- The contract holds style facts only — no business content, no page-specific copy, no menu data.
- `sources/` must contain enough evidence to re-derive every `measured:*` value (screenshots with annotations, or the raw dump from `measure-tokens.js`).

## Workflow

1. Determine the source type and pick the path. If inputs are mixed (e.g. design images + an old system), the higher-fidelity source wins as style truth; record the decision in contract §0.
2. Create the pack directory and copy `assets/contract-template.md` → `contract.md`, filling §0 metadata.
3. Run the path-specific extraction:
   - **A**: run the source system → measure tokens on real pages (`measure-tokens.js` or DevTools; degraded mode: annotated screenshots) → inventory source pages into the 7 archetypes, save 1-2 representative screenshots per archetype into `sources/` → fill contract §1-§5 → fill §6 adjudication table for every component AntD 4 cannot replicate 1:1.
   - **B**: index all design assets in `sources/` → hand-build the golden page from the design images (low-quality HTML consulted for semantics only) → executor confirmation gate on the golden page → reverse-distill contract §1-§5 from the confirmed page → fill §7 design gaps (every unspecified state: hover, empty, loading, density, breakpoints) and §8 extrapolation rules.
   - **C**: normalize the given pages structurally → side-by-side visual comparison against the originals → distill contract §1-§5 from the given CSS (merge duplicates, tokenize, drop one-off hacks) → pick the densest normalized page as golden page.
4. Produce `prototype/app.css` and `prototype/page-template.html` as projections of the contract (Path A/B: write from contract; Path C: normalize the given CSS into the projection).
5. Build the golden page on the projection (Paths A/C; Path B already has it — re-base it on the projection and re-verify).
6. **Executor confirmation gate**: walk the golden page with the review card. Loop fixes into contract or page until passed.
7. Generate `parity-checklist.md` from contract §3 — one row per structural-class numeric value.
8. Initialize `CHANGELOG.md`, set contract §0 version to `v0.1`, and write the handoff note pointing to `template-calibrate`.

## Self-Check

- Pack directory matches the fixed layout; `pack-id` is kebab-case English.
- Contract has all 11 sections (§0-§10); no section is silently empty — inapplicable sections say `不适用` with a reason.
- Every numeric value has a provenance tag; every `measured:*` value has evidence in `sources/`.
- Path A: no source-system component code in the pack; §6 has a row for every non-1:1 component, each with an executor-confirmed verdict.
- Path B: golden page was confirmed before the contract was written; low-quality HTML CSS is absent from the contract; §7/§8 are filled.
- Path C: normalized golden page visually matches the given original; no inline styles, no hardcoded table rows, IR markers present, `prototype-*` classes present.
- `prototype/app.css` contains every §3 value; `parity-checklist.md` rows cover every §3 entry.
- Golden page passes the prototype-site self-check rules (single `data-page`, no shell markup, data-driven tables, no page-level horizontal scroll).
- Review card for the confirmation gate is filled and stored in `sources/`.
- Contract §0 version is `v0.1` and the handoff note names the calibration working directory `xdocs/模板校准/<pack-id>/`.
