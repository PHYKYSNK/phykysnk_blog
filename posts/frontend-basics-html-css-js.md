# 前端三件套学习总结

> 基于黑马程序员 JavaWeb 前置课程整理，包含 HTML / CSS / JS 核心知识点与实战陷阱。

---

## 一、HTML（HyperText Markup Language）— 结构层

### 1.1 文档骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
</head>
<body>
    <!-- 可见内容 -->
</body>
</html>
```

| 标签 | 全称 | 含义 | 位置 |
|------|------|------|------|
| `<!DOCTYPE html>` | Document Type | 声明 HTML5 文档类型 | 文件第一行 |
| `<html>` | HyperText Markup Language | 根元素 | 包裹整个页面 |
| `<head>` | Head | 头部，存放元信息 | `<html>` 内最前 |
| `<body>` | Body | 身体，存放可见内容 | `</head>` 后 |
| `<meta>` | Metadata | 元数据（编码、视口等） | `<head>` 内 |
| `<title>` | Title | 浏览器标签页标题 | `<head>` 内 |

### 1.2 文本类标签

| 标签 | 全称 | 语义 | 默认样式 | 双/单标签 |
|------|------|------|----------|-----------|
| `<h1>` ~ `<h6>` | Heading 1~6 | 标题，h1 最重要 | 加粗，逐级变小 | 双 |
| `<p>` | Paragraph | 段落 | 段间自动留白 | 双 |
| `<br>` | Break | 换行 | 强制折行 | 单 |
| `<hr>` | Horizontal Rule | 水平分割线 | 一条横线 | 单 |
| `<strong>` | Strong | 重要内容（语义强调） | **加粗** | 双 |
| `<em>` | Emphasis | 强调内容 | *斜体* | 双 |
| `<del>` | Delete | 已删除内容 | ~~删除线~~ | 双 |
| `<ins>` | Insert | 新插入内容 | 下划线 | 双 |

### 1.3 链接与图片

| 标签 | 全称 | 关键属性 | 说明 |
|------|------|----------|------|
| `<a>` | Anchor | `href`（Hypertext Reference，目标URL）、`target` | 超链接 |
| `<img>` | Image | `src`（Source，图片路径）、`alt`（Alternative Text，替代文字）、`width`、`height` | 图片（单标签） |

| 属性 | 全称 | 取值 | 作用 |
|------|------|------|------|
| `href` | Hypertext Reference | URL | 链接目标地址 |
| `target` | Target | `_self`（默认，当前页跳转）/ `_blank`（新标签页） | 打开方式 |
| `src` | Source | 文件路径 | 图片/资源地址 |
| `alt` | Alternative Text | 文字 | 图片加载失败时的替代文本 |
| `charset` | Character Set | `UTF-8` | 字符编码 |
| `lang` | Language | `zh-CN`、`en` | 页面语言 |

### 1.4 列表（三种）

| 标签 | 全称 | 场景 | 默认标记 |
|------|------|------|----------|
| `<ul>` | Unordered List | 并列项，无顺序要求 | 圆点 `●` |
| `<ol>` | Ordered List | 有顺序的步骤 | 数字 `1. 2. 3.` |
| `<li>` | List Item | 列表中的每一项 | — |
| `<dl>` | Definition List | 术语解释 | — |
| `<dt>` | Definition Term | 被定义的术语 | — |
| `<dd>` | Definition Description | 术语的解释 | 缩进 |

### 1.5 表格

| 标签 | 全称 | 位置 | 说明 |
|------|------|------|------|
| `<table>` | Table | 最外层 | 表格容器 |
| `<thead>` | Table Head | `<table>` 内 | 表头区域（可选但推荐） |
| `<tbody>` | Table Body | `<table>` 内 | 数据区域 |
| `<tfoot>` | Table Foot | `<table>` 内 | 脚注区域 |
| `<tr>` | Table Row | 行容器 | 表格中的一行 |
| `<th>` | Table Header Cell | `<tr>` 内 | 表头单元格（**加粗居中**） |
| `<td>` | Table Data Cell | `<tr>` 内 | 普通数据单元格 |

```html
<table border="1">
    <thead>
        <tr><th>姓名</th><th>年龄</th></tr>
    </thead>
    <tbody>
        <tr><td>张三</td><td>25</td></tr>
    </tbody>
