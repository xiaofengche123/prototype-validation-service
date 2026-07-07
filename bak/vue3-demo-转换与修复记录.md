# vue3-demo 原型转 Vue + 框架修复 交接记录

> 记录时间：2026-06-25
> 目的：万一额度用尽，其他 AI 编程工具可据此继续。本文件记录「已完成的工作」「发现的框架 bug 与修复」「待验证项」。

## 一、任务背景

- 用 `skills/prototype-vue3-framework` 生成的 Vue3 框架已落在 `vue3-project-skill/vue3-demo/`。
- 用 `skills/prototype-to-vue3` 把 `vue3-project-skill/prototype-pages/pages/**/*.html`（18 个原型页）转换进 `vue3-demo/src/views/`。
- 技术栈：Vue 3.5 + Ant Design Vue 4 + Vue Router 4 + Vuex 4 + vue-cli 5（webpack）。mock 自运行，零后端。

## 二、已完成（全部 18 页 + 菜单 + 构建通过）

每页 = `<编码>.vue` + `<编码小写>Api.js`，路径按编码前 4 位推导（BMGY01→BM/GY）：

| 分组(groupEname/中文) | 页面 | 目录 |
|---|---|---|
| BMGY 工艺参数配置 | BMGY01 工艺参数总览、BMGY02 收率与配比配置、BMGY03 微量元素保留率配置 | `src/views/BM/GY/` |
| BMYW 业务参数配置 | BMYW01 石油焦品种质量标准、BMYW03 基础价格维护、BMYW05 运费基础数据 | `src/views/BM/YW/` |
| BSRS 业务输入管理 | BSRS01/02/03/04/05/06/08（企业侧需求/炼厂供应/库存与计划/参考价/投料调整/投料配比/采购侧） | `src/views/BS/RS/` |
| BSCX 业务输出管理 | BSCX01 方案结果展示、BSCX03 帕累托对比、BSCX04 影子价格、BSCX05 审批流转 | `src/views/BS/CX/` |
| BMCP 模型运行管理 | BMCP01 质量指标权重配置 | `src/views/BM/CP/` |

- 菜单：`src/mock/data/menu.js` 已登记 18 行（+保留框架样例 BMSP01），5 个分组，`formEname==.vue文件名==编码`，`formLoadPath==/views/<模块>/<子模块>/<编码>`。
- 高保真：保留原型分区/统计卡/查询网格/状态页签/批量栏/弹窗 2 列；用 `prototype-*` 公用类。
- 公用样式层 `src/assets/styles/prototype-parity.scss` 本轮新增了：notice、biz-tabs、cond-bar、kpi、main-side/cols-2/cols-3、pbar、timeline、rank、chart-ph，以及之前同步的 fit-table / fixed-bottom-bar / 等高 prototype-cols。
- `npm run build` 通过（仅包体积 size-limit 提示，无错误）。无 Vue2/AntD1 残留（无 `::v-deep`/`scopedSlots`/`a-form-model`/`:visible=`/裸 `v-model=`）。

## 三、运行期发现的框架 bug 与修复（关键）

框架模板本身（不是转换页）有两个 Vue3 运行期 bug，**已同时修复 `vue3-demo` 与 `skills/prototype-vue3-framework/assets/framework-template`**：

### bug 1：keep-alive 双分支写法 → `parentComponent.ctx.deactivate is not a function`
- 文件：`src/layouts/BasicLayout.vue`
- 原写法（错）：keep-alive 内一个 `<component :is>`、外面再一个，靠 `v-if="$route.meta.keepAlive"` 切换。从非缓存页(dashboard)切到缓存页时 keep-alive 对同一 vnode 的 activate/deactivate 识别错位。
- 修复：改成单一 keep-alive：
  ```html
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
  </router-view>
  ```

### bug 2：路由组件被 reactive 化 → `Vue received a Component that was made a reactive object`（菜单点击无渲染的真正根因）
- 根因：路由记录被存进 Vuex(响应式) state（`store/modules/permission.js` 的 routers/addRouters），组件被 `reactive()` 包成 Proxy，RouterView/keep-alive 用「组件类型」比较身份时错位 → 告警 + 切页后不渲染 + 菜单点击像没反应。
- 修复：用 `markRaw` 标记所有路由组件为非响应式：
  - `src/api/backend/mock.js`：`loadView` 返回 `markRaw(defineAsyncComponent(() => import(...)))`；`RouteView = markRaw({...})`。
  - `src/config/router.config.js`：新增 `const lazy = loader => markRaw(defineAsyncComponent(loader))`，BasicLayout/UserLayout/Login/Dashboard/403/404 全部用 `lazy(...)`。

