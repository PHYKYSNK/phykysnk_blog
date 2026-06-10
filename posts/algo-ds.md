# 算法笔记：常用数据结构

**2026-06-10**

---

## 单调栈

找每个元素左边第一个比它小的数。

```cpp
stack<int> st;
for (int i = 0; i < n; i++) {
    while (!st.empty() && st.top() >= a[i]) st.pop();
    if (st.empty()) cout << -1 << " ";
    else cout << st.top() << " ";
    st.push(a[i]);
}
```

核心：维护栈内元素单调递增，不满足条件的弹出。

## 单调队列（滑动窗口）

求窗口内的最大值/最小值。

```cpp
deque<int> q;  // 存下标
for (int i = 0; i < n; i++) {
    // 移除超出窗口范围的元素
    if (!q.empty() && q.front() < i - k + 1) q.pop_front();
    // 移除不可能是答案的元素
    while (!q.empty() && a[q.back()] >= a[i]) q.pop_back();
    q.push_back(i);
    if (i >= k - 1) cout << a[q.front()] << " ";  // 窗口最小值
}
```

## KMP

字符串匹配，O(n+m)。

```cpp
// 求 next 数组
vector<int> nxt(m);
for (int i = 1, j = 0; i < m; i++) {
    while (j && p[i] != p[j]) j = nxt[j - 1];
    if (p[i] == p[j]) j++;
    nxt[i] = j;
}

// 匹配
for (int i = 0, j = 0; i < n; i++) {
    while (j && s[i] != p[j]) j = nxt[j - 1];
    if (s[i] == p[j]) j++;
    if (j == m) {
        cout << i - m + 1 << " ";  // 匹配起始位置
        j = nxt[j - 1];
    }
}
```

## 并查集

合并集合 + 查询是否同集合。

```cpp
int p[N];
// 初始化
for (int i = 1; i <= n; i++) p[i] = i;

// 查找（含路径压缩）
int find(int x) {
    if (p[x] != x) p[x] = find(p[x]);
    return p[x];
}

// 合并
void merge(int a, int b) {
    p[find(a)] = find(b);
}

// 查询是否同集合
if (find(a) == find(b)) cout << "YES";
```

## 堆（优先队列）

```cpp
priority_queue<int> max_heap;          // 大根堆
priority_queue<int, vector<int>, greater<int>> min_heap;  // 小根堆
max_heap.push(10);
max_heap.top();    // 最大值
max_heap.pop();    // 弹出最大值
```

## 哈希表

unordered_set / unordered_map，O(1) 增删查。

```cpp
unordered_map<string, int> mp;
mp["hello"] = 1;
mp.count("hello");  // 是否存在
mp.erase("hello");  // 删除
```
