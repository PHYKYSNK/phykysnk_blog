# 算法笔记：C++ 基础与 STL 容器

**2026-06-10**

---

系统过了一遍 C++ 的 STL 容器，按使用频率从高到低整理。

## 1. vector（动态数组）

最常用的容器，自动扩容。

```cpp
vector<int> v1;
vector<int> v2(6, 2);      // 6个2

v.push_back(10);           // 尾部添加
v.pop_back();              // 尾部删除
v.size();                  // 元素个数

v.insert(v.begin(), 66);   // 指定位置插入
v.erase(v.begin());        // 指定位置删除
v.clear();                 // 清空
v.front(); v.back();       // 首尾元素

// 查找（必须有序）
int idx = lower_bound(v.begin(), v.end(), x) - v.begin();
bool found = binary_search(v.begin(), v.end(), x);

// 逆置
reverse(v.begin(), v.end());

// 遍历
for (int x : v) cout << x << " ";
```

## 2. string（字符串）

```cpp
string s = "hello";
s += " world";
s.size(); s.length();

// 查找（注意：string 用 s.find()，不能用 find(s.begin(),s.end())）
int pos = s.find("world");      // 正向查找
int pos2 = s.rfind("world");    // 反向查找
// 没找到返回 -1（或 string::npos）

s.insert(3, "gh");              // 插入
s.erase(4, 3);                  // 删除
s.substr(0, 5);                 // 取子串

// 大小写转换
transform(s.begin(), s.end(), s.begin(), ::toupper);
transform(s.begin(), s.end(), s.begin(), ::tolower);

// 数字转字符串
string s = to_string(10086);
int n = stoi("10086");
```

## 3. deque（双端队列）

头尾都可以操作，但速度慢。

```cpp
deque<int> d;
d.push_front(1);
d.push_back(2);
d.pop_front();
d.pop_back();
d.front(); d.back();
```

## 4. stack（栈）

先进后出（LIFO）。

```cpp
stack<int> s;
s.push(1);
s.pop();
s.top();          // 取栈顶
s.empty();
s.size();
```

## 5. queue（队列）

先进先出（FIFO），**不能遍历**。

```cpp
queue<int> q;
q.push(1);
q.pop();
q.front();        // 队首
q.back();         // 队尾
```

## 6. set（集合）

- 唯一性 + 有序性（红黑树实现，O(logn)）

```cpp
set<int> s;
s.insert(10);
s.erase(40);
s.find(60);                   // 返回迭代器
s.lower_bound(50);            // >=
s.upper_bound(50);            // >
```

## 7. unordered_set（无序集合）

- 唯一性 + 无序性（哈希表实现，O(1)）
- 比 set 更快，适合不需要排序的场景

## 8. 常用算法

```cpp
// 排序
sort(v.begin(), v.end());                 // 升序
sort(v.begin(), v.end(), greater<int>()); // 降序

// 自定义排序
bool cmp(int a, int b) { return a > b; }
sort(v.begin(), v.end(), cmp);

// 二分查找（必须有序）
binary_search(v.begin(), v.end(), x);     // 返回 bool

// 最大最小值
auto min = min_element(v.begin(), v.end());
auto max = max_element(v.begin(), v.end());
cout << *min << " " << *max;
```

## 实用小技巧

```cpp
// int 扩展为 long long
#define int long long
signed main() { }

// 关闭同步流（加速 cin/cout）
ios::sync_with_stdio(0);
cin.tie(0); cout.tie(0);

// 快速取数字位数
int len = log10(a) + 1;       // 十进制位数
int len = log2(a) + 1;        // 二进制位数

// 二进制表示
string s = bitset<8>(a).to_string();
```