> 这两个修复都已写进 skill 模板并加了中文注释，避免以后再生成出同样 bug。

## 四、待验证（下一步该做的）

1. 重启/刷新 dev：`cd vue3-demo && npm run serve:mock`，强刷浏览器（Ctrl+F5）。
2. 确认：① 控制台无 `reactive object` 告警、无 `deactivate` 报错；② 左侧菜单点击能切页；③ dashboard 进各业务页正常渲染。
3. 逐页冒烟点检（重点交互页）：
   - BMGY02 重量转换链/参数联动；BMGY03 矩阵编辑+元素切换+试算；
   - BSRS03 正/反模式切换；BSRS05 调整建议+撤销+重新求解(跳 BSRS06)；BSRS06 看板；
   - BSCX03 帕累托散点选点对比(最多3个)；BSCX04 影子价格「如果会怎样」试算；BSCX05 审批流转时间线推进；
   - BMCP01 权重滑块+归一化校验(总和必须100%)。
4. 若仍有页面报错：多半是个别页面的模板/数据问题，按报错定位到对应 `.vue` 修；公用交互范式参考 `src/views/BM/SP/BMSP01.vue`（样板）。

## 五、约定速查（继续开发用）

- Vue 文件名/路由/组件名全大写英文编码；中文只进 `formCname`/`fullTitle`。
- AntD4 写法：`v-model:value`、`<a-form-item name>`、表格 `#bodyCell` 插槽、`v-model:open`、`:deep()`、按钮 `#icon` 插槽、`<a-icon type="..."/>`（靠 `components/AIcon.js` 兼容层）。
- 状态标签类：`status-tag` + `enabled/pending/disabled/reject/expired/review/draft`（见 prototype-parity.scss）。
- 固定底栏：页根加 `has-fixed-actions`，按钮组 `fixed-bottom-bar`（`.spacer/.center/.between`）。
- 体验约束（禁页面级横向滚动/窄表 fit-table/同排卡片等高/固定底栏）见 `skills/prototype-site-change-log.md`。

## 六、2026-06-25 菜单点击无反应二次修复记录

### 1. 现象
- 用户反馈：`vue3-demo` 当前“点击左侧菜单没反应，点击工作台菜单也没反应”，项目处于“看起来可渲染、但无法导航”的不可用状态。
- 实际复现：登录后左侧菜单点击高亮会变化，但主内容区不切页；dashboard 内部卡片链接反而可以正常跳转，说明页面组件和动态路由并未整体失效。

### 2. 本次调试方式
- 按运行时证据链调试，在 `vue3-demo/` 根目录建立 `debug-menu-click-no-response.md`。
- 启动调试服务：`http://127.0.0.1:7777/event`，日志文件：`.dbg/trae-debug-log-menu-click-no-response.ndjson`。
- 仅加观测点，不先改业务逻辑。埋点文件：
  - `src/components/SideMenu.vue`
  - `src/layouts/BasicLayout.vue`
  - `src/permission.js`
  - `src/api/backend/mock.js`
  - `src/router/index.js`
  - `src/views/dashboard/Dashboard.vue`

### 3. 关键证据
- pre-fix 日志显示：左侧菜单点击后，`BasicLayout.onMenuClick` 被调用 **两次**：
  - 第一次收到字符串路由，如 `"/BMGY01"`；
  - 第二次收到 `a-menu` 原始事件对象，如 `{ key, keyPath, domEvent, item... }`。
- 随后两次 `router.push` promise 都 resolved，但 `currentPath/fullPath` 仍停留在 `/dashboard`，并且 **没有进入** `router.beforeEach`，所以页面不会真正切换。
- 对照实验：dashboard 卡片点击会正常进入 `router.beforeEach` 并跳到目标页，证明动态路由生成、菜单数据、页面组件加载链路都基本正常。

### 4. 根因
- 第一层根因不是路由表丢失，也不是 keep-alive 再次失效，而是 **Vue 3 组件事件透传**：
  - `SideMenu.vue` 里调用了 `this.$emit('select', key)`；
  - 但组件本身 **没有声明** `emits: ['select']`；
  - 在 Vue 3 中，父组件上的 `@select` 会发生 fallthrough，额外挂到子组件根节点 `a-menu` 上；
  - 结果 `BasicLayout` 同时收到“自定义字符串事件”和“Ant Design Menu 原始事件对象”，后者污染了 `router.push(...)`，菜单点击表面上就像没反应。
