/* ============================================================================
   原型站点 —— 外壳运行时（仅 index.html 引用）
   职责：读 menu.config.js 渲染左菜单 → 点菜单/页签切换 iframe → 收子页 data-nav 跳转
   ↔ psm-ui 对应：BasicLayout(顶栏) + SideMenu(菜单) + MultiTab(页签) + router-view
   说明：跨 iframe 只用 postMessage('*')，不做跨框 DOM 直读，规避 file:// 同源限制。
   ============================================================================ */
(function () {
  document.documentElement.classList.add('shell');
  var MENU = window.MENU || [];
  var sidebar = document.getElementById('sidebar');
  var tabList = document.getElementById('tabList');
  var pageTabs = document.querySelector('.page-tabs');
  var tabScrollLeft = document.getElementById('tabScrollLeft');
  var tabScrollRight = document.getElementById('tabScrollRight');
  var frame = document.getElementById('contentFrame');

  // 编码 → {code, cname} 索引 + 编码 → 所属分组序号（含分组下所有页）
  var INDEX = {}, GROUP_OF = {};
  MENU.forEach(function (g, gi) { (g.children || []).forEach(function (it) { INDEX[it.code] = it; GROUP_OF[it.code] = gi; }); });

  var openTabs = []; // [{code, cname}]
  var current = null;

  /* ---------- 渲染左侧菜单 ---------- */
  function renderMenu() {
    sidebar.innerHTML = MENU.map(function (g, gi) {
      var items = (g.children || []).map(function (it) {
        return '<div class="menu-item" data-code="' + it.code + '"><div class="ml">' + (it.cname || it.code) + '</div></div>';
      }).join('');
      return '<div class="menu-group">' +
        '<div class="menu-item ' + (gi === 0 ? 'expanded' : '') + '" data-group="' + gi + '">' +
        '<div class="ml"><span class="mi">' + (g.icon || '📁') + '</span>' + g.group + '</div><span class="arrow">▶</span></div>' +
        '<div class="submenu ' + (gi === 0 ? 'open' : '') + '">' + items + '</div></div>';
    }).join('');

    sidebar.querySelectorAll('.menu-item[data-group]').forEach(function (el) {
      el.addEventListener('click', function () {
        el.classList.toggle('expanded');
        el.nextElementSibling.classList.toggle('open');
      });
    });
    sidebar.querySelectorAll('.menu-item[data-code]').forEach(function (el) {
      el.addEventListener('click', function () { navigate(el.dataset.code); });
    });
  }

  /* ---------- 页签 ---------- */
  function renderTabs() {
    tabList.innerHTML = openTabs.map(function (t) {
      return '<div class="tab-item ' + (t.code === current ? 'active' : '') + '" data-code="' + t.code + '">' +
        t.cname + '<span class="tc" data-close="' + t.code + '">✕</span></div>';
    }).join('');
    tabList.querySelectorAll('.tab-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.dataset.close) { closeTab(e.target.dataset.close); return; }
        navigate(el.dataset.code);
      });
    });
    keepActiveTabVisible();
    updateTabScroll();
    setTimeout(updateTabScroll, 240);
  }

  function updateTabScroll() {
    var max = Math.max(0, tabList.scrollWidth - tabList.clientWidth);
    var has = max > 2;
    if (pageTabs) pageTabs.classList.toggle('has-overflow', has);
    if (tabScrollLeft) tabScrollLeft.disabled = !has || tabList.scrollLeft <= 1;
    if (tabScrollRight) tabScrollRight.disabled = !has || tabList.scrollLeft >= max - 1;
  }

  function scrollTabs(dir) {
    var step = Math.max(180, Math.floor(tabList.clientWidth * 0.65));
    tabList.scrollBy({ left: dir * step, behavior: 'smooth' });
    setTimeout(updateTabScroll, 220);
  }

  function keepActiveTabVisible() {
    var el = tabList.querySelector('.tab-item.active');
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }

  if (tabScrollLeft) tabScrollLeft.addEventListener('click', function () { scrollTabs(-1); });
  if (tabScrollRight) tabScrollRight.addEventListener('click', function () { scrollTabs(1); });
  tabList.addEventListener('scroll', updateTabScroll);
  window.addEventListener('resize', updateTabScroll);

  function closeTab(code) {
    var i = openTabs.findIndex(function (t) { return t.code === code; });
    if (i < 0) return;
    openTabs.splice(i, 1);
    if (current === code) {
      var next = openTabs[i] || openTabs[i - 1];
      if (next) navigate(next.code); else { current = null; frame.src = 'about:blank'; renderTabs(); }
    } else { renderTabs(); }
  }

  /* ---------- 切页（核心）---------- */
  function navigate(code) {
    if (!code || !INDEX[code]) { return; }
    current = code;
    if (!openTabs.some(function (t) { return t.code === code; })) openTabs.push(INDEX[code]);
    // 按菜单登记的中文相对路径切页（file = '<分组中文>/<页面中文名>.html'）
    frame.src = 'pages/' + (INDEX[code].file || (code + '.html'));
    if (location.hash.slice(1) !== code) location.hash = code;
    // 高亮菜单 + 展开所属分组
    sidebar.querySelectorAll('.menu-item[data-code]').forEach(function (el) {
      el.classList.toggle('active', el.dataset.code === code);
    });
    var grpEl = sidebar.querySelector('.menu-item[data-group="' + GROUP_OF[code] + '"]');
    if (grpEl) { grpEl.classList.add('expanded'); grpEl.nextElementSibling.classList.add('open'); }
    renderTabs();
  }

  /* ---------- 收子页跳转 / 提示 ---------- */
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'nav') navigate(d.code);
    else if (d.type === 'toast') toast(d.msg);
  });

  function toast(m) {
    var t = document.createElement('div'); t.className = 'pr-toast'; t.textContent = m;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1200);
  }

  /* ---------- 启动：hash 优先，否则第一页 ---------- */
  renderMenu();
  var start = location.hash.slice(1);
  if (!INDEX[start]) start = (MENU[0] && MENU[0].children && MENU[0].children[0]) ? MENU[0].children[0].code : null;
  if (start) navigate(start);

  window.addEventListener('hashchange', function () {
    var c = location.hash.slice(1);
    if (c && c !== current && INDEX[c]) navigate(c);
  });
})();
