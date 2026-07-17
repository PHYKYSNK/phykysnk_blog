# 算法笔记：区间合并 & 离散化


---

## 区间合并

合并有交集的区间，输出合并后的区间个数。

```cpp
vector<pair<int,int>> segs;
sort(segs.begin(), segs.end());  // 按左端点排序

int st = INT_MIN, ed = INT_MIN;
for (auto seg : segs) {
    if (seg.first > ed) {
        // 新区间出现，保存之前的
        if (st != INT_MIN) res.push_back({st, ed});
        st = seg.first;
        ed = seg.second;
    } else {
        ed = max(ed, seg.second);  // 延长当前区间
    }
}
if (st != INT_MIN) res.push_back({st, ed});
```

思路就是排序后，用一个当前区间去"吞"后面有重叠的区间。

---

## 离散化

把值域很大但数据稀疏的坐标映射到紧凑的连续下标。

典型场景：值域 10^9 但只有 10^5 个点需要操作。

```cpp
vector<int> alls;  // 所有出现的下标
sort(alls.begin(), alls.end());
alls.erase(unique(alls.begin(), alls.end()), alls.end());

// 获取离散化后的位置
int find(int x) {
    return lower_bound(alls.begin(), alls.end(), x) - alls.begin() + 1;
}
```

三步：排序 → 去重 → 查下标。
