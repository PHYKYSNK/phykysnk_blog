# Vue 3 快速入门总结

> 基于 Vue 3 Composition API + ES Module 方式，涵盖核心指令、事件处理、计算属性与侦听器。

---

## 一、Vue 3 引入与初始化（ES 模块方式）

### 1.1 最小模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
</head>
<body>
    <div id="app">
        <!-- Vue 模板 -->
    </div>

    <script type="module">
        import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

        createApp({
            data() {
                return {
                    // 响应式数据
                };
            }
        }).mount("#app");
    </script>
</body>
</html>
```

### 1.2 三要素

| 项 | 含义 | 说明 |
|----|------|------|
| `createApp()` | 创建 Vue 应用实例 | 替代 Vue 2 的 `new Vue()` |
| `data()` | 返回响应式数据对象 | Vue 3 中**必须是函数**（Vue 2 可以是对象） |
| `.mount("#app")` | 挂载点 | 接管指定 HTML 元素及其内部所有内容 |

### 1.3 Vue 2 vs Vue 3 差异速记

| | Vue 2 | Vue 3（ES 模块） |
|--|-------|------------------|
| 引入方式 | `<script src="vue.js">` | `<script type="module">` + `import` |
| 创建实例 | `new Vue({ el:"#app", data:{} })` | `createApp({ data(){} }).mount("#app")` |
| data | 对象 `data: {}` | 函数 `data() { return {} }`（必须） |
| 模板语法 | 相同 | 相同 |

---

## 二、模板语法 —— `{{ }}` 插值

### 2.1 插值表达式（Mustache 小胡子语法）

```html
<div id="app">
    <h2>{{ message }}</h2>                        <!-- 输出变量 -->
    <p>{{ count + 1 }}</p>                        <!-- 表达式 -->
    <p>{{ message.toUpperCase() }}</p>             <!-- 方法调用 -->
    <p>{{ isLogin ? "已登录" : "未登录" }}</p>      <!-- 三元表达式 -->
</div>
```

### 2.2 限制

| 能做什么 | 不能做什么 |
|----------|------------|
| 变量、表达式、三元、方法调用 | 写在属性里（属性用 `v-bind`） |
| 简单运算 | 流程控制语句（if/for 用指令） |

---

## 三、核心指令速查表

### 3.1 v-bind —— 属性绑定

**完整写法：** `v-bind:属性名="data变量"`　　**简写：** `:属性名="data变量"`

| 示例 | 说明 |
|------|------|
| `:href="url"` | 动态链接 |
| `:src="imgUrl"` | 动态图片 |
| `:class="{ active: isActive }"` | 动态 class（对象写法，isActive 为 true 时添加 active 类） |
| `:style="{ color: textColor, fontSize: size + 'px' }"` | 动态 style（对象写法） |

```html
<a :href="link">跳转</a>
<img :src="avatar" :alt="name">
<div :class="{ red: isDanger, bold: isImportant }">文字</div>
```

> `v-bind` 用于 HTML 属性，`{{ }}` 用于标签内容。两者各司其职。

### 3.2 v-model —— 表单双向绑定

```html
<input v-model="username" placeholder="输入姓名">
<p>你输入的是：{{ username }}</p>
```

| 方向 | 含义 |
|------|------|
| data → 页面 | 修改 `username`，input 和 `<p>` 自动更新 |
| 页面 → data | 用户在 input 中打字，`username` 实时同步 |

**支持的控件：** `<input>`（text/password/email 等）、`<textarea>`、`<select>`、`<input type="checkbox">`

> `v-model` 本质是 `:value` + `@input` 的语法糖。

### 3.3 v-if / v-else-if / v-else —— 条件渲染

```html
<p v-if="score >= 60">合格</p>
<p v-else-if="score >= 40">补考</p>
<p v-else>不合格</p>
```

### 3.4 v-show —— 条件显示

```html
<p v-show="isLogin">欢迎回来</p>
```

| 对比 | v-if | v-show |
|------|------|--------|
| 机制 | 条件为 false 时**DOM 元素不存在** | 始终渲染，切换 `display: none` |
| 切换成本 | 高（创建/销毁 DOM） | 低（只改 CSS） |
| 适用场景 | 运行时条件极少改变 | 频繁切换（Tab 切换、加载中状态） |

### 3.5 v-for —— 列表渲染

```html
<ul>
    <li v-for="(item, index) in list" :key="item.id">
        第 {{ index + 1 }} 项：{{ item.name }}
    </li>
