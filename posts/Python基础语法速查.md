# Python 基础语法速查（新手版）

> 这份文档面向「刚上手 Python」的阶段，重点不是讲原理，而是**把最基础的写法和符号列清楚**。
> 拿不准某个东西该用哪个括号、哪个符号时，来查表。

---

## 目录

- [0. 最重要的一页：符号对照表](#0-最重要的一页符号对照表)
- [1. 文件怎么写、怎么跑](#1-文件怎么写怎么跑)
- [2. 变量](#2-变量)
- [3. 数据类型总览](#3-数据类型总览)
- [4. 四种容器（重点）](#4-四种容器重点)
- [5. 字符串](#5-字符串)
- [6. 运算符](#6-运算符)
- [7. 条件判断](#7-条件判断)
- [8. 循环](#8-循环)
- [9. 函数](#9-函数)
- [10. 类（最简版）](#10-类最简版)
- [11. 索引与切片](#11-索引与切片)
- [12. 常用内置函数](#12-常用内置函数)
- [13. 报错信息速查](#13-报错信息速查)
- [14. 「想当然」与「实际」对照](#14-想当然与实际对照)

---

## 0. 最重要的一页：符号对照表

### 4 种容器 → 4 种括号

| 容器 | 名字 | 用什么符号 | 例子 |
|---|---|---|---|
| 列表 | `list` | **方括号** `[ ]` | `[1, 2, 3]` |
| 元组 | `tuple` | **圆括号** `( )` | `(1, 2, 3)` |
| 字典 | `dict` | **花括号** `{ }` + 里面用**冒号** `:` | `{"name": "Tom", "age": 25}` |
| 集合 | `set` | **花括号** `{ }`（里面**没有冒号**） | `{1, 2, 3}` |

### 空值怎么写（最容易搞错的部分）

| 我要的 | 写法 | 注意 |
|---|---|---|
| 空列表 | `[]` | |
| 空元组 | `()` | |
| 空字典 | `{}` | ⚠️ **`{}` 是空字典，不是空集合** |
| 空集合 | `set()` | ⚠️ **只能用 `set()`，不能写 `{}`** |
| 空字符串 | `""` 或 `''` | |
| 空值 | `None` | 首字母大写 |

### 分隔符用哪个（超高频错误点）

| 场景 | 用什么 | 例子 |
|---|---|---|
| 字典**字面量**里分隔键和值 | **冒号** `:` | `{"name": "Tom"}` |
| 给字典**赋值** | **等号** `=` | `d["name"] = "Tom"` |
| 变量赋值 | **等号** `=` | `x = 1` |
| 比较是否相等 | **双等号** `==` | `if x == 1:` |
| 代码块开始 | **冒号** `:` + 换行缩进 | `if x > 0:` / `def f():` |
| 元素之间分隔 | **逗号** `,` | `[1, 2, 3]` |

### 一句话记住

> **`:` 描述结构（字典、代码块），`=` 执行动作（赋值）。**

---

## 1. 文件怎么写、怎么跑

### 文件

- 后缀是 `.py`，例如 `hello.py`
- 文件名用小写字母 + 下划线，例如 `my_first_script.py`

### 运行

在文件所在目录打开终端，执行：

```bash
python hello.py
```

### 三个最基础的规则

**① 没有分号。** 一行写完就换行，不用写 `;`

```python
x = 1
y = 2
```

**② 缩进就是语法。** 代码块用 **4 个空格** 缩进，不用花括号 `{}`

```python
if x > 0:
    print("正数")        # ← 这行缩进了，属于 if 的代码块
print("结束")            # ← 这行没缩进，if 结束之后的代码
```

⚠️ **缩进错了程序就跑不对，这是语法错误，不是排版问题。** 坚决不要混用 Tab 和空格。

**③ 注释用 `#`**

```python
# 这是整行注释
x = 1    # 这是行尾注释
```

多行注释用三引号（实际上是一个没被赋值的字符串）：

```python
"""
这是多行注释
可以写好几行
"""
```

---

## 2. 变量

### 不需要声明类型

```python
age = 18
name = "Tom"
price = 9.9
is_ok = True
```

和 Java 不同，**不用写 `int` / `String`**，Python 自己推断。

### 名字可以改指向别的类型

```python
x = 1
x = "hello"      # 合法，x 现在指向字符串
```

### 变量名规则

- 只能用：字母、数字、下划线
- **不能以数字开头**
- 区分大小写（`name` 和 `Name` 是两个变量）
- 不能用 Python 关键字（`if`、`for`、`class`、`def`…）
- 习惯用小写 + 下划线：`user_name`、`total_count`

⚠️ **不要用这些名字当变量名**（它们都是内置函数）：
`sum`、`list`、`dict`、`set`、`max`、`min`、`len`、`type`、`id`、`print`、`input`

用它们当变量名会覆盖掉内置函数，后面再用就会报 `TypeError: 'int' object is not callable`。

### 一次赋值多个

```python
a, b = 1, 2
a, b = b, a          # 交换两个变量，不用中间变量
```

### 查看类型

```python
x = 1
print(type(x))       # <class 'int'>
```

---

## 3. 数据类型总览

| 类型 | 名字 | 例子 | 说明 |
|---|---|---|---|
| 整数 | `int` | `1` `-5` `1000000` | 没有大小限制 |
| 小数 | `float` | `3.14` `-0.5` | 浮点数 |
| 字符串 | `str` | `"hello"` `'你好'` | 单双引号都行 |
| 布尔 | `bool` | `True` `False` | **首字母必须大写** |
| 空值 | `NoneType` | `None` | 表示"什么都没有" |

⚠️ 布尔值是 `True` / `False`（大写 T、大写 F），不是 `true` / `false`。

---

## 4. 四种容器（重点）

### 快速对比

| 容器 | 符号 | 有序吗 | 能修改吗 | 能重复吗 | 什么时候用 |
|---|---|---|---|---|---|
| 列表 `list` | `[ ]` | 有序 | ✅ 能改 | ✅ 能重复 | 最常用，一组数据 |
| 元组 `tuple` | `( )` | 有序 | ❌ **不能改** | ✅ 能重复 | 不会变的一组值 |
| 字典 `dict` | `{键: 值}` | 有序* | ✅ 能改 | 键不能重复 | 键值对，查表 |
| 集合 `set` | `{ }` / `set()` | ❌ 无序 | ✅ 能改 | ❌ **自动去重** | 去重、判断存在 |

\* Python 3.7+ 的字典会保持插入顺序，但不要依赖它。

---

### 4.1 列表 list

```python
nums = [1, 2, 3]
empty = []
mixed = [1, "a", True]        # 可以混装不同类型
nested = [[1, 2], [3, 4]]     # 可以嵌套
```

**常用操作：**

```python
nums = [1, 2, 3]

nums.append(4)          # 末尾追加 → [1, 2, 3, 4]
nums.insert(0, 0)       # 在指定位置插入
nums.remove(2)          # 删除第一个值为 2 的元素
last = nums.pop()       # 删除并返回最后一个
nums[0] = 99            # 按下标改
length = len(nums)      # 长度（是函数，不是 .length）
print(2 in nums)        # 判断是否存在 → True / False
nums.sort()             # 原地排序（返回 None！）
```

⚠️ **`nums.sort()` 没有返回值**，写 `x = nums.sort()` 会得到 `None`。要返回新列表用 `sorted(nums)`。

⚠️ 列表追加用 **`append`**，不是 `add`（那是 Java 的写法，Python 会报 `AttributeError`）。

---

### 4.2 元组 tuple

**定义：用圆括号，元素之间用逗号。**

```python
point = (3, 5)
rgb = (255, 0, 0)
single = (5,)          # ⚠️ 只有一个元素时，必须加逗号！
```

⚠️ **单元素元组的坑：**

```python
a = (5)      # 这不是元组，只是加了括号的整数 5
b = (5,)     # 这才是元组
print(type(a))   # <class 'int'>
print(type(b))   # <class 'tuple'>
```

**元组不能修改：**

```python
point = (3, 5)
point[0] = 9      # ❌ TypeError: 'tuple' object does not support item assignment
```

**优点**：不会被意外改动，可以当作字典的键。

---

### 4.3 字典 dict

**定义：用花括号，里面是「键: 值」，键和值之间用冒号。**

```python
person = {"name": "Tom", "age": 25}
empty = {}
```

⚠️ **这是最容易写错的地方 —— 冒号，不是等号：**

```python
person = {"name": "Tom", "age": 25}     # ✅ 正确
person = {"name" = "Tom", "age" = 25}   # ❌ 语法错误
```

**常用操作：**

```python
d = {"name": "Tom", "age": 25}

d["city"] = "Beijing"      # 新增/修改（这里用等号）
print(d["name"])           # 按键取值 → Tom
print(d.get("phone"))      # 不存在返回 None，不报错
print(d.get("phone", "无")) # 不存在返回默认值
print("age" in d)          # 判断键是否存在 → True
del d["age"]               # 删除某个键
print(len(d))              # 键的个数
print(list(d.keys()))      # 所有键
print(list(d.values()))    # 所有值
```

⚠️ **`d["不存在的键"]` 会直接抛 `KeyError`，不会返回 null。** 不确定键存在时用 `d.get(...)`。

**遍历字典：**

```python
d = {"name": "Tom", "age": 25}

for key in d:                        # 遍历键
    print(key)

for key, value in d.items():         # 遍历键和值
    print(key, value)
```

---

### 4.4 集合 set

**定义：用花括号，但里面**没有冒号**；或者用 `set()`。**

```python
s = {1, 2, 3}
s2 = set([1, 2, 2, 3])       # 自动去重 → {1, 2, 3}
empty = set()                # ⚠️ 空集合只能这样写
```

⚠️ **`{}` 创建的是空字典，不是空集合：**

```python
a = {}          # 这是空字典！
b = set()       # 这才是空集合
```

**常用操作：**

```python
s = {1, 2, 3}

s.add(4)            # 添加（注意是 add，不是 append）
s.remove(1)         # 删除（不存在会报错）
s.discard(99)       # 删除（不存在也不报错）
print(len(s))       # 大小
print(2 in s)       # 判断是否存在（很快）
```

**用途：去重**

```python
nums = [1, 2, 2, 3, 1]
unique = list(set(nums))     # 去重后转回列表
```

⚠️ 集合是**无序**的，所以 `list(set(...))` 出来的**顺序不保证**。

---

## 5. 字符串

### 定义

```python
s1 = "双引号"
s2 = '单引号'          # 完全等价，选一种用到底就行
s3 = "里面有'单引号'"
s4 = '里面有"双引号"'
s5 = """多行
字符串"""
```

### 拼接与重复

```python
a = "Hello"
b = "World"

print(a + " " + b)     # Hello World    用 + 拼接
print(a * 3)           # HelloHelloHello  用 * 重复

print("Hello" + 5)     # ❌ TypeError：字符串和数字不能直接 +
print("Hello" + str(5))  # ✅ 要先用 str() 转换
```

### f-string（推荐，最常用）

```python
name = "Tom"
age = 25

print(f"我叫{name}，今年{age}岁")     # 我叫Tom，今年25岁
print(f"明年{age + 1}岁")             # 里面可以直接写表达式
```

写法：字符串前面加 `f`，变量用 `{}` 包起来。

### 常用方法

```python
s = "  Hello World  "

s.strip()          # 去掉两端空白 → "Hello World"
s.lower()          # 转小写
s.upper()          # 转大写
s.replace("o", "0")
s.split()          # 按空白切分 → ['Hello', 'World']
s.split(",")       # 按逗号切分
"-".join(["a", "b"])   # 用 - 连接 → 'a-b'
s.startswith(" ")  # 是否以某内容开头
s.find("World")    # 返回下标，找不到返回 -1
len(s)             # 长度
```

⚠️ 这些**都返回新字符串，不会修改原字符串**（字符串是不可变的）。

---

## 6. 运算符

### 算术

| 运算符 | 含义 | 例子 | 结果 |
|---|---|---|---|
| `+` | 加 | `3 + 2` | `5` |
| `-` | 减 | `3 - 2` | `1` |
| `*` | 乘 | `3 * 2` | `6` |
| `/` | 除（**结果是小数**） | `7 / 2` | `3.5` |
| `//` | 整除（向下取整） | `7 // 2` | `3` |
| `%` | 取余 | `7 % 2` | `1` |
| `**` | 幂 | `2 ** 3` | `8` |

⚠️ Python 的 `/` **一定返回小数**，`7 / 2` 是 `3.5`，不是 `3`。

### 比较（结果都是 True / False）

```python
==   等于
!=   不等于
>  <  >=  <=
```

### 逻辑运算

| Python | 其他语言 | 含义 |
|---|---|---|
| `and` | `&&` | 并且 |
| `or` | `\|\|` | 或者 |
| `not` | `!` | 取反 |

```python
if age > 18 and score > 60:
    print("通过")
```

⚠️ Python **没有** `&&` `||` `!` 这三个符号，只能写 `and` `or` `not`。

### 成员运算

```python
print(2 in [1, 2, 3])         # True
print("a" in "abc")           # True
print("x" not in "abc")       # True
print("name" in {"name": 1})  # True（判断的是键）
```

### 身份运算

```python
a is b        # 是不是同一个对象（比"身份"）
a is not b
a == b        # 值是否相等（比"内容"）
```

### 增强赋值

```python
x += 1     # 等价于 x = x + 1
x -= 1
x *= 2
x /= 2
```

⚠️ Python **没有 `++` 和 `--`**，自增必须写 `x += 1`。

---

## 7. 条件判断

```python
if score >= 90:
    print("优秀")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

三个要点：

1. 条件**不写括号**
2. 行尾必须写**冒号** `:`
3. 代码块靠**缩进**

⚠️ `else if` 在 Python 里写作 **`elif`**（一个词）。

⚠️ **多个分支只会执行一个**：谁先满足算谁，后面的不再判断。

### 什么是「真」什么是「假」

不用写 `if x == True:`，直接写 `if x:` 就行：

**假值（这些都算 False）：**
```python
False   None   0   0.0   ""   []   {}   ()
```

**其他一切值都算 True。**

```python
nums = []
if nums:
    print("有元素")
else:
    print("空列表")      # ← 会走这里
```

---

## 8. 循环

### for：用来「遍历」

```python
# 遍历列表
for item in [1, 2, 3]:
    print(item)

# 遍历字符串
for ch in "abc":
    print(ch)

# 遍历字典的键
for key in {"a": 1, "b": 2}:
    print(key)
```

**需要数字序列时用 `range()`：**

```python
range(5)          # 0, 1, 2, 3, 4        ← 不含 5
range(1, 5)       # 1, 2, 3, 4           ← 左闭右开
range(1, 10, 2)   # 1, 3, 5, 7, 9        ← 第三个参数是步长

for i in range(3):
    print(i)      # 0 1 2
```

⚠️ **`range(n)` 不包含 n。** 想循环到 n 就写 `range(n + 1)`。

**同时拿下标和值：**

```python
for i, ch in enumerate(["a", "b"]):
    print(i, ch)      # 0 a / 1 b
```

### while：条件为真就一直循环

```python
n = 3
while n > 0:
    print(n)
    n -= 1            # ⚠️ 别忘了改条件，否则死循环
```

### break / continue

```python
for i in range(10):
    if i == 3:
        break         # 直接结束整个循环
    if i == 1:
        continue      # 跳过这一次，继续下一次
    print(i)
```

---

## 9. 函数

### 定义与调用

```python
def greet(name):
    return "Hello, " + name

result = greet("Tom")
print(result)
```

要点：

- 用 `def` 开头
- 参数**不写类型**，返回值**不写类型**
- 行尾写**冒号**
- 函数体**缩进**
- 用 `return` 返回值；**没有 `return` 的函数返回 `None`**

### 默认参数

```python
def greet(name, greeting="Hello"):
    return greeting + ", " + name

print(greet("Tom"))              # Hello, Tom
print(greet("Tom", "Hi"))        # Hi, Tom
```

⚠️ **默认值不要用可变对象**（列表、字典）：

```python
def add_item(item, box=[]):       # ❌ 错的
    box.append(item)
    return box

def add_item(item, box=None):     # ✅ 对的
    if box is None:
        box = []
    box.append(item)
    return box
```

### 关键字参数

调用时可以用 `名字=值` 的方式，顺序就不重要了：

```python
def info(name, age):
    print(name, age)

info(age=25, name="Tom")     # 可以颠倒顺序
```

### 返回多个值（其实是返回元组）

```python
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([3, 1, 5])
print(low, high)      # 1 5
```

---

## 10. 类（最简版）

```python
class Dog:
    def __init__(self, name):        # 构造方法，固定叫 __init__
        self.name = name             # 实例属性

    def bark(self):                  # 方法的第一个参数必须是 self
        return self.name + " says woof"


d = Dog("Tom")                       # ⚠️ 不用 new
print(d.bark())
```

四个要点：

1. 类名用 `class` 开头，习惯**首字母大写**：`Dog`、`User`
2. 构造方法固定叫 **`__init__`**（前后各两条下划线）
3. 每个方法的**第一个参数必须是 `self`**（它是"接住实例的位置"）
4. **创建对象不用 `new`**，直接写 `Dog("Tom")`

### `self` 到底是什么

```python
d.bark()          # 你写的
Dog.bark(d)       # Python 实际执行的（实例被自动塞进第一个参数）
```

所以定义时要留一个参数接住它 —— 那就是 `self`。

### 实例属性 vs 类属性

```python
class Dog:
    tricks = []                  # ← 写在类体里 = 类属性，所有实例共享

    def __init__(self, name):
        self.name = name         # ← self.x = ... = 实例属性，每个一份

    def add_trick(self, t):
        self.tricks.append(t)
```

```python
a = Dog("a")
b = Dog("b")
a.add_trick("sit")
print(b.tricks)      # ['sit']   ← b 也受影响！
```

⚠️ **想让每个实例各有一份，必须在 `__init__` 里赋值 `self.tricks = []`。**

---

## 11. 索引与切片

```python
s = "abcdef"
nums = [10, 20, 30, 40, 50]
```

### 索引

```python
print(nums[0])      # 10     第一个（下标从 0 开始）
print(nums[-1])     # 50     最后一个
print(nums[-2])     # 40     倒数第二个
```

⚠️ 下标越界会报 `IndexError`。

### 切片

语法：`序列[开始:结束:步长]`，**左闭右开**（不含结束位置）

```python
nums = [10, 20, 30, 40, 50]

nums[1:3]      # [20, 30]        从下标 1 到 3 之前
nums[:2]       # [10, 20]        从头开始
nums[2:]       # [30, 40, 50]    到末尾
nums[:]        # [10, 20, 30, 40, 50]   全部（相当于复制一份）
nums[::2]      # [10, 30, 50]    每隔一个取
nums[::-1]     # [50, 40, 30, 20, 10]   反转
```

⚠️ 切片**不会报越界错**，超出的部分自动忽略。

### 两种给列表赋值的方式（结果完全不同）

```python
nums = [1, 2, 3]

nums[0] = 99        # 改第 0 个元素 → [99, 2, 3]
nums[:] = [7, 8]    # 把整个内容换掉 → [7, 8]
nums = [5, 6]       # 让 nums 这个名字指向一个全新的列表
```

---

## 12. 常用内置函数

| 函数 | 作用 | 例子 |
|---|---|---|
| `print(x)` | 打印 | `print("hi")` |
| `type(x)` | 查看类型 | `type(1)` → `<class 'int'>` |
| `len(x)` | 长度/个数 | `len([1,2])` → `2` |
| `int(x)` | 转整数 | `int("25")` → `25` |
| `str(x)` | 转字符串 | `str(25)` → `"25"` |
| `float(x)` | 转小数 | `float("1.5")` → `1.5` |
| `list(x)` | 转列表 | `list("abc")` → `['a','b','c']` |
| `set(x)` | 转集合（去重） | `set([1,1,2])` → `{1,2}` |
| `sum(x)` | 求和 | `sum([1,2,3])` → `6` |
| `max(x)` / `min(x)` | 最大 / 最小 | `max([1,5,3])` → `5` |
| `abs(x)` | 绝对值 | `abs(-3)` → `3` |
| `round(x, n)` | 四舍五入 | `round(3.14159, 2)` → `3.14` |
| `sorted(x)` | 排序（返回新列表） | `sorted([3,1,2])` → `[1,2,3]` |
| `range(n)` | 生成数字序列 | `range(3)` → 0,1,2 |
| `input(prompt)` | 读用户输入（**返回字符串**） | `input("请输入：")` |
| `isinstance(x, T)` | 判断是不是某类型 | `isinstance(1, int)` → `True` |

⚠️ **`sorted()` 和 `.sort()` 的区别：**

```python
nums = [3, 1, 2]

new_list = sorted(nums)     # ✅ 返回新列表，nums 不变
nums.sort()                 # ⚠️ 原地排序，返回 None
```

⚠️ **`input()` 返回的永远是字符串**，要数字必须转：

```python
age = input("年龄：")        # 得到 "25"（字符串）
age = int(input("年龄："))   # 这样才是整数
```

### `print` 的两个参数

```python
print("a", "b")              # a b        多个参数自动用空格分隔
print("a", "b", sep="-")     # a-b        自定义分隔符
print("a", end="")           # 不换行
```

---

## 13. 报错信息速查

看懂报错是最重要的调试技能。常见报错对应：

| 报错 | 常见原因 |
|---|---|
| `SyntaxError: invalid syntax` | 漏了冒号、括号不配对、字典字面量里写了 `=` |
| `IndentationError` | 缩进不对（多一个/少一个空格、混用 Tab 和空格） |
| `NameError: name 'x' is not defined` | 变量没定义、拼写错、或定义在使用之后 |
| `TypeError: 'int' object is not callable` | 用内置函数名当了变量名（如 `sum = 0`），把它覆盖了 |
| `TypeError: can only concatenate str (not "int") to str` | 字符串和数字直接 `+`，需要 `str()` |
| `TypeError: 'tuple' object does not support item assignment` | 试图修改元组 |
| `IndexError: list index out of range` | 下标越界 |
| `KeyError: 'xxx'` | 字典里没有这个键 |
| `AttributeError: 'list' object has no attribute 'add'` | 方法名用错（列表是 `append`） |
| `ValueError: invalid literal for int()` | `int("abc")` —— 转换失败 |
| `ZeroDivisionError` | 除以 0 |
| `UnboundLocalError` | 函数内给外部变量赋值了，但没写 `nonlocal` |
| `ModuleNotFoundError: No module named 'xxx'` | 包没装，或装到了另一个 Python 解释器 |
| `AttributeError: 'NoneType' object has no attribute ...` | 上一步返回了 `None`（比如用了 `.sort()` 的返回值） |

---

## 14. 「想当然」与「实际」对照

如果你有 Java / JS / C 的基础，这些地方最容易顺手写错：

| 想当然的写法 | Python 实际写法 | 说明 |
|---|---|---|
| `{}` 创建空集合 | `{}` 是**空字典**；空集合写 `set()` | ⚠️ 最高频 |
| `{"a" = 1}` | `{"a": 1}` | 字典字面量用**冒号** |
| `list.add(x)` | `list.append(x)` | 列表追加是 `append` |
| `set.append(x)` | `set.add(x)` | 反过来，集合是 `add` |
| `arr.length` | `len(arr)` | 长度是**函数** |
| `true` / `false` | `True` / `False` | 首字母大写 |
| `null` | `None` | |
| `&&` `\|\|` `!` | `and` `or` `not` | |
| `i++` | `i += 1` | Python 没有 `++` |
| `new Dog()` | `Dog()` | 没有 `new` |
| `else if` | `elif` | |
| `map.get(k)` 返回 null | `d[k]` 会抛 `KeyError` | 安全取值用 `d.get(k, 默认值)` |
| 数组长度固定 | 列表**可以随意增删** | |
| `int` 有大小限制 | Python 整数**无上限** | |
| 字符串是字符数组 | 字符串**不可变**，所有方法返回新串 | |
| `print` 多个东西会连在一起 | 会自动**插入空格** | `print("T3:", 8)` → `T3: 8` |

---

## 附：写代码的三个小习惯

1. **变量名要有意义**：用 `total_count` 而不是 `a`、`s1`、`tmp`
2. **逗号后加空格、冒号前不加空格**：`def f(a, b):` / `d = {"k": 1}`
3. **写完立刻跑一遍**：不要一次写一百行再运行，出错时不知道是哪一行的问题

---

*参考：Python 3.13。本文档中的写法均在本机实际运行验证过。*
