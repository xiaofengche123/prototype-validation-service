# Vue3 演示框架画像（共享知识包）

> 用途：原型转 Vue 时，让大模型**只按本 Vue3 演示框架的真实约定干活**。
> 维护原则：**关键值以模板实文件为准**（本文件给出文件路径，必要时现读现确认，避免快照过期）。
> 适用项目：本 skill 生成的 **Vue 3.4 + Ant Design Vue 4** 演示框架（`prototype-vue-framework` 的 Vue3 升级版，风格/样式/目录/命名完全一致）。

---

## 0. 一句话定位

本框架是 **Vue 3.4 + Ant Design Vue 4** 的前端框架基座。业务页 = 一个 `.vue`（只含内容区，用 AntD 组件）+ 一个 `Api.js`（数据层）。**mock 模式下无需任何后端即可运行**。命名约定、菜单机制、设计令牌与 psm-ui 一致；写法用 Vue3 / AntD Vue 4 的现代 API。

---

## 1. 🔴 红线：禁止把"另一个项目(pscs)"的写法带进来

参考资料里有一份 `psm/xdocs/开发流程/增删改查案例示范.md`，它属于**另一个项目 pscs 的 iPlat4J 原生栈**，与本框架 **完全不同**。转页面时**严禁**出现以下任何东西：

| 禁止出现（pscs 的） | 本框架实际用 |
|---|---|
| `EFPage` / `EFRegion` / `EFGrid` / `EFColumn` / `EFComboColumn` | `a-card` / `a-form` / `a-table` / `a-modal`（Ant Design Vue 4） |
| `XrBaseView` / `<script src="./XXX.js">` 分离写法 | 标准单文件 `.vue`（template + script + scoped style） |
| `TEDFA00` / `TEDFA01` / `TEDCM00` / `TEDCM01` 注册 | mock 模式只改 `src/mock/data/menu.js` 一行 |
| `OPERATE_TYPE='xrvue'` | 不存在此概念 |
| 直连 Oracle 写库 | 第一版完全不碰数据库 |

> 自检：生成的 `.vue` 里若出现 `EF` 开头组件、`OPERATE_TYPE`、`XrBaseView`、`TEDFA`，一律判为错，必须重写。

---

## 2. 技术栈与关键文件

| 项 | 值 / 路径 |
|---|---|
| 框架 | Vue 3.4 · Ant Design Vue 4.x · Vue Router 4 · Vuex 4 · SCSS |
| 图标 | `@ant-design/icons-vue` + 兼容层 `src/components/AIcon.js`（保留 `<a-icon type="xxx" />` 字符串写法） |
| 设计令牌唯一来源 | `src/assets/styles/variables.scss`（自动注入，组件内直接用变量，**勿 `@import`**） |
| 业务页样板（**照抄它**） | `src/views/BM/SP/BMSP01.vue` + `src/views/BM/SP/bmsp01Api.js` |
| 全局外壳（页面**不要**自己写） | `src/layouts/BasicLayout.vue`（顶栏）、`components/SideMenu.vue`（菜单）、`components/MultiTab.vue`（页签） |
| mock 菜单/路由数据 | `src/mock/data/menu.js` |
| mock 后端适配 | `src/api/backend/mock.js` |
| 运行（离线） | `npm run serve:mock` |

---

## 3. 设计令牌（来自 `variables.scss`，组件内直接用 `$变量`）

```scss
$primary-color:   #1565c0;   // 主色（品牌/主按钮/链接/激活）
$primary-dark:    #0d47a1;
$primary-light:   #e3f2fd;   // 选中底色/表头底色
$success-color:   #43a047;
$warning-color:   #fb8c00;
$error-color:     #e53935;
$info-color:      #5e35b1;
$text-color:      #333;  $text-color-secondary: #666;  $text-color-muted: #999;
$layout-body-bg:  #f0f2f5;  $component-bg: #fff;  $border-color: #e0e0e0;
$border-radius-base: 4px;
$box-shadow-card: 0 1px 4px rgba(0,0,0,.08);
$header-height: 56px;  $sidebar-width: 220px;
// mixin：@include text-ellipsis;  @include flex-center;
```

