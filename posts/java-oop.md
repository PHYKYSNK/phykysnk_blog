# Java SE 学习笔记：面向对象

**2026-06-10**

---

## 1. 类与对象

类是模板，对象是实例。

```java
public class Student {
    String name;
    int age;
    public Student() { }
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

## 2. 封装

```java
public class Person {
    private int age;
    public void setAge(int age) {
        if (age < 0 || age > 150) return;
        this.age = age;
    }
}
```

## 3. 继承

```java
public class Animal { public void eat() { } }
public class Dog extends Animal { public void bark() { } }
```

## 4. 多态

必要条件：继承 + 重写 + 父类引用指向子类对象

```java
Animal a = new Dog();
a.eat();
if (a instanceof Dog) {
    Dog d = (Dog) a;
    d.bark();
}
```

## 5. 抽象类与接口

```java
public abstract class Animal { public abstract void eat(); }
public interface Playable { void play(); }
public class Dog implements Playable { public void play() { } }
```
