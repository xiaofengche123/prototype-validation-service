# 交互契约 IR 规范（站点版）

> 用途：原型业务页与 Vue 转化之间的**接缝契约**。原型按本规范给可交互元素打标记，转 Vue 时**机械翻译**成真实逻辑，保证「原型点了有反应 → Vue 也有反应」。
> 设计原则：**刻意做小**。只 4 个标记，宁可桩逻辑简单，也要点了有反应、迁移不丢逻辑。
> 站点版变化：业务页已与外壳**结构性分离**（页面文件里只有业务内容），所以"剥壳"不再是一道脏活；`data-nav` 在站点里走 `postMessage` 通知外壳切页。

---

## 0. 为什么需要它

原型里的交互如果只是 `onclick="alert()"` 或写死的 `<div>`，转 Vue 时没有可翻译的结构 → 弹窗点了没反应、跳转变死链，迁移就被判失败。
解决办法：原型阶段就用**标准标记**声明"这个元素要干什么"，转化器照标记生成真实 Vue 逻辑。通用行为由 `assets/page-runtime.js` 的 `PR.*` 统一提供（`bindActions/toast/openModal/closeModal/nav`）。

---

## 1. 四个标记总览

| 标记 | 加在哪 | 声明的意图 | 转 Vue 后变成 |
|---|---|---|---|
| `data-page` | 业务区根节点（**唯一**） | 页面编码 | 推导文件名/路径/路由/menu 条目；也是转化器的取料锚点 |
| `data-action` | 按钮 / 可点元素 | 触发一个动作 | `methods` 里同名方法 + 桩逻辑 |
| `data-modal` | 弹窗容器 | 这是个对话框 | `a-modal` + `v-model:open` 状态 |
| `data-nav` | 可跳转元素 | 跳到另一个页面 | `this.$router.push('/编码')` |

> 没有更多标记。`data-action` 已能覆盖"打开弹窗、查询、保存、删除、导出、提示"等绝大多数动作。

---

## 2. 逐个定义

### 2.1 `data-page` —— 页面编码（每页一个，放业务区根）

```html
<div id="page-content" data-page="BMSP01">…业务内容…</div>
```

- 值 = 页面**英文编码**（大写）。新编码为 4 个字母 + 2 个数字；沿用旧系统编码兼容 `^[A-Z]{2,6}[0-9]{2}$`。转化器按编码字母部分推导英文 Vue 路径：去掉末尾 2 位数字，前 2 字母为模块，其余字母为子模块：
  `views/BM/SP/BMSP01.vue`（🔴 文件名大写 == 编码）、`bmsp01Api.js`、路由 `/BMSP01`、menu `formEname:'BMSP01'` + `formLoadPath:'/views/BM/SP/BMSP01'`；页面中文名进 `formCname`（详见画像 §4/§10）。
- **必填**。缺失时转化器问一次使用者。
- 站点版里业务页文件本就只含业务内容（外壳在 `index.html`），转 Vue 时取 `data-page` 容器内内容即可，**无需再剥外壳**。

### 2.2 `data-action` —— 按钮动作

```html
<button class="btn btn-primary" data-action="search">查询</button>
<button class="btn" data-action="reset">重置</button>
<button class="btn" data-action="open-add" data-modal-target="editForm">新增</button>
<a data-action="open-edit" data-modal-target="editForm">编辑</a>
<a data-action="delete-row">删除</a>
<button class="btn" data-action="batch-export">批量导出</button>
```

- 值用 **kebab-case 动词短语**，转 Vue 时映射成 camelCase 方法名：`open-edit` → `methods.openEdit`。
- **保留动作名**（转化器认识、直接生成标准实现）：

  | data-action | 原型 page-runtime 行为 | 生成的 Vue 标准实现 |
  |---|---|---|
  | `search` | 业页 `PR.on('search', render)` | `onSearch()`：回到第 1 页并 `fetch()` |
  | `reset` | 业页 `PR.on('reset', …)` | `onReset()`：清空 filter 后 `onSearch()` |
  | `open-add` | 默认开 `editForm` 弹窗 | `openAdd()`：清空 editing → `modalVisible=true` |
  | `open-edit` | 默认开 `editForm` 弹窗 | `openEdit(record)`：填充 editing → `modalVisible=true` |
  | `save` | 关弹窗 + toast | `onSave()`：校验 → 调 Api save → 关弹窗 → 刷新 |
  | `delete-row` | confirm + toast | `onDelete(record)`：`$confirm` → 调 Api delete → 刷新 |
  | `open-view` | toast | `openView(record)`：查看（桩或跳详情） |
  | `batch-*` | 业页 `PR.on('batch-x', …)` 给 toast | 校验已选 → `$message.info('已选 N 项…')` 桩 |

- **非保留动作名**（业务自定义，如 `recall`/`approve`/`print`）：原型里业页用 `PR.on('recall', ()=>PR.toast('「撤回」待实现'))` 注册（或不注册，自动走"待实现"桩）；转 Vue 生成**同名方法 + 默认桩**：
  ```js
  recall(record) { this.$message.info('「撤回」功能待实现') }
  ```