</table>
```

### 1.6 块级 vs 行内（核心概念）

| 对比维度 | 块级（block） | 行内（inline） |
|----------|---------------|----------------|
| 代表标签 | `<div>`, `<p>`, `<h1>`, `<ul>`, `<table>`, `<header>` | `<span>`, `<a>`, `<strong>`, `<em>`, `<img>` |
| 占据宽度 | 独占一行，默认宽度 100% | 只占内容宽度 |
| 可设宽高 | 可以 | 不可以（`<img>` 例外） |
| 典型用途 | 页面大骨架布局 | 文本内局部修饰/包裹 |

| 纯容器标签 | 全称 | 类型 | 说明 |
|------------|------|------|------|
| `<div>` | Division（分区） | 块级 | 万能块级容器，无语义 |
| `<span>` | Span（跨越范围） | 行内 | 万能行内容器，无语义 |

### 1.7 HTML5 语义化布局标签

| 标签 | 含义 | 用途 |
|------|------|------|
| `<header>` | 页头 | Logo、标题、导航容器 |
| `<nav>` | Navigation | 导航菜单 |
| `<main>` | 主体 | 页面核心内容，每页仅一个 |
| `<section>` | 内容分区 | 带标题的章节 |
| `<article>` | 独立文章 | 可独立转载的内容（博客、新闻） |
| `<aside>` | 侧边栏 | 附属信息（广告、推荐） |
| `<footer>` | 页脚 | 版权、联系方式 |

### 1.8 表单 —— 前后端数据交互入口

#### 表单骨架

| 属性 | 含义 | 值 |
|------|------|-----|
| `action` | 提交目标 URL | Servlet 地址（JavaWeb 中） |
| `method` | 请求方法 | `GET`（数据在 URL）/ `POST`（数据在请求体） |

```html
<form action="/register" method="POST">
    <!-- 控件 -->
    <button type="submit">提交</button>
</form>
```

#### 表单控件速查表

| 控件 | 标签 | type 值 | 关键属性 |
|------|------|---------|----------|
| 文本框 | `<input>` | `text` | `name`, `placeholder`, `value`, `maxlength`, `readonly`, `disabled` |
| 密码框 | `<input>` | `password` | 同上（内容被 `●` 遮挡） |
| 单选框 | `<input>` | `radio` | `name`（同组必须一致）, `value`, `checked` |
| 复选框 | `<input>` | `checkbox` | `name`（同组一致）, `value`, `checked` |
| 下拉框 | `<select>` + `<option>` | — | `name`（在 `<select>` 上）, `value`（在 `<option>` 上） |
| 多行文本 | `<textarea>` | — | `name`, `rows`, `cols`, `placeholder` |
| 提交按钮 | `<button>` | `submit` | — |

#### 控件通用属性

| 属性 | 全称 | 作用 |
|------|------|------|
| `name` | Name | 数据的键名，**后端靠这个取值，必须写** |
| `value` | Value | 数据的值 |
| `placeholder` | Placeholder | 占位提示文字 |
| `required` | Required | 必填校验，空值无法提交 |
| `maxlength` | Max Length | 最大输入字符数 |
| `readonly` | Read Only | 只读，不可修改 |
| `disabled` | Disabled | 禁用，呈灰色且数据不提交 |
| `checked` | Checked | 单选框/复选框默认选中 |

---

## 二、CSS（Cascading Style Sheets）— 表现层

### 2.1 引入方式

| 方式 | 写法 | 优先级 | 推荐 |
|------|------|--------|------|
| 行内样式 | `<p style="color:red">` | 最高 | 不推荐 |
| 内部样式 | `<head>` 内 `<style>` 块 | 中 | 演示/小页面可用 |
| 外部样式 | `<link rel="stylesheet" href="xxx.css">` | 与内部同级（后者覆盖） | **推荐** |

### 2.2 选择器全表

#### 基础选择器

| 选择器 | 写法 | 选中目标 | 示例 |
|--------|------|----------|------|
| 标签选择器 | `div` | 所有 `<div>` | `p { color: red; }` |
| 类选择器 | `.class` | 所有 `class="xxx"` 的元素 | `.box { border: 1px; }` |
| ID 选择器 | `#id` | `id="xxx"` 的元素（唯一） | `#title { font-size: 24px; }` |
| 通配符 | `*` | 所有元素 | `* { margin: 0; }` |