> ⚠️ 原型里若用了 `#0052d9`（旧框架提示词的离群主色），转 Vue 时**一律改成 `$primary-color`(#1565c0)**。所有颜色尽量用变量，不写死十六进制。

---

## 4. 命名推导：编码 → 全套文件（机械规则）

> 🔴 **Vue 文件命名是硬约束，用英文编码，不可用中文。**（中文只用于①静态原型站点的文件名、②Vue 菜单的 `formCname` 显示名。）

设页面编码 = `BMSP01`（模块 `BM`、子模块 `SP`、序号 `01`）：

| 产物 | 路径 / 名称 |
|---|---|
| 页面组件 | `src/views/BM/SP/BMSP01.vue`（**文件名大写 == 编码**） |
| 数据层 | `src/views/BM/SP/bmsp01Api.js`（同目录，`<编码小写>Api.js`） |
| mock 路由路径 | `formLoadPath: '/views/BM/SP/BMSP01'` |
| 路由地址 | `/BMSP01`（由 `formEname` 自动生成） |
| 菜单 formEname / formCname | `BMSP01`（== 编码 == 文件名） / `供应商准入申请`（中文显示名） |

> **🔴 唯一最关键约束**：`menu.js` 的 `formEname` 与 `.vue` 文件名（大写）必须一致（== 编码），否则 `formLoadPath` 找不到组件、页面打不开。**绝不能用中文给 `.vue`/`Api.js`/路径命名**。
> 注意：适配层 `mock.js` 的 `loadView` 会自动补 `.vue` 后缀（`import('@/views/BM/SP/BMSP01.vue')`），这是 Vue3 + vue-cli 动态 import 的要求。

---

## 5. mock 注册法（让页面在菜单里出现 + 可点开）

往 `src/mock/data/menu.js` 的 `menuRows` 数组**加一条**（幂等：按 `formEname` 去重，有则改、无则加）：

```js
{
  groupEname: 'BM',                          // 分组英文短码（聚拢同组路由 + views 文件夹）
  groupCname: '基础信息管理',                 // 分组中文名（菜单折叠组显示）
  formEname: 'BMSP01',                       // == .vue 文件名（大写）== 编码
  formCname: '供应商准入申请',                // 页面中文名（菜单与页签显示）
  formLoadPath: '/views/BM/SP/BMSP01',       // 适配层取 split('/').slice(2) → import('@/views/BM/SP/BMSP01.vue')
  fullTitle: '基础信息管理 / 供应商准入申请',
  icon: 'form',                              // AntD 图标名（经 AIcon 兼容层映射到 FormOutlined）
  sort: 10
}
```

机制（见 `mock.js`）：`getMenuAndButtons()` 读 `menuRows` → 每条生成 `{ path:'/'+formEname, component: ()=>import('@/views/'+路径+'.vue') }` → `store/modules/permission.js` 的 `GenerateRoutes` 构建 → `permission.js` 用 `router.addRoute('index', ...)`（Vue Router 4）挂载 → 左侧菜单显示（显示文字用 `formCname` 中文）。**全程不碰数据库。**

> 按钮级权限（`buttonRows`）第一版可不加；需要时再按 `{ formEname, buttonEname }` 追加。

---

## 6. 页面组件骨架（高保真转换，照 BMSP01 的写法，Vue3 + AntD Vue 4）

> 🔴 **高保真硬要求**：转出的 `.vue` 要**高度还原原型页面**。原型业务页（`pages/**/*.html`）已经把统一层抽到外壳，业务片段里用的是 `card/card-head/title/query-grid/form-item/stat-row/status-tabs/table/tag/op...` 这套类；转换时**保留同一套布局结构**，只是把类名换成框架公用层 `prototype-parity.scss` 的 `prototype-*` 版本、把原生控件换成 AntD 组件。**不要**用 AntD 默认布局重画（例如别把 `query-grid` 改成 `a-form layout="inline"`、别把统计/状态页签删掉、别把 2 列弹窗改成竖排表单）。原型↔框架的类名对照见下表与 `visual-parity.md`。
>
> **完整可运行范本：框架里的 `src/views/BM/SP/BMSP01.vue` + `bmsp01Api.js`，直接照抄它的结构。**

原型类名 → 框架公用类（机械替换）：

| 原型 (app.css) | 框架 (prototype-parity.scss) | 备注 |
|---|---|---|
| `card` / `list-card` | `prototype-card` / `prototype-card prototype-list-card` | 用 `<div>`，**不要**用 `a-card` 默认头/体 |
| `card-head` / `list-toolbar` | `prototype-card-head` / `prototype-list-toolbar` | 标题栏显式写 |
| `title`(含 `.bar`) / `actions` | `prototype-title` / `prototype-actions` | 竖条用 `::before` 自带 |
| `query-grid` / `form-item` / `label .req` | `prototype-query-grid` / `prototype-field` / `.req` | 4 列网格，**别改 inline form** |
| `stat-row` / `stat-card`(含 `.dot/.num`) | `prototype-stat-row` / `prototype-stat-card` | 统计卡片保留 |
| `batch-bar` / `status-tabs` / `status-tab` | `prototype-batch-bar` / `prototype-status-tabs` / `prototype-status-tab` | 批量栏 + 状态页签保留 |
| `table-wrap` + `table` | `prototype-table-wrap prototype-table` 包 `a-table` | 表头/行高/底色由公用层还原 |
| `tag.<status>` | `<a-tag :class="['status-tag', status]">` | 同色小圆点由公用层 `::before` 还原 |
| `op blue/green/red` | `<a class="prototype-op blue/green/red">` | 行内操作链接 |
| `pager` | `a-table` 的 `:pagination`（`showTotal:t=>\`共 ${t} 条\``） | 用表格内置分页 |
| `modal-body`(2 列) | `a-form layout="vertical"` 内套 `.prototype-modal-form` | 2 列网格表单 |
| 原生 `input/select/日期范围/全选 checkbox` | `a-input` / `a-select` / `a-range-picker` / `a-table` 的 `row-selection` | 控件换成 AntD |

骨架（节选，完整见 BMSP01.vue）：

```vue
<template>
  <div class="prototype-page">
    <!-- 统计卡片（联动 filter.status） -->
    <div class="prototype-stat-row">
      <div v-for="s in statList" :key="s.key" class="prototype-stat-card"
           :class="{ active: filter.status === s.key }" @click="onStatusChange(s.key)">
        <div class="label"><span v-if="s.color" class="dot" :style="{ background: s.color }"></span>{{ s.label }}</div>
        <div class="num">{{ counts[s.key] || 0 }}</div>
      </div>
    </div>

    <!-- 查询卡片：4 列网格，不要用 inline form -->
    <div class="prototype-card">
      <div class="prototype-card-head">
        <div class="prototype-title">查询信息</div>
        <div class="prototype-actions">
          <a-button @click="onReset"><template #icon><a-icon type="reload" /></template>重置</a-button>
          <a-button type="primary" @click="onSearch"><template #icon><a-icon type="search" /></template>查询</a-button>
        </div>
      </div>
      <div class="prototype-query-grid">
        <div class="prototype-field"><label>申请单号</label><a-input v-model:value="filter.no" allow-clear /></div>
        <div class="prototype-field"><label>供应商名称<span class="req">*</span></label><a-input v-model:value="filter.name" allow-clear /></div>
        <!-- a-select / a-range-picker 同理，逐字段对应原型 form-item -->
      </div>
    </div>

    <!-- 列表卡片 -->
    <div class="prototype-card prototype-list-card">
      <div class="prototype-list-toolbar"> <div class="prototype-title">…清单</div> <div class="prototype-actions"> … </div> </div>
      <div v-if="selectedRowKeys.length" class="prototype-batch-bar"> 已选择 <b>{{ selectedRowKeys.length }}</b> 项 … </div>
      <div class="prototype-status-tabs">
        <div v-for="s in statList" :key="s.key" class="prototype-status-tab"
             :class="{ active: filter.status === s.key }" @click="onStatusChange(s.key)">{{ s.label }} ({{ counts[s.key] || 0 }})</div>
      </div>
      <div class="prototype-table-wrap prototype-table">
        <a-table :columns="columns" :data-source="rows" :loading="loading" :pagination="pagination"
                 :row-selection="{ selectedRowKeys, onChange: keys => (selectedRowKeys = keys) }"
                 :scroll="{ x: 1100 }" row-key="id" @change="onTableChange">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'no'"><a class="prototype-link" @click="goDetail">{{ text }}</a></template>
            <template v-else-if="column.dataIndex === 'status'"><a-tag :class="['status-tag', text]">{{ statusText(text) }}</a-tag></template>
            <template v-else-if="column.key === 'action'">
              <a class="prototype-op blue" @click="openEdit(record)">编辑</a>
              <a class="prototype-op red" @click="onDelete(record)">删除</a>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 弹窗：2 列网格表单（对齐原型 modal-body） -->
    <a-modal v-model:open="modalVisible" :confirm-loading="saving" @ok="onSave">
      <a-form ref="form" :model="editing" :rules="rules" layout="vertical">
        <div class="prototype-modal-form">
          <a-form-item label="供应商名称" name="name"><a-input v-model:value="editing.name" /></a-form-item>
          <!-- 其余字段… -->
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { queryXxx, saveXxx } from './bmsp01Api'
export default {
  name: 'BMSP01',
  data() {
    return {
      loading:false, rows:[], counts:{}, filter:{ status:'all' },
      pagination:{ current:1, pageSize:20, total:0, showTotal:t=>`共 ${t} 条` },
      selectedRowKeys:[], modalVisible:false, editing:{},
      columns:[
        { title:'序号', key:'idx', align:'center', customRender:({ index }) => index + 1 },
        { title:'申请单号', dataIndex:'no', align:'center' },
        { title:'申请状态', dataIndex:'status', align:'center' },
        { title:'操作', key:'action', align:'center' }
      ]
    }
  },
  created() { this.fetch() },
  methods: {
    async onSave() {
      try { await this.$refs.form.validate() } catch (e) { return }   // AntD4 validate() 返回 Promise
      // … saveXxx …
    }
    // fetch / onSearch / onReset / onStatusChange / onTableChange / openEdit …
  }
}
</script>

<style lang="scss" scoped>
/* 通常无需自带样式：布局/卡片/网格/表格/标签/操作链接全部来自 prototype-parity.scss。
   只在确有页面专属微调时才写，颜色用 $变量，AntD 皮肤用 :deep(.ant-table)。 */
</style>
```

要点（与 Vue2 版的差异 + 高保真，**必须遵守**）：
- **高保真**：保留原型的分区顺序/统计卡片/查询网格/状态页签/批量栏/表格密度/操作位置/弹窗 2 列布局；用 `prototype-*` 公用类，别用 AntD 默认布局重画。
- 输入双向绑定：`v-model:value`（不是 `v-model`）。
- 表单：`<a-form>` + `<a-form-item name="字段">`（AntD4 合并了 `a-form-model`；校验字段用 `name`，不是 `prop`）。
- 表格自定义单元格：统一 `#bodyCell="{ column, text, record, index }"` 插槽，按 `column.dataIndex`/`column.key` 分支（不再用 per-column `scopedSlots`）。
- 列 `customRender` 入参为对象 `({ text, record, index, column })`。
- 弹窗显隐：`v-model:open`（`visible` 已废弃）。
- 按钮图标：`<a-button><template #icon><a-icon type="reload" /></template>…</a-button>`。
- 图标：`<a-icon type="form" />` 仍可用（靠 `AIcon.js` 兼容层映射到 `FormOutlined`）。
- 深度样式：`:deep(.ant-table)`（不是 `::v-deep`）。
- 轻提示/确认框：`this.$message.*`、`this.$confirm(...)` 仍可用（`app.use(Antd)` 注册了全局属性）。

---

## 7. 数据层 Api.js（第一版：本地 mock）

照 `bmsp01Api.js`：导出 `queryXxx({filter, offset, limit})` 返回 `{ rows, count }`，数据来自文件内 `MOCK_DATA` 常量 + 本地过滤/分页。`save/delete` 可先留桩或本地模拟。

```js
const MOCK_DATA = [ /* 覆盖各状态/类型的样例行 */ ]
export async function queryXxx({ filter={}, offset=0, limit=20 } = {}) {
  let list = [...MOCK_DATA]
  // 按 filter 本地过滤…
  return { rows: list.slice(offset, offset+limit), count: list.length }
}
```

> 第二版接真后端时，改成 `request({ url:'/psm/service/BMSP01/query', … })` 走 EiInfo（条件→`inqu_status`、数据→`result`、字段顺序与后端对齐）。本版不做。

---

## 8. Ant Design Vue 4 能力对照（避免造不存在的 API）

| 原型效果 | AntD Vue 4 实现 |
|---|---|
| 数据表格 | `a-table`（`columns` + `data-source` + `row-key`） |
| 单元格自定义 | 统一插槽 `#bodyCell="{ column, text, record, index }"` |
| 行选 / 批量 | `a-table` 的 `row-selection` |
| 列筛选 / 排序 | column 的 `filters` + `onFilter`、`sorter` |
| 固定列 | column 的 `fixed:'left'|'right'` + table `:scroll="{x}"` |
| 表头吸顶 | table `:scroll="{ y }"`（区域内滚动） |
| 分页 | `a-table` 的 `pagination` 对象（`showTotal/showSizeChanger/showQuickJumper`） |
| 加载/骨架 | table `:loading`；或 `a-skeleton` |
| 状态标签 | `a-tag`（颜色用 class + `$变量` 覆盖） |
| 表单 + 校验 | `a-form`(`:model`/`:rules`/`ref`) + `a-form-item`(`name`)；`ref.validate()` 返回 Promise；或 `@finish` |
| 输入双向绑定 | `v-model:value`（input/select/datepicker 等同理） |
| 弹窗 | `a-modal`(`v-model:open`) |
| 图标 | `@ant-design/icons-vue` 的 `*Outlined`；本框架另有 `<a-icon type="...">` 兼容层 |
| 轻提示 | `this.$message.success/info/warning/error` |
| 确认框 | `this.$confirm({...})` |
| 日期范围 | `a-range-picker`（值是 dayjs 对象，框架已 `dayjs.locale('zh-cn')`） |

---

## 9. 验收口径

- 启动：`npm run serve:mock`，用 mock 账号登录。
- 通过标准（**契约级，非像素级**）：
  1. 左侧菜单出现该页 → 点开是真实页面（非占位）。
  2. 查询/重置/分页/行选可用。
  3. 所有按钮点击有反应；弹窗能开能关；跳转 `$router.push` 能走。
  4. 视觉与原型在容差内一致（主色/间距/状态色一致即可）。
  5. 无控制台报错、无 `EF*`/`xrvue` 痕迹、无 `v-model`(应为 `v-model:value`)/`scopedSlots`(应为 `#bodyCell`) 等 Vue2 残留写法。

---

## 10. 原型站点 ↔ 演示框架 镜像 + 命名对接（关键）

> **两侧命名不同，靠编码桥接**：静态站点文件名用**中文**（方便查找）；Vue 文件名用**英文编码**（Vue 硬约束）。转换时**按 `data-page` 编码推导 Vue 英文路径**，把静态页的中文名写进 `formCname`（菜单显示）。

| 原型站点（中文） | ↔ | 演示框架 Vue（英文编码） |
|---|---|---|
| `index.html`（外壳） | ↔ | `BasicLayout.vue` + SideMenu + MultiTab（**已存在，不用动**） |
| `assets/app.css`、`assets/{shell,page-runtime}.js` | ↔ | `variables.scss`/全局样式 + 框架运行时（**已存在，不用动**） |
| `pages/<分组中文>/<页面中文名>.html`（业务片段，内含 `data-page=编码`） | ↔ | `src/views/<模块>/<子模块>/<编码>.vue`（**按编码推导，英文**） |
| 业务页内 `MOCK_DATA` + `render` | ↔ | `<编码小写>Api.js`（`MOCK_DATA` + `queryXxx`） |
| `menu.config.js` 一条 `{code,cname,group,icon,file}` | ↔ | `menu.js` 一条 `{groupEname:模块, groupCname:分组中文, formEname:code, formCname:cname, formLoadPath:'/views/模块/子模块/code'}` |
| `data-page="<编码>"` | ↔ | `.vue` 文件名 / 组件 `name` / 路由 `/<编码>`（全英文编码） |
| 页面中文名（文件名 + `cname`） | ↔ | `formCname`（菜单/页签显示） |
| `data-nav="<编码>"` | ↔ | `this.$router.push('/<编码>')` |

对接示例：静态 `pages/基础信息管理/供应商准入申请.html`（`data-page=BMSP01`）
→ Vue `views/BM/SP/BMSP01.vue` + `bmsp01Api.js`，menu `{groupCname:'基础信息管理', formEname:'BMSP01', formCname:'供应商准入申请', formLoadPath:'/views/BM/SP/BMSP01'}`。

> 因此**只需转 `pages/**/*.html` 和合并 `menu.config.js`**；外壳/样式/运行时这些"框架级"东西演示框架早已具备，转换时一律不碰。模块/子模块由编码前 4 位推出（BMSP01→BM/SP），中文名只进 `formCname`。
