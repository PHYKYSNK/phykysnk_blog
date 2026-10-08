# 博客项目长期笔记（phykysnk_blog）

## 项目概况
- 纯静态 Markdown 驱动 SPA，hash 路由，托管 Cloudflare Pages，`git push` 触发自动部署。
- 路径：`D:\A_CODE\github\blog`；仓库 `github.com:PHYKYSNK/phykysnk_blog.git`。
- 视图容器：home / post / about / changelog / **training**（2026-10-08 新增）。

## 视图切换（2026-10-08 重构）
- `main.js` 里 `var views = {home, post, about, changelog, training}` + `showView(name)`。
- 用 `classList.toggle('hidden', key !== name)` 统一处理，**新增页面只需在 views 登记 + 加路由分支**。
- 不要改回手写枚举 hidden（旧写法每加一页要改 N 处，漏一处会两页叠加）。

## 路由
- `#/`、`#/post/{slug}`、`#/about`、`#/changelog`、`#/training`。

## 舒尔特方格训练页（2026-10-08）
- 入口：导航栏**「舒尔特训练」**→ `#/training`；样式 `.schulte-*`，逻辑在 `main.js` 的「舒尔特方格训练」段。
- **尺寸可选 3×3 / 5×5 / 7×7**（`SCHULTE_SIZES`，默认 5）。用可变 `schulteSize` + `schulteTotal()`，
  **不要再写成 `SCHULTE_SIZE` 常量**（旧常量已删）。切尺寸入口 `setSchulteSize()`，
  界面同步在 `updateSchulteSizeUI()`（按钮高亮 + `gridTemplateColumns` + `data-size` + 副标题）。
  `setSchulteSize` 传相同值会直接 return，**不重置进度**。
- `performance.now()` 计时、错误计数；**无历史记录**。
- 洗牌用 Fisher-Yates；点对加 `.done`，点错加 `.wrong`。
- `renderPlaceholderGrid()` 保证未开始时方格区有高度，否则遮罩层（absolute inset:0）会塌陷。
- 移动端要点：`touch-action: manipulation` / `user-select: none` / 点过格子变淡（防手指遮挡不确定）。
- 字号必须按尺寸调（`.schulte-grid[data-size="7"] .schulte-cell`），否则 7×7 数字会溢出格子。
- ⚠️ 7×7 在 375px 手机上格子仅约 45.6px，属**临界可用**（低于 Material 48dp）。

## 测试方式（无浏览器环境，可复用）
- 环境无 agent-browser、无 npm（Bash 也缺 ls/cp/grep 等）。
- 做法：自建**最小 DOM 桩**（Element/document/window/localStorage/fetch/performance），
  用 `new Function(...)` 注入后执行 `main.js`，捕获 `DOMContentLoaded` 回调触发，
  再手动派发 hashchange/click 驱动流程。见 `tests/schulte.test.js`（55 项断言，含尺寸切换）。
- 运行：`node tests/schulte.test.js`（exit 0 = 全过）。


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

## 附件与下载按钮（2026-09-24 新增）
- 附件存放：`assets/files/`（文件名用英文，避免中文 URL 编码坑）。
- Markdown 语法：`[按钮文字](assets/files/x.zip){download size="11.99 MB" note="Windows · 解压即用"}`
- 渲染入口：`main.js` 的 `enhanceDownloadLinks()`，在 `marked.parse()` 之后调用。
- **关键坑：marked 会把 `{...}` 内双引号转义成 `&quot;`**，正则须兼容两种引号，并用 `unescapeHTML()` 还原。
- 兜底：站内 `.zip/.exe/.pdf` 等后缀链接自动转按钮（站外链接不转，避免误伤）。
- 生成的按钮带 `download` 属性 + `.download-btn` 样式。
- ⚠️ zip 一旦提交进 git 就永久占用历史体积，多版本更新场景应改用 GitHub Releases。


## 编码 | 路径坑
- 中文 slug：读用 `decodeURIComponent`，生成链接用 `encodeURIComponent`。
- Windows Git Bash 环境部分 Unix 命令不可用（ls/cp/grep/head/tail），改用 Read/Write/Glob/Grep 工具或 `node -e`。

## 用户偏好
- 暖色调（米黄 `#f6eddf` / 暖深褐 `#1a1612`），白天夜间都暖。
- 背景：`preview.gif` 单张 cover + `image-rendering: pixelated` + 晕影遮罩。
- **要求先解释根因再动手**，不接受闷头改。
- 改数据前喜欢知道自己改的是哪个文件、哪一层。
