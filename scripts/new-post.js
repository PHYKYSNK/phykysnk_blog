#!/usr/bin/env node
/**
 * new-post.js — 交互式博客文章管理工具
 *
 * 用法:
 *   node scripts/new-post.js                        统一管理面板（推荐）
 *   node scripts/new-post.js --scan                 扫描并选择注册已有文件
 *   node scripts/new-post.js --delete               浏览并选择删除文章
 *   node scripts/new-post.js --changelog-add        手动添加更新日志条目
 *   node scripts/new-post.js --changelog-delete     浏览并删除日志条目
 *   node scripts/new-post.js --edit                 选择文章编辑（自动更新 updatedAt + changelog）
 *   node scripts/new-post.js "标题" --tags "标签"    快速创建（--push 可选）
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
  const doPush = (await ask('  \x1b[38;5;173m?\x1b[0m 是否自动 git commit + push？(\x1b[38;5;142mY\x1b[0m/n)：\x1b[38;5;222m')).trim().toLowerCase() !== 'n';
  console.log('\x1b[0m');

  const index = readJSON(INDEX_JSON) || [];
  const changelog = readJSON(CHANGELOG_JSON) || [];
  const date = today();

  for (const slug of slugs) {
    const { title, excerpt } = parseMarkdownInfo(slug);
    const tagsRaw = (await ask(`  \x1b[38;5;173m?\x1b[0m 标签（${title}，逗号分隔）：\x1b[38;5;222m`)).trim();
    console.log('\x1b[0m');
    const tags = tagsRaw ? tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];

    const entry = { slug, title, date, updatedAt: date, tags, excerpt };
    index.unshift(entry);
    changelog.push({ date, type: '新增', description: `发布新文章：${title}`, slug });
    console.log(`  \x1b[38;5;142m✔\x1b[0m 已注册：${slug} — ${title}\n`);
  }

  writeJSON(INDEX_JSON, index);
  writeJSON(CHANGELOG_JSON, changelog);
  console.log('  \x1b[38;5;142m✔\x1b[0m index.json 已更新');
  console.log('  \x1b[38;5;142m✔\x1b[0m changelog.json 已更新\n');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${INDEX_JSON}" "${CHANGELOG_JSON}" ${slugs.map(s => `"${path.join(POSTS_DIR, s + '.md')}"`).join(' ')}`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "feat: 新增 ${slugs.length} 篇文章"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[38;5;222m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
      console.log('  \x1b[38;5;222m  请手动执行 git push\x1b[0m\n');
    }
  }

  console.log('  \x1b[38;5;142m🎉 注册完成！\x1b[0m\n');
  return backToMenu();
}

async function interactiveMode() {
  // Step 0: Check for unregistered files
  const unregistered = getUnregisteredFiles();

  if (unregistered.length > 0) {
    console.log('\n  \x1b[38;5;222m⚠ 检测到 ' + unregistered.length + ' 个未注册的文章文件\x1b[0m\n');
    unregistered.forEach((f, i) => {
      const { title } = parseMarkdownInfo(f);
      console.log(`  \x1b[38;5;245m  ${i + 1}.\x1b[0m ${f}.md  ${title !== f ? '→ ' + title : ''}`);
    });
    console.log();
    const choice = (await ask('  你要：\x1b[38;5;142m[1]\x1b[0m 选择文件注册  \x1b[38;5;142m[2]\x1b[0m 创建新文章  \x1b[38;5;245m[回车取消]\x1b[0m：\x1b[38;5;222m')).trim();
    console.log('\x1b[0m');
    if (choice === '1') {
      const pick = (await ask('  输入编号注册（逗号分隔，直接回车全选）：\x1b[38;5;222m')).trim();
      console.log('\x1b[0m');
      const selected = pick ? pick.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => n > 0 && n <= unregistered.length) : unregistered.map((_, i) => i + 1);
      const slugs = selected.map(i => unregistered[i - 1]).filter(Boolean);
      if (slugs.length) return registerExisting(slugs);
    } else if (choice !== '2') {
      console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n');
      return backToMenu();
}
    // choice === '2' → fall through to create new post
  }

  // === Create new post flow ===
  console.log('\n  \x1b[38;5;142m📝 创建新文章\x1b[0m');
  console.log('  \x1b[38;5;245m' + '='.repeat(30) + '\x1b[0m\n');

  const title = (await ask('  \x1b[38;5;173m?\x1b[0m 文章标题：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');
  if (!title) { console.log('  \x1b[38;5;203m✖ 标题不能为空\x1b[0m\n'); return backToMenu();
}

  const suggested = slugify(title);
  console.log('  \x1b[38;5;245m  Slug 用于生成文章 URL 链接，建议使用英文短横线格式\x1b[0m');
  const slugRaw = await ask(`  \x1b[38;5;173m?\x1b[0m 链接标识 (slug)：\x1b[38;5;222m${suggested}\x1b[0m`);
  const slug = slugRaw.trim() || suggested;

  const tagsRaw = (await ask('  \x1b[38;5;173m?\x1b[0m 标签（逗号分隔，如 Java,JavaWeb）：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');
  const tags = tagsRaw ? tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];

  const excerpt = (await ask('  \x1b[38;5;173m?\x1b[0m 摘要（可选，直接回车跳过）：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');

  const pushRaw = (await ask('  \x1b[38;5;173m?\x1b[0m 是否自动 git commit + push？(\x1b[38;5;142mY\x1b[0m/n)：\x1b[38;5;222m')).trim().toLowerCase();
  console.log('\x1b[0m');
  const doPush = pushRaw !== 'n';

  // Summary
  const date = today();
  console.log('  \x1b[38;5;245m' + '-' .repeat(30) + '\x1b[0m');
  console.log('  \x1b[38;5;180m确认信息：\x1b[0m');
  console.log(`  \x1b[38;5;245m├\x1b[0m 标题：${title}`);
  console.log(`  \x1b[38;5;245m├\x1b[0m Slug： ${slug}`);
  console.log(`  \x1b[38;5;245m├\x1b[0m 标签： ${tags.join(', ') || '(无)'}`);
  console.log(`  \x1b[38;5;245m├\x1b[0m 日期： ${date}`);
  console.log(`  \x1b[38;5;245m├\x1b[0m 文件： posts/${slug}.md`);
  console.log(`  \x1b[38;5;245m└\x1b[0m 提交： ${doPush ? '自动 commit + push' : '仅本地'}`);
  console.log();

  const confirm = (await ask('  \x1b[38;5;173m?\x1b[0m [\x1b[38;5;142mY\x1b[0m] 确认  [\x1b[38;5;203mN\x1b[0m] 取消：\x1b[38;5;222m')).trim().toLowerCase();
  console.log('\x1b[0m');
  if (confirm === 'n') { console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n'); return backToMenu();
}

  // === Execute ===
  const mdPath = path.join(POSTS_DIR, slug + '.md');
  if (fs.existsSync(mdPath)) {
    console.log(`  \x1b[38;5;203m✖ 文件已存在：posts/${slug}.md\x1b[0m\n`);
    return backToMenu();
}
  const mdContent = `# ${title}\n\n\n`;
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`  \x1b[38;5;142m✔\x1b[0m 已创建：posts/${slug}.md`);

  const index = readJSON(INDEX_JSON) || [];
  const entry = { slug, title, date, updatedAt: date, tags, excerpt };
  index.unshift(entry);
  writeJSON(INDEX_JSON, index);
  console.log('  \x1b[38;5;142m✔\x1b[0m index.json 已更新');

  const changelog = readJSON(CHANGELOG_JSON) || [];
  changelog.push({ date, type: '新增', description: `发布新文章：${title}`, slug });
  writeJSON(CHANGELOG_JSON, changelog);
  console.log('  \x1b[38;5;142m✔\x1b[0m changelog.json 已更新\n');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${mdPath}" "${INDEX_JSON}" "${CHANGELOG_JSON}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "feat: 新增文章「${title}」"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[38;5;222m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
      console.log('  \x1b[38;5;222m  请手动执行 git push\x1b[0m\n');
    }
  }

  console.log('  \x1b[38;5;142m🎉 部署中，等待 Cloudflare Pages 构建完成...\x1b[0m\n');
  return backToMenu();
}

async function scanMode() {
  const unregistered = getUnregisteredFiles();
  if (!unregistered.length) {
    console.log('\n  \x1b[38;5;142m✔ 没有未注册的文件\x1b[0m\n');
    return backToMenu();
}

  console.log(`\n  \x1b[38;5;222m⚠ 发现 ${unregistered.length} 个未注册的文件：\x1b[0m\n`);
  unregistered.forEach((f, i) => {
    const { title } = parseMarkdownInfo(f);
    console.log(`  \x1b[38;5;245m  ${i + 1}.\x1b[0m ${f}.md  → ${title}`);
  });

  console.log();
  const pick = (await ask('  输入编号注册（逗号分隔，直接回车全选）：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');
  const selected = pick ? pick.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => n > 0 && n <= unregistered.length) : unregistered.map((_, i) => i + 1);
  const slugs = selected.map(i => unregistered[i - 1]).filter(Boolean);
  if (!slugs.length) { console.log('  \x1b[38;5;222m✖ 未选择任何文件\x1b[0m\n'); return backToMenu();
}
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
    console.log(`\n  \x1b[38;5;203m✖ 文件已存在：posts/${slug}.md\x1b[0m\n`);
    process.exit(1);
  }
  fs.writeFileSync(mdPath, `# ${title}\n\n\n`, 'utf8');
  console.log(`  \x1b[38;5;142m✔\x1b[0m 已创建：posts/${slug}.md`);

  const index = readJSON(INDEX_JSON) || [];
  index.unshift({ slug, title, date, updatedAt: date, tags, excerpt });
  writeJSON(INDEX_JSON, index);
  console.log('  \x1b[38;5;142m✔\x1b[0m index.json 已更新');

  const changelog = readJSON(CHANGELOG_JSON) || [];
  changelog.push({ date, type: '新增', description: `发布新文章：${title}`, slug });
  writeJSON(CHANGELOG_JSON, changelog);
  console.log('  \x1b[38;5;142m✔\x1b[0m changelog.json 已更新');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${mdPath}" "${INDEX_JSON}" "${CHANGELOG_JSON}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "feat: 新增文章「${title}」"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已推送至 GitHub');
    } catch (e) {
      console.log(`  \x1b[38;5;222m⚠ git 出错：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
    }
  }
  console.log('  \x1b[38;5;142m🎉 完成！\x1b[0m\n');
}

async function deleteMode() {
  const index = readJSON(INDEX_JSON) || [];
  if (!index.length) {
    console.log('\n  \x1b[38;5;222m⚠ 没有任何已注册的文章\x1b[0m\n');
    return backToMenu();
}

  console.log('\n  \x1b[38;5;203m🗑️ 删除文章\x1b[0m');
  console.log('  \x1b[38;5;245m' + '='.repeat(30) + '\x1b[0m\n');
  console.log('  \x1b[38;5;245m当前共 ' + index.length + ' 篇文章：\x1b[0m\n');

  index.forEach((p, i) => {
    const marker = fs.existsSync(path.join(POSTS_DIR, p.slug + '.md')) ? '' : ' \x1b[38;5;203m[文件缺失]\x1b[0m';
    console.log(`  \x1b[38;5;245m  ${String(i + 1).padStart(2)}.\x1b[0m ${p.title}  \x1b[38;5;245m(${p.date})\x1b[0m${marker}`);
  });

  console.log();
  const pick = (await ask('  输入编号删除（逗号分隔多选，直接回车取消）：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');
  if (!pick) { console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n'); return backToMenu();
}

  const selected = pick.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => n > 0 && n <= index.length);
  if (!selected.length) { console.log('  \x1b[38;5;222m✖ 无效编号\x1b[0m\n'); return backToMenu();
}

  const toDelete = selected.map(i => index[i - 1]);
  console.log('  \x1b[38;5;222m⚠ 即将删除以下文章：\x1b[0m\n');
  toDelete.forEach(p => console.log(`  \x1b[38;5;245m  ·\x1b[0m ${p.title}  \x1b[38;5;245m(posts/${p.slug}.md)\x1b[0m`));
  console.log();

  const confirm = (await ask('  \x1b[38;5;173m?\x1b[0m 确认删除？此操作不可撤销！(\x1b[38;5;203myes\x1b[0m/N)：\x1b[38;5;222m')).trim().toLowerCase();
  console.log('\x1b[0m');
  if (confirm !== 'yes') { console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n'); return backToMenu();
}

  const doPush = (await ask('  \x1b[38;5;173m?\x1b[0m 是否自动 git commit + push？(\x1b[38;5;142mY\x1b[0m/n)：\x1b[38;5;222m')).trim().toLowerCase() !== 'n';
  console.log('\x1b[0m');

  const date = today();
  const deletedSlugs = [];
  const changelog = readJSON(CHANGELOG_JSON) || [];

  toDelete.forEach(p => {
    const mdPath = path.join(POSTS_DIR, p.slug + '.md');
    if (fs.existsSync(mdPath)) {
      fs.unlinkSync(mdPath);
      console.log(`  \x1b[38;5;142m✔\x1b[0m 已删除文件：posts/${p.slug}.md`);
    } else {
      console.log(`  \x1b[38;5;222m⚠\x1b[0m 文件不存在：posts/${p.slug}.md（跳过）`);
    }
    deletedSlugs.push(p.slug);
    changelog.push({ date, type: '删除', description: `删除文章：${p.title}`, slug: null });
  });

  const newIndex = index.filter(p => !deletedSlugs.includes(p.slug));
  writeJSON(INDEX_JSON, newIndex);
  writeJSON(CHANGELOG_JSON, changelog);
  console.log('  \x1b[38;5;142m✔\x1b[0m index.json 已更新');
  console.log('  \x1b[38;5;142m✔\x1b[0m changelog.json 已更新\n');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${INDEX_JSON}" "${CHANGELOG_JSON}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "chore: 删除 ${toDelete.length} 篇文章"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[38;5;222m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
    }
  }

  console.log('  \x1b[38;5;142m🗑️ 删除完成\x1b[0m\n');
  return backToMenu();
}

async function changelogAddMode() {
  const changelog = readJSON(CHANGELOG_JSON) || [];

  console.log('\n  \x1b[38;5;142m📋 添加更新日志条目\x1b[0m');
  console.log('  \x1b[38;5;245m' + '='.repeat(30) + '\x1b[0m\n');

  console.log('  \x1b[38;5;245m  可选类型：初始化 / 新增 / 修复 / 优化 / 批量导入 / 更新\x1b[0m');
  const type = (await ask('  \x1b[38;5;173m?\x1b[0m 变更类型：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');
  if (!type) { console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n'); return backToMenu();
}

  const description = (await ask('  \x1b[38;5;173m?\x1b[0m 变更描述：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');
  if (!description) { console.log('  \x1b[38;5;222m✖ 描述不能为空\x1b[0m\n'); return backToMenu();
}

  const slug = (await ask('  \x1b[38;5;173m?\x1b[0m 关联文章 slug（可选，直接回车跳过）：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');

  const date = today();
  const entry = { date, type, description, slug: slug || null };
  changelog.push(entry);
  writeJSON(CHANGELOG_JSON, changelog);
  console.log(`  \x1b[38;5;142m✔\x1b[0m 日志已添加：${type} — ${description.slice(0, 40)}${description.length > 40 ? '...' : ''}\n`);

  const doPush = (await ask('  \x1b[38;5;173m?\x1b[0m 是否自动 git commit + push？(\x1b[38;5;142mY\x1b[0m/n)：\x1b[38;5;222m')).trim().toLowerCase() !== 'n';
  console.log('\x1b[0m');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${CHANGELOG_JSON}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "chore: 更新日志 - ${type}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[38;5;222m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
    }
  }

  return backToMenu();
}

async function changelogDeleteMode() {
  const changelog = readJSON(CHANGELOG_JSON) || [];
  if (!changelog.length) {
    console.log('\n  \x1b[38;5;222m⚠ 没有任何日志条目\x1b[0m\n');
    return backToMenu();
}

  console.log('\n  \x1b[38;5;203m🗑️ 删除日志条目\x1b[0m');
  console.log('  \x1b[38;5;245m' + '='.repeat(30) + '\x1b[0m\n');
  console.log('  \x1b[38;5;245m当前共 ' + changelog.length + ' 条日志：\x1b[0m\n');

  changelog.forEach((e, i) => {
    const desc = e.description.length > 60 ? e.description.slice(0, 60) + '...' : e.description;
    console.log(`  \x1b[38;5;245m  ${String(i + 1).padStart(2)}.\x1b[0m \x1b[38;5;222m[${e.type}]\x1b[0m ${desc}  \x1b[38;5;245m(${e.date})\x1b[0m`);
  });

  console.log();
  const pick = (await ask('  输入编号删除（逗号分隔多选，直接回车取消）：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');
  if (!pick) { console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n'); return backToMenu();
}

  const selected = pick.split(/[,，]/).map(s => parseInt(s.trim())).filter(n => n > 0 && n <= changelog.length);
  if (!selected.length) { console.log('  \x1b[38;5;222m✖ 无效编号\x1b[0m\n'); return backToMenu();
}

  const confirm = (await ask('  \x1b[38;5;173m?\x1b[0m 确认删除选中的 ' + selected.length + ' 条日志？(\x1b[38;5;203myes\x1b[0m/N)：\x1b[38;5;222m')).trim().toLowerCase();
  console.log('\x1b[0m');
  if (confirm !== 'yes') { console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n'); return backToMenu();
}

  const newChangelog = changelog.filter((_, i) => !selected.includes(i + 1));
  writeJSON(CHANGELOG_JSON, newChangelog);
  console.log(`  \x1b[38;5;142m✔\x1b[0m 已删除 ${selected.length} 条日志\n`);

  const doPush = (await ask('  \x1b[38;5;173m?\x1b[0m 是否自动 git commit + push？(\x1b[38;5;142mY\x1b[0m/n)：\x1b[38;5;222m')).trim().toLowerCase() !== 'n';
  console.log('\x1b[0m');

  if (doPush) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add "${CHANGELOG_JSON}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "chore: 删除 ${selected.length} 条更新日志"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[38;5;222m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
    }
  }

  return backToMenu();
}

async function editMode() {
  const index = readJSON(INDEX_JSON) || [];

  console.log('\n  \x1b[38;5;180m✏️ 编辑文章\x1b[0m');
  console.log('  \x1b[38;5;245m' + '='.repeat(30) + '\x1b[0m\n');

  console.log(`  \x1b[38;5;245m  [0]\x1b[0m 关于页（posts/about.md）`);
  index.forEach((p, i) => {
    console.log(`  \x1b[38;5;245m  [${i + 1}]\x1b[0m ${p.title}  \x1b[38;5;245m(${p.date})\x1b[0m`);
  });
  console.log();

  const pick = (await ask('  输入编号选择要编辑的文章：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');

  let post = null;
  let mdPath = '';
  let isAbout = false;

  if (pick === '0' || pick.toLowerCase() === 'a' || pick.toLowerCase() === 'about') {
    isAbout = true;
    mdPath = path.join(POSTS_DIR, 'about.md');
    if (!fs.existsSync(mdPath)) {
      console.log('  \x1b[38;5;203m✖ posts/about.md 不存在\x1b[0m\n');
      return backToMenu();
}
    console.log('  \x1b[38;5;180m📄 posts/about.md  — 关于页\x1b[0m\n');
  } else {
    const idx = parseInt(pick) - 1;
    if (isNaN(idx) || idx < 0 || idx >= index.length) {
      console.log('  \x1b[38;5;222m✖ 无效编号\x1b[0m\n');
      return backToMenu();
}
    post = index[idx];
    mdPath = path.join(POSTS_DIR, post.slug + '.md');
    if (!fs.existsSync(mdPath)) {
      console.log(`  \x1b[38;5;203m✖ 文件不存在：posts/${post.slug}.md\x1b[0m\n`);
      return backToMenu();
}
    console.log(`  \x1b[38;5;180m📄 posts/${post.slug}.md\x1b[0m\n`);
  }

  console.log('  \x1b[38;5;245m  请在编辑器中修改此文件，完成后回来继续\x1b[0m\n');

  // Try to open in editor
  const { execSync } = require('child_process');
  const repoDir = path.join(__dirname, '..');
  try {
    execSync(`code "${mdPath}"`, { cwd: repoDir, stdio: 'ignore' });
    console.log('  \x1b[38;5;142m✔\x1b[0m 已用 VS Code 打开');
  } catch {
    try {
      execSync(`notepad "${mdPath}"`, { cwd: repoDir, stdio: 'ignore' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已用记事本打开');
    } catch {
      console.log(`  \x1b[38;5;222m⚠ 无法自动打开编辑器，请手动编辑：\x1b[0m`);
      console.log(`     \x1b[38;5;180m${mdPath}\x1b[0m\n`);
    }
  }

  const done = (await ask('  编辑完成后输入 \x1b[38;5;142myes\x1b[0m 继续，直接回车取消：\x1b[38;5;222m')).trim().toLowerCase();
  console.log('\x1b[0m');
  if (done !== 'yes') { console.log('  \x1b[38;5;222m✖ 已取消\x1b[0m\n'); return backToMenu();
}

  const date = today();
  const changelog = readJSON(CHANGELOG_JSON) || [];

  if (isAbout) {
    // about.md — 只更新 changelog
    changelog.push({ date, type: '更新', description: '更新关于页', slug: null });
    writeJSON(CHANGELOG_JSON, changelog);
    console.log('  \x1b[38;5;142m✔\x1b[0m changelog.json 已更新\n');
  } else {
    // Normal article — update updatedAt + changelog
    const oldUpdated = post.updatedAt || post.date;
    post.updatedAt = date;
    writeJSON(INDEX_JSON, index);
    console.log(`  \x1b[38;5;142m✔\x1b[0m updatedAt 已更新：${oldUpdated} → ${date}`);
    const desc = (await ask('  简要描述本次修改（用于更新日志）：\x1b[38;5;222m')).trim();
    console.log('\x1b[0m');
    changelog.push({ date, type: '更新', description: desc || `更新文章：${post.title}`, slug: post.slug });
    writeJSON(CHANGELOG_JSON, changelog);
    console.log('  \x1b[38;5;142m✔\x1b[0m changelog.json 已更新\n');
  }

  const doPush = (await ask('  \x1b[38;5;173m?\x1b[0m 是否自动 git commit + push？(\x1b[38;5;142mY\x1b[0m/n)：\x1b[38;5;222m')).trim().toLowerCase() !== 'n';
  console.log('\x1b[0m');

  if (doPush) {
    try {
      const addFiles = isAbout
        ? `"${mdPath}" "${CHANGELOG_JSON}"`
        : `"${mdPath}" "${INDEX_JSON}" "${CHANGELOG_JSON}"`;
      execSync(`git add ${addFiles}`, { cwd: repoDir, stdio: 'pipe' });
      execSync(`git commit -m "update: ${isAbout ? '关于页' : post.title}"`, { cwd: repoDir, stdio: 'pipe' });
      execSync('git push', { cwd: repoDir, stdio: 'pipe' });
      console.log('  \x1b[38;5;142m✔\x1b[0m 已推送至 GitHub\n');
    } catch (e) {
      console.log(`  \x1b[38;5;222m⚠ git 操作失败：${e.stderr?.toString().trim() || e.message}\x1b[0m`);
    }
  }

  console.log('  \x1b[38;5;142m🎉 更新完成！\x1b[0m\n');
  return backToMenu();
}

async function menuMode() {
  console.log('\n  \x1b[38;5;180m📝 博客管理面板\x1b[0m');
  console.log('  \x1b[38;5;245m' + '='.repeat(30) + '\x1b[0m\n');
  console.log('  \x1b[38;5;245m  [1]\x1b[0m 创建新文章');
  console.log('  \x1b[38;5;245m  [2]\x1b[0m 注册已有文件');
  console.log('  \x1b[38;5;245m  [3]\x1b[0m 删除文章');
  console.log('  \x1b[38;5;245m  [4]\x1b[0m 添加更新日志');
  console.log('  \x1b[38;5;245m  [5]\x1b[0m 删除更新日志');
  console.log('  \x1b[38;5;245m  [6]\x1b[0m 编辑文章');
  console.log('  \x1b[38;5;245m  [7]\x1b[0m 退出\n');

  const choice = (await ask('  请选择 [\x1b[38;5;142m1-7\x1b[0m]：\x1b[38;5;222m')).trim();
  console.log('\x1b[0m');

  switch (choice) {
    case '1': await interactiveMode(); break;
    case '2': await scanMode(); break;
    case '3': await deleteMode(); break;
    case '4': await changelogAddMode(); break;
    case '5': await changelogDeleteMode(); break;
    case '6': await editMode(); break;
    default: console.log('  \x1b[38;5;222mbye\x1b[0m\n'); process.exit(0);
  }
  await backToMenu();
  return menuMode();
}

async function backToMenu() {
  await ask('\n  按回车键返回菜单...');
  console.log('\x1b[0m');
}

// === Entry ===
const args = process.argv.slice(2);

if (args.includes('--scan')) {
  scanMode();
} else if (args.includes('--delete')) {
  deleteMode();
} else if (args.includes('--changelog-add')) {
  changelogAddMode();
} else if (args.includes('--changelog-delete')) {
  changelogDeleteMode();
} else if (args.includes('--edit')) {
  editMode();
} else if (args.length && !args[0].startsWith('--')) {
  quickMode(args);
} else if (args.includes('--menu') || args.includes('--help') || args.includes('-h')) {
  menuMode();
} else {
  menuMode();
}
