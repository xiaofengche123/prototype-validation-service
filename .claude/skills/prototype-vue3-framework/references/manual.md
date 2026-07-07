# 原型框架Vue3 skill — 使用手册

> 给使用者看的操作手册。重点是**可拷贝的提示词** + 验收/常见问题。

---

## 1. 这个 skill 帮你做什么

一句话:**给你一个能跑的 Vue3 前端框架空壳**(Vue 3.4 + Ant Design Vue 4),风格和原型站点、和 Vue2 版框架一模一样,`npm install && npm run serve:mock` 直接起来,登录页任意账号进入,左菜单、多页签、动态路由都现成。

它是 `prototype-vue-framework`(Vue2 版)的**升级版**:目录、样式、设计令牌、命名约定、菜单机制全部一致,只把运行时换成 **Vue 3 / Ant Design Vue 4 / Vue Router 4 / Vuex 4**。

它是三件套的中间环:
- 「原型制作」做静态站点给客户看;
- **「原型框架Vue3」生成可跑的 Vue3 框架(本 skill)**;
- 「原型转Vue」把站点页面塞进这个框架跑起来。

特点:
- **开箱即跑**:自带登录/工作台/异常页 + 1 张样例业务页(供应商准入申请)。
- **零后端**:纯 mock 自运行,不依赖任何 Java 服务或数据库。
- **约定即 psm-ui**:页面路径、菜单登记、设计令牌都和 psm-ui 一致。
- **独立**:与生产 psm-ui 解耦,专门用于部门推广/客户演示。

---

## 2. 提示词案例库(复制即用)

### 案例 A:生成一个新框架(最常用)

```
用「原型框架Vue3」skill 生成一个 Vue3 前端框架到 xdocs/原型框架-vue3-demo/。
系统名就用默认的"绿星链通 / 管理系统演示"。
```

### 案例 B:指定品牌/系统名

```
用「原型框架Vue3」skill 生成框架到 D:/demo/供应链演示/。
顶栏系统名改成"供应链协同平台"，登录页副标题同步改，项目名 supply-chain-demo。
```

### 案例 C:配合整套流水线

```
1. 用「原型框架Vue3」skill 生成框架到 xdocs/原型框架-vue3-demo/
2. 再用「原型转Vue」skill 把 xdocs/原型站点/ 整站转进 xdocs/原型框架-vue3-demo/（按 Vue3 / AntD4 写法）
最后我 npm install && npm run serve:mock 验收。
```

---

## 3. 生成后怎么跑(你来执行)

```bash
cd <目标目录>            # 例如 xdocs/原型框架-vue3-demo
npm install              # 首次装依赖（联网）
npm run serve:mock       # 默认 http://localhost:8080
```
- 浏览器打开 8080 → 登录页**任意账号密码**点登录。
- 进去看到:工作台(功能导航,按菜单自动生成卡片) → 左菜单「供应商准入申请」→ 点开是真实页面,可查询/分页/勾选/弹窗。

---

## 4. 往框架里加页面

通常**交给「原型转Vue」自动做**(转页面 + 改 menu.js)。手动加的话(Vue 文件用英文编码,中文只在菜单显示):
1. `src/views/<模块>/<子模块>/<编码>.vue`(🔴 文件名大写 == 编码,如 `BMSP01.vue`)。
2. 同目录 `<编码小写>Api.js`(如 `bmsp01Api.js`),`.vue` 里 `import ... from './bmsp01Api'`。
3. `src/mock/data/menu.js` 的 `menuRows` 加一条
   `{ groupEname:'<模块>', groupCname:'<分组中文名>', formEname:'<编码>', formCname:'<页面中文名>', formLoadPath:'/views/<模块>/<子模块>/<编码>', sort }`。
4. 刷新即见菜单(必要时重启 serve)。

> 写页面用 Vue3 / AntD4 写法:`v-model:value`、`<a-form-item name>`、表格 `#bodyCell` 插槽、`v-model:open` 弹窗、`:deep()`、按钮图标用 `#icon` 插槽。详见 `references/psm-ui-profile.md` §6/§8。

---

## 5. 框架里有什么 / 砍了什么

| 保留 | 砍掉(mock 演示用不到) |
|---|---|
| 登录(任意账号)/工作台/403/404 | 真后端 EiInfo、realpsm 联调模式 |
| 顶栏 + 左菜单 + 多页签 + 动态路由 | qiankun 微前端 |
| 菜单→路由(读 menu.js,无 HTTP) | RSA 加密登录(jsencrypt) |
| 设计令牌 variables.scss(主色 #1565c0) | PDF 导出(jspdf/html2canvas) |
| a-icon 兼容层(AIcon.js) | mockjs HTTP 拦截、按钮级权限指令 |
| 样例页 BMSP01 + Api | |

---

## 6. 常见问题

| 现象 | 处理 |
|---|---|
| `npm install` 慢/失败 | 配淘宝镜像或公司源后重试 |
| 起不来/端口占用 | 改 `vue.config.js` 的 `devServer.port` |
| 登录后空白 | 看控制台;通常是某 `views/*.vue` 报错,按错误定位修 |
| 菜单没出现新页 | `menu.js` 是否加了该页 `menuRows`;`formLoadPath` 与 `.vue` 路径是否一致;文件名大写 == formEname |
| 图标不显示/报 a-icon 未注册 | 确认 main.js 有 `app.component('AIcon', AIcon)`;type 名是 AntD 图标名(如 `form`/`search`/`file-text`),兼容层会映射到 `*Outlined` |
| 表单不双向绑定 | AntD4 输入要 `v-model:value`(不是 `v-model`) |
| 表格自定义列不渲染 | AntD4 用统一 `#bodyCell` 插槽(不是 `scopedSlots`);列 `customRender` 入参是对象 `({text,record,index})` |
| 弹窗开不了/警告 visible 废弃 | 用 `v-model:open`(AntD4 改名) |
| 样式发灰/不对 | 颜色是否用 `$变量`;AntD 内部样式用 `:deep()` 覆盖 |
| 想接真后端 | 本框架是演示版;接真后端请按生产项目的 `Api.js` 走 EiInfo 协议 |
