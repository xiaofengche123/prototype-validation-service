const fs = require('fs');
const path = require('path');

// 提示词质量门（html-input-spec.md §3.5）
// 用法（在站点根目录）：
//   node <skill>/assets/check-prompts.js
//   node <skill>/assets/check-prompts.js prompts/<编码>-<页面名>.md [...]
//   node <skill>/assets/check-prompts.js --html-only
// 校验 prompts/*.md 是否达到"高质量提示词"标准；任何 ✗ 都必须修复后才能进入生成。

const root = process.cwd();
const promptsDir = path.join(root, 'prompts');
let exitCode = 0;
const errors = [];

function fail(msg) {
  errors.push(msg);
  exitCode = 1;
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

if (!fs.existsSync(promptsDir)) {
  console.log('prompts/ 目录不存在——无提示词可校验（非批量/非 HTML 输入模式可忽略）');
  process.exit(0);
}

const args = process.argv.slice(2);
const htmlOnly = args.includes('--html-only');
const requested = args.filter(arg => arg !== '--html-only').map(arg => path.basename(arg));
let files = fs.readdirSync(promptsDir).filter(f => f.endsWith('.md'));
if (requested.length > 0) {
  const available = new Set(files);
  for (const f of requested) {
    if (!available.has(f)) {
      fail(`P0: 指定的提示词 prompts/${f} 不存在`);
    }
  }
  const selected = new Set(requested);
  files = files.filter(f => selected.has(f));
}
if (files.length === 0) {
  if (errors.length > 0) {
    console.log(errors.map(e => `✗ ${e}`).join('\n'));
    process.exit(exitCode);
  }
  console.log('没有匹配的 .md 提示词文件');
  process.exit(0);
}

// 模糊词黑名单：出现即说明提取偷懒，细节没抄全
const VAGUE_PATTERNS = [
  { re: /若干/, hint: '"若干" —— 必须写具体数字' },
  { re: /多列|多个字段|多个按钮/, hint: '"多列/多个" —— 必须逐项列出' },
  { re: /下拉筛选(?![：:（(])/, hint: '"下拉筛选"未带选项 —— 必须逐个抄录选项值' },
  { re: /选项略|等等|等选项|……/, hint: '选项被省略 —— 必须逐个抄录' },
  { re: /常见做法|参考通用/, hint: '"常见做法" —— 禁止凭常见做法补位，细节从源文件抄' },
  { re: /同旧版|与原型一致(?!：)/, hint: '"同旧版/与原型一致"是空话 —— 必须写出具体内容' },
];

// 数量守恒清单必须出现的计数行（HTML 输入模式）
const COUNT_LINES = ['查询字段数', '表格', '数据行数', '页签', '弹窗', '操作按钮'];

const PAGE_NATURES = ['配置工具页', '录入页', '查询页', '工作台', '看板'];

for (const f of files) {
  const filePath = path.join(promptsDir, f);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const label = `prompts/${f}`;

  // 判定是否 HTML 输入模式（提示词含“源页面”字样或存在同名 .source.html）
  const sourcePath = path.join(promptsDir, f.replace(/\.md$/, '.source.html'));
  const hasSource = fs.existsSync(sourcePath);
  const isHtmlInput = hasSource || /源页面|数量守恒/.test(content);
  if (htmlOnly && !isHtmlInput) {
    console.log(`- 跳过 ${label}（非 HTML 输入模式）`);
    continue;
  }

  // P1: 文件名编码格式（新 6 位或旧编码兼容 2~6 字母 + 2 数字）
  const nameMatch = f.match(/^([A-Z0-9]+)-/);
  if (!nameMatch || !/^[A-Z]{2,6}[0-9]{2}$/.test(nameMatch[1])) {
    fail(`P1: ${label} 文件名未以合规编码开头（<编码>-<页面名>.md）`);
  } else {
    ok(`P1: ${label} 编码 ${nameMatch[1]} 格式合规`);
  }

  if (isHtmlInput) {
    // P2: 剥壳源文件必须落盘（双输入生成的第二输入）
    if (!hasSource) {
      fail(`P2: ${label} 是 HTML 输入模式但缺少配套剥壳源文件 ${path.basename(sourcePath)}（双输入生成必需）`);
    } else {
      ok(`P2: ${label} 配套剥壳源文件存在`);
    }

    // P3: 数量守恒清单存在且每项有具体数字
    if (!/数量守恒/.test(content)) {
      fail(`P3: ${label} 缺少"数量守恒"清单`);
    } else {
      for (const key of COUNT_LINES) {
        const line = lines.find(l => l.includes(key));
        if (!line) {
          fail(`P3: ${label} 数量守恒清单缺少"${key}"行`);
        } else if (!/\d/.test(line)) {
          fail(`P3: ${label} "${key}"行没有具体数字：${line.trim()}`);
        }
      }
      ok(`P3: ${label} 数量守恒清单已核验`);
    }

    // P4: 长度下限（按剥壳源文件行数的比例要求）
    if (hasSource) {
      const srcLines = fs.readFileSync(sourcePath, 'utf-8').split('\n').length;
      const min = srcLines > 800 ? 200 : srcLines > 300 ? 100 : 40;
      if (lines.length < min) {
        fail(`P4: ${label} 仅 ${lines.length} 行，源文件 ${srcLines} 行要求提示词 ≥${min} 行——疑似摘要式提取，退回重提`);
      } else {
        ok(`P4: ${label} ${lines.length} 行，满足源文件 ${srcLines} 行的长度下限（≥${min}）`);
      }
    }
  }

  // P5: 业务说明段 + 页面性质五选一（所有模式必须有）
  if (!/业务说明/.test(content)) {
    fail(`P5: ${label} 缺少"业务说明"段（防语义跑偏的关键段落）`);
  } else if (!PAGE_NATURES.some(n => content.includes(n))) {
    fail(`P5: ${label} 业务说明段未写页面性质（须为：${PAGE_NATURES.join('/')} 五选一）`);
  } else {
    ok(`P5: ${label} 业务说明段完整`);
  }

  // P6: 模糊词黑名单
  for (const { re, hint } of VAGUE_PATTERNS) {
    const hit = lines.find(l => re.test(l));
    if (hit) {
      fail(`P6: ${label} 含模糊表述 ${hint}：${hit.trim().slice(0, 60)}`);
    }
  }
}

console.log('\n=== 质量门结果 ===');
if (errors.length > 0) {
  console.log(`\n✗ 共 ${errors.length} 项未通过（不达标禁止进入生成）：`);
  for (const e of errors) {
    console.log(`  ✗ ${e}`);
  }
} else {
  console.log('\n✓ 全部通过，可以进入生成');
}

process.exit(exitCode);