</ul>
```

| 语法 | 含义 |
|------|------|
| `item in list` | 遍历数组，item 为每项的值 |
| `(item, index) in list` | 带索引，index 从 0 开始 |
| `:key` | **必须**，唯一标识每项，Vue 依赖它做高效 DOM 更新 |

### 3.6 指令总览

| 指令 | 简写 | 作用 | 核心记忆 |
|------|------|------|----------|
| `v-bind` | `:` | 把 data 变量绑到 HTML 属性上 | 管属性的 `{{ }}` |
| `v-model` | — | 表单双向绑定 | 输入框神器 |
| `v-if` / `v-else-if` / `v-else` | — | 条件渲染（移除 DOM） | 开销大，适合不变的条件 |
| `v-show` | — | 条件显示（隐藏 DOM） | 开销小，适合频繁切换 |
| `v-for` | — | 列表渲染 | 必须加 `:key` |
| `v-on` | `@` | 事件监听 | `@click="handler"` |

---

## 四、事件处理 —— v-on 与 methods

### 4.1 v-on 基础

```html
<!-- 完整写法 -->
<button v-on:click="count += 1">+1</button>

<!-- 简写（最常用） -->
<button @click="count += 1">+1</button>
```

### 4.2 事件修饰符

| 修饰符 | 写法 | 作用 |
|--------|------|------|
| `.prevent` | `@submit.prevent` | 阻止默认行为（等效 `e.preventDefault()`） |
| `.stop` | `@click.stop` | 阻止事件冒泡 |
| `.enter` | `@keyup.enter` | 仅在按下 Enter 时触发 |
| `.esc` | `@keyup.esc` | 仅在按下 Esc 时触发 |

### 4.3 methods —— 事件处理抽离到方法

```js
createApp({
    data() {
        return {
            count: 0
        };
    },
    methods: {
        increment() {
            this.count++;         // 用 this. 访问 data
        },
        reduce() {
            if (this.count > 0) {
                this.count--;
            }
        },
        reset() {
            this.count = 0;
        }
    }
}).mount("#app");
```

```html
<button @click="increment">+1</button>
<button @click="reduce">-1</button>
<button @click="reset">重置</button>
```

> **关键规则：** methods 中访问 data 变量必须加 **`this.`**

### 4.4 事件对象 $event

```html
<!-- 需要原生事件对象时传 $event -->
<button @click="sayHi('张三', $event)">打招呼</button>
```

```js
methods: {
    sayHi(name, e) {
        console.log(name);  // "张三"
        console.log(e);     // 原生事件对象
    }
}
```

---

## 五、练习文件索引

| 文件 | 对应知识点 |
|------|------------|
| `01.html` | Vue 3 初始化 + `{{ }}` 插值 |
| `02.html` | v-bind、v-model、v-if、v-for |
| `03.html` | v-on + methods 初探 |
| `04.html` | methods 完整（+1/-1/重置/输入相加） |

---

## 六、Vue 开发心智模型

```
传统 JS：        数据变化 → document.querySelector → .textContent = 新值
Vue：            data 变化 → 模板自动更新（不需要手动操作 DOM）
```

**核心原则：**

1. 数据定义在 `data()` 中，模板中用 `{{ }}` 或指令引用
2. 指令用 `v-bind`（属性）/ `v-model`（表单）/ `v-on`（事件）/ `v-if`（条件）/ `v-for`（列表）
3. 复杂逻辑放 `methods`，data 变量访问一律 `this.xxx`