> **注意：** `getElementById("title")` 不加 `#`，`querySelector("#title")` 必须加 `#`。

#### 关系选择器

| 选择器 | 写法 | 含义 | 示例 |
|--------|------|------|------|
| 后代选择器 | `A B` | A 内部所有层级中的 B | `nav a`（所有后代） |
| 子代选择器 | `A > B` | A 的**直接子元素** B | `nav > a`（仅直接子代） |
| 相邻兄弟 | `A + B` | 紧挨着 A 后面的第一个 B | `h2 + p` |
| 通用兄弟 | `A ~ B` | A 后面所有同级 B | `h2 ~ p` |
| 分组选择器 | `A, B` | 同时选中 A 和 B | `h1, h2, h3` |

#### 属性选择器

| 选择器 | 含义 | 示例 |
|--------|------|------|
| `[attr]` | 有该属性的元素 | `input[required]` |
| `[attr="val"]` | 属性等于某值的元素 | `input[type="text"]` |
| `[attr^="val"]` | 属性以某值开头 | `a[href^="https"]` |
| `[attr$="val"]` | 属性以某值结尾 | `a[href$=".pdf"]` |
| `[attr*="val"]` | 属性包含某值 | `input[name*="user"]` |

#### 伪类（状态）

| 伪类 | 触发条件 | 示例 |
|------|----------|------|
| `:hover` | 鼠标悬停 | `a:hover { color: red; }` |
| `:focus` | 元素获得焦点 | `input:focus { border-color: blue; }` |
| `:first-child` | 第一个子元素 | `li:first-child` |
| `:last-child` | 最后一个子元素 | `li:last-child` |
| `:nth-child(odd)` | 奇数项（1,3,5...） | `tr:nth-child(odd)` |
| `:nth-child(even)` | 偶数项（2,4,6...） | `tr:nth-child(even)` |
| `:nth-child(3n+1)` | 自定公式项 | `li:nth-child(3n+1)` |
| `:checked` | 选中的复选框/单选框 | `input[name="hobby"]:checked` |

#### 伪元素（虚拟元素）

| 伪元素 | 作用 | 示例 |
|--------|------|------|
| `::before` | 在元素内容前插入 | `p::before { content: "→ "; }` |
| `::after` | 在元素内容后插入 | `p::after { content: " ←"; }` |
| `::placeholder` | 设置 placeholder 样式 | `input::placeholder { color: #999; }` |

> 伪类（`:xxx`）选择元素的**状态**，伪元素（`::xxx`）创建**虚拟元素**。

#### 优先级（权重）排序

```
!important > 行内样式(1000) > #id(100) > .class(10) > 标签(1) > *(0)
```

### 2.3 盒模型（Box Model）

```
┌──────────────────────────────┐
│  margin        外边距         │ ← 盒子与盒子的间距
│  ┌────────────────────────┐  │
│  │  border    边框         │  │
│  │  ┌──────────────────┐  │  │
│  │  │  padding  内边距  │  │  │ ← 边框到内容的距离
│  │  │  ┌────────────┐  │  │  │
│  │  │  │  content   │  │  │  │ ← 内容区（文字/图片）
│  │  │  │  内容区     │  │  │  │
│  │  │  └────────────┘  │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

实际占用宽度 = width + padding(左右) + border(左右) + margin(左右)
```

