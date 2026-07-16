const fs = require('fs');
const path = require('path');

const root = process.cwd();
let exitCode = 0;
const errors = [];

function fail(msg) {
  errors.push(msg);
  exitCode = 1;
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function isEmbeddedReference(fileName, html) {
  return fileName.startsWith('内嵌-') || html.includes('window.self !== window.top');
}

// C1: menu.config.js 编码格式与唯一性
function checkMenu() {
  const menuPath = path.join(root, 'menu.config.js');
  if (!fs.existsSync(menuPath)) {
    fail('C1: menu.config.js 不存在');
    return;
  }
  const content = fs.readFileSync(menuPath, 'utf-8');
  // 兼容规则：新编码 6 位（2+2+2），旧系统沿用编码允许 2~6 字母 + 2 数字（如 FXGLQD01）
  const codeRegex = /code\s*:\s*['"]([A-Z0-9]+)['"]/g;
  const strictFormat = /^[A-Z]{2}[A-Z]{2}[0-9]{2}$/;
  const legacyFormat = /^[A-Z]{2,6}[0-9]{2}$/;
  const codes = [];
  let m;
  while ((m = codeRegex.exec(content)) !== null) {
    codes.push(m[1]);
  }
  const seen = new Set();
  for (const c of codes) {
    if (!legacyFormat.test(c)) {
      fail(`C1: 编码 ${c} 格式不合规（新编码须 6 位 2+2+2，旧编码兼容 2~6 字母+2 数字）`);
      continue;
    }
    if (seen.has(c)) {
      fail(`C1: 编码 ${c} 在 menu.config.js 中重复`);
    } else {
      seen.add(c);
      ok(`C1: 编码 ${c} ${strictFormat.test(c) ? '格式合规' : '为旧编码（兼容格式）'}且唯一`);
    }
  }
}

// C2: menu 条目与页面文件对应
function checkMenuPageMapping() {
  const menuPath = path.join(root, 'menu.config.js');
  if (!fs.existsSync(menuPath)) return;
  const content = fs.readFileSync(menuPath, 'utf-8');
  const fileRegex = /file\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = fileRegex.exec(content)) !== null) {
    const filePath = path.join(root, 'pages', m[1]);
    if (!fs.existsSync(filePath)) {
      fail(`C2: menu 条目 file="${m[1]}" 指向的页面文件不存在`);
    } else {
      ok(`C2: menu file="${m[1]}" 页面文件存在`);
    }
  }
  // 反向检查：pages 下的每个 html 是否在 menu 中
  const pagesDir = path.join(root, 'pages');
  if (fs.existsSync(pagesDir)) {
    function walk(dir, rel) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name), path.join(rel, entry.name));
        } else if (entry.name.endsWith('.html')) {
          const fileRel = path.join(rel, entry.name).replace(/\\/g, '/');
          if (!content.includes(`'${fileRel}'`) && !content.includes(`"${fileRel}"`)) {
            const html = fs.readFileSync(path.join(dir, entry.name), 'utf-8');
            if (isEmbeddedReference(entry.name, html)) {
              ok(`C2: 内嵌参考文件 ${fileRel} 未注册 menu（符合规则）`);
            } else {
              fail(`C2: 普通页面文件 ${fileRel} 未在 menu.config.js 中注册`);
            }
          } else {
            ok(`C2: 页面文件 ${fileRel} 已注册 menu`);
          }
        }
      }
    }
    walk(pagesDir, '');
  }
}

// C3: 每页有且仅有一个 data-page，值合规且与 menu 一致
function checkDataPage() {
  const pagesDir = path.join(root, 'pages');
  if (!fs.existsSync(pagesDir)) return;
  const menuPath = path.join(root, 'menu.config.js');
  const menuContent = fs.existsSync(menuPath) ? fs.readFileSync(menuPath, 'utf-8') : '';

  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const filePath = path.join(dir, entry.name);
        const html = fs.readFileSync(filePath, 'utf-8');
        if (isEmbeddedReference(entry.name, html)) {
          ok(`C3: 跳过内嵌参考文件 ${path.join(rel, entry.name)}`);
          continue;
        }
        const dpMatches = html.match(/data-page="([A-Z]{2,6}[0-9]{2})"/g);
        if (!dpMatches || dpMatches.length === 0) {
          fail(`C3: ${path.join(rel, entry.name)} 缺少 data-page`);
        } else if (dpMatches.length > 1) {
          fail(`C3: ${path.join(rel, entry.name)} 有多个 data-page`);
        } else {
          const code = dpMatches[0].match(/data-page="([A-Z]{2,6}[0-9]{2})"/)[1];
          if (!menuContent.includes(code)) {
            fail(`C3: ${path.join(rel, entry.name)} data-page="${code}" 未在 menu.config.js 中注册`);
          } else {
            ok(`C3: ${path.join(rel, entry.name)} data-page="${code}" 合规且已注册`);
          }
        }
      }
    }
  }
  walk(pagesDir, '');
}