- 第二层根因是在修完点击链后暴露出来的 **分组占位路由渲染错误**：
  - `src/api/backend/mock.js` 里的分组路由占位组件写成了 `render: () => h('router-view')`；
  - 这会生成原生 `<router-view>` 标签，而不是真实的 Vue Router `RouterView` 组件；
  - 所以 URL 虽然变成了 `/BMGY01`，但内容区只剩 `<router-view></router-view>`，看起来就是“地址变了，页面一片空白”。

### 5. 修复方案（已落地）
- `src/components/SideMenu.vue`
  - 增加 `emits: ['select']`，显式声明组件对外事件，阻断 `@select` 监听器向根节点透传。
- `src/layouts/BasicLayout.vue`
  - 把 `onMenuClick(key)` 改为 `onMenuClick(payload)`；
  - 增加兜底解析：`const key = typeof payload === 'string' ? payload : payload && payload.key`；
  - 仅当 `key` 为字符串时才执行 `this.$router.push(key)`。
- `src/api/backend/mock.js`
  - 把分组占位路由从 `render: () => h('router-view')` 改为 `render: () => h(RouterView)`。
- `skills/prototype-vue3-framework/assets/framework-template/src/api/backend/mock.js`
  - 同步把模板里的分组占位路由一起修正为 `h(RouterView)`，避免以后用 skill 新生成项目时再次出现“地址变了但内容空白”。
- 这个 fix 是“根因修复 + 防御性兜底”组合：
  - 真正根因靠 `emits` 修掉；
  - `BasicLayout` 的类型判断用于避免未来同类透传或误绑定再次把对象塞进 `router.push`。
  - `RouterView` 修复用于保证分组页可以把叶子业务页真实挂进内容区。

### 6. post-fix 验证结果
- 使用 Playwright 在本地复测通过：
  - 点击左侧 `工艺参数总览(BMGY01)`：已从 `/dashboard` 正常进入 `/BMGY01`；
  - `BMGY01` 页面内容实际渲染成功，不再是空白内容区；
  - 再点击左侧 `工作台`：已从 `/BMGY01` 正常返回 `/dashboard`。
- post-fix 日志特征：
  - `SideMenu` 只再发出一次字符串事件；
  - `BasicLayout` 记录到 `payloadType: "string"`；
  - 随后进入 `router.beforeEach`；
  - `router.push resolved` 时 `currentPath/fullPath` 已更新为目标路由；
  - Playwright 抓到 `.content` 中已出现 `BMGY01` 的真实页面 DOM，不再只有裸 `<router-view>` 标签。

### 7. 当前保留项
- 为了继续观察是否有其他潜在导航问题，本次调试埋点和 `debug-menu-click-no-response.md` 暂时保留，尚未清理。
- 若用户确认“菜单点击问题已完全修复”，下一步可清理：
  - `debug-menu-click-no-response.md`
  - `.dbg/menu-click-no-response.env`
  - `.dbg/trae-debug-log-menu-click-no-response.ndjson`
  - 以及本次加入的 `#region debug-point` 埋点代码。
- 补充状态（2026-06-25，本轮中断说明）：
  - 用户在继续验证前手动停止了当前运行会话，因此 dev server / 调试链路已中断；
  - **代码修改本身已经落盘**，未丢失，可直接继续；
  - 中断前已确认的已落地修改有 4 处：
    1. `src/components/SideMenu.vue`：补 `emits: ['select']`；
    2. `src/layouts/BasicLayout.vue`：`onMenuClick` 改为 payload 兜底解析，仅字符串路由才 `push`；
    3. `vue3-demo/src/api/backend/mock.js`：分组占位路由改为 `h(RouterView)`；
    4. `skills/prototype-vue3-framework/assets/framework-template/src/api/backend/mock.js`：同步模板修复 `h(RouterView)`。
  - 中断前最后一次自动化验证结果：
    - 左侧菜单点击已能进入 `BMGY01`；
    - `BMGY01` 内容区已真实渲染，不再空白；
    - 点击“工作台”可返回 `/dashboard`。
  - 若切到 solo 模式继续，建议起手步骤：
    1. 在 `vue3-demo` 下重新执行 `npm run serve:mock`；
    2. 手工点检 3 个路径：`工作台 -> BMGY01 -> 工作台`；
    3. 若确认稳定，再决定是否清理调试埋点和 `debug-menu-click-no-response.md`。

### 8. 对两个 skill 的反向改进建议
- `prototype-vue3-framework`
  - 生成所有带 `$emit(...)` 的 Vue 3 组件时，必须同步生成 `emits` 声明，尤其是菜单、分页、筛选栏、弹窗包装组件。
  - 对“根节点就是第三方组件”的 wrapper 要特别警惕 listener fallthrough。
  - 生成占位路由组件时，不要写 `h('router-view')`；在 render 函数里必须使用真实组件 `h(RouterView)` 或等价写法。
