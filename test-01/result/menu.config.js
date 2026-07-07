/* ============================================================================
   绿星智审-审计监督模型 原型站点菜单注册表
   命名约定：
     - 文件夹 = 菜单分组中文名；页面文件 = 页面中文名
     - code  —— 英文编码(大写)，与页面内 data-page 一致
     - cname —— 页面中文名
     - file  —— 相对 pages/ 的路径 '<分组中文>/<页面中文名>.html'
   幂等约定：同 code 视为同一页，重复登记时更新而非追加。
   当前策略：仅展示已生成页面的菜单条目。
   ============================================================================ */
window.MENU = [
  {
    group: '模型中心', icon: '⚙️', children: [
      { code: 'MXLIST', cname: '模型列表', icon: 'list', file: '模型中心/模型列表.html' },
      { code: 'MXGZ01', cname: '规则配置管理', icon: 'rule', file: '模型中心/规则引擎/规则配置管理.html' },
      { code: 'MXCK01', cname: '指标管理', icon: 'indicator', file: '模型中心/模型仓库/指标管理.html' },
      { code: 'MXCK02', cname: '指标新增', icon: 'plus', file: '模型中心/模型仓库/指标新增.html' }
    ]
  },
  {
    group: '风险管理', icon: '📊', children: [
      { code: 'FXKB01', cname: '风险驾驶舱', icon: 'dashboard', file: '风险管理/风险驾驶舱/风险驾驶舱.html' }
    ]
  },
  {
    group: '任务中心', icon: '📋', children: [
      { code: 'RWGL05', cname: '任务驾驶舱', icon: 'dashboard', file: '任务中心/任务驾驶舱.html' },
      { code: 'RWGL02', cname: '任务管理列表', icon: 'list', file: '任务中心/任务管理列表.html' },
      { code: 'RWGL01', cname: '任务创建', icon: 'plus', file: '任务中心/任务创建.html' }
    ]
  }
];
