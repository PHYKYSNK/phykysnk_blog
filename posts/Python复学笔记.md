# Python 复学笔记：我搞清楚了「学过就忘」是怎么回事

## 写在前面

大三，前端和 Java 有一些基础，现在要学 Python —— 原因是找实习时发现岗位要求。

网课我是完整看过一轮的，顺序是：函数基础 → 函数进阶 → 类型注解 → 模块 → 面向对象基础 → 异常 → 大模型部署。按理说该学的都学过了。

问题在于：**跟着教程能写出来，过一段时间连自己写的代码都读不懂。**

这篇文章记录的不是"又听了一遍网课"，而是换了一种学法之后，我到底搞明白了什么。

---

## 一、先说结论：我的问题不是「没学过」

这个症状我不是第一次遇到。Vue、Java 多线程、Java 网络编程、Spring Boot —— 全都一模一样：**学的时候会写，过一段时间看不懂。**

一开始我以为是记性差，或者就是不适合干这行。后来想通了两件事，才明白问题出在哪。

### 1. 忘了 API 是正常的，忘了逻辑是不正常的

必须把这两种遗忘分开：

| 现象 | 是否正常 | 解法 |
|---|---|---|
| 忘了方法名、参数顺序 | ✅ 完全正常，所有人都这样 | 查文档 |
| **连逻辑都读不懂，像在看别人写的代码** | ❌ 不正常 | 说明当时就没理解 |

我长期在第二种状态里，却一直用第一种的理由安慰自己。这个自我评价是失真的。

### 2. 我学的是「怎么用」，不是「为什么」

教程教的是"这样写就能跑"，没教"为什么必须这样"。

具体到每个技术：

- **Vue**：我会写 `data` / `computed`，但不知道 JS 是怎么知道数据变了（答案是 `Proxy` / `Object.defineProperty` 劫持属性读写）
- **Java 多线程**：我会写 `synchronized`，但不知道**为什么需要锁**（答案是 JMM 与多核 CPU 缓存不一致）
- **Java 网络编程**：我会写 `Socket`，但不知道字节流为什么没有边界（粘包问题）
- **Spring Boot**：我会写注解，但不知道请求怎么从浏览器走到我的方法里

**共同点：教程把"为什么"藏起来了。** 于是我的知识是一堆没有锚点的符号，记忆一退，整段就解体了。

---

## 二、先做一次诊断：我到底哪里没懂

重学之前我先做了一件事：**不查资料、不运行，凭印象预测下面几段代码的输出。** 结果很有价值。

### 诊断题

```python
# Q1 类型注解
def add(a: int, b: int) -> int:
    return a + b
print(add(1, 2))
print(add("1", "2"))

# Q2 异常
def f():
    try:
        return "try"
    finally:
        return "finally"
print(f())

# Q3 类属性
class Dog:
    tricks = []
    def add_trick(self, t):
        self.tricks.append(t)

a = Dog()
b = Dog()
a.add_trick("sit")
print(b.tricks)

# Q4 生成器
def gen():
    print("A")
    yield 1
    print("B")
    yield 2

g = gen()
print("start")
print(next(g))
print(next(g))
```

### 结果

| 题 | 我的预测 | 实际 | 判定 |
|---|---|---|---|
| Q1 | `3` / 以为会报错 | `3` / **`12`** | 有洞 |
| Q2 | 不确定 | **`finally`** | 有洞 |
| Q3 | `[]` | **`['sit']`** | 有洞（最大） |
| Q4 | 没学 | `start A 1 B 2` | 未学 |

**一次扫出四个洞，比重新看一遍教程高效得多。** 这个诊断方法我后面一直在用：**先用预测题找出真正没懂的，再只针对漏洞补机制。**

---

## 三、核心知识点：按「机制」重新组织

下面这些是我这轮真正搞懂的东西。**注意排序方式**：不是按语法分类，而是按依赖关系 —— 后面每一个都建立在前面之上。

### 1. `=` 是给名字换绑定，不是「装箱」

Java 的变量是**盒子**：盒子有类型，值装在里面。

Python 的变量是**名字（标签）**：对象有类型，名字没有。所以下面这段在 Python 里完全合法：

