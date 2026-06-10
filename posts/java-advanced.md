# Java SE 学习笔记：高级特性

**2026-06-10**

---

这篇整理了异常处理、IO流、多线程、网络编程、反射与注解。

## 1. 异常处理

Java 的异常机制让错误处理更优雅。

```java
try {
    int result = 10 / 0;  // 可能出错的代码
} catch (ArithmeticException e) {
    System.out.println("除数不能为0");
    e.printStackTrace();
} finally {
    System.out.println("无论是否异常都会执行");
}
```

**异常体系：** Throwable → Error（不可处理）和 Exception（可处理）
- 运行时异常：RuntimeException（不用强制处理）
- 编译时异常：非 RuntimeException（必须处理）

**throws 和 throw：**
- `throws`：方法签名上声明可能抛出的异常
- `throw`：手动抛出异常

**try-with-resources（JDK7+）：** 自动关闭资源

```java
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // 使用完自动关闭
} catch (IOException e) {
    e.printStackTrace();
}
```

## 2. IO 流

**分类：**
- 按方向：输入流、输出流
- 按单位：字节流（万能）、字符流（文本）
- 按功能：节点流（原始）、处理流（包装）

**核心类：**

| 类 | 说明 |
|----|------|
| InputStream/OutputStream | 字节输入/输出抽象类 |
| FileInputStream/FileOutputStream | 文件字节流 |
| Reader/Writer | 字符输入/输出抽象类 |
| FileReader/FileWriter | 文件字符流 |
| BufferedReader/BufferedWriter | 缓冲字符流（高效） |
| BufferedInputStream/BufferedOutputStream | 缓冲字节流（高效） |

**缓冲流为什么快？** 内部有一个 8192 字节（8KB）的缓冲区，减少磁盘访问次数。

## 3. 多线程

**三种实现方式：**

```java
// 1. 继承 Thread
class MyThread extends Thread {
    public void run() { }
}
new MyThread().start();

// 2. 实现 Runnable
class MyRunnable implements Runnable {
    public void run() { }
}
new Thread(new MyRunnable()).start();

// 3. Lambda（JDK8+）
new Thread(() -> { }).start();
```

**线程安全：** 多个线程同时访问共享数据可能导致数据不一致。用 `synchronized` 加锁。

**线程状态：** NEW → RUNNABLE → BLOCKED/WAITING/TIMED_WAITING → TERMINATED

## 4. 网络编程

**TCP（面向连接，可靠）：**

```java
// 服务器端
ServerSocket ss = new ServerSocket(9999);
Socket s = ss.accept();  // 阻塞等待

// 客户端
Socket s = new Socket("localhost", 9999);
```

socket 管道只能传字节，所以需要用流来包装。

**TCP 一传多：** 为每个客户端创建新线程处理。

**UDP（无连接，快速）：**
- DatagramSocket：UDP 的 Socket
- DatagramPacket：数据包

| 特性 | TCP | UDP |
|-----|-----|-----|
| 连接 | 面向连接（打电话） | 无连接（发短信） |
| 可靠性 | 可靠 | 可能丢包 |
| 速度 | 较慢 | 较快 |
| 适用 | 文件传输、聊天 | 视频通话、游戏 |

## 5. 反射与注解

**反射：** 运行时动态获取类的信息、创建对象、调用方法。

```java
// 获取 Class 对象的三种方式
Class<?> c1 = Student.class;
Class<?> c2 = obj.getClass();
Class<?> c3 = Class.forName("com.example.Student");

// 创建对象
Object obj = c1.newInstance();

// 调用方法
Method m = c1.getMethod("setName", String.class);
m.invoke(obj, "小玉");

// 操作私有属性
Field f = c1.getDeclaredField("age");
f.setAccessible(true);  // 打破封装
f.set(obj, 20);
```

**注解：** 代码中的标记。

```java
@Override         // 重写方法
@Deprecated       // 已过时
@SuppressWarnings // 抑制警告
```

自定义注解用 `@interface` 定义，配合 `@Target` 和 `@Retention` 指定作用范围和保留策略。