- `prototype-to-vue3`
  - 若转换产物中存在父组件监听 `@select/@change/@submit` 等自定义事件，而子组件是 Vue wrapper，需自动检查是否补了 `emits`。
  - 可在产物检查阶段增加一条规则：`$emit('xxx')` 存在但未声明 `emits` 时，标记为高优先级运行期风险。

## 七、2026-06-25 自主测试与稳定性修复总结

### 1. 本轮目标
- 不再只修单个已知问题，而是以“页面可正常使用、不点击就报错”为底线，对整个 `vue3-demo` 做一轮自主冒烟测试和关键交互测试。
- 测试优先级：
  1. 主菜单所有页面能否正常进入、正常渲染；
  2. 重点交互页点击按钮后是否报运行时错误；
  3. 构建是否通过；
  4. 把可沉淀成 skill 规则的问题补写进记录。

### 2. 自主测试覆盖范围
- 主菜单页面全量冒烟：
  - 工作台
  - 18 个业务页面
  - 1 个框架样例页
- 重点交互页专项检查：
  - `BMGY03` 微量元素保留率配置
  - `BSRS03` 库存与计划录入
  - `BSRS05` 投料数据调整
  - `BSCX03` 帕累托对比
  - `BSCX04` 影子价格
  - `BSCX05` 审批流转
  - `BMCP01` 质量指标权重配置
- 构建验证：
  - `npm run build` 已通过，仅剩包体积 size-limit 警告，无编译错误。

### 3. 本轮发现的问题
- 阻断性问题：1 个
  - `BMGY03` 点击“预览传导”触发运行时异常：
    - 报错：`TypeError: this.$el.querySelector is not a function`
    - 影响：webpack dev overlay 会弹出，页面后续交互被中断
    - 复现路径：进入 `BMGY03` -> 点击固定底栏“预览传导”
- 非阻断问题：1 类
  - 控制台存在 `Vue Router warn`：
    - 原因：路由组件使用了 `defineAsyncComponent(() => import(...))`
    - 影响：不阻断页面使用，但会制造噪音，属于框架模板层面的质量问题

### 4. 本轮修复
- `src/views/BM/GY/BMGY03.vue`
  - 原问题代码：
    - `this.$el.querySelector('.calc-card')?.scrollIntoView(...)`
  - 修复：
    - 给 `.calc-card` 加 `ref="calcCard"`
    - 改为 `this.$refs.calcCard?.scrollIntoView(...)`
  - 结论：
    - 修复后点击“预览传导”不再报 exception/error
- 清理调试遗留埋点
  - 为避免正常使用时出现 `127.0.0.1:7777/event` 调试请求报错，已把前一轮临时调试埋点从运行代码中移除。
  - 清理文件：
    - `src/components/SideMenu.vue`
    - `src/layouts/BasicLayout.vue`
    - `src/permission.js`
    - `src/api/backend/mock.js`
    - `src/router/index.js`
    - `src/views/dashboard/Dashboard.vue`

### 5. 本轮结果
- 页面可用性结论：
  - 主菜单页面本轮检查结果 `20/20` 可进入、可渲染、无空白页
  - 关键交互页本轮未再发现新的阻断性故障
  - `BMGY03` 的“预览传导”已从“点击即报错”恢复为可正常使用
- 当前残留风险：
  - 仍有非阻断 `Vue Router warn`
  - 不影响页面使用，但建议后续单独整理为模板级修复项

### 6. 对 skill 的新增优化建议
- `prototype-to-vue3`
  - 若页面脚本里存在 `this.$el.querySelector(...)`、`this.$el.querySelectorAll(...)` 这类 DOM 依赖，转换时优先改成 `ref`，不要直接保留到 Vue 3 产物里。
  - 特别是“滚动定位”“高亮定位”“聚焦某块区域”这类原型行为，推荐统一生成 `ref + scrollIntoView` 模式。
- `prototype-vue3-framework`
  - 框架模板应减少会在控制台持续产生噪音的默认实现，尤其是路由异步组件写法应与 Vue Router 4 推荐方式保持一致。
  - 生成模板后建议内置一轮“菜单全量冒烟 + 关键交互页点击检查”的自检清单，避免把明显运行期问题留到业务页验收阶段。

## 八、2026-06-25 刷新业务页误跳 404 修复记录