```python
x = 1
x = "hello"      # 合法，x 只是改指向了另一个对象
```

判断"改动会不会影响到别处"，只看一件事：**等号左边是什么。**

| 写法 | 含义 | 外部可见 |
|---|---|---|
| `nums = [1, 2, 3]` | 名字改指向新对象 | ❌ |
| `nums[:] = [...]` | 把原对象的内容整体替换 | ✅ |
| `nums.append(x)` | 修改原对象的内容 | ✅ |
| `d["k"] = v` | 修改原对象的内容 | ✅ |

**判据：左边是「名字」→ 改绑定；左边是「对象的一部分」（`nums[:]`、`nums[0]`、`d["k"]`）→ 改内容。**

一个能一锤定音的实验：

```python
a = [1, 2, 3]
b = a
a[:] = [9, 9]
print(b)        # [9, 9]   ← b 也变了！
print(a is b)   # True     ← 还是同一个对象

c = [1, 2, 3]
d = c
c = [9, 9]
print(d)        # [1, 2, 3]  ← d 没变
print(c is d)   # False
```

`a[:] = ...` 改了内容 → 所有指向它的名字都看得见；`c = ...` 只是改了绑定 → 只影响 `c` 自己。

### 2. 函数传参：改内容和改绑定是两件事

因为传参也是"把参数名绑定到对象上"，所以：

- 函数内**修改对象内容** → 调用方看得见
- 函数内**给参数重新赋值**（改绑） → 调用方看不见

```python
def modify_list(nums):
    nums.append(99)      # 改内容 → 外部可见
    nums = [1, 2, 3]     # 改绑定 → 外部不可见
    nums.append(100)
    return nums

data = [10, 20]
returned = modify_list(data)

print(data)              # [10, 20, 99]
print(returned)          # [1, 2, 3, 100]
print(data is returned)  # False
```

### 3. 可变默认参数陷阱

这是 Python 最著名的坑之一。默认值**只在 `def` 执行时创建一次**，所有没传这个参数的调用共用同一个对象。

```python
def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item("apple"))    # ['apple']
print(add_item("banana"))   # ['apple', 'banana']   ← 累积了！
print(add_item("cherry"))   # ['apple', 'banana', 'cherry']
```

铁证是函数对象上的 `__defaults__` 属性：

```python
add_item("apple")
print(add_item.__defaults__)
# (['apple'],)
```

默认值对象**本身被改写**了 —— 它最初是个空列表 `[]`。

> 顺带发现：Python 里**函数也是对象**，所以函数能带属性（`__defaults__`、`__name__`、`__annotations__`）。Java 里方法不是对象，不存在这个概念。

**正确写法：用 `None` 当哨兵。**

```python
def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket
```

为什么用 `None` 而不是 `0` 或 `False`？因为 `None` 是唯一不会被当成"合法传入值"的哨兵。

### 4. 浅拷贝与深拷贝

先记住三种写法的差别：

| 写法 | 外层 | 内层 |
|---|---|---|
| `b = a` | 共享 | 共享（只是多一个名字） |
| `b = a.copy()` | 新建 | **共享** |
| `b = copy.deepcopy(a)` | 新建 | 新建 |

```python
a = [[1, 2], [3, 4]]
b = a.copy()

b.append([5, 6])
print(a)        # [[1, 2], [3, 4]]        ← 外层独立，不受影响

b[0].append(99)
print(a)        # [[1, 2, 99], [3, 4]]    ← 内层共享，跟着变了
print(a[0] is b[0])   # True
```

**"浅"的含义就是只复制一层。** 内层的列表还是同几个对象。

**选择标准**：只有一层（全是数字/字符串）→ `.copy()` 够用；有嵌套 → 要真正独立必须 `deepcopy`。

### 5. 闭包与 nonlocal

想写一个"能记住值"的函数时，会遇到这个：

```python
def make_counter():
    count = 0
    def counter():
        count += 1        # ← 这里会报错
        return count
    return counter
```

报错：

```
UnboundLocalError: cannot access local variable 'count' where it is not associated with a value
```

**机制**：Python 的规则是 —— **函数内部只要对某个名字发生赋值（`+=` 也算），这个名字就被判定为本函数的局部变量。** 于是 `count + 1` 变成"读取一个还没赋值的局部变量"。