| 属性 | 作用 | 缩写规则（顺时针：上→右→下→左） |
|------|------|--------------------------------|
| `width` | 内容宽度 | — |
| `height` | 内容高度 | — |
| `padding` | 内边距 | `10px`=四边 / `10px 20px`=上下 左右 / `10px 20px 30px`=上 左右 下 / `10px 20px 30px 40px`=上 右 下 左 |
| `border` | 边框 | `2px solid #333`（粗细 样式 颜色） |
| `margin` | 外边距 | 缩写规则同 padding |
| `border-radius` | 圆角 | `8px` |
| `box-shadow` | 阴影 | `x偏移 y偏移 模糊半径 颜色`，如 `0 2px 8px rgba(0,0,0,0.1)` |

### 2.4 Flex 布局

#### 核心原则

> `display: flex` 写在**父容器**上，控制**子元素**的排列方式。写在子元素上无效。

#### 容器属性（写在父元素上）

| 属性 | 值 | 作用 |
|------|-----|------|
| `display` | `flex` | 开启弹性布局 |
| `flex-direction` | `row`（默认）/ `column` | 主轴方向：横向/纵向 |
| `justify-content` | `flex-start` / `center` / `space-between` / `space-around` | 主轴对齐方式 |
| `align-items` | `stretch`（默认）/ `center` / `flex-start` | 交叉轴对齐方式 |
| `flex-wrap` | `nowrap`（默认）/ `wrap` | 是否换行 |
| `gap` | `20px` | 子元素间距（替代 margin） |

> `justify-` = 主轴方向（row 时是水平），`align-` = 交叉轴方向（row 时是垂直）

#### 项目属性（写在子元素上）

| 属性 | 值 | 作用 |
|------|-----|------|
| `flex` | 数字 | 等分剩余空间：`flex: 1` 表示占 1 份 |
| `width` | 固定值 | 固定宽度（如 `200px`，不受 flex 影响） |

```css
flex: 1;  /* 等效于  flex-grow: 1; flex-shrink: 1; flex-basis: 0; */
```

### 2.5 定位

| 属性值 | 参照物 | 是否脱离文档流 | 原位置是否保留 | 典型用途 |
|--------|--------|----------------|----------------|----------|
| `static`（默认） | — | 否 | — | 默认排列 |
| `relative` | 自身原位置 | 否 | **是**（占位保留） | 微调位置 |
| `absolute` | 最近的非 static 祖先（通常给祖先加 `position: relative`） | **是** | 否（不占位） | 弹出层、下拉菜单 |
| `fixed` | 浏览器窗口 | **是** | 否（不占位） | 固定导航栏、侧边栏 |

```css
/* 固定顶部导航栏 */
.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background: #333;
}

/* 弹窗遮罩铺满全屏 */
.overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: none;                           /* 默认隐藏 */
    justify-content: center;
    align-items: center;                     /* 弹窗居中 */
}
.overlay.active { display: flex; }           /* JS 切 class 显示 */
```

---

## 三、JavaScript — 行为层

### 3.1 引入方式

```html
<!-- 外部脚本（推荐），写在 </body> 之前 -->
<script src="script.js"></script>

<!-- 内部脚本 -->
<script>
    console.log("Hello");
</script>
```

> **脚本位置：** 必须写在 `</body>` 之前，确保 DOM 元素加载完毕再执行 JS。

### 3.2 变量声明

| 关键字 | 可修改 | 作用域 | 推荐场景 |
|--------|--------|--------|----------|
| `const` | 否 | 块级 `{}` | **优先使用**，不变的值 |
| `let` | 是 | 块级 `{}` | 需要重新赋值的变量 |
| `var` | 是 | 函数级 | **不推荐**（作用域混乱） |

