/**
 * 路径A 取值脚本 — 在源系统真实页面的浏览器控制台整段粘贴执行。
 * 输出一份 computed style 取值 JSON（控制台打印 + 尝试复制到剪贴板），
 * 存入风格包 sources/ 目录作为 measured:computed-style 的证据。
 *
 * 用法：
 * 1. 打开源系统一张典型列表页（有卡片、查询区、表格、按钮、状态标签）。
 * 2. 按需修改下方 SELECTORS 里的选择器为源系统的实际类名/结构。
 * 3. 整段粘贴到 DevTools Console 回车；把输出 JSON 存为
 *    style-packs/<pack-id>/sources/measured-<页面名>-<日期>.json
 * 4. 对每个值在契约里标注出处 measured:computed-style。
 */
(function measureTokens() {
  // ↓↓↓ 按源系统实际结构修改这些选择器 ↓↓↓
  var SELECTORS = {
    '顶栏': 'header, .top-header, .navbar, .el-header',
    '侧栏': 'aside, .sidebar, .el-aside, .ant-layout-sider',
    '卡片': '.card, .el-card, .ant-card, .box-card',
    '卡片头': '.card-head, .el-card__header, .ant-card-head',
    '主按钮': '.el-button--primary, .ant-btn-primary, button.primary',
    '普通按钮': '.el-button, .ant-btn, button',
    '输入框': '.el-input__inner, .ant-input, input[type=text]',
    '表头单元格': 'thead th, .el-table__header th, .ant-table-thead th',
    '表体单元格': 'tbody td, .el-table__body td, .ant-table-tbody td',
    '状态标签': '.el-tag, .ant-tag, .tag, .status-tag',
    '分页区': '.el-pagination, .ant-pagination, .pager',
    '弹窗': '.el-dialog, .ant-modal-content',
  };
  var PROPS = [
    'height', 'minHeight', 'lineHeight', 'padding', 'margin',
    'fontSize', 'fontWeight', 'color', 'backgroundColor',
    'border', 'borderBottom', 'borderRadius', 'boxShadow',
    'display', 'gap', 'gridTemplateColumns', 'textAlign', 'width',
  ];
  var out = { url: location.href, date: new Date().toISOString(), items: {} };
  Object.keys(SELECTORS).forEach(function (name) {
    var el = document.querySelector(SELECTORS[name]);
    if (!el) { out.items[name] = { selector: SELECTORS[name], found: false }; return; }
    var cs = getComputedStyle(el);
    var rec = { selector: SELECTORS[name], found: true, rect: el.getBoundingClientRect().toJSON(), style: {} };
    PROPS.forEach(function (p) { rec.style[p] = cs[p]; });
    out.items[name] = rec;
  });
  // 主色候选：扫描页面上出现频率最高的非灰饱和色（背景/文字/边框）
  var colorCount = {};
  Array.prototype.slice.call(document.querySelectorAll('button, a, th, .active, [class*=primary], [class*=tag]'), 0, 400)
    .forEach(function (el) {
      var cs = getComputedStyle(el);
      [cs.color, cs.backgroundColor, cs.borderColor].forEach(function (c) {
        if (!c || c === 'rgba(0, 0, 0, 0)' || /rgb\((\d+), \1, \1\)/.test(c)) return;
        colorCount[c] = (colorCount[c] || 0) + 1;
      });
    });
  out.colorCandidates = Object.keys(colorCount)
    .map(function (c) { return { color: c, count: colorCount[c] }; })
    .sort(function (a, b) { return b.count - a.count; })
    .slice(0, 15);
  var json = JSON.stringify(out, null, 2);
  console.log(json);
  try { copy(json); console.log('>>> 已复制到剪贴板'); } catch (e) { console.log('>>> copy() 不可用，请手动复制上方 JSON'); }
  return '取值完成，共 ' + Object.keys(out.items).length + ' 项';
})();
