# Java SE 学习笔记：基础篇

**2026-06-10**

---

最近系统过了一遍 Java SE 的基础，把学到的东西整理成笔记。这是第一篇——基础篇。

## 1. 变量

变量是存储数据的基本单元，就像一个带标签的盒子。

```java
// 方式1：先声明后赋值
int age;
age = 25;

// 方式2：声明时直接初始化（推荐）
String name = "张三";
double height = 1.75;
```

**命名规则：**
- 由字母、数字、下划线、$ 组成
- 不能以数字开头
- 不能使用 Java 保留字（if、class、public 等）
- 建议使用有意义的名称（驼峰命名法：studentName）

## 2. 数据类型

Java 是**强类型语言**，数据类型分为两大类：

**基本数据类型（8 种）：**

| 类型 | 关键字 | 占用 | 范围 | 示例 |
|-----|--------|-----|------|------|
| 字节型 | byte | 1字节 | -128~127 | `byte b = 100;` |
| 短整型 | short | 2字节 | -32768~32767 | `short s = 1000;` |
| 整型 | int | 4字节 | -21亿~21亿 | `int i = 100000;` |
| 长整型 | long | 8字节 | 超大 | `long l = 100000L;` |
| 单精度 | float | 4字节 | 小数 | `float f = 3.14f;` |
| 双精度 | double | 8字节 | 高精度小数 | `double d = 3.14159;` |
| 字符型 | char | 2字节 | 单个字符 | `char c = 'A';` |
| 布尔型 | boolean | 1位 | true/false | `boolean flag = true;` |

**类型转换：**

```java
// 自动类型转换（小→大，安全）
int i = 100;
double d = i;

// 强制类型转换（大→小，可能丢精度）
double pi = 3.14159;
int num = (int) pi;  // 结果为3
```

## 3. 运算符

```java
int a = 10, b = 3;
a + b   // 13
a - b   // 7
a * b   // 30
a / b   // 3（整数除法）
a % b   // 1（取余）

// 三元运算符
int max = (a > b) ? a : b;
```

**逻辑运算符：** &&（短路与）、||（短路或）、!（非）

## 4. 控制流程

**if-else 分支：**

```java
if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}
```

**switch 语句：** 注意每个 case 后面要加 `break`，否则会穿透。

**三种循环：**

```java
// for 循环
for (int i = 1; i <= 5; i++) { }

// while 循环
while (条件) { }

// do...while 循环：至少执行一次
do { } while (条件);
```

- `break`：跳出整个循环
- `continue`：跳过本次循环

## 5. 数组

**声明和初始化：**

```java
int[] arr = new int[5];        // 默认值0
int[] arr2 = {1, 2, 3, 4, 5};  // 直接初始化
```

**遍历：**

```java
// 普通for
for (int i = 0; i < arr.length; i++) { }

// 增强for（foreach）
for (int num : arr) { }
```

**Arrays 工具类：**

```java
Arrays.sort(arr);              // 排序
Arrays.toString(arr);          // 转字符串
Arrays.binarySearch(arr, 5);   // 二分查找（需先排序）
Arrays.copyOf(arr, 10);        // 复制（可扩容）
Arrays.fill(arr, 10);          // 填充
```

## 练习

一个完整的练习：计算 1 到 100 的偶数和、判断成绩等级、打印三角形。

```java
public class Main {
    public static void main(String[] args) {
        // 1-100偶数和
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            if (i % 2 == 0) sum += i;
        }
        System.out.println(sum);  // 2550

        // 打印直角三角形
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}
```

---

*下一篇会整理面向对象部分。*