用 `nonlocal` 取消这个判定：

```python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c = make_counter()
print(c())   # 1
print(c())   # 2
```

而且**每次调用 `make_counter()` 都会生成一个独立的闭包**：

```python
c1 = make_counter()
c2 = make_counter()
print(c1(), c1(), c2())   # 1 2 1
```

对比其他语言：
- **Java**：lambda 只能捕获 effectively final 的变量，**不能修改**
- **JS**：没有"赋值即局部"的规则，直接改就行，不需要 `nonlocal`

### 6. 函数是值 → 装饰器

先要接受一个前提：**在 Python 里，函数和数字、字符串一样，都是值。**

```python
counter        # 函数本身（那个对象）
counter()      # 调用它，拿到返回值
```

就像"菜谱"和"照着菜谱做一次菜"的区别。所以函数能存进变量、当参数传、作为返回值。

**装饰器就建立在这上面：**

```python
@double_it
def get_number():
    return 5
```

**完全等价于：**

```python
def get_number():
    return 5

get_number = double_it(get_number)     # ← 关键在这一行
```

原来的函数被当参数传进去，返回的新函数被重新赋给同一个名字。

完整的执行过程：

```
① 定义函数       get_number  →  【函数 A：return 5】
② @ 生效         等价于 get_number = double_it(get_number)
③ 名字改绑       get_number  →  【wrapper】，wrapper 内部捕获了函数 A
④ 调用时         get_number() 实际执行 wrapper() → 调用函数 A() → 5 → ×2 → 10
```

**一句话：装饰器就是把函数名从一个函数改指向另一个函数。** 原函数没消失，被"包"在里面了。

两个必须知道的细节：

```python
print(get_number())          # 10
print(get_number.__name__)   # wrapper   ← 不是 get_number！
```

第二个是因为 `get_number` 这个名字现在指向 `wrapper`，而 `__name__` 是函数对象的属性。

**务实建议**：装饰器是 Python 最绕的语法之一。日常工作中你 95% 的时间是在**使用**别人写好的装饰器（`@app.get("/")`、`@pytest.fixture`、`@staticmethod`），极少需要自己写。**所以标准可以降到"能看懂 + 会套模板"。**

### 7. `self` 到底是什么

Java 的 `this` 是**隐式**的，编译器自动处理。Python 的 `self` 是**显式**的，必须写出来 —— 这让很多人困惑。

真正的机制只有一个等式：

```python
d.bark(2)          # 你写的
Dog.bark(d, 2)     # Python 实际执行的
```

**实例被自动塞进了第一个参数位置。** 这就是 `self` 的由来 —— 它是"接住实例的那个位置"，不是"默认有的东西"。

反证：如果方法写成 `def bark(times)`（不写 `self`），会报：

```
Dog.bark() takes 1 positional argument but 2 were given
```

因为 `d` 被塞进了 `times`，而 `2` 成了多余的位置参数。

**类属性 vs 实例属性**（这是最容易栽的地方）：

```python
class Dog:
    tricks = []                  # ← 写在类体里 = 类属性，全部实例共享

    def __init__(self, name):
        self.name = name         # ← self.x = ... = 实例属性，每个实例一份

    def add_trick(self, t):
        self.tricks.append(t)    # ← 只读取不改绑，动的是类属性！
```

```python
x = Dog("x")
y = Dog("y")
x.add_trick("sit")
print(y.tricks)          # ['sit']   ← y 也受影响
print(x.tricks is y.tricks)   # True
```

**注意这和"可变默认参数陷阱"是同源问题** —— 都是"共享的可变对象 + 没有发生重新绑定"。

想让每个实例各自一份，必须在 `__init__` 里显式赋值 `self.tricks = []`。

属性查找顺序：**先找实例属性 → 找不到再找类属性。**

### 8. 类型注解不检查类型，Pydantic 才检查

先看一个反直觉的事实：

```python
def add(a: int, b: int) -> int:
    return a + b

print(add(1, 2))        # 3
print(add("1", "2"))    # 12      ← 没报错！
```

**注解不在运行时做任何检查。** 它只是元数据：