// C4: data-nav 目标合规，占位已记规格卡
function checkDataNav() {
  const pagesDir = path.join(root, 'pages');
  if (!fs.existsSync(pagesDir)) return;
  const menuPath = path.join(root, 'menu.config.js');
  const menuContent = fs.existsSync(menuPath) ? fs.readFileSync(menuPath, 'utf-8') : '';

  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const filePath = path.join(dir, entry.name);
        const html = fs.readFileSync(filePath, 'utf-8');
        if (isEmbeddedReference(entry.name, html)) {
          ok(`C4: 跳过内嵌参考文件 ${path.join(rel, entry.name)}`);
          continue;
        }
        const navMatches = html.match(/data-nav="([^"]+)"/g) || [];
        for (const nav of navMatches) {
          const target = nav.match(/data-nav="([^"]+)"/)[1];
          if (!/^[A-Z]{2,6}[0-9]{2}$/.test(target)) {
            fail(`C4: ${path.join(rel, entry.name)} data-nav="${target}" 格式不合规（新编码 6 位 2+2+2，旧编码兼容 2~6 字母+2 数字）`);
            continue;
          }
          if (!menuContent.includes(target)) {
            // 占位目标：检查规格卡补位项栏是否含该编码 + "占位"
            const specMatch = html.match(new RegExp('补位项[\\s\\S]*?【补位】[^\\n]*' + target + '[^\\n]*占位'));
            if (!specMatch) {
              fail(`C4: ${path.join(rel, entry.name)} data-nav="${target}" 为占位目标，但规格卡补位项栏未标明"占位"`);
            } else {
              ok(`C4: ${path.join(rel, entry.name)} data-nav="${target}" 占位目标已记入规格卡`);
            }
          } else {
            ok(`C4: ${path.join(rel, entry.name)} data-nav="${target}" 目标已注册 menu`);
          }
        }
      }
    }
  }
  walk(pagesDir, '');
}

// C5: 规格卡含确认项/补位项栏且补位项非空
function checkSpecCard() {
  const pagesDir = path.join(root, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const filePath = path.join(dir, entry.name);
        const html = fs.readFileSync(filePath, 'utf-8');
        if (isEmbeddedReference(entry.name, html)) {
          ok(`C5: 跳过内嵌参考文件 ${path.join(rel, entry.name)}`);
          continue;
        }
        const commentMatch = html.match(/<!--([\s\S]*?)-->/);
        if (!commentMatch) {
          fail(`C5: ${path.join(rel, entry.name)} 无 HTML 注释（规格卡缺失）`);
          continue;
        }
        const comment = commentMatch[1];
        if (!comment.includes('确认项')) {
          fail(`C5: ${path.join(rel, entry.name)} 规格卡缺少"确认项"栏`);
        } else if (!comment.includes('补位项')) {
          fail(`C5: ${path.join(rel, entry.name)} 规格卡缺少"补位项"栏`);
        } else if (!comment.includes('状态key')) {
          fail(`C5: ${path.join(rel, entry.name)} 规格卡缺少"状态key"栏`);
        } else {
          // 补位项非空检查：补位项栏后必须有内容或"无"
          const bufweiMatch = comment.match(/补位项[\s\S]*?(?:─────────────────────────────|$)/);
          if (bufweiMatch) {
            const bufweiContent = bufweiMatch[0].replace(/补位项/, '').trim();
            if (bufweiContent.length === 0 || bufweiContent.length < 5) {
              fail(`C5: ${path.join(rel, entry.name)} 规格卡"补位项"栏为空或内容不足（必须显式写"无"）`);
            } else {
              ok(`C5: ${path.join(rel, entry.name)} 规格卡含状态key/确认项/补位项三栏且补位项非空`);
            }
          } else {
            ok(`C5: ${path.join(rel, entry.name)} 规格卡含状态key/确认项/补位项三栏`);
          }
        }
      }
    }
  }
  walk(pagesDir, '');
}

