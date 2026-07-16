# 原型演示前端框架（Vue3）

由「原型框架Vue3 skill」生成的可运行 Vue3 框架空壳，与原型站点风格一致，Mock 自运行、零后端。
配「原型转Vue」skill 使用：把原型页面转成 `.vue` 放进 `src/views/...` 并在 `src/mock/data/menu.js` 登记一行，即可在菜单里跑起来。

技术栈：**Vue 3.4 · Ant Design Vue 4.x · Vue Router 4 · Vuex 4 · SCSS**（与 Vue2 版同款风格/样式/目录，仅升级运行时与组件库）。

## 运行
```bash
npm install
npm run serve:mock     # 默认 http://localhost:8080
```
登录页任意账号密码即可进入（离线演示模式）。

## 结构（与 psm-ui 约定一致）
```
src/
  main.js / App.vue / permission.js     入口(createApp) / 根组件 / 路由守卫
  router/ + config/router.config.js      路由（基础路由 + 动态路由根，Vue Router 4）
  store/                                 用户态 / 多页签 / 动态路由(GenerateRoutes，Vuex 4)
  api/backend/mock.js                    菜单→路由（读 menu.js，无 HTTP）
  mock/data/menu.js                      菜单真源（menuRows）← 新增页面在此登记
  layouts/BasicLayout.vue                外壳：顶栏 + 左菜单 + 多页签 + 内容区
  components/
    AIcon.js                             a-icon 兼容层（type 字符串 → @ant-design/icons-vue 组件）
    SideMenu.vue / MultiTab.vue          菜单（a-menu items） / 页签（a-tabs items）
  assets/styles/{variables,global}.scss  设计令牌 / 全局样式（主色 #1677ff）
  views/
    user/Login.vue  dashboard/Dashboard.vue  exception/{403,404}.vue
    BM/SP/BMSP01.vue + bmsp01Api.js          样例业务页（转 Vue 的范本）
```

> 命名约定：Vue 文件用**英文编码**（`BMSP01.vue`，🔴 文件名大写 == formEname == 编码，否则页面打不开）；
> 中文只出现在**菜单显示**（`formCname`）。（静态原型站点那边才用中文文件夹/文件名；Vue 工程按惯例用 ASCII。）

## 加一个页面（手动；通常由「原型转Vue」自动完成）
1. 放页面：`src/views/<模块>/<子模块>/<编码>.vue`（文件名大写 == 编码，如 `BMSP01.vue`）。
2. 数据层：同目录 `<编码小写>Api.js`（如 `bmsp01Api.js`），`.vue` 里 `import ... from './bmsp01Api'`。
3. 登记菜单：`src/mock/data/menu.js` 的 `menuRows` 加一条
   `{ groupEname:'<模块>', groupCname:'<分组中文名>', formEname:'<编码>', formCname:'<页面中文名>', formLoadPath:'/views/<模块>/<子模块>/<编码>', sort }`。
4. 刷新即见菜单（必要时重启 serve）。

## Vue3 / AntD Vue 4 与 Vue2 版的写法差异（转页面时注意）
- 表单输入：`v-model:value="x"`（不是 `v-model="x"`）。
- 表单容器：`<a-form>` + `<a-form-item name="字段">`（AntD4 已合并 `a-form-model`）。
- 表格自定义单元格：用统一插槽 `#bodyCell="{ column, text, record, index }"`（不是 per-column `scopedSlots`）。
- 列 `customRender` 入参为对象：`({ text, record, index, column }) => ...`。
- 弹窗：`v-model:open="visible"`（`visible` 已废弃）。
- 图标：仍可写 `<a-icon type="search" />`（本框架的 `AIcon.js` 兼容层把字符串映射到 `*Outlined` 组件）。
- 按钮图标用插槽：`<a-button><template #icon><a-icon type="reload" /></template>重置</a-button>`。
- 深度样式：`:deep(.ant-xxx)`（不是 `::v-deep`）。
