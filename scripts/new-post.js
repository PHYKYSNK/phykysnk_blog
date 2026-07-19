#!/usr/bin/env node
/**
 * new-post.js — 交互式添加博客文章工具
 *
 * 用法:
 *   node scripts/new-post.js              交互模式
 *   node scripts/new-post.js --scan       扫描未注册文件
 *   node scripts/new-post.js "标题" --tags "标签" --push  快速模式
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const INDEX_JSON = path.join(POSTS_DIR, 'index.json');
const CHANGELOG_JSON = path.join(POSTS_DIR, 'changelog.json');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

function readJSON(fp) {
  try {
    let raw = fs.readFileSync(fp, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return JSON.parse(raw);
  } catch { return null; }
}

function writeJSON(fp, data) {
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function slugify(title) {
  // Keep only lowercase letters, numbers, and hyphens
  let s = title.toLowerCase().trim();
  // Convert common Chinese to English approximations
  const dict = { '笔记': 'notes', '入门': 'intro', '基础': 'basics', '进阶': 'advanced',
    '算法': 'algo', '教程': 'tutorial', '指南': 'guide', '学习': 'learn',
    '总结': 'summary', '实践': 'practice', '问题': 'problem', '解决': 'solution',
    '配置': 'config', '安装': 'setup', '使用': 'usage', '原理': 'principle' };
  for (const [cn, en] of Object.entries(dict)) {
    s = s.replace(new RegExp(cn, 'g'), '-' + en);
  }
  // Remove non-alphanumeric (keep hyphens)
  s = s.replace(/[^a-z0-9\u4e00-\u9fff-]/g, '-');
  // Convert remaining Chinese to pinyin-like initials
  s = s.replace(/[-\s]+/g, '-').replace(/^-|-$/g, '');
  // If still has Chinese chars, just use english portion
  s = s.replace(/[\u4e00-\u9fff]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return s || 'post-' + today().replace(/-/g, '');
}

async function interactiveMode() {
  console.log('\n  \x1b[32m📝 添加新文章\x1b[0m');
  console.log('  \x1b[90m' + '='.repeat(30) + '\x1b[0m\n');

  const title = (await ask('  \x1b[35m?\x1b[0m 文章标题：\x1b[33m')).trim();
  console.log('\x1b[0m');
  if (!title) { console.log('  \x1b[31m✖ 标题不能为空\x1b[0m'); rl.close(); return; }

  const suggested = slugify(title);
  const slugRaw = await ask(`  \x1b[35m?\x1b[0m 链接标识 (slug)：\x1b[33m${suggested}\x1b[0m`);
  const slug = slugRaw.trim() || suggested;

  const tagsRaw = (await ask('  \x1b[35m?\x1b[0m 标签（逗号分隔）：\x1b[33m')).trim();
  console.log('\x1b[0m');
  const tags = tagsRaw ? tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];

  const excerpt = (await ask('  \x1b[35m?\x1b[0m 摘要（可选，直接回车跳过）：\x1b[33m')).trim();
  console.log('\x1b[0m');

  const pushRaw = (await ask('  \x1b[35m?\x1b[0m 是否自动 git commit + push？(\x1b[32mY\x1b[0m/n)：\x1b[33m')).trim().toLowerCase();
  console.log('\x1b[0m');
  const doPush = pushRaw !== 'n';

  // Summary
  const date = today();
  console.log('  \x1b[90m' + '-' .repeat(30) + '\x1b[0m');
  console.log('  \x1b[36m确认信息：\x1b[0m');
  console.log(`  \x1b[90m├\x1b[0m 标题：${title}`);
  console.log(`  \x1b[90m├\x1b[0m Slug： ${slug}`);
  console.log(`  \x1b[90m├\x1b[0m 标签： ${tags.join(', ') || '(无)'}`);
  console.log(`  \x1b[90m├\x1b[0m 日期： ${date}`);
  console.log(`  \x1b[90m├\x1b[0m 文件： posts/${slug}.md`);
  console.log(`  \x1b[90m└\x1b[0m 提交： ${doPush ? '自动 commit + push' : '仅本地'}`);
  console.log();

  const confirm = (await ask('  \x1b[35m?\x1b[0m [\x1b[32mY\x1b[0m] 确认  [\x1b[31mN\x1b[0m] 取消：\x1b[33m')).trim().toLowerCase();
  console.log('\x1b[0m');
  if (confirm === 'n') { console.log('  \x1b[33m✖ 已取消\x1b[0m'); rl.close(); return; }

  // === Execute ===
  // 1. Create .md file
  const mdPath = path.join(POSTS_DIR, slug + '.md');
  if (fs.existsSync(mdPath)) {
    console.log(`  \x1b[31m✖ 文件已存在：posts/${slug}.md\x1b[0m`);
    rl.close(); return;
  }
  const mdContent = `# ${title}\n\n\n`;
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`  \x1b[32m✔\x1b[0m 已创建：posts/${slug}.md`);

  // 2. Update index.json
  const index = readJSON(INDEX_JSON) || [];
  const entry = { slug, title, date, updatedAt: date, tags, excerpt };
  index.unshift(entry);
  writeJSON(INDEX_JSON, index);
  console.log('  \x1b[32m✔\x1b[0m index.json 已更新');

  // 3. Update changelog
  const changelog = readJSON(CHANGELOG_JSON) || [];
  changelog.push({ date, type: '新增', description: `发布新文章：${title}`, slug });
  writeJSON(CHANGELOG_JSON, changelog);
  console.log('  \x1b[32m✔\x1b[0m changelog.json 已更新\n');

  // 4. Git
  if (doPush) {
    const { execSync } = require('child_process');
    const repoDir = path.join(__dirname, '..');
    try {
      execSync(`git add "${mdPath}" "${INDEX_JSON}" "${CHANGELOG_JSON}"`, { cwd: repoDir, stdio: 'pipe' });
      execSync(`git commit -m "feat: 新增文章「${title}」"`, { cwd: repoDir, stdio: 'pipe' });
      console.log('  \x1b[32m✔\x1b[0m commit 完成');
      execSync('git push', { cwd: repoDir, stdio: 'pipe' });
      console.log('  \x1b[32m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[33m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
      console.log('  \x1b[33m  请手动执行 git push\x1b[0m\n');
    }
  }

  console.log('  \x1b[32m🎉 文章已上线！等待 Cloudflare Pages 部署...\x1b[0m\n');
  rl.close();
}

async function scanMode() {
  const index = readJSON(INDEX_JSON) || [];
  const registered = new Set(index.map(p => p.slug));

  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') && f !== 'about.md')
    .map(f => f.replace(/\.md$/, ''))
    .filter(slug => !registered.has(slug));

  if (!files.length) {
    console.log('\n  \x1b[32m✔ 没有未注册的文件\x1b[0m\n');
    rl.close(); return;
  }

  console.log(`\n  \x1b[33m⚠ 发现 ${files.length} 个未注册的文件：\x1b[0m\n`);
  files.forEach((f, i) => console.log(`  \x1b[90m  ${i + 1}.\x1b[0m posts/${f}.md`));

  console.log();
  const pick = (await ask('  输入编号注册（多个用逗号分隔，直接回车全部注册）：\x1b[33m')).trim();
  console.log('\x1b[0m');

  const selected = pick ? pick.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => n > 0 && n <= files.length) : files.map((_, i) => i + 1);
  const toRegister = selected.map(i => files[i - 1]).filter(Boolean);

  for (const slug of toRegister) {
    const mdPath = path.join(POSTS_DIR, slug + '.md');
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const firstLine = mdContent.split('\n')[0].replace(/^#\s*/, '').trim();
    const title = firstLine || slug;
    const excerpt = mdContent.split('\n').filter(l => l.trim() && !l.startsWith('#'))[0]?.trim().slice(0, 80) || '';

    const date = today();
    const entry = { slug, title, date, updatedAt: date, tags: [], excerpt };
    index.push(entry);
    console.log(`  \x1b[32m✔\x1b[0m 已注册：${slug} — ${title}`);
  }

  writeJSON(INDEX_JSON, index);
  console.log('  \x1b[32m✔\x1b[0m index.json 已更新\n');
  rl.close();
}

// === Entry ===
const args = process.argv.slice(2);

if (args.includes('--scan')) {
  scanMode();
} else if (args.length && !args[0].startsWith('--')) {
  // Quick mode: node new-post.js "Title" --tags "a,b" --push
  (async () => {
    const title = args[0];
    const tagsIdx = args.indexOf('--tags');
    const tags = tagsIdx >= 0 ? args[tagsIdx + 1].split(',').map(t => t.trim()) : [];
    const excerptIdx = args.indexOf('--excerpt');
    const excerpt = excerptIdx >= 0 ? args[excerptIdx + 1] : '';
    const doPush = args.includes('--push');
    const slug = slugify(title);
    const date = today();

    const mdPath = path.join(POSTS_DIR, slug + '.md');
    if (fs.existsSync(mdPath)) {
      console.log(`\n  \x1b[31m✖ 文件已存在：posts/${slug}.md\x1b[0m\n`);
      process.exit(1);
    }
    fs.writeFileSync(mdPath, `# ${title}\n\n\n`, 'utf8');
    console.log(`  \x1b[32m✔\x1b[0m 已创建：posts/${slug}.md`);

    const index = readJSON(INDEX_JSON) || [];
    index.unshift({ slug, title, date, updatedAt: date, tags, excerpt });
    writeJSON(INDEX_JSON, index);
    console.log('  \x1b[32m✔\x1b[0m index.json 已更新');

    const changelog = readJSON(CHANGELOG_JSON) || [];
    changelog.push({ date, type: '新增', description: `发布新文章：${title}`, slug });
    writeJSON(CHANGELOG_JSON, changelog);
    console.log('  \x1b[32m✔\x1b[0m changelog.json 已更新');

    if (doPush) {
      const { execSync } = require('child_process');
      try {
        execSync(`git add "${mdPath}" "${INDEX_JSON}" "${CHANGELOG_JSON}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
        execSync(`git commit -m "feat: 新增文章「${title}」"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
        execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
        console.log('  \x1b[32m✔\x1b[0m 已推送至 GitHub');
      } catch (e) {
        console.log(`  \x1b[33m⚠ git 出错：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
      }
    }
    console.log('  \x1b[32m🎉 完成！\x1b[0m\n');
  })();
} else {
  interactiveMode();
}
