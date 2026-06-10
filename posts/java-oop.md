# Java SE 学习笔记：面向对象

**2026-06-10**

---

面向对象是 Java 最核心的部分。这篇整理了类与对象、封装、继承、多态、抽象类与接口。

## 1. 类与对象

类是模板，对象是实例。

```java
public class Student {
    String name;
    int age;

    // 构造方法：方法名与类名相同，没有返回值
    public Student() { }

    public Student(String name, int age) {
        this.name = name;  // this 指向当前对象
        this.age = age;
    }
}
```

**成员变量 vs 局部变量：**

| 区别 | 成员变量 | 局部变量 |
|-----|---------|---------|
| 位置 | 类中方法外 | 方法内部 |
| 默认值 | 有默认值 | 无默认值 |
| 作用域 | 整个类 | 当前方法 |

## 2. 封装

把东西包起来，对外只暴露必要接口，隐藏内部实现。

```java
public class Person {
    private String name;  // private 隐藏
    private int age;

    // public getter/setter 受控访问
    public String getName() { return name; }

    public void setAge(int age) {
        if (age < 0 || age > 150) {
            System.out.println("年龄不合法！");
            return;
        }
        this.age = age;
    }
}
```

封装的好处：数据安全、易于维护。

## 3. 继承

子类继承父类，获得父类的属性和方法。

```java
public class Animal {
    public void eat() {
        System.out.println("动物在吃东西");
    }
}

public class Dog extends Animal {
    public void bark() {
        System.out.println("汪汪");
    }
}
```

**方法重写（Override）：** 子类重新定义父类方法

```java
public class Cat extends Animal {
    @Override
    public void eat() {
        System.out.println("猫在吃鱼");
    }
}
```

**super 关键字：** 访问父类成员

```java
public class Dog extends Animal {
    @Override
    public void eat() {
        super.eat();  // 调用父类方法
        System.out.println("狗在吃狗粮");
    }
}
```

特点：单继承（一个类只能有一个直接父类）。

## 4. 多态

同一个方法调用，不同对象产生不同行为。

**三个必要条件：** 继承 + 重写 + 父类引用指向子类对象

```java
Animal a1 = new Dog();
Animal a2 = new Cat();
a1.eat();  // 狗在吃狗粮
a2.eat();  // 猫在吃猫粮
```

**向下转型：** 调用子类特有方法

```java
if (animal instanceof Dog) {
    Dog d = (Dog) animal;
    d.bark();
}
```

## 5. 抽象类

用 `abstract` 修饰，不能直接 `new`，子类必须重写所有抽象方法。

```java
public abstract class Animal {
    public abstract void eat();  // 抽象方法，没有方法体

    public void sleep() {        // 可以有普通方法
        System.out.println("睡觉");
    }
}
```

## 6. 接口

比抽象类更纯粹的抽象，用 `interface` 定义，用 `implements` 实现。

```java
public interface Playable {
    void play();  // 默认是抽象的
}

public class Dog implements Playable {
    @Override
    public void play() {
        System.out.println("狗在玩飞盘");
    }
}
```

一个类可以实现多个接口，这是对单继承的补充。

---

*下一篇整理 Java 高级特性：异常、IO、多线程、网络编程。*