// C6: 无外壳标记残留、无内联 style、head 只链 app.css
function checkNoShell() {
  const pagesDir = path.join(root, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const filePath = path.join(dir, entry.name);
        const html = fs.readFileSync(filePath, 'utf-8');
        if (isEmbeddedReference(entry.name, html)) {
          ok(`C6: 跳过内嵌参考文件 ${path.join(rel, entry.name)}`);
          continue;
        }
        let passed = true;
        const shellMarks = ['top-header', 'sidebar', 'page-tabs'];
        for (const mark of shellMarks) {
          if (html.includes(mark)) {
            fail(`C6: ${path.join(rel, entry.name)} 残留外壳标记 "${mark}"`);
            passed = false;
          }
        }
        if (html.includes('<style>') || html.includes('<style ')) {
          fail(`C6: ${path.join(rel, entry.name)} 含内联 <style> 块`);
          passed = false;
        }
        const headMatch = html.match(/<head>[\s\S]*?<\/head>/);
        if (headMatch) {
          const head = headMatch[0];
          const cssLinks = head.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
          if (cssLinks.length !== 1) {
            fail(`C6: ${path.join(rel, entry.name)} <head> 必须且只能有一个样式链接（app.css），实际 ${cssLinks.length} 个`);
            passed = false;
          }
          for (const link of cssLinks) {
            if (!/href=["']\.\.\/\.\.\/assets\/app\.css["']/.test(link)) {
              fail(`C6: ${path.join(rel, entry.name)} <head> 引用了非 app.css 的样式：${link}`);
              passed = false;
            }
          }
        } else {
          fail(`C6: ${path.join(rel, entry.name)} 缺少 <head>`);
          passed = false;
        }

        const styleAttrs = [...html.matchAll(/\sstyle\s*=\s*["']([^"']*)["']/gi)];
        const allowedInlineProperties = new Set(['width', 'text-align', 'background', 'background-color']);
        for (const match of styleAttrs) {
          const properties = match[1]
            .split(';')
            .map(part => part.trim())
            .filter(Boolean)
            .map(part => part.split(':', 1)[0].trim().toLowerCase());
          const forbidden = properties.filter(prop => !allowedInlineProperties.has(prop));
          if (forbidden.length > 0) {
            fail(`C6: ${path.join(rel, entry.name)} 含不允许的内联样式属性：${forbidden.join(', ')}（仅允许 width/text-align/background）`);
            passed = false;
          }
        }
        if (passed) {
          ok(`C6: ${path.join(rel, entry.name)} 无外壳残留、无 <style> 块、head 只链 app.css，内联属性在白名单内`);
        }
      }
    }
  }
  walk(pagesDir, '');
}

