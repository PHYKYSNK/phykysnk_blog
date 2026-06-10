# 算法笔记：数学与数论

**2026-06-10**

---

## 快速幂

把 O(n) 降为 O(logn)。

```cpp
const int MOD = 1e9 + 7;
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

原理：把指数 b 写成二进制，每次取最后一位判断是否需要乘。

## 最大公约数

**辗转相除法（欧几里得算法）：**

```cpp
int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}
```

最小公倍数：`lcm(a, b) = a / gcd(a, b) * b`

## 素数筛

**试除法（判断单个数）：**

```cpp
bool is_prime(int x) {
    if (x < 2) return false;
    for (int i = 2; i <= x / i; i++)
        if (x % i == 0) return false;
    return true;
}
```

**埃氏筛（1e6 以内）：** 标记素数的倍数。

```cpp
vector<int> sieve(int n) {
    vector<bool> v(n + 1, true);
    vector<int> primes;
    v[0] = v[1] = false;
    for (int i = 2; i <= n; i++) {
        if (!v[i]) continue;
        primes.push_back(i);
        for (int j = 2 * i; j <= n; j += i)
            v[j] = false;
    }
    return primes;
}
```

**欧拉筛（线性筛，推荐）：** 每个合数只被筛一次。

```cpp
const int N = 1e5 + 10;
vector<bool> is_prime(N, true);
vector<int> primes;
void euler(int n) {
    is_prime[0] = is_prime[1] = false;
    for (int i = 2; i <= n; i++) {
        if (is_prime[i]) primes.push_back(i);
        for (int p : primes) {
            if (p * i > n) break;
            is_prime[p * i] = false;
            if (i % p == 0) break;  // 关键优化
        }
    }
}
```

## 因数

**求所有因数：**

```cpp
vector<int> get_factors(int x) {
    vector<int> res;
    for (int i = 1; i <= x / i; i++) {
        if (x % i == 0) {
            res.push_back(i);
            if (i != x / i) res.push_back(x / i);
        }
    }
    sort(res.begin(), res.end());
    return res;
}
```

**因数个数：** 分解质因数后，每个指数 +1 再相乘。

## 欧拉函数

φ(n) = 1~n 中与 n 互质的数的个数。

公式：φ(n) = n × Π(1 - 1/p_i)，其中 p_i 是 n 的质因数。

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

## 高精度运算

大数运算，用数组或 vector 模拟竖式。

**高精度加法：**
1. 字符串倒序转数组
2. 逐位相加，处理进位
3. 去掉前导零，倒序输出

**高精度减法：**
1. 比较大小，确保大减小
2. 不够减时借位
3. 处理负号和前导零

**高精度乘法（高 × 低）：**
1. 逐位乘
2. 统一进位

**高精度乘法（高 × 高）：**
1. 双层循环相乘
2. 错位相加
3. 统一进位

## 其他常用

**闰年判断：**

```cpp
if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0)
    // 是闰年
```

**三角形判断：** 任意两边之和大于第三边。

**唯一分解定理：** 任何大于 1 的自然数都可以唯一分解成有限个素数的乘积。

