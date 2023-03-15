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

> 构建表结构

```sql
Create table department (
    dept_name varchar(255) primary key,
    building varchar(255),
    budget numeric(10, 2)
);

Create table instructor (
    ID int primary key,
    name varchar(255),
    dept_name varchar(255),
    foreign key(dept_name) references department(dept_name)
);
```

> 删除被 `instructor` 约束的 `department` 中的记录

```sql
Insert into department (dept_name, building, budget) 
values ('Comp. Sci.', 'Watson', 90000); 

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

**a.** Π person_name(σ<sub>city = "Miami"</sub>(employee))

**b.** Π person_name(σ<sub>salary > 100000</sub>(works))

**c.** Π person_name(σ<sub>salary > 100000 ^ city = "Miami"</sub>(works x employee))

## 6.3

a. σ<sub>branch_city = "Chicago"</sub>(branch)

b. 