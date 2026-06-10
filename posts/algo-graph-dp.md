# 算法笔记：图论与动态规划

**2026-06-10**

---

## 图的存储与遍历

### 邻接表

用 vector 数组存每个节点的邻接点。

```cpp
vector<int> adj[N];
void add(int a, int b) {
    adj[a].push_back(b);
    adj[b].push_back(a);  // 无向图
}

// 遍历
for (int v : adj[u]) {
    // 处理 u 的邻接点 v
}
```

### DFS 遍历图

```cpp
void dfs(int u) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v);
    }
}
```

### BFS 遍历图（求最短路径）

```cpp
int bfs(int start) {
    queue<int> q; q.push(start);
    dist[start] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] != -1) continue;
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
    return dist[target];
}
```

---

## 动态规划（背包问题）

### 01背包

每个物品只能选一次，求最大价值。

```cpp
for (int i = 1; i <= n; i++) {        // 枚举物品
    for (int j = m; j >= v[i]; j--) {  // 枚举容量（倒序）
        dp[j] = max(dp[j], dp[j - v[i]] + w[i]);
    }
}
// 结果：dp[m]
```

倒序的原因：保证 dp[j - v[i]] 是上一轮的结果，确保每个物品只取一次。

### 完全背包

每个物品可以选无限次。

```cpp
for (int i = 1; i <= n; i++) {
    for (int j = v[i]; j <= m; j++) {  // 正序！
        dp[j] = max(dp[j], dp[j - v[i]] + w[i]);
    }
}
```

正序的原因：dp[j - v[i]] 可能是已经取过当前物品的状态，恰好实现了无限取。
