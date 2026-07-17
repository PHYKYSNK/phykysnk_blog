# 算法笔记：数学与数论


---

## 快速幂

```cpp
long long qpow(long long a, long long b) {
    long long res = 1;
    while (b) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}
```

## 最大公约数

```cpp
int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
```

## 素数筛（欧拉筛）

```cpp
vector<bool> is(N, true); vector<int> p;
void euler(int n) {
    is[0] = is[1] = false;
    for (int i = 2; i <= n; i++) {
        if (is[i]) p.push_back(i);
        for (int pi : p) {
            if (pi * i > n) break;
            is[pi * i] = false;
            if (i % pi == 0) break;
        }
    }
}
```

## 欧拉函数

```cpp
int phi(int n) {
    int res = n;
    for (int i = 2; i <= n / i; i++) {
        if (n % i == 0) {
            while (n % i == 0) n /= i;
            res = res / i * (i - 1);
        }
    }
    if (n > 1) res = res / n * (n - 1);
    return res;
}
```

## 高精度

用数组模拟竖式，注意倒序存放和进位处理。