> **避免的变量名：** `name`、`status`、`top`、`self`、`parent`、`length` 等 `window` 的已有属性名。

### 3.3 数据类型

| 类型 | 写法 | `typeof` 结果 |
|------|------|---------------|
| string（字符串） | `"hello"`、`'hello'`、`` `hello` `` | `"string"` |
| number（数字） | `42`、`3.14`、`NaN` | `"number"` |
| boolean（布尔） | `true`、`false` | `"boolean"` |
| null（空） | `null` | `"object"`（历史遗留） |
| undefined（未定义） | `let x;` | `"undefined"` |
| array（数组） | `[1, 2, 3]` | `"object"` |
| object（对象） | `{ key: "value" }` | `"object"` |

### 3.4 常用方法与函数

| 方法 | 作用 | 示例 |
|------|------|------|
| `parseInt()` | 字符串转整数 | `parseInt("50")` → `50` |
| `parseFloat()` | 字符串转浮点数 | `parseFloat("3.14")` → `3.14` |
| `.trim()` | 去首尾空格 | `" abc ".trim()` → `"abc"` |
| `.length` | 获取长度 | `"hello".length` → `5` |
| `.toLocaleString()` | 格式化时间 | `new Date().toLocaleString()` |
| `new Date()` | 创建日期对象 | 获取当前时间 |

```js
// 函数定义
function add(a, b) {
    return a + b;
}

// 箭头函数（简洁写法）
const multiply = (a, b) => a * b;
```

### 3.5 DOM 操作四步法

> DOM = Document Object Model，浏览器把 HTML 解析成的节点树。

#### 第 1 步：获取元素

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `document.getElementById("id")` | 纯 ID 值（**不加 #**） | 单个元素 | 仅按 ID 查找 |
| `document.querySelector("选择器")` | CSS 选择器（**加 # 或 .**） | 第一个匹配元素 | 最通用 |
| `document.querySelectorAll("选择器")` | CSS 选择器 | NodeList（可 forEach） | 获取全部匹配 |

```js
const titleEl = document.getElementById("title");          // 不加 #
const boxEl  = document.querySelector(".product-name");    // 加 .
const allP    = document.querySelectorAll("#product-box p"); // 全部 p
```

#### 第 2 步：修改内容

| 属性 | 写入方式 | 安全 | 说明 |
|------|----------|------|------|
| `.textContent` | `el.textContent = "文本"` | 安全 | 纯文本，HTML 标签被当文字输出 |
| `.innerHTML` | `el.innerHTML = "<strong>文本</strong>"` | 有 XSS 风险 | 会渲染 HTML 标签 |

> 经验法则：改文字用 `textContent`，确实要插 HTML 才用 `innerHTML`。

#### 第 3 步：修改样式

| 方式 | 写法 | 适用场景 |
|------|------|----------|
| `.style.xxx` | `el.style.color = "red"` | 简单一次性改动 |
| `.classList.add("类名")` | `el.classList.add("active")` | **推荐**，样式逻辑分离 |
| `.classList.remove("类名")` | `el.classList.remove("active")` | 移除 class |
| `.classList.toggle("类名")` | `el.classList.toggle("active")` | 有则删，无则加 |

> JS 中 CSS 属性用**驼峰命名**：`font-size` → `fontSize`，`background-color` → `backgroundColor`

#### 第 4 步：事件监听

```js
// 公式
元素.addEventListener("事件类型", function(事件对象) {
    // 响应逻辑
});
```

| 事件类型 | 触发时机 |
|----------|----------|
| `click` | 鼠标点击 |
| `input` | 输入框内容每次变化 |
| `change` | 内容改变且失焦 |
| `submit` | 表单提交 |

| 事件对象方法 | 作用 |
|--------------|------|
| `event.preventDefault()` | 阻止默认行为（如表单提交刷新页面） |

### 3.6 表单校验模板

