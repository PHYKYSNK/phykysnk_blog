# Java SE 学习笔记：高级特性


---

## 1. 异常处理

```java
try { int r = 10 / 0; }
catch (ArithmeticException e) { e.printStackTrace(); }
finally { }
```

## 2. IO 流

字节流：InputStream / OutputStream
字符流：Reader / Writer
缓冲流：BufferedReader / BufferedWriter（8KB 缓冲区）

## 3. 多线程

```java
// 继承 Thread
class MyThread extends Thread { public void run() { } }
new MyThread().start();

// 实现 Runnable
new Thread(() -> { }).start();
```

## 4. 网络编程

TCP（面向连接）：ServerSocket / Socket
UDP（无连接）：DatagramSocket / DatagramPacket

## 5. 反射

```java
Class<?> c = Class.forName("com.example.Student");
Object obj = c.newInstance();
Method m = c.getMethod("setName", String.class);
m.invoke(obj, "小玉");
Field f = c.getDeclaredField("age");
f.setAccessible(true);
f.set(obj, 20);
```

## 6. 注解

@Override、@Deprecated、自定义 @interface
