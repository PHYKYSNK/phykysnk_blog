# Java SE 学习笔记：基础篇


---

最近系统过了一遍 Java SE 的基础。

## 1. 变量

```java
int age;
age = 25;
String name = "张三";
```

## 2. 数据类型

byte(1), short(2), int(4), long(8), float(4), double(8), char(2), boolean(1)

## 3. 运算符

```java
int a = 10, b = 3;
a + b  // 13
a / b  // 3
a % b  // 1
int max = (a > b) ? a : b;
```

## 4. 控制流程

```java
if (score >= 90) { } else if (score >= 60) { } else { }
for (int i = 1; i <= 5; i++) { }
while (条件) { }
do { } while (条件);
```

## 5. 数组

```java
int[] arr = new int[5];
int[] arr2 = {1, 2, 3, 4, 5};
for (int num : arr) { }
Arrays.sort(arr);
Arrays.toString(arr);
```
