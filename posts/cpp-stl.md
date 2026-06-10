# 算法笔记：C++ 基础与 STL 容器

**2026-06-10**

---

## vector

```cpp
v.push_back(10); v.pop_back();
v.size(); v.clear();
v.insert(v.begin(), 66);
int idx = lower_bound(v.begin(), v.end(), x) - v.begin();
sort(v.begin(), v.end());
reverse(v.begin(), v.end());
```

## string

```cpp
string s = "hello";
s.find("world");
s.substr(0, 5);
to_string(10086);
stoi("10086");
```

## stack / queue

```cpp
stack<int> s; s.push(1); s.pop(); s.top();
queue<int> q; q.push(1); q.pop(); q.front(); q.back();
```

## set / unordered_set

set 有序 O(logn)，unordered_set 无序但 O(1)。

## 技巧

```cpp
ios::sync_with_stdio(0); cin.tie(0);
#define int long long; signed main() { }
int len = log10(a) + 1;
```
