# 数值核对清单 — <pack-id>@<version>

> 由 `contract.md` §3 逐行生成，是「风格一致」的 **L1 强制机械门**。
> 执行时机：校准第0批、每次回灌后、定版前。任何一项「否」即阻塞，先修投影再继续。
> 比对方法：打开原型侧 `prototype/app.css` 与 Vue 侧 `vue/prototype-parity.scss`（含 `variables.scss` 变量展开值），逐行核对实际值；拿不准的用浏览器 DevTools 在双栈黄金页上量实际渲染值。

执行信息：

| 字段 | 值 |
| --- | --- |
| 执行日期 | |
| 触发原因 | 第0批 / 回灌（CHANGELOG 节号）/ 定版 |
| 契约版本 | |
| 结论 | 全部通过 / 阻塞（列出不一致项） |

## 核对表

> 「契约值」抄自 contract.md §3；「原型侧实际」「Vue侧实际」填核对时看到的值；三者一致打「是」。

| # | 结构类·属性 | 契约值 | 原型侧实际 | Vue侧实际 | 一致 |
| --- | --- | --- | --- | --- | --- |
| 1 | prototype-card·底距 | | | | |
| 2 | prototype-card·边框/圆角/阴影 | | | | |
| 3 | prototype-card-head·高度 | | | | |
| 4 | prototype-card-head·padding | | | | |
| 5 | prototype-title·字号/字重/色条 | | | | |
| 6 | prototype-query-grid·列数/gap/padding | | | | |
| 7 | prototype-query-grid·降列断点 | | | | |
| 8 | prototype-field·label 字号/颜色 | | | | |
| 9 | stat-card·padding/数字字号/active | | | | |
| 10 | status-tab·padding/字号/active | | | | |
| 11 | 表头·高度/底色/文字色/对齐 | | | | |
| 12 | 表行·行高/hover/边框 | | | | |
| 13 | batch-bar·padding/底色 | | | | |
| 14 | pager·高度/边框 | | | | |
| 15 | modal-form·列数/gap | | | | |
| 16 | prototype-cols·轨道/gap/等高/断点 | | | | |
| 17 | fixed-bottom-bar·高度/预留（实现差异见契约§6） | | | | |
| 18 | 按钮·默认/sm 高度/字号 | | | | |
| 19 | 表单控件·min-height/字号 | | | | |
| 20 | Token·primary 系三色 | | | | |
| 21 | Token·状态色板全部键 | | | | |
| 22 | 禁用色·全库 grep 无禁用色值 | —（grep 结果） | | | |

> 按契约 §3 实际行数增删；新增结构类必须同步在此追加行。