// C10: theme.css 加载链与皮肤边界
function checkThemeCss() {
  const appPath = path.join(root, 'assets', 'app.css');
  const themePath = path.join(root, 'assets', 'theme.css');
  if (!fs.existsSync(appPath)) {
    fail('C10: assets/app.css 不存在');
    return;
  }
  if (!fs.existsSync(themePath)) {
    fail('C10: assets/theme.css 不存在（B 路线皮肤覆盖无法落盘）');
    return;
  }

  const appCss = fs.readFileSync(appPath, 'utf-8').replace(/^\uFEFF/, '');
  const importMatches = appCss.match(/@import\s+url\(["']?\.\/theme\.css["']?\)\s*;/g) || [];
  if (importMatches.length !== 1 || !appCss.trimStart().startsWith(importMatches[0])) {
    fail('C10: app.css 必须在所有其他规则之前且仅一次导入 ./theme.css');
  } else {
    ok('C10: app.css 已在首部且仅一次导入 theme.css');
  }

  const themeCss = fs.readFileSync(themePath, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
  const layoutProperty = /(?:^|[;{\s])(display|position|width|min-width|max-width|grid|grid-template-columns|grid-template-rows)\s*:/m.exec(themeCss);
  if (layoutProperty) {
    fail(`C10: theme.css 含布局属性 "${layoutProperty[1]}"；theme.css 只能放皮肤覆盖`);
  } else {
    ok('C10: theme.css 未包含禁用的布局属性');
  }
}

// C7: 每个按钮和可点元素都有 data-action 或 data-nav
function checkButtons() {
  const pagesDir = path.join(root, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const filePath = path.join(dir, entry.name);
        const html = fs.readFileSync(filePath, 'utf-8');
        if (isEmbeddedReference(entry.name, html)) {
          ok(`C7: 跳过内嵌参考文件 ${path.join(rel, entry.name)}`);
          continue;
        }
        // 简单解析：找 button 和带 class="link" 或 class="op" 的元素
        const btnRegex = /<button[^>]*>/g;
        const linkRegex = /<a[^>]*class="[^"]*(?:link|op)[^"]*"[^>]*>/g;
        let m;
        const buttons = [];
        while ((m = btnRegex.exec(html)) !== null) buttons.push(m[0]);
        while ((m = linkRegex.exec(html)) !== null) buttons.push(m[0]);
        for (const btn of buttons) {
          if (!btn.includes('data-action') && !btn.includes('data-nav')) {
            const text = btn.match(/>([^<]*)</)?.[1] || btn;
            fail(`C7: ${path.join(rel, entry.name)} 按钮 "${text}" 缺少 data-action 或 data-nav`);
          }
        }
        if (buttons.length > 0) {
          ok(`C7: ${path.join(rel, entry.name)} ${buttons.length} 个可交互元素均有 data-action/data-nav`);
        }
      }
    }
  }
  walk(pagesDir, '');
}

// C8: 无 location.href、无旧主色（#0052d9 / #1565c0）
function checkNoBadPatterns() {
  const pagesDir = path.join(root, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const filePath = path.join(dir, entry.name);
        const html = fs.readFileSync(filePath, 'utf-8');
        if (isEmbeddedReference(entry.name, html)) {
          ok(`C8: 跳过内嵌参考文件 ${path.join(rel, entry.name)}`);
          continue;
        }
        if (html.includes('location.href')) {
          fail(`C8: ${path.join(rel, entry.name)} 含 location.href（应改用 data-nav）`);
        }
        if (html.includes('#0052d9')) {
          fail(`C8: ${path.join(rel, entry.name)} 含旧蓝星蓝 #0052d9（应改用 #1677ff）`);
        }
        if (html.includes('#1565c0')) {
          fail(`C8: ${path.join(rel, entry.name)} 含旧绿星链通主色 #1565c0（本站主色为 #1677ff）`);
        }
        ok(`C8: ${path.join(rel, entry.name)} 无 location.href、无旧主色`);
      }
    }
  }
  walk(pagesDir, '');
}

// C9: 每个 data-modal-target 都有同名 data-modal 容器
function checkModalPairs() {
  const pagesDir = path.join(root, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const filePath = path.join(dir, entry.name);
        const html = fs.readFileSync(filePath, 'utf-8');
        if (isEmbeddedReference(entry.name, html)) {
          ok(`C9: 跳过内嵌参考文件 ${path.join(rel, entry.name)}`);
          continue;
        }
        const targetMatches = html.match(/data-modal-target="([^"]+)"/g) || [];
        const modalMatches = html.match(/data-modal="([^"]+)"/g) || [];
        const targets = targetMatches.map(m => m.match(/data-modal-target="([^"]+)"/)[1]);
        const modals = modalMatches.map(m => m.match(/data-modal="([^"]+)"/)[1]);
        for (const t of targets) {
          if (!modals.includes(t)) {
            fail(`C9: ${path.join(rel, entry.name)} data-modal-target="${t}" 无对应 data-modal="${t}" 容器`);
          } else {
            ok(`C9: ${path.join(rel, entry.name)} data-modal-target="${t}" 配对正确`);
          }
        }
        // 反向检查：每个 data-modal 容器至少有一个触发按钮（否则弹窗永远打不开）
        for (const mdl of modals) {
          if (!targets.includes(mdl) && !html.includes(`openModal('${mdl}')`) && !html.includes(`openModal("${mdl}")`)) {
            fail(`C9: ${path.join(rel, entry.name)} data-modal="${mdl}" 容器没有任何触发入口（缺 data-modal-target 或 PR.openModal 调用）`);
          }
        }
      }
    }
  }
  walk(pagesDir, '');
}

// 执行所有检查
console.log('=== check-site.js 站点校验 ===\n');

checkMenu();
checkMenuPageMapping();
checkDataPage();
checkDataNav();
checkSpecCard();
checkNoShell();
checkButtons();
checkNoBadPatterns();
checkModalPairs();
checkThemeCss();

console.log('\n=== 校验结果 ===');
if (errors.length > 0) {
  console.log(`\n✗ 共 ${errors.length} 项未通过：`);
  for (const e of errors) {
    console.log(`  ✗ ${e}`);
  }
} else {
  console.log('\n✓ 全部通过');
}

process.exit(exitCode);
