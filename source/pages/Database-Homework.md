---
title: 数据库原理作业
tags: 作业
date: 2023-02-23
cover: ../static/Database-Homework/cover.jpg
katex: false
---

# 第二章作业

## 2.1

|    表    |     主码     |
| :------: | :----------: |
| employee | person_name  |
|  works   | person_name  |
| company  | company_name |

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

|    表     |      主码      |          外码           |
| :-------: | :------------: | :---------------------: |
|  branch   |  branch_name   |           无            |
| customer  | customer_name  |           无            |
|   loan    |  loan_number   |   branch_name(branch)   |
| borrower  |       ID       |    loan_number(loan)    |
|  account  | account_number |   branch_name(branch)   |
| depositir |       ID       | account_number(account) |

## 2.8

![题2.8图]("../static/Database-Homework/Pic-2.8.jpg")

## 2.9

1. 作为默认值
2. 数据可能不存在

## 6.2

**a.** Π<sub>person_name</sub>(σ<sub>city = "Miami"</sub>(employee) )

**b.** Π<sub>person_name</sub>(σ<sub>salary > 100000</sub>(works) )

**c.** Π<sub>person_name</sub>(σ<sub>salary > 100000 ∧ city = "Miami"</sub>(works ⋈<sub>works.person_name = employee.person_name</sub> employee) )

## 6.3
  
**a.** Π<sub>branch_name</sub> (σ<sub>branch_city = "Chicago"</sub>(branch) )

**b.** Π<sub>ID</sub> (σ<sub>branch_name = "Downtown"</sub> (loan <sub>loan.loan_number = borrower.loan_number</sub> borrower) )

## 6.4

> 图6-11 没有 `ID`, 姑且在 `employee` 加个 `ID`

**a.** Π<sub>works.person_name, employee.ID</sub>(σ<sub>company_name != "BigBank"</sub>(works ⋈<sub>works.person_name = employee.person_name</sub> employee) ) 

**b.** 不会

## 6.10

**a.** Π<sub>works.person_name, employee.ID</sub>(σ<sub>company_name = "BigBank"</sub>(works ⋈<sub>works.person_name = employee.person_name</sub> employee) ) 

**b.** Π<sub>works.person_name, employee.ID, employee.city</sub>(σ<sub>company_name = "BigBank"</sub>(works ⋈<sub>works.person_name = employee.person_name</sub> employee) ) 

**c.** Π<sub>works.person_name, employee.ID, employee.city</sub>(σ<sub>company_name = "BigBank" ∧ salary > 100000</sub>(works ⋈<sub>works.person_name = employee.person_name</sub> employee) ) 

## 6.11

**a.** Π<sub>loan_number</sub> (σ<sub>amount > 10000</sub>(loan) )

**b.** Π<sub>ID</sub> (account ⨝<sub>borrower.account_number = account.account_number</sub> (σ<sub>balance > 6000 </sub>account))

**c.** 不会

## 6.12

<!--  -->