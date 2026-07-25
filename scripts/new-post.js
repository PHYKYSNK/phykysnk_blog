#!/usr/bin/env node
/**
 * new-post.js — 交互式博客文章管理工具
 *
 * 用法:
 *   node scripts/new-post.js              交互模式（创建或注册）
 *   node scripts/new-post.js --scan       扫描并选择注册已有文件
 *   node scripts/new-post.js "标题" --tags "标签" --push  快速创建
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

function getUnregisteredFiles() {
  const index = readJSON(INDEX_JSON) || [];
  const registered = new Set(index.map(p => p.slug));
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') && f !== 'about.md')
    .map(f => f.replace(/\.md$/, ''))
    .filter(slug => !registered.has(slug));
}

function parseMarkdownInfo(slug) {
  const mdPath = path.join(POSTS_DIR, slug + '.md');
  if (!fs.existsSync(mdPath)) return { title: slug, excerpt: '' };
  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');
  const title = lines.find(l => l.startsWith('# '))?.replace(/^#\s*/, '').trim() || slug;
  const excerpt = lines.find(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'))?.trim().slice(0, 100) || '';
  return { title, excerpt };
}

async function registerExisting(slugs) {
  const doPush = (await ask('  \x1b[35m?\x1b[0m 是否自动 git commit + push？(\x1b[32mY\x1b[0m/n)：\x1b[33m')).trim().toLowerCase() !== 'n';
  console.log('\x1b[0m');

  const index = readJSON(INDEX_JSON) || [];
  const changelog = readJSON(CHANGELOG_JSON) || [];
  const date = today();

  for (const slug of slugs) {
    const { title, excerpt } = parseMarkdownInfo(slug);
    const tagsRaw = (await ask(`  \x1b[35m?\x1b[0m 标签（${title}，逗号分隔）：\x1b[33m`)).trim();
    console.log('\x1b[0m');
    const tags = tagsRaw ? tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];

    const entry = { slug, title, date, updatedAt: date, tags, excerpt };
    index.unshift(entry);
    changelog.push({ date, type: '新增', description: `发布新文章：${title}`, slug });
    console.log(`  \x1b[32m✔\x1b[0m 已注册：${slug} — ${title}\n`);
  }

  writeJSON(INDEX_JSON, index);
  writeJSON(CHANGELOG_JSON, changelog);
  console.log('  \x1b[32m✔\x1b[0m index.json 已更新');
  console.log('  \x1b[32m✔\x1b[0m changelog.json 已更新\n');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${INDEX_JSON}" "${CHANGELOG_JSON}" ${slugs.map(s => `"${path.join(POSTS_DIR, s + '.md')}"`).join(' ')}`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "feat: 新增 ${slugs.length} 篇文章"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[32m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[33m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
      console.log('  \x1b[33m  请手动执行 git push\x1b[0m\n');
    }
  }

  console.log('  \x1b[32m🎉 注册完成！\x1b[0m\n');
  rl.close();
}