```python
print(add.__annotations__)
# {'a': <class 'int'>, 'b': <class 'int'>, 'return': <class 'int'>}
```

Java 的类型检查在**编译期**，编译器直接拦下错误。Python 没有编译期这一步。

**那注解有什么用？三个用途，第三个最重要：**

1. IDE 的提示与自动补全
2. 静态检查工具（`mypy`）—— 运行前发现问题，但那是额外工具
3. **框架读取它来工作** ← Pydantic / FastAPI 就是靠读注解干活的

**Pydantic 才会真的动手：**

```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int

u = User(name="Tom", age="25")    # 传的是字符串
print(u.age)                      # 25
print(type(u.age))                # <class 'int'>
```

它**会尝试转换**，而不是拒绝。三条关键行为：

| 情况 | 结果 |
|---|---|
| `age="25"` | 转换成整数 `25` |
| 缺 `age`（无默认值） | 抛 `ValidationError`，`Field required` |
| `age: int = 0`（有默认值） | 缺了就用 `0`，变成可选 |

注意第二条：**它不会替你补一个 `None`，而是直接报错。** 因为"没传"和"传了空值"是两件不同的事 —— 静默的 `None` 会在很久以后才爆炸。

导出用 `model_dump()`：

```python
print(u.model_dump())         # {'name': 'Tom', 'age': 25}  → dict
print(u.model_dump_json())    # {"name":"Tom","age":25}     → str
print(u.model_dump(exclude={"password"}))   # 排除敏感字段
```

`model_dump()` 返回的是**新建的字典**，改它不会影响原对象：

```python
data = u.model_dump()
data["age"] = 999
print(u.age)     # 25，没变
```

（旧写法 `u.dict()` 已废弃，会发出 `PydanticDeprecatedSince20` 警告。）

### 9. 字典：字面量用冒号，赋值用等号

这个坑我自己踩了。两种创建方式用的是**不同的符号**：

```python
d = {"name": "Tom", "age": 25}    # ✅ 字面量：键值之间用【冒号】
d = {"name" = "Tom"}              # ❌ 语法错误

d = {}                            # 空字典
d["name"] = "Tom"                 # ✅ 赋值：用【等号】
```

**这不是两套矛盾的写法，是两件不同的事：**

- 字面量里的 `:` 是**键值对的分隔符**，读作"name **映射到** Tom"（描述结构）
- 赋值里的 `=` 是**把值放进这个键**这个动作（执行操作）

记忆点：**`:` 描述结构，`=` 执行动作。**

对照其他语言：Java 的 `Map.of("name", "Tom")` 键值之间是**逗号**（在 Java 眼里它们只是两个参数）；Python 用**冒号**。

另一个小细节 —— `print` 出来的样子：

```python
print({"name": "Tom"})
# {'name': 'Tom'}
```

显示成单引号、冒号后带空格，**但这只是显示格式，不是你要敲的代码**。

---

## 四、我踩过的坑（自查清单）

1. `print` 传多个参数时，会**自动在参数之间插入空格**（`print("T3:", 8)` 输出 `T3: 8`）
2. **不要用内置函数名当变量名** —— 我用 `sum` 做过累加变量，把内置的 `sum()` 覆盖了，而且报错信息完全看不出来
3. **不要在遍历列表的同时删除它的元素**

   ```python
   for n in nums:
       if n < 0:
           nums.remove(n)     # ❌ 会跳过元素
   ```

   原因：`remove` 让列表变短，后面的元素整体前移，而迭代器的索引照常 +1，于是跳过了下一个。正确写法：

   ```python
   nums[:] = [n for n in nums if n >= 0]    # ✅ 切片赋值 = 改内容，外部可见
   ```

4. 字典字面量用**冒号**，不是等号（见上文）
5. 元组里只有一个元素时必须带尾逗号：`(5,)` 是元组，`(5)` 只是加了括号的整数
6. 代码改了，**注释要跟着改**；不要留下没用到的变量（注释和代码不一致比没注释更危险）
7. **仔细读题面/需求里的字面量** —— 数字、大小写、空格。我在这上面栽了三次：漏掉 `print` 的空格、把 `Wang!` 写成 `wang!`、把"返回结果"理解成"返回长度"。**代码逻辑没问题，但对细节不仔细，这在工作中是实打实的 bug。**
8. PEP8 基本习惯：逗号后加空格、冒号前不加空格、`def f():` 括号紧贴函数名

