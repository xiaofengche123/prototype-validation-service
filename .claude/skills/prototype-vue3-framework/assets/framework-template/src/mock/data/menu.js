// 动态路由 / 菜单 数据（演示框架的菜单真源）
// ↔ 原型站点的 menu.config.js；「原型转Vue」把页面转进来时往这里加一行。
// 命名约定（Vue 侧用英文编码命名，菜单显示用中文）：
//   groupEname            —— 分组英文短码（聚拢同组路由 + views 文件夹名，如 BM）
//   groupCname            —— 分组中文名（左菜单折叠组显示名）
//   formEname             —— 页面英文编码(大写)：== .vue 文件名 == 路由名/路径 /BMSP01（🔴 三者必须一致）
//   formCname             —— 页面中文名（菜单/页签显示名）
//   formLoadPath          —— '/views/<模块>/<子模块>/<编码>'，适配层 split('/').slice(2) → import('@/views/<模块>/<子模块>/<编码>.vue')
//   fullTitle / sort      —— 完整标题 / 组内排序
// 🔴 关键约束：formEname == .vue 文件名（大写）== 编码，否则 formLoadPath 找不到组件、页面打不开。
// 幂等：同 formEname 视为同一页，重复登记时更新而非追加。
export const menuRows = [
  {
    groupEname: 'BM',
    groupCname: '基础信息管理',
    formEname: 'BMSP01',
    formCname: '供应商准入申请',
    formLoadPath: '/views/BM/SP/BMSP01',
    fullTitle: '基础信息管理 / 供应商准入申请',
    icon: 'form',
    sort: 10
  }
  // ← 「原型转Vue」新增的页面追加到这里
]

// 按钮级权限（演示框架暂不使用，预留）
export const buttonRows = []
