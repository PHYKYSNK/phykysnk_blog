# 算法笔记：二分查找 & 前缀和与差分

**2026-06-10**

---

## 二分

二分查找用于在有序序列中快速定位目标，时间复杂度 O(logn)。

### 整数二分（两个模板）

**模板一：找左边界（第一个 >= x 的位置）**

```cpp
int bsearch_1(int l, int r) {
    while (l < r) {
        int mid = (l + r) / 2;
        if (a[mid] >= x) r = mid;
        else l = mid + 1;
    }
    return l;
}
```

**模板二：找右边界（最后一个 <= x 的位置）**

```cpp
int bsearch_2(int l, int r) {
    while (l < r) {
        int mid = (l + r + 1) / 2;  // 注意+1防死循环
        if (a[mid] <= x) l = mid;
        else r = mid - 1;
    }
    return l;
}
```

怎么记：先写 mid，看是 `l = mid` 还是 `r = mid`。如果是 `l = mid`，mid 要加 1。

### 浮点数二分

```cpp
double bsearch_d(double l, double r) {
    const double eps = 1e-8;  // 精度比要求多两位
    while (r - l > eps) {
        double mid = (l + r) / 2;
        if (f(mid)) r = mid;
        else l = mid;
    }
    return l;
}
```

浮点数二分不需要考虑边界问题，直接用 while 控制精度即可。

---

## 前缀和

前缀和可以在 O(1) 时间内求出一段区间的和。

### 一维前缀和

```cpp
vector<int> a(n + 1), s(n + 1, 0);
for (int i = 1; i <= n; i++) {
    s[i] = s[i - 1] + a[i];
}
// 求 [l, r] 的和
int sum = s[r] - s[l - 1];
```

### 二维前缀和

```cpp
// s[i][j] = s[i-1][j] + s[i][j-1] - s[i-1][j-1] + a[i][j]
// 求 (x1,y1) 到 (x2,y2) 子矩阵和
int sum = s[x2][y2] - s[x1-1][y2] - s[x2][y1-1] + s[x1-1][y1-1];
```

### 差分（前缀和的逆运算）

给区间 [l, r] 每个数加 c：

```cpp
// 先构造差分数组 b
b[l] += c;
b[r + 1] -= c;
// 最后对 b 求前缀和得到原数组
```

二维差分：

```cpp
b[x1][y1] += c;
b[x2+1][y1] -= c;
b[x1][y2+1] -= c;
b[x2+1][y2+1] += c;
```
