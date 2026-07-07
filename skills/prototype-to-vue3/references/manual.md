# 原型转Vue skill（Vue3 站点版）— 使用手册

> 给使用者看的操作手册。重点是**大量可拷贝的提示词案例**——复制下来，改原型路径/编码就能用。
> 本版转换目标是 **Vue 3 + Ant Design Vue 4** 演示框架（由 `prototype-vue3-framework` skill 生成）。

---

## 1. 这个 skill 帮你做什么

把「原型站点」里的业务页，变成 **Vue3 演示框架**里**能跑、能看、能点**的 Vue 页面。跑完一次，`npm run serve:mock` 就能在系统菜单里看到它。

它会自动产出/修改三处：
1. `src/views/<模块>/<子模块>/<编码>.vue` —— 页面（🔴 文件名大写 == 编码，全英文）
2. `src/views/<模块>/<子模块>/<编码小写>Api.js` —— 数据（本地 mock）
3. `src/mock/data/menu.js` —— 菜单加一行

**零 Java 后端、零数据库**。原型里能点的、能弹的、能跳的，转过去都还能用。
**两种粒度**：转一张 / 整站批量转。

> 站点版省事在哪：原型业务页本就只有业务内容（外壳在站点 `index.html`），转换时**不用再剥壳**；站点目录与 Vue3 演示框架几乎 1:1 对应，转换又快又稳。

---

## 2. 用之前确认

- 原型最好由「原型制作」skill 产出（在 `xdocs/原型站点/pages/` 下，带 `data-page` 编码和规格卡）。
- 目标框架由「原型框架Vue3」skill (`prototype-vue3-framework`) 生成（Vue 3 + Ant Design Vue 4）。
- 知道页面编码（如 `BMSP01` = 模块 BM + 子模块 SP + 序号 01）。没有就现起一个。

---

## 3. 提示词案例库（复制即用）

### 案例 A：单页转换（最常用）

```
用「原型转Vue」skill，把 xdocs/原型站点/pages/基础信息管理/供应商准入申请.html 转成 Vue 页面。
数据先用 mock，能 serve:mock 跑起来即可。
```

### 案例 B：编码/归属另指定

```
用「原型转Vue」skill 转 xdocs/原型站点/pages/基础信息管理/物料主数据.html。
编码 BMWL01，模块 BM、子模块 WL。
```

### 案例 C：整站批量转换

```
用「原型转Vue」skill，把 xdocs/原型站点/ 整站转进 Vue3 演示框架：
- pages 下每张页都转成对应 .vue + Api.js
- menu.config.js 的菜单条目合并进 menu.js
每张转完报告一次结果，最后给一份汇总。
```

### 案例 D：重跑/改进（幂等续跑）

```
用「原型转Vue」skill 重新转 xdocs/原型站点/pages/基础信息管理/供应商准入申请.html（BMSP01）。
原型刚改过：表格加了"当前审批节点"列、查询区加了"准入类别"下拉。
在已有 BMSP01.vue 基础上更新，别从零重写，菜单别重复加。
```

### 案例 E：只补某一块

```
用「原型转Vue」skill，给 BMSP01.vue 的"批量审批"按钮补上桩方法和提示，其它不动。
```

---

## 4. 跑完怎么验收

1. 在 Vue3 演示框架目录执行：`npm run serve:mock`
2. 浏览器打开（默认 8080），用 mock 账号（任意账号密码）登录。
3. 左侧菜单出现该页 → 点开看到真实页面。
4. 逐项点：查询/重置/分页/勾选/弹窗/单号跳转 —— 都应有反应。

> 看不到菜单？硬刷新（Ctrl+Shift+R）；必要时重启 `serve:mock` 让它重新扫描页面。

---

## 5. 转化后页面长什么样（Vue3 + AntD4）

- **高保真**：版面与原型几乎一模一样——统计卡片、4 列查询网格、状态页签、批量栏、表格密度、操作位置、2 列弹窗都原样保留（复用框架公用层 `prototype-*` 类，范本见框架 `src/views/BM/SP/BMSP01.vue`），不会被 AntD 默认样式重画走样。
- 一个标准 Ant Design Vue 4 页面（统计卡片 + 查询区 + 列表 + 弹窗），风格与系统一致。
- 数据是本地 mock（直接搬原型里的样例数据），查询/分页/筛选都能动。
- 写法都是 Vue3/AntD4：`v-model:value`、`<a-form>`+`<a-form-item name>`、表格 `#bodyCell` 插槽、`v-model:open` 弹窗、`:deep()`、按钮 `#icon` 插槽（详见画像 §6/§8）。
- 所有按钮都有方法：
  - 标准动作（查询/重置/新增/编辑/删除/保存）—— 真能用。
  - 业务自定义动作（审核/撤回/打印…）—— 给"待实现"提示桩，**点了有反应**，后续把桩换成真逻辑即可。
- 跳转用 `$router.push('/目标编码')`（原型里的跨页跳转自动转成它），目标页做出来就通。

---

## 6. 现在是 mock，以后怎么接真后端

第一版只做前端 mock（验证页面、给客户确认最省事）。等需要真数据时：
- 把 `Api.js` 的 `query/save/delete` 改成 `request({ url:'/psm/service/<编码>/...' })` 走 EiInfo 协议（条件→`inqu_status`、数据→`result`、字段与后端对齐）。
- 后端 Service/SQL/表、菜单入库等，按生产项目的页面开发指南走。
- 这部分是**第二版**，与本 skill 解耦，页面代码基本不用动。

---

## 7. 常见问题

| 现象 | 处理 |
|---|---|
| 菜单没出现 | 确认 `menu.js` 加了该页一行；硬刷新 / 重启 serve:mock |
| 点菜单是空白/报错 | `formLoadPath` 路径与 `.vue` 实际位置是否一致；文件名大写是否 == 编码（适配层会自动补 `.vue` 后缀） |
| 样式不对/发灰 | 颜色是否用了 `$变量`；AntD 内部样式是否用 `:deep()` 覆盖（不是 `::v-deep`） |
| 表单不双向绑定 | AntD4 输入要 `v-model:value`（不是 `v-model`） |
| 表格自定义列不渲染 | 用统一 `#bodyCell` 插槽（不是 `scopedSlots`）；列 `customRender` 入参是对象 `({ text, record, index })` |
| 弹窗点了没反应 | 检查该弹窗是否转成 `a-modal` 且 `v-model:open` 绑定到状态（`visible` 已废弃） |
| 表单校验报错/不触发 | `a-form-item` 用 `name`（不是 `prop`）；`this.$refs.form.validate()` 返回 Promise，用 `try/await` |
| 控制台报 `EF...` 未注册 | 误用了 pscs 的 EFGrid 写法，要改回 Ant Design Vue 组件 |
| 图标不显示 | type 用 AntD 图标名（如 `form`/`search`），框架 `AIcon.js` 兼容层会映射到 `*Outlined` |
| `.vue` 里残留 `PR.`/`postMessage` | 没翻译干净，按 IR 规范把动作转成 method、跳转转成 `$router.push` |