---

## 五、学习方法上改了三件事

这部分可能比上面的知识点更值钱。

### 1. 每个知识点只追问「一层」，不是钻源码

不是去研究 CPython 怎么实现 `list`，而是搞清楚：**这个东西解决什么问题？为什么必须这样写？**

比如学 `@Autowired`（Java）时不要只记"这样写就能注入"，而是追问：不用它会怎样？（得自己 `new`，耦合死了）→ 它怎么知道该注入哪个？（容器启动时扫描 Bean 定义，按类型匹配）→ 那容器是什么？（一个 `Map`）。

**但只补到"能解释清当前这层为什么存在"就停下。** 有人一追问就钻到 CPU 指令集、编译器实现，那也是浪费。边界感很重要。

### 2. 强制走「先预测 → 再运行 → 写错因」

这是我认为最有效的一步。

学完一个东西，**先写下你的预测，再运行验证**。猜错了不要跳过，把"为什么猜错"写下来。

为什么有效：**它会暴露你真实的认知状态。** 光看教程会让你产生"我懂了"的错觉；预测不会骗人 —— 你的直觉偏在哪里，一目了然。

### 3. 空白重写

新建一个空文件，**关掉所有参考资料**，把刚学的东西重写一遍。

写不出来的地方，就是你真正没懂的地方。这比"再看一遍教程"精准得多，因为它直接指出断点在哪。

节奏：学完 24 小时内做一次，一周后再做一次。

---

## 六、顺带踩的环境坑：pip 装了，PyCharm 却看不到

我遇到的情况：在 cmd 里 `pip install pydantic` 成功装了 2.13.5，但 PyCharm 里一直提示找不到这个包。

**根因**：我机器上有多个 Python，而 **`pip` 不是独立工具，它永远属于某一个具体的解释器**。`pip install x` 的意思是"把 x 装进**我这个 pip 所属的那个**解释器里"。

我机器上的情况：

| 用途 | 路径 |
|---|---|
| **PyCharm 项目解释器** | `D:\...\.venv\Scripts\python.exe`（没有 pydantic）|
| 系统 Python 3.12 | `...\Programs\Python\Python312`（**pydantic 装在了这里**）|
| 系统 Python 3.13 | `...\Programs\Python\Python313` |

**虚拟环境存在的理由**：项目 A 要 pydantic 1.x、项目 B 要 2.x，装进系统 Python 必然冲突；所以每个项目有自己的 `.venv`，依赖互相隔离。**PyCharm 默认会在项目根目录创建 `.venv` 并作为项目解释器。**

### 正确装包的写法

**最可靠的一种 —— 明确指定解释器：**

```bash
D:\A_CODE\Python\.venv\Scripts\python.exe -m pip install 包名
```

`-m pip` 的意思是"**用这个 Python 去运行 pip 模块**"。这样写不可能装错地方。

**要避免的写法**：在系统任意位置直接敲 `pip install 包名` —— 因为你不知道那一刻 `pip` 属于哪个 Python。

### 一个通用自检

装完包后，用**同一个解释器**验证：

```bash
D:\A_CODE\Python\.venv\Scripts\python.exe -c "import pydantic; print(pydantic.VERSION)"
```

**以后只要看见 `ModuleNotFoundError`，第一反应就是做这个自检。**

---

## 结语

回头看，我这轮最大的收获不是"多学了几个语法点"，而是弄明白了自己卡在哪：

> **我一直在学"怎么用"，从没学"为什么"。所以知识是无锚点的符号，记忆一退就散。**

改了学法之后，变化是能感觉到的：以前是"这个我会写"，现在是"这个我知道它为什么长这样，如果我改 X 会影响 Y"。

当然这只是开始，后面还有异常处理、生成器、asyncio、FastAPI、调用大模型 API 要走。但至少方向对了。

**如果你也有"学过就忘"的问题，建议先别急着再学一遍 —— 先做一次诊断，找出真正没懂的，再补那一层。**

---

*本文是个人学习笔记，代码均在本机 Python 3.13 环境下实际运行验证过。*
