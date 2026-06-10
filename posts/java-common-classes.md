# Java SE：常用类（String、包装类）

**2026-06-10**

---

## 1. String 类

### 创建方式

```java
// 直接赋值（字符串常量池）
String s1 = "hello";

// new 创建（堆内存）
String s2 = new String("hello");
```

### 常用方法

```java
String s = "Hello Java";

s.length();                     // 长度
s.charAt(0);                    // 获取指定字符
s.indexOf("Java");              // 查找子串位置
s.toUpperCase();                // 转大写
s.toLowerCase();                // 转小写
s.replace("Java", "Python");    // 替换
s.substring(6);                 // 截取
s.split(" ");                   // 分割成数组
s.equals("hello java");        // 比较内容（用equals不用==）
s.startsWith("He");            // 是否以...开头
s.contains("World");           // 是否包含...
```

### StringBuilder（可变字符串）

String 是不可变的，频繁拼接用 StringBuilder。

```java
StringBuilder sb = new StringBuilder();
sb.append("hello");
sb.append(" world");
sb.reverse();
System.out.println(sb.toString());  // "dlrow olleh"
```

## 2. 包装类

基本类型有对应的包装类：Integer、Double、Character、Boolean 等。

```java
// 自动装箱和拆箱
Integer i = 10;      // 装箱：int → Integer
int n = i;           // 拆箱：Integer → int

// 字符串 ↔ 数字
int num = Integer.parseInt("123");   // String → int
String str = String.valueOf(123);    // int → String
```

## 3. 练习

统计字符串中单词出现次数、字符出现次数：

```java
// 统计 "hello" 出现次数
String s = "hello world hello java hello";
int pos = 0, cnt = 0;
while ((pos = s.indexOf("hello", pos)) != -1) {
    cnt++;
    pos += "hello".length();
}
System.out.println(cnt);  // 3

// 统计字符 'l' 出现次数
int cntL = 0;
for (int i = 0; i < s.length(); i++) {
    if (s.charAt(i) == 'l') cntL++;
}
System.out.println(cntL);  // 6
```
