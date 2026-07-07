/* ============================================================================
   原型站点 —— 业务页通用运行时（每个 pages/*.html 用 <script src> 引入）
   职责：把 IR 标记(data-action/data-modal/data-nav)落成统一演示行为。
   ↔ psm-ui 对应：这些行为转 Vue 时变成 methods / a-modal / $router.push。
   用法：业务页脚本里
     PR.on('search', render);              // 注册本页自定义/需联动的动作
     PR.on('reset', () => { ...; render() });
     render(); PR.bindActions();           // 渲染完调用一次 bindActions
   ============================================================================ */
(function () {
  var inShell = window.self !== window.top;
  if (inShell) document.documentElement.classList.add('in-shell');

  /* ---------- 弹窗 ---------- */
  function openModal(id) { var m = document.getElementById(id + 'Mask') || qModal(id); if (m) m.classList.add('show'); }
  function closeModal(id) { var m = document.getElementById(id + 'Mask') || qModal(id); if (m) m.classList.remove('show'); }
  function qModal(id) { return document.querySelector('[data-modal="' + id + '"]'); }

  /* ---------- 轻提示（外壳内则交给外壳顶层显示）---------- */
  function toast(m) {
    if (inShell) { parent.postMessage({ type: 'toast', msg: m }, '*'); return; }
    var t = document.createElement('div'); t.className = 'pr-toast'; t.textContent = m;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1200);
  }

  /* ---------- 跳转：外壳内 postMessage 给外壳按菜单切页；独立预览时给提示 ---------- */
  function nav(code) {
    if (inShell) parent.postMessage({ type: 'nav', code: code }, '*');
    else toast('独立预览模式，整站联动请在 index.html 中查看（目标：' + code + '）');
  }

  /* ---------- 默认动作表（保留动作，转 Vue 时有标准实现）---------- */
  var ACTION = {
    'open-add': function (e) { openModal(e.dataset.modalTarget || 'editForm'); },
    'open-edit': function (e) { openModal(e.dataset.modalTarget || 'editForm'); },
    'close-modal': function (e) { closeModal(e.dataset.modalTarget || 'editForm'); },
    'save': function (e) { closeModal(e.dataset.modalTarget || 'editForm'); toast('已保存'); },
    'delete-row': function () { if (confirm('确认删除？')) toast('已删除'); },
    'open-view': function () { toast('查看明细'); }
    // search/reset 等需联动渲染的动作，由业务页用 PR.on(...) 注册
  };

  /* ---------- 绑定（幂等，可重复调用）---------- */
  function bindActions() {
    document.querySelectorAll('[data-action]').forEach(function (el) {
      if (el._b) return; el._b = 1;
      el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var fn = ACTION[el.dataset.action];
        fn ? fn(el, ev) : toast('「' + el.dataset.action + '」待实现');
      });
    });
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      if (el._b) return; el._b = 1;
      el.addEventListener('click', function () { nav(el.dataset.nav); });
    });
  }

  window.PR = {
    on: function (name, fn) { ACTION[name] = fn; return this; },
    bindActions: bindActions,
    openModal: openModal,
    closeModal: closeModal,
    toast: toast,
    nav: nav
  };

  document.addEventListener('DOMContentLoaded', bindActions);
})();