### 1. 现象
- 用户反馈：进入 `http://localhost:8082/#/BMGY02` 后，如果刷新页面，会跳到 `http://localhost:8082/#/404`。
- 期望行为：刷新后仍停留在原业务页，而不是被错误打到 404。

### 2. 关键证据
- 本轮针对 `permission.js` 与 `router/index.js` 增加了最小观测点，重点记录：
  - 刷新时 `to.path / to.fullPath`
  - 动态路由是否已生成
  - `router.beforeResolve/afterEach` 的 `matchedPaths`
- 修复后再次刷新 `#/BMGY02`，日志出现了一个关键特征：
  - `fromPath: "/404"`
  - `toPath: "/BMGY02"`
  - `matchedPaths: ["/", "/mock/BMGY", "/BMGY02"]`
- 这说明真实整页刷新时，路由恢复链路里确实会短暂经过 404；如果没有额外恢复逻辑，最终就会停在 404。

### 3. 根因
- 根因是“**动态路由恢复晚于初始 404 命中**”：
  - 常量路由里存在 `/:pathMatch(.*)* -> /404` 的 catch-all；
  - 刷新业务页时，动态路由还没重新注入，初始解析可能先把业务页识别为 not-found；
  - `permission.js` 虽然后续会 `GenerateRoutes + addRoute`，但如果仍然直接 `next({ ...to })`，此时 `to.path` 已经是 `/404`，就把错误结果继续保留下来了。

### 4. 修复方案（已落地）
- 文件：`src/permission.js`
- 新增一个 `getHashTargetPath()`，从 `window.location.hash` 中提取真实目标路径。
- 同时在模块初始化阶段缓存 `initialHashTargetPath`，保存“页面首次加载时”的原始 hash 目标。
- 在动态路由注入完成后：
  - 如果当前 `to.path === '/404'`
  - 优先使用首次加载时缓存的 `initialHashTargetPath`
  - 若没有，再回退到当前地址栏 hash
  - 最后把跳转目标从 `/404` 改写回恢复出的原始业务路径，再 `next({ path: recoveredTarget, replace: true })`
- 第二轮增强修复（更关键）：
  - 文件：`src/main.js`
  - 在应用挂载前，如果检测到本地已有 token 且动态路由尚未恢复，则先执行：
    - `store.dispatch('GenerateRoutes')`
    - `resetRouter()`
    - `router.addRoute('index', route)`
  - 然后再 `app.use(router)` 和 `app.mount('#app')`
  - 这样 Router 首次启动时就已经拥有业务动态路由，不会在首帧把 `#/BMGY02` 误识别成 404。
- 模板同步：
  - `skills/prototype-vue3-framework/assets/framework-template/src/main.js` 已同步加入同样的启动前动态路由恢复逻辑。

### 5. 为什么这个修复有效
- 404 是“初始解析阶段的临时结果”，不是用户真实要去的目标页。
- 真正可靠的原始意图来源，不是“已经可能被 404 重写过的当前 hash”，而是“模块初始化时捕获的首次 hash”。
- 因此在动态路由恢复完成后，优先回放首次加载时的业务路径，能把用户带回正确页面。
- 如果 hash 本来就是非法路径，路由仍会再次落回 404，不会破坏真正的 not-found 行为。

### 6. 当前验证结果
- 本地验证：
  - 第一轮守卫恢复方案后，本地可恢复到 `BMGY02`
  - 用户侧仍反馈跳 404，因此继续升级为“启动前恢复动态路由”
  - 第二轮修复后，本地在重启 dev server 的前提下，新开浏览器会话进入 `BMGY02` 并整页刷新，未再跳到 `#/404`
- 本次修复属于路由恢复链的增强，对正常菜单切页无副作用。
- 若用户侧仍复现，优先考虑浏览器拿到的是旧 bundle，应先做一次强刷或清缓存后复测。

### 7. 对 skill 的新增优化建议
- `prototype-vue3-framework`
  - 对“基础常量路由 + 登录后动态注入路由”的模板，必须考虑“整页刷新恢复目标路由”的场景，不能只验证菜单点击。
  - 更稳妥的默认实现不是只依赖路由守卫恢复，而是“应用挂载前先恢复动态路由”，避免 Router 首帧先命中 404。
  - 生成模板后建议加入一个固定自检项：
    - 登录进入任一动态业务页
    - 刷新浏览器
    - 验证是否仍停留在原页
- `prototype-to-vue3`
  - 如果转换产物依赖动态菜单路由，验收清单中应包含“直达 URL 打开”和“整页刷新恢复”两类场景，而不仅是 SPA 内部点击跳转。
