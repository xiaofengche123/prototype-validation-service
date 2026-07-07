---
name: prototype-vue3-framework
description: Create or repair a runnable Vue 3.4 + Ant Design Vue 4 mock demo framework for PSM prototype pages. Use when you need to initialize a Vue3 frontend demo project, copy the shared framework template, verify menu dynamic imports, or provide the target project for prototype-to-vue3 converted pages. Vue3 edition — same visual style, layout, naming conventions and design tokens as the Vue2 framework, with the runtime upgraded to Vue 3 / AntD Vue 4 / Vue Router 4 / Vuex 4.
---

# Prototype Vue Framework (Vue3 edition)

Create a standalone mock Vue3 framework that converted prototype pages can run inside. The template includes login, shell layout, side menu, multi-tab routing, local mock menu data, and one sample page. It is the Vue3 upgrade of the Vue2 demo framework: identical look/feel, style tokens, directory layout and naming rules, with the stack upgraded to **Vue 3.4 + Ant Design Vue 4 + Vue Router 4 + Vuex 4**.

## Resources

- Copy the full project template from `assets/framework-template/`.
- Read `references/psm-ui-profile.md` when validating naming, menu shape, style tokens, AntD Vue 4 API usage, or red lines.
- Read `references/visual-parity.md` when validating the prototype parity style layer.
- Read `references/manual.md` only for extra examples or troubleshooting.

## Hard Rules

- Vue page paths use English codes only: `src/views/<模块>/<子模块>/<编码>.vue`.
- API files use lowercase code names: `src/views/<模块>/<子模块>/<编码小写>Api.js`.
- `src/mock/data/menu.js` must keep `formEname == <编码> == .vue filename`.
- `formLoadPath` must be `/views/<模块>/<子模块>/<编码>`.
- Chinese appears in Vue only as display text such as `groupCname`, `formCname`, and titles.
- Keep the primary color `#1565c0`; do not introduce `#0052d9`.
- Use the Vue3 / Ant Design Vue 4 idioms (see `references/psm-ui-profile.md` §8 and the template's `README.md`): `createApp`, `v-model:value`, `<a-form>` + `<a-form-item name>`, table `#bodyCell` slot, `v-model:open` modals, `:deep()`, icon slots.
- Keep `<a-icon type="...">` working through the `src/components/AIcon.js` compatibility layer (AntD Vue 4 removed the built-in `a-icon`); do not delete it — `menu.js` icon names and `SideMenu` auto-icons depend on it.
- Do not add production-only dependencies or imports: `$common`, `EiInfo`, `EFGrid`, `jsencrypt`, `qiankun`, `mockjs`, real backend calls.
- Do not touch production `psm-ui`; this skill creates an isolated demo framework.
- Include the shared high-fidelity style layer `src/assets/styles/prototype-parity.scss`, imported by `global.scss`, so converted pages can visually match confirmed HTML prototypes.

## Vue3 Runtime Red Lines (do not regress)

These four bugs all looked like "click menu → nothing happens / blank page" and each cost a full debug round. The template already encodes the fixes; never generate code that reverts them.

- **Declare `emits` on every component that calls `$emit`.** A component whose root node is a third-party component (e.g. `SideMenu` → `a-menu`) will let an undeclared `@select`/`@change` listener *fall through* to the root, firing the handler twice (once with your string payload, once with the library's raw event object) and polluting `router.push`. `SideMenu.vue` must keep `emits: ['select']`. Apply the same to any pagination/filter/modal wrapper component you add.
- **`markRaw` all route components.** Route records are stored in Vuex (reactive) state; if a component is wrapped in a `reactive()` Proxy, `RouterView`/`keep-alive` mis-compare component identity → `Vue received a Component that was made a reactive object` + blank content after navigation. Keep `loadView`/`RouteView` in `src/api/backend/mock.js` and the `lazy()` helper in `src/config/router.config.js` wrapped in `markRaw`.
- **Group placeholder routes must render the real `RouterView`.** Use `render: () => h(RouterView)` (imported from `vue-router`), never `h('router-view')` — the string form emits a literal `<router-view>` tag and the content area stays blank while the URL changes.
- **Single `<keep-alive>` only.** Wrap one `<component :is="Component" :key="$route.fullPath">` inside one `<keep-alive>` via `router-view v-slot`. The double-branch pattern (keep-alive component + an outer component switched by `v-if`) throws `parentComponent.ctx.deactivate is not a function` when moving from a non-cached page to a cached one.
- **Restore dynamic routes before mount.** `src/main.js` must run `bootstrapDynamicRoutes()` (GenerateRoutes → resetRouter → `addRoute('index', ...)`) before `app.mount`, so a full-page refresh on a deep route (e.g. `#/BMGY02`) does not transiently hit the `/404` catch-all and stick there. Do not rely on the route guard alone.

## Workflow

1. Choose the target framework directory.
2. Copy `assets/framework-template/` into the target directory. If the target already has a framework, fill missing framework files only; do not overwrite existing business pages, `menu.js`, or `node_modules`.
3. Optionally update branding in `public/index.html`, `src/layouts/BasicLayout.vue`, `src/views/user/Login.vue`, and `package.json`.
4. Validate that the sample page exists at `src/views/BM/SP/BMSP01.vue` with `bmsp01Api.js`, and that `menu.js` registers `BMSP01` with `/views/BM/SP/BMSP01`.
5. Run `npm install` and `npm run build` when dependencies are available.

## Self-Check

- `src/main.js` (uses `createApp`), `src/layouts/BasicLayout.vue`, `src/components/AIcon.js`, `src/mock/data/menu.js`, and `package.json` exist.
- `package.json` is the Vue3 demo dependency set (`vue ^3`, `ant-design-vue ^4`, `@ant-design/icons-vue`, `vue-router ^4`, `vuex ^4`, `dayjs`) and includes `serve:mock`.
- No banned imports or legacy PSM framework APIs are present; no `moment`, no `vue-template-compiler`.
- `variables.scss` uses `#1565c0`.
- `prototype-parity.scss` exists and is imported by `global.scss`.
- Dynamic import paths in menu rows match real English-coded `.vue` files (`loadView` appends `.vue`).
- Vue3 idioms used throughout: `v-model:value`, `<a-form-item name>`, table `#bodyCell`, `v-model:open`, `:deep()`, `app.component('AIcon', ...)`.
- Runtime red lines hold: `SideMenu.vue` declares `emits: ['select']`; every other `$emit` has a matching `emits`; route components are `markRaw`'d in `mock.js` and `router.config.js`; group placeholder routes use `h(RouterView)` (not `h('router-view')`); `BasicLayout.vue` uses a single `<keep-alive>`; `main.js` restores dynamic routes before `mount`.

## Runtime Smoke Self-Check (after generating, before handing off)

Do not stop at "build passes" — these are the failures that survive a green build. Walk them with the dev server (`npm run serve:mock`):

- Console is clean on first load and after navigation: no `Vue received a Component that was made a reactive object`, no `parentComponent.ctx.deactivate is not a function`, no Vue Router warnings, no stray debug requests.
- Navigation works both directions: 工作台 → a business page → back to 工作台, with the content area actually re-rendering each time (not just the URL/highlight changing).
- A menu click fires the handler exactly once (string payload), not twice.
- Full-page refresh on a deep business route (e.g. `#/BMGY02`) stays on that page instead of redirecting to `/404`; opening that URL directly also lands on the page.
