# Markdown 基础语法速记

**2026-06-10**

---

常用 Markdown 写法备忘（GitHub / VS Code 通用，部分为 GFM）。

## 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

## 强调

```markdown
**粗体**  *斜体*  ~~删除线~~  ***粗斜体***
```

## 代码块

````markdown
行内代码：`代码`

```java
public class Main {
    public static void main(String[] args) {}
}
```
````

如果代码里本身有反引号 `，用双反引号包起来：`` `code` ``。

## 链接与图片

```markdown
[链接文字](https://example.com)
[带标题的链接](https://example.com "提示文字")

![替代文字](图片路径.png)
```

## 列表

```markdown
- 无序列表项
  - 子项

1. 有序列表项
   1. 子步骤
```

## 引用

```markdown
> 一行引用
> > 嵌套引用
```

## 分隔线

```markdown
---
***
___
```

## 表格（GFM）

```markdown
| 左对齐 | 居中对齐 | 右对齐 |
| :----- | :------: | -----: |
| 内容   | 内容     | 内容   |
```

## 任务列表（GFM）

```markdown
- [ ] 未完成
- [x] 已完成
```

## 换行技巧

- 段内换行：行尾加两个空格再回车
- 段落换行：中间空一行

## 转义

想在 Markdown 中显示 `*` `#` `` ` `` 等符号本身，前面加 `\`：`\*` `\#`。