> 原则：**任何按钮都必须有 `data-action`**。原型作者没指定明确行为的也给一个，默认生成提示桩。绝不允许"点了没反应"的按钮被转过去。

### 2.3 `data-modal` —— 弹窗

```html
<button data-action="open-edit" data-modal-target="editForm">编辑</button>
<div class="modal-mask" id="editFormMask" data-modal="editForm">
  <div class="modal">
    <div class="modal-title">编辑供应商准入申请</div>
    <div class="modal-body"> …表单字段… </div>
    <div class="modal-footer">
      <button data-action="close-modal" data-modal-target="editForm">取消</button>
      <button class="btn-primary" data-action="save" data-modal-target="editForm">确定</button>
    </div>
  </div>
</div>
```

转 Vue：
- `data-modal="editForm"` → 一个 `a-modal v-model:open="editFormVisible"`，内容转成 `a-form` + `a-form-item name`（AntD Vue 4 已把 `a-form-model` 合并进 `a-form`）。
- `open-*` 按钮 → 对应方法里 `this.editFormVisible = true`。
- `close-modal` / `a-modal` 的 `@cancel` → `this.editFormVisible = false`（用 `v-model:open` 时框架自动同步显隐）。
- **验收点**：原型能弹的，Vue 必须也能弹、能关、能确定/取消。

### 2.4 `data-nav` —— 页面跳转

```html
<span class="link" data-nav="BMSP02">查看明细</span>
<button data-action="open-add" data-nav="BMSP03">新增申请</button>
```

- 原型站点里：`PR` 自动处理——在外壳 iframe 内时 `parent.postMessage({type:'nav',code},'*')`，外壳按 `menu.config.js` 的 `file` 字段解析中文路径并切页+开页签；单独打开页面时给"请在 index.html 查看联动"提示。**业务作者只管打 `data-nav="<目标编码>"`，不写任何跳转代码。**
- 转 Vue：`this.$router.push('/<目标编码>')`。目标页没开发 → 走 404/占位，但**不是死链**（语义正确，目标页做出来即通）。
- **不要**用 `location.href='xxx.html'`；统一用 `data-nav="<编码>"`。

---

## 3. 完整示例（一行行对应）

原型业务页片段：
```html
<div id="page-content" data-page="BMSP01">
  <button class="btn btn-primary" data-action="open-add" data-modal-target="editForm">新增申请</button>
  <table> …
    <span class="link" data-nav="BMSP02">ZRSQ202410001</span>   <!-- 单号跳占位详情页（BMSP02 未注册 menu） -->
    <button data-action="open-edit" data-modal-target="editForm">编辑</button>
    <button data-action="delete-row">删除</button>
    <button data-action="recall">撤回</button>                          <!-- 自定义动作 -->
  </table>
  <div class="modal-mask" data-modal="editForm"> …表单… <button data-action="save">确定</button></div>
</div>
<script src="../assets/page-runtime.js"></script>
<script> PR.on('search', render); PR.on('recall', ()=>PR.toast('「撤回」待实现')); render(); </script>
```

转出的 Vue methods（示意）：
```js
methods: {
  openAdd()   { this.editing = {}; this.editFormVisible = true },
  openEdit(r) { this.editing = { ...r }; this.editFormVisible = true },
  onDelete(r) { this.$confirm({ title:'确认删除？', onOk: () => {/* api.delete */ this.fetch()} }) },
  recall(r)   { this.$message.info('「撤回」功能待实现') },
  async onSave() { try { await this.$refs.form.validate() } catch (e) { return } /* api.save */ this.editFormVisible = false; this.fetch() },  // AntD4 validate() 返回 Promise
  goDetail(r) { this.$router.push('/BMSP02') }  // BMSP02 为占位详情页，未注册 menu
}
```

---

## 4. 转化器自检清单（针对 IR）

- [ ] 业务区有且仅有一个 `data-page`。
- [ ] **每个**按钮/可点元素都有对应 `method`（无"裸 onclick"残留）。
- [ ] 每个 `data-modal` 都转成了 `a-modal` 且有 `v-model:open` 绑定，能开能关。
- [ ] 每个 `data-nav` 都转成了 `$router.push`，无 `location.href`、无残留 `postMessage`。
- [ ] 自定义动作生成了同名方法 + 提示桩（点了有反应）。

---

## 5. 与项目画像的关系

- 编码推导、文件路径、menu 登记 → 见 `psm-ui-profile.md` §4/§5。
- 组件映射（按钮→`a-button`、弹窗→`a-modal` 等）→ 见画像 §6/§8。
- 本规范只管"交互意图标记"这一层；样式/组件/命名归画像管。
- 🔴 转换目标是 **Vue 3 + Ant Design Vue 4** 框架（`erp-prototype-vue3-framework` 生成）。生成 `.vue` 时一律用 Vue3/AntD4 写法：`v-model:value`、`<a-form>`+`<a-form-item name>`、表格 `#bodyCell` 插槽、`v-model:open` 弹窗、`:deep()`、按钮 `#icon` 插槽。详见画像 §6/§8。
