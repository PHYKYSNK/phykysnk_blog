#!/usr/bin/env node
/**
 * build-changelog.js
 * 
 * 自动更新 changelog.json 和 index.json 的 updatedAt 字段。
 * 
 * 用法：node scripts/build-changelog.js
 * 
 * 工作原理：
 *   1. 读取 posts/ 目录下的所有 .md 文件，获取最新修改时间
 *   2. 与 posts/index.json 中的 date / updatedAt 对比
 *   3. 如果发现新文件或文件有更新，往 changelog.json 追加新条目
 *   4. 同步更新 index.json 中的 updatedAt
 * 
 * 设计为增量操作——不会覆盖已有的 changelog 条目。
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const INDEX_JSON = path.join(POSTS_DIR, 'index.json');
const CHANGELOG_JSON = path.join(POSTS_DIR, 'changelog.json');

function readJSON(filepath) {
  try {
    var raw = fs.readFileSync(filepath, 'utf-8');
    // strip UTF-8 BOM if present
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function formatDate(ts) {
  const d = new Date(ts * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function main() {
  // 1. 读取所有 .md 文件的最新修改时间
  const mdFiles = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') && f !== 'about.md')
    .map(f => {
      const stat = fs.statSync(path.join(POSTS_DIR, f));
      const slug = f.replace(/\.md$/, '');
      return { slug, mtime: stat.mtime, mtimeUnix: Math.floor(stat.mtimeMs / 1000) };
    });

  // 2. 读取 index.json
  const index = readJSON(INDEX_JSON);
  if (!index) { console.error('Error: index.json not found'); process.exit(1); }

  // 3. 读取 changelog.json
  const changelog = readJSON(CHANGELOG_JSON) || [];

  // 从现有 changelog 中收集已记录过的 slug（去重）
  const loggedSlugs = new Set();
  changelog.forEach(e => { if (e.slug) loggedSlugs.add(e.slug); });

  // 4. 对比并更新
  let changed = false;
  const today = formatDate(Math.floor(Date.now() / 1000));

  mdFiles.forEach(({ slug, mtime, mtimeUnix }) => {
    const post = index.find(p => p.slug === slug);
    if (!post) {
      // 新文章，不在 index.json 中——需要手动添加
      console.log(`[SKIP] ${slug} — 不在 index.json 中，请手动添加条目`);
      return;
    }

    const fileDate = formatDate(mtimeUnix);
    const prevUpdated = post.updatedAt || post.date;

    if (fileDate !== prevUpdated && !loggedSlugs.has(slug)) {
      // 有更新，且尚未记录到 changelog
      changelog.push({
        date: today,
        type: '更新',
        description: `更新文章：${post.title}`,
        slug: slug
      });
      post.updatedAt = today;
      loggedSlugs.add(slug);
      changed = true;
      console.log(`[UPDATED] ${slug} — ${post.title}`);
    } else if (fileDate !== prevUpdated) {
      // 已有记录，但仍是新的修改——更新 updatedAt
      post.updatedAt = today;
      changed = true;
      console.log(`[REFRESH] ${slug} — 刷新 updatedAt`);
    }
  });

  if (changed) {
    writeJSON(INDEX_JSON, index);
    writeJSON(CHANGELOG_JSON, changelog);
    console.log('Done. index.json & changelog.json updated.');
  } else {
    console.log('Nothing changed.');
  }
}

main();
