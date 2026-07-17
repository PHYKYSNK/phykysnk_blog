# Python 基础回顾：列表推导式与生成器


一直以来写 Python 都会混用列表推导式和生成器表达式，今天特意整理一下。

## 列表推导式

```python
squares = [x**2 for x in range(10)]
even_squares = [x**2 for x in range(10) if x % 2 == 0]
matrix = [[i+j for j in range(3)] for i in range(3)]
```

列表推导式会**一次性生成整个列表**，把所有结果都放在内存里。

## 生成器表达式

```python
squares_gen = (x**2 for x in range(10))
for val in squares_gen:
    print(val)
```

生成器是**惰性求值**的——每次迭代才计算下一个值，内存占用小很多。

## 什么时候用什么

- 数据量小，需要反复遍历或随机访问 → 列表推导式
- 数据量大，或者只需要遍历一次 → 生成器表达式

一个经典例子：读取大文件

```python
# 不推荐
lines = [line.strip() for line in open("large.txt")]
# 推荐
lines = (line.strip() for line in open("large.txt"))
for line in lines:
    process(line)
```

## 小结

列表推导式是「我要这个集合」，生成器是「我需要逐个处理这些元素」。理解了这个区别，以后就不会写错了。
