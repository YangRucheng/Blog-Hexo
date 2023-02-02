---
title: 数据结构简单总结
tags: datastructure
cover: /img/top.jpg
---




Data Structure && Algorithm

## 线性表(List)







## 队列(Queue)



## 栈(Stack)

### 1.单调栈的使用一般用来寻找左边或右边第一个比当前数字大或小的数字。



## 二叉树(Binary Tree)

1.判断是否为二叉平衡树


### 1.遍历方式

1.dfs遍历（前序，中序，后序遍历）

2.bfs遍历（层序遍历）

3.迭代器遍历（利用栈Stack)

### 2.二叉搜索树

### 3.二叉平衡树(AVL)

```cpp
class Solution {
public:
    // 返回以该节点为根节点的二叉树的高度，如果不是平衡二叉树了则返回-1
    int getHeight(TreeNode* node) {
        if (node == NULL) {
            return 0;
        }
        int leftHeight = getHeight(node->left);
        if (leftHeight == -1) return -1;
        int rightHeight = getHeight(node->right);
        if (rightHeight == -1) return -1;
        return abs(leftHeight - rightHeight) > 1 ? -1 : 1 + max(leftHeight, rightHeight);
    }
    bool isBalanced(TreeNode* root) {
        return getHeight(root) == -1 ? false : true;
    }
};
```

## 图

### 1.krustal算法

利用 **贪心**算法，按加权大小排序。同时利用并查集操作判断是否在同一集合中。优化算法有按秩合并以及路径压缩。

*路径压缩查找算法*

```c++
 int find(int x)
    {
        return x == parent[x] ? x : (parent[x] = find(parent[x]));
    }
```

*按秩合并*

```c++
  void to_union(int x1, int x2)
    {
        int f1 = find(x1);
        int f2 = find(x2);
        if (rank[f1] > rank[f2])
            parent[f2] = f1;
        else
        {
            parent[f1] = f2;
            if (rank[f1] == rank[f2])
                ++rank[f2];
        }
    }
```



## 算法

### 1.排序

#### 		1.冒泡排序

#### 		2.选择排序

#### 		3.快速排序

### 2.搜索

### 3.动态规划

### 4.贪心算法

### 5.二分法

### 6.字符串

#### 		1.KMP算法

​	1.**kmp主体**

```c++
int kmp_search(string main,string patt){
	int j = 0,i = 0;
    next = next_build(patt);
    while(j<main.length()){
        if(main[j]==patt[i]){
            j++;i++;
        }
        else if(j>0){
            j=next[j-1];
        }
        else i++;
        if(j==patt.length())
            return i - j;
    }
```

2.**next数组构建**

```c++
vector<int> next_build(string patt){
    vector<int>next={0};
    int i = 1,prefix_len = 0;
    while(i<patt.length()){
        if(patt[prefix_len]==patt[i]){
            prefix_len++;
            next.push_back(prefix_len);
            i++;
        }
        else if(prefix_len>0){
            prefix_len = next[prefix_len - 1];
        }
        else {
            next.push_back(0);
            i++;
        }
    }
    return next;
}
```



# Git使用

### 1.初始化(`git init`)

### 2.提交(`git add .` `git commit -m "XXX"`)

### 3.同步(`git push origin master`)

### 4.创建切换分支(`git branch XXX` `git checkout XXX`)

### 5.取消暂存(`git checkout --file`)

### 6.查看工作区(`git status`)

### 7.查看日志(`git log` `git reflog`)

### 8.回退版本(`git reset --hard file`)

[^1]: 此方法删除后仍可用序列恢复



