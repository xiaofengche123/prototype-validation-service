/* ============================================================================
   原型站点 —— 菜单注册表（唯一真源）
   ↔ psm-ui 对应：src/mock/data/menu.js 的 menuRows
   命名约定（全链路中文 + 英文编码做内部标识）：
     - 文件夹 = 菜单分组中文名；页面文件 = 页面中文名（方便按菜单查找）
     - code  —— 英文编码(大写)，页面内 data-page 用它；转 Vue 时作路由名/组件名
     - cname —— 页面中文名（== 文件名，不含 .html）
     - file  —— 相对 pages/ 的路径 = '<分组中文>/<页面中文名>.html'
   新增一页：在对应分组 children 里加一条 { code, cname, icon, file }
   幂等约定：同 code 视为同一页，重复登记时更新而非追加。
   ============================================================================ */
window.MENU = [
  {
    group: '基础信息管理', icon: '🗂️', children: [
      { code: 'BMSP01', cname: '供应商准入申请', icon: 'form', file: '基础信息管理/供应商准入申请.html' },
      { code: 'BMSP02', cname: '供应商证照管理', icon: 'file-protect', file: '基础信息管理/供应商证照管理.html' },
      { code: 'BMSP02-DETAIL', cname: '供应商证照详情', icon: 'file-search', file: '基础信息管理/供应商证照详情.html' },
      { code: 'BMSP02-ALERT', cname: '证照到期提醒看板', icon: 'alert', file: '基础信息管理/证照到期提醒看板.html' },
      { code: 'BMSP02-RENEW', cname: '证照续期申请', icon: 'form', file: '基础信息管理/证照续期申请.html' },
      { code: 'BMSP01-ADD', cname: '供应商准入申请填报', icon: 'form', file: '基础信息管理/供应商准入申请填报.html' }
    ]
  },
  { group: '系统平台', icon: '🖥️', children: [] },
  { group: '计划管理', icon: '📋', children: [] },
  { group: '合同管理', icon: '📄', children: [] }
];
