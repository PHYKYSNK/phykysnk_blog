# 算法笔记：排序与搜索

**2026-06-10**

---

## 内置 sort

```cpp
sort(v.begin(), v.end());
sort(v.begin(), v.end(), greater<int>());
```

## 快速排序（分治）

```cpp
void quick_sort(vector<int> &v, int l, int r) {
    if (l >= r) return;
    int pivot = v[(l + r) / 2], i = l, j = r;
    while (i <= j) {
        while (v[i] < pivot) i++;
        while (v[j] > pivot) j--;
        if (i <= j) { swap(v[i], v[j]); i++; j--; }
    }
    quick_sort(v, l, j);
    quick_sort(v, i, r);
}
```

## 归并排序

```cpp
void merge_sort(vector<int> &v, int l, int r) {
    if (l >= r) return;
    int mid = (l + r) / 2;
    merge_sort(v, l, mid); merge_sort(v, mid + 1, r);
    vector<int> tmp;
    int i = l, j = mid + 1;
    while (i <= mid && j <= r)
        tmp.push_back(v[i] < v[j] ? v[i++] : v[j++]);
    while (i <= mid) tmp.push_back(v[i++]);
    while (j <= r) tmp.push_back(v[j++]);
    for (int t = 0; t < tmp.size(); t++) v[l + t] = tmp[t];
}
```

## DFS

```cpp
void dfs(int x) {
    if (x == n + 1) { return; }
    for (int i = 1; i <= n; i++) {
        if (!used[i]) {
            used[i] = true; re[x] = a[i];
            dfs(x + 1);
            used[i] = false;
        }
    }
}
```

## BFS

```cpp
queue<int> q; q.push(root);
while (!q.empty()) {
    int idx = q.front(); q.pop();
}
```