```js
const form = document.querySelector("#reg-form");

form.addEventListener("submit", function(e) {
    e.preventDefault();   // 阻止默认提交

    // 取值
    const username = document.querySelector("input[name='username']").value.trim();
    const password = document.querySelector("input[name='password']").value;

    // 校验
    if (username === "") {
        alert("用户名不能为空");
        return;   // 终止，不继续
    }

    if (password.length < 6) {
        alert("密码至少 6 位");
        return;
    }

    // 复选框校验
    const hobbies = document.querySelectorAll("input[name='hobby']:checked");
    if (hobbies.length === 0) {
        alert("请至少选一个爱好");
        return;
    }

    // 全部通过
    alert("注册成功");
    // form.submit();  // 实际提交
});
```

### 3.7 显隐切换模式（模态框）

```js
// 元素一直在 HTML 里，JS 只负责切换 class 控制显隐
const openBtn  = document.querySelector("#open-btn");
const closeBtn = document.querySelector("#close-btn");
const overlay  = document.querySelector("#overlay");

openBtn.addEventListener("click", () => {
    overlay.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
});
```

> 对应 CSS：`.overlay { display: none; }` + `.overlay.active { display: flex; }`

### 3.8 获取表单控件值的方法汇总

| 控件类型 | JS 取值方式 |
|----------|-------------|
| 文本框/密码框 | `input.value` |
| 单选框（radio） | `document.querySelector("input[name='xxx']:checked").value` |
| 复选框（checkbox） | `document.querySelectorAll("input[name='xxx']:checked")` → 判 `.length` |
| 下拉框（select） | `select.value` |
| 多行文本（textarea） | `textarea.value` |

---

## 四、常见 UI 模式速查

### 4.1 导航栏

```css
.navbar {
    display: flex;
    justify-content: space-between;  /* logo 左，链接右 */
    align-items: center;
    padding: 10px 30px;
}
.nav-links { display: flex; gap: 20px; }
```

### 4.2 卡片

```css
.card {
    width: 280px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;          /* 图片不超出圆角 */
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.card img { width: 100%; display: block; }  /* display:block 消除图片底部空隙 */
```

---

## 五、踩坑记录（实际遇到的 Bug）

| 序号 | 现象 | 原因 | 修正 |
|------|------|------|------|
| 1 | 设了 `flex` 子元素还是上下排列 | `display: flex` 写在了子元素上，应该写在父容器上 | 父容器加 `display: flex` |
| 2 | `classList.add("highlight")` 不生效 | CSS 中没有定义 `.highlight` 类 | 在 CSS 中补写 `.highlight { ... }` |
| 3 | `console.log(name.textContent)` 输出 `undefined` | 变量名 `name` 是 `window.name` 的别名，赋值被转成字符串 | 换变量名 + 加 `const` |
| 4 | `getElementById("#title")` 取不到元素 | `getElementById` 不加 `#`，`querySelector` 才加 | 改成 `getElementById("title")` |
| 5 | `.trim` 校验无效 | 漏了括号 `()`，`.trim` 是取函数引用不是执行 | 改成 `.trim()` |
| 6 | `addEventListener` 没生效 | 写成了 `addeventListener`（e 小写），大小写严格 | 改成 `addEventListener` |

---

## 六、练习文件索引

| 文件 | 对应知识点 |
|------|------------|
| `HTML/review_html.html` | 基础标签、表格、列表、超链接 |
| `HTML/form_practice.html` | 表单控件 |
| `CSS/box_practice.html` + `.css` | 盒模型 + flex 入门 |
| `HTML/layout_practice.html` + `CSS/layout_practice.css` | flex 三栏布局 + fixed 定位 |
| `HTML/dom_practice.html` + `JS/dom_practice.js` | DOM 获取/修改/事件 |
| `HTML/form_validate.html` + `JS/form-validate.js` | 表单拦截 + 校验 |

---

> 后续 JavaWeb 学习（Servlet、JSP、JDBC）中，前端表单提交的数据格式与这里的 `<form>` 完全一致，DOM 操作经验也将延续到动态页面渲染中。
