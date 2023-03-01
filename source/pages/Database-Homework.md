---
title: 数据库原理作业
tags: 作业
date: 2023-02-23
cover: ../static/Database-Homework/cover.jpg
katex: false
---

# 第二章作业

## 2.1

|表|主码|
|:---:|:---:|
|employee|person_name |
|works   |person_name |
|company |company_name|

## 2.2

> 假设初始的两个表均无记录

**(1)** 插入一条 `department` 表记录, 以便 `instructor` 表中的外键引用, 然后插入一条`instructor` 表记录, 引用不存在的 `dept_name`

```sql
Insert into department (dept_name, building, budget) 
values ('Biology', 'Watson', 90000);

Insert into instructor (ID, name, dept_name, salary) 
values (10101, 'Srinivasan', 'Comp. Sci.', 65000);
```

**(2)** 删除 `department` 表中已被引用的记录

```sql
Insert into instructor (ID, name, dept_name, salary) 
values (10101, 'Srinivasan', 'Comp. Sci.', 65000);

Delete from department where dept_name = 'Comp. Sci.';
```

## 2.6

不是. 主码应该是 `s_id` 和 `i_id` 的组合

## 2.7

|  表 | 主码 | 外码 |
|:---:|:---:|:---:| 
|branch|branch_name|无|
|customer|customer_name|无|
|loan|loan_number|branch_name(branch)|
|borrower|ID|loan_number(loan)|
|account|account_number|branch_name(branch)|
|depositir|ID|account_number(account)|

## 2.8

<!--  -->

## 2.9

1. 作为默认值
2. 数据可能不存在

## 6.2

a. σ<sub>city = "Miami"</sub>(employee)

b. σ<sub>salary > 100000</sub>(works)

c. σ<sub>salary > 100000 ^ city = "Miami"</sub>(works x employee)

## 6.3

a. σ<sub>branch_city = "Chicago"</sub>(branch)

b. 