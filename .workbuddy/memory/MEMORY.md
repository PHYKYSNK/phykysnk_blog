# 博客项目长期笔记（phykysnk_blog）

## 项目概况
- 纯静态 Markdown 驱动 SPA，hash 路由，托管 Cloudflare Pages，`git push` 触发自动部署。
- 路径：`D:\A_CODE\github\blog`；仓库 `github.com:PHYKYSNK/phykysnk_blog.git`。
- 视图容器：home / post / about / changelog，靠切换 `hidden` 类实现。

## 数据结构（关键）
- `posts/index.json`：文章注册表，每条含 `slug / title / date / updatedAt / tags[] / excerpt`。**标签只在这里**。
- `posts/changelog.json`：更新日志，含 `date / type / description / slug`。
- `posts/*.md`：正文，**不含标签**；about.md 是独立关于页。
- 路由：`#/`、`#/post/{slug}`、`#/about`、`#/changelog`。

## 标签机制
- 渲染：`renderTags()` 汇总所有文章 tags 去重排序 → 生成 `.tag-btn` 按钮（`.` = 全部）。
- 首页卡片 / 文章页 meta 中的标签渲染为 `<span class="post-card-tag" data-tag="xxx">`。
- 点击：写 `data-tag` 到全局变量 `currentTag` → 调 `renderTags()` + `renderPosts()`。
- `renderPosts()` 据 `currentTag` 用 `p.tags.indexOf(currentTag) !== -1` 过滤。**纯前端内存过滤，不跳转、不刷新。**

## CLI 工具 scripts/new-post.js
- 入口：统一菜单（默认）；参数 `--scan / --delete / --changelog-add / --changelog-delete / --edit / --tag`。
- 快捷创建：`node scripts/new-post.js "标题" --tags "a,b" --push`。
- 一键脚本 `blog.bat` = 切目录 + `node scripts/new-post.js %*`（薄包装，加功能改 js 即可）。
- 设计约定：子功能结束走 `backToMenu()` 返回菜单，只有选「退出」才 `process.exit(0)`。
- ChromaBug：不弹浏览器的 CLI stdout 管道在非 TTY 下 readline 会一次性吞掉所有输入，测试交互流程只能单步喂。

## 编码 | 路径坑
- 中文 slug：读用 `decodeURIComponent`，生成链接用 `encodeURIComponent`。
- Windows Git Bash 环境部分 Unix 命令不可用（ls/cp/grep/head/tail），改用 Read/Write/Glob/Grep 工具或 `node -e`。

## 用户偏好
- 暖色调（米黄 `#f6eddf` / 暖深褐 `#1a1612`），白天夜间都暖。
- 背景：`preview.gif` 单张 cover + `image-rendering: pixelated` + 晕影遮罩。
- **要求先解释根因再动手**，不接受闷头改。
- 改数据前喜欢知道自己改的是哪个文件、哪一层。
