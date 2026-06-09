# 异步编程初步理解

**2026-06-09**

今天花了一整个下午读 `asyncio` 的文档，终于对异步编程有了一点感觉。

## 同步 vs 异步

想象你在煮泡面：

- **同步**：把水烧开 → 等水开 → 下面 → 等面熟 → 加调料 → 吃。每一步都在干等。
- **异步**：把水烧上，在等水开的时候去切葱、拿碗、看一集短剧。水开了再回来下面。

程序也是类似的——大多数时间不是在算，而是在等（等网络响应、等磁盘读取、等数据库查询）。异步编程就是把这些「等」的时间利用起来。

## Python 里的 async/await

```python
import asyncio

async def fetch_data(url):
    print(f"开始请求: {url}")
    await asyncio.sleep(2)
    print(f"完成请求: {url}")
    return f"数据来自 {url}"

async def main():
    tasks = [
        fetch_data("https://api.example.com/1"),
        fetch_data("https://api.example.com/2"),
        fetch_data("https://api.example.com/3"),
    ]
    results = await asyncio.gather(*tasks)
    print(results)

asyncio.run(main())
```

`await` 就是告诉 Python：「这里要等，你先去干别的，等好了叫我」。

## 容易搞混的地方

1. **async 函数不会自动并发** —— 写 `await func1(); await func2()` 还是顺序执行的。要用 `asyncio.gather` 或 `create_task` 才能真正并发。
2. **不是所有操作都适合异步** —— CPU 密集型的计算用异步反而慢，应该用多进程。
3. **同步代码不能直接调 async 函数** —— 必须在 async 函数里用 `await`，或者用 `asyncio.run()`。

## 我的理解

异步编程的核心思路很简单：**把等待的时间还给你**。复杂的不是概念本身，而是怎么组织代码让异步的同时还能保持可读性。

还需要再多写写才能真正掌握。
