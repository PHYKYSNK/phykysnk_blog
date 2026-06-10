# 算法笔记：排序与搜索

**2026-06-10**

---

## 排序

### 选择排序

每轮选最小的放到前面。优化：标记是否已排好序。

```cpp
void selection_sort(vector<int> &v) {
    for (int i = 0; i < v.size() - 1; i++) {
        int min_pos = i;
        for (int j = i + 1; j < v.size(); j++)
            if (v[j] < v[min_pos])
                min_pos = j;
        if (min_pos != i) swap(v[i], v[min_pos]);
    }
}
```

时间复杂度 O(n2)，每轮只交换一次。

### 冒泡排序

每轮把最大的沉到底部。

```cpp
void bubble_sort(vector<int> &v) {
    for (int i = 0; i < v.size(); i++) {
        bool swapped = false;
        for (int j = 0; j < v.size() - i - 1; j++) {
            if (v[j] > v[j + 1]) {
                swap(v[j], v[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;  // 优化：没发生交换说明已有序
    }
}
```

### 插入排序

像打扑克摸牌，把新牌插入到已排好序的手牌中。

```cpp
void insertion_sort(vector<int> &v) {
    for (int i = 1; i < v.size(); i++) {
        int key = v[i];
        int j = i - 1;
        while (j >= 0 && key < v[j]) {
            v[j + 1] = v[j];
            j--;
        }
        v[j + 1] = key;
    }
}
```

### 快速排序（分治）

选一个基准点，把数组分成左右两部分，递归排序。

```cpp
void quick_sort(vector<int> &v, int l, int r) {
    if (l >= r) return;
    int pivot = v[(l + r) / 2];
    int i = l, j = r;
    while (i <= j) {
        while (v[i] < pivot) i++;
        while (v[j] > pivot) j--;
        if (i <= j) {
            swap(v[i], v[j]);
            i++; j--;
        }
    }
    quick_sort(v, l, j);
    quick_sort(v, i, r);
}
```

平均 O(nlogn)，但数据已有序时退化为 O(n2)。

### 归并排序（分治）

先把数组分成单个元素，再两两合并。

```cpp
vector<int> tmp;
void merge_sort(vector<int> &v, int l, int r) {
    if (l >= r) return;
    int mid = (l + r) / 2;
    merge_sort(v, l, mid);
    merge_sort(v, mid + 1, r);

    tmp.clear();
    tmp.resize(r - l + 1);
    int i = l, j = mid + 1, k = 0;
    while (i <= mid && j <= r) {
        if (v[i] < v[j]) tmp[k++] = v[i++];
        else tmp[k++] = v[j++];
    }
    while (i <= mid) tmp[k++] = v[i++];
    while (j <= r)   tmp[k++] = v[j++];
    for (int t = 0; t < k; t++)
        v[l + t] = tmp[t];
}
```

稳定，O(nlogn)，需要额外空间。

### 内置 sort

竞赛中最常用的，混合排序算法，始终 O(nlogn)。

```cpp
sort(v.begin(), v.end());              // 升序
sort(v.begin(), v.end(), greater<>()); // 降序
```

---

## 搜索

### DFS（深度优先搜索）

不撞南墙不回头，走到尽头再回溯。

**全排列：**

```cpp
const int N = 100;
int a[N]; bool used[N]; int re[N]; int n;
void dfs(int x) {
    if (x == n + 1) {
        for (int i = 1; i <= n; i++) cout << re[i] << " ";
        cout << endl; return;
    }
    for (int i = 1; i <= n; i++) {
        if (!used[i]) {
            used[i] = true;
            re[x] = a[i];
            dfs(x + 1);
            used[i] = false;
        }
    }
}
```

核心思想：标记 → 递归 → 回溯（取消标记）。

### BFS（广度优先搜索）

一层层往外扩，适合求最短路径。

**二叉树层序遍历：**

```cpp
void bfs(int root) {
    queue<int> q; q.push(root);
    while (!q.empty()) {
        int idx = q.front(); q.pop();
        cout << a[idx] << " ";
        if (idx * 2 <= n)     q.push(idx * 2);
        if (idx * 2 + 1 <= n) q.push(idx * 2 + 1);
    }
}
```

| 特性 | DFS | BFS |
|-----|-----|-----|
| 数据结构 | 栈（递归） | 队列 |
| 空间 | 较小 | 较大（需要存一层） |
| 适用 | 全排列、连通性 | 最短路径、层序遍历 |