async function interactiveMode() {
  // Step 0: Check for unregistered files
  const unregistered = getUnregisteredFiles();

  if (unregistered.length > 0) {
    console.log('\n  \x1b[33m⚠ 检测到 ' + unregistered.length + ' 个未注册的文章文件\x1b[0m\n');
    unregistered.forEach((f, i) => {
      const { title } = parseMarkdownInfo(f);
      console.log(`  \x1b[90m  ${i + 1}.\x1b[0m ${f}.md  ${title !== f ? '→ ' + title : ''}`);
    });
    console.log();
    const choice = (await ask('  你要：\x1b[32m[1]\x1b[0m 选择文件注册  \x1b[32m[2]\x1b[0m 创建新文章  \x1b[90m[回车取消]\x1b[0m：\x1b[33m')).trim();
    console.log('\x1b[0m');
    if (choice === '1') {
      const pick = (await ask('  输入编号注册（逗号分隔，直接回车全选）：\x1b[33m')).trim();
      console.log('\x1b[0m');
      const selected = pick ? pick.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => n > 0 && n <= unregistered.length) : unregistered.map((_, i) => i + 1);
      const slugs = selected.map(i => unregistered[i - 1]).filter(Boolean);
      if (slugs.length) return registerExisting(slugs);
    } else if (choice !== '2') {
      console.log('  \x1b[33m✖ 已取消\x1b[0m\n');
      rl.close(); return;
    }
    // choice === '2' → fall through to create new post
  }

  // === Create new post flow ===
  console.log('\n  \x1b[32m📝 创建新文章\x1b[0m');
  console.log('  \x1b[90m' + '='.repeat(30) + '\x1b[0m\n');

  const title = (await ask('  \x1b[35m?\x1b[0m 文章标题：\x1b[33m')).trim();
  console.log('\x1b[0m');
  if (!title) { console.log('  \x1b[31m✖ 标题不能为空\x1b[0m\n'); rl.close(); return; }

  const suggested = slugify(title);
  console.log('  \x1b[90m  Slug 用于生成文章 URL 链接，建议使用英文短横线格式\x1b[0m');
  const slugRaw = await ask(`  \x1b[35m?\x1b[0m 链接标识 (slug)：\x1b[33m${suggested}\x1b[0m`);
  const slug = slugRaw.trim() || suggested;

  const tagsRaw = (await ask('  \x1b[35m?\x1b[0m 标签（逗号分隔，如 Java,JavaWeb）：\x1b[33m')).trim();
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
  if (confirm === 'n') { console.log('  \x1b[33m✖ 已取消\x1b[0m\n'); rl.close(); return; }

  // === Execute ===
  const mdPath = path.join(POSTS_DIR, slug + '.md');
  if (fs.existsSync(mdPath)) {
    console.log(`  \x1b[31m✖ 文件已存在：posts/${slug}.md\x1b[0m\n`);
    rl.close(); return;
  }
  const mdContent = `# ${title}\n\n\n`;
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`  \x1b[32m✔\x1b[0m 已创建：posts/${slug}.md`);

  const index = readJSON(INDEX_JSON) || [];
  const entry = { slug, title, date, updatedAt: date, tags, excerpt };
  index.unshift(entry);
  writeJSON(INDEX_JSON, index);
  console.log('  \x1b[32m✔\x1b[0m index.json 已更新');

  const changelog = readJSON(CHANGELOG_JSON) || [];
  changelog.push({ date, type: '新增', description: `发布新文章：${title}`, slug });
  writeJSON(CHANGELOG_JSON, changelog);
  console.log('  \x1b[32m✔\x1b[0m changelog.json 已更新\n');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${mdPath}" "${INDEX_JSON}" "${CHANGELOG_JSON}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "feat: 新增文章「${title}」"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[32m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[33m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
      console.log('  \x1b[33m  请手动执行 git push\x1b[0m\n');
    }
  }

  console.log('  \x1b[32m🎉 部署中，等待 Cloudflare Pages 构建完成...\x1b[0m\n');
  rl.close();
}

async function scanMode() {
  const unregistered = getUnregisteredFiles();
  if (!unregistered.length) {
    console.log('\n  \x1b[32m✔ 没有未注册的文件\x1b[0m\n');
    rl.close(); return;
  }

  console.log(`\n  \x1b[33m⚠ 发现 ${unregistered.length} 个未注册的文件：\x1b[0m\n`);
  unregistered.forEach((f, i) => {
    const { title } = parseMarkdownInfo(f);
    console.log(`  \x1b[90m  ${i + 1}.\x1b[0m ${f}.md  → ${title}`);
  });

  console.log();
  const pick = (await ask('  输入编号注册（逗号分隔，直接回车全选）：\x1b[33m')).trim();
  console.log('\x1b[0m');
  const selected = pick ? pick.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => n > 0 && n <= unregistered.length) : unregistered.map((_, i) => i + 1);
  const slugs = selected.map(i => unregistered[i - 1]).filter(Boolean);
  if (!slugs.length) { console.log('  \x1b[33m✖ 未选择任何文件\x1b[0m\n'); rl.close(); return; }
  return registerExisting(slugs);
}

// === Quick mode ===
// node new-post.js "Title" --tags "a,b" --push
function quickMode(args) {
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
}

// === Entry ===
const args = process.argv.slice(2);

if (args.includes('--scan')) {
  scanMode();
} else if (args.length && !args[0].startsWith('--')) {
  quickMode(args);
} else {
  interactiveMode();
}
