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
    group: '首页', icon: '🏠', children: [
      { code: 'HOME01', cname: '首页', icon: 'home', file: '首页/首页.html' }
    ]
  },
  {
    group: '风险驾驶舱', icon: '📈', children: [
      { code: 'FXLSC01', cname: '风险驾驶舱', icon: 'dashboard', file: '风险驾驶舱/风险驾驶舱.html' },
      { code: 'FXZL01', cname: '风险总览', icon: 'dashboard', file: '风险驾驶舱/风险总览.html' },
      { code: 'BMPM01', cname: '部门排名', icon: 'bar-chart', file: '风险驾驶舱/部门排名.html' }
    ]
  },
  {
    group: '风险事件池', icon: '📋', children: [
      { code: 'FXSJ01', cname: '风险事件池', icon: 'file-text', file: '风险事件池/风险事件池.html' }
    ]
  },
  {
    group: '我的工作台', icon: '💼', children: [
      { code: 'WDGZ01', cname: '我的工作台', icon: 'desktop', file: '我的工作台/我的工作台.html' }
    ]
  },
  {
    group: '任务管理', icon: '🚀', children: [
      { code: 'RWJSC01', cname: '任务驾驶舱', icon: 'dashboard', file: '任务管理/任务驾驶舱.html' },
      { code: 'RWGL01', cname: '任务管理列表', icon: 'unordered-list', file: '任务管理/任务管理列表.html' }
    ]
  },
  {
    group: '验收审核', icon: '✅', children: [
      { code: 'YSSH01', cname: '验收审核', icon: 'check-circle', file: '验收审核/验收审核.html' }
    ]
  },
  {
    group: '超期督办', icon: '📢', children: [
      { code: 'CQDB01', cname: '超期督办', icon: 'notification', file: '超期督办/超期督办.html' }
    ]
  },
  {
    group: '知识库', icon: '📖', children: [
      { code: 'ZSK01', cname: '知识库', icon: 'book', file: '知识库/知识库.html' }
    ]
  },
  {
    group: '统计分析', icon: '📊', children: [
      { code: 'TJFX01', cname: '统计分析', icon: 'bar-chart', file: '统计分析/统计分析.html' }
    ]
  }
];
