---
title: 数据库原理作业
tags: 作业
date: 2023-02-23
cover: /static/Database-Homework/cover.jpg
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

![题2.8图](/static/Database-Homework/Pic-2.8.jpg)

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

不会

# 第三章作业

## 3.1

**a.**
```sql
select title
from course
where dept_name=’Comp.Sci.’and credits=3
```

**b.**
```sql
select dictinct takes.ID
from takes,instructor,teaches
where takes.course_id = teaches.course_id
and takes.sec_id = teaches.sec_id 
and takes.sem ester = teaches.semester 
and takes.year = teaches.year 
and teaches.id = instructor.id 
and instructor.name = 'Einstein'
```

**c.**
```sql
select max(salary)
from instructor
```

**d.**
```sql
select ID,name
from instructor
where salary = (select max(salary) from instructor)
```

**e.**
```sql
select takes.course_id, takes.sec_id, count(ID)
from section,takes
where takes.course_id=section.course_id
and takes.sec_id=section.sec_id
and takes.semester = section.semester
and takes.year=section.year
and takes.semester=’Fall’
and takes.year=2017
group by takes.course_id,takes.sec_id
```
**f.**

```sql
select max(enrollment)
from (select count(ID) as enrollment
from section,takes
where takes.year=section.year
and takes.semester = section.semester
and takes.course_id = section.course_id 
and takes.sec_id = section .sec_.id
and tak es.semester = 'Fall'
and takes.year = 2017
group by tak es.course_id, tak es.sec_.id)
```

**g.**
```sql
with sec_enrollment as (
selectta k es.course id, tak es.sec_.id, count( ID) as en rollmentfromsection , tak es
wheretakes.year = section.year
and takes.semester = section.sem esterand takes.course _id = section.course_idand tak es.sec_id = section.sec_id
and takes.semester = 'Fall'and tak es.year = 2017
group by tak es.course id , tak es.sec_.id)select course_id , sec_id
fromsec_enrollmen t
where enrollment = (select max( enrollmen t) from sec_enrollmen t)
```

## 3.2

**a.**
```sql
select sum( credits * poin ts)from takes, course, grade _poin ts
where tak es.grade = grade_poin ts.grade
and tak es.course id = course.course _idand ID = '12345'
```

**b.**
```sql
select
sum( cred its * poin ts)/ sum( cred its) as GPA
from tak es, course, grade poin ts
where
tak es.grade = grade poin ts.gradeand tak es.course id = course.course _idand ID= '12345'
```

**c.**
```sql
select
ID, sum( credits * poin ts)/ sum( cred its) as GPA
from
tak es,course, grade_poin ts
where
tak es.grade = grade _poin ts.grade
and takes.course_id = course.course_idgroup by ID
```

## 3.3

**a.**
```sql
update instructor
set salary = salary * 1.10
where deptname = 'Comp. Sci.'
```

**b.**
```sql
delete from course
where course_id not in( select course_id from section )
```

**c.**
```sql
insert into instructor
select ID, name, dept_name,10000
from student
where tot_cred > 100
```

## 3.4

**a.**
```sql
select count (distinct perso n.dr iver_id)
from accident, participated, person , owns
where accident.repori_number=participated.report_number
and owns.driver_id = person.driver_id
and owns.license_plate = participated.license-plate
and year = 2017
```

**b.**
```sql
delete car
where year = 2010 and license_plate in
( select license_plate
from owns_o
where o.driver_id = '12345')
```

## 3.5

**a.**
```sql
select ID,
case
when score <40 then 'F’
when score <60 then 'C'
when score <80 then 'B’
else 'A'
end
from marks
```

**b.**
```sql
with
grades as
(
selectID,
case
when score <40 then 'F’
when score <60 then 'C'
when score <80 then 'B’
else 'A'
end as grade
from
marks
)
select grade, count(ID)
from grades
group by grade
```

## 3.6
```sql
select dep_name 
from department
where lower(deptname) like '%sci%'
```

## 3.7
```sql
select p.al
from p, r1,r2
where p.al = r1.a1 or p.a1 = r2.a 1
```

## 3.8

**a.**
```sql
(select ID
fromdepositor)
except
(select ID
fromborro wer)
```

**b.**
```sql
select F.ID
from customer as F, customer as S
where F.customer street = S.cutomer _street
and F.cus tomer_city = S.customer_city
and S.cus tomer_id = '12345'
```

**c.**
```sql
select distinct branch_name
from accoun t, deposior, customer
where customer.id = depositor.id
and depositor.account_number=account.account_number
and cus tomer_city = 'Harrison'
```

## 3.9

**a.**
```sql
select e.ID, e.person_name,cityfrom employee as e, works as w
where w.com pany_name = 'First Bank Corporation' 
and w.ID =e.ID
```

**b.**
```sql
select *
from employeewhere ID in
(select IDfrom works
where company name = 'First Bank Corporati on' and salary > 10000)
```

**c.**
```sql
select Ip
from works
where company_name <> 'First Bank Corp orati on'
```

**d.**
```sql
select ID
from works
where salary > all
( select salary
from works
where company_name = 'Small Bank Corporation')
```

**e.**
```sql
select S.com pany_name
from company as S
where not exists (( select city
from company
where company_name = 'Small Bank Corp oration')except
( select city
from company as T
where S.company_name = Tcom pany name) )
```

**f.**
```sql
select company_name
from works
group by company name
having count (distinct ID) >= all
( select count (distinct ID)from works
group by company name)
```

**g.**
```sql
select company name
from works
group by company_name
having avg (salary) > (select avg (salary)
from works
where com pany name = 'First Bank Corporation')
```

## 3.10
**a.**
```sql
update employee
set city = 'Newtown'
where ID = '12345'
```

**b.**
```sql
update works T
set T.salary = T.salary * 1.03where T.ID in (select manager_id
from manages)
and Tsalary * 1.l >100000
and T.company_name = 'First Bank Corporation'
update works T
set T.salary = T.salary * 1.1
where T.ID in (select manager_id
from manages)
and T.salary * 1.l <=100000
and T.company name = 'First Bank Corporation'
```

## 3.11

**a.**
```sql
SELECT DISTINCT S.ID, S.Name
FROM Student S
INNER JOIN Takes T ON S.ID = T.ID
INNER JOIN Course C ON T.CourseId = C.CourseId
WHERE C.DeptName = 'Comp. Sci'
ORDER BY S.ID;
```

**b.**
```sql
SELECT DISTINCT S.ID, S.Name
FROM Student S
LEFT JOIN Takes T ON S.ID = T.ID
LEFT JOIN Course C ON T.CourseId = C.CourseId AND C.Year < 2017
WHERE T.ID IS NULL
ORDER BY S.ID;
```

**c.**
```sql
SELECT DeptName, MAX(Salary) AS MaxSalary
FROM Instructor
GROUP BY DeptName
ORDER BY DeptName;
```

**d.**
```sql
SELECT MIN(MaxSalary) AS MinSalary
FROM (
    SELECT MAX(Salary) AS MaxSalary
    FROM Instructor
    GROUP BY DeptName
) AS MaxSalaries;
```

## 3.12

**a.**
```sql
INSERT INTO Course (CourseId, Title, DeptName, Credits)
VALUES ('CS-001', 'Weekly Seminar', 'Comp. Sci', 0);
```

**b.**
```sql
INSERT INTO Section (CourseId, SecId, Semester, Year)
VALUES ('CS-001', 1, 'Fall', 2017);
```

**c.**
```sql
INSERT INTO Takes (ID, CourseId, SecId, Semester, Year, Grade)
SELECT S.ID, 'CS-001', 1, 'Fall', 2017, NULL
FROM Student S
WHERE S.DeptName = 'Comp. Sci';
```

**d.**
```sql
DELETE FROM Takes
WHERE ID = '12345' AND CourseId = 'CS-001' AND SecId = 1 AND Semester = 'Fall' AND Year = 2017;
```

**e.**
如果在运行DELETE语句之前没有先删除新课程段，那么在删除课程CS-001时，将会出现外键约束错误。
这是因为在大学模式中，Section表中CourseId列是对Course表中的CourseId列的外键引用，用于确保所有课程段的所属课程必须存在于Course表中。
如果先删除了所有与课程CS-001相关的课程段，那么在运行DELETE语句时就不会出现外键约束错误。

**f.**
```sql
DELETE FROM Takes
WHERE CourseId IN (
    SELECT CourseId
    FROM Course
    WHERE LOWER(Title) LIKE '%advanced%'
);
```

## 3.13
```sql
CREATE TABLE person (
  driver_id INT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL
);

CREATE TABLE car (
  license_plate VARCHAR(20) NOT NULL PRIMARY KEY,
  model VARCHAR(255) NOT NULL,
  year INT NOT NULL
);

CREATE TABLE accident (
  report_number INT NOT NULL PRIMARY KEY,
  year INT NOT NULL,
  location VARCHAR(255) NOT NULL
);

CREATE TABLE owns (
  driver_id INT NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  PRIMARY KEY (driver_id, license_plate),
  FOREIGN KEY (driver_id) REFERENCES person(driver_id),
  FOREIGN KEY (license_plate) REFERENCES car(license_plate)
);

CREATE TABLE participated (
  report_number INT NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  driver_id INT NOT NULL,
  damage_amount DECIMAL(10, 2),
  PRIMARY KEY (report_number, license_plate, driver_id),
  FOREIGN KEY (report_number) REFERENCES accident(report_number),
  FOREIGN KEY (license_plate) REFERENCES car(license_plate),
  FOREIGN KEY (driver_id) REFERENCES person(driver_id)
);
```

## 3.14

**a.**

```sql
SELECT COUNT(*) AS num_accidents
FROM person p
JOIN owns o ON p.driver_id = o.driver_id
JOIN car c ON o.license_plate = c.license_plate
JOIN participated pd ON o.license_plate = pd.license_plate AND p.driver_id = pd.driver_id
JOIN accident a ON pd.report_number = a.report_number
WHERE p.name = 'John Smith';
```

**b.**
```sql
UPDATE participated
SET damage_amount = 3000.00
WHERE report_number = 'AR2197'
  AND license_plate = 'AABB2000';
```

## 3.15 
```sql
SELECT DISTINCT c.*
FROM customer c
JOIN account a ON c.customer_id = a.customer_id
JOIN branch b ON a.branch_id = b.branch_id
WHERE b.city = 'Brooklyn'
AND NOT EXISTS (
  SELECT 1
  FROM account a2
  WHERE a2.customer_id = c.customer
)
```

## 3.16
```sql
SELECT e.employee_id, e.name
FROM employee e
JOIN works_on w ON e.employee_id = w.employee_id
JOIN department d ON w.department_id = d.department_id
JOIN address a1 ON e.address_id = a1.address_id
JOIN address a2 ON d.address_id = a2.address_id
WHERE a1.city = a2.city;
```

## 3.17
```sql
UPDATE employee
SET salary = salary * 1.1
WHERE company = 'First Bank Corporation';
```

## 3.21

**a.**
```sql
select memb_no,name
from member
where (select authors from book where authors=’McGraw-Hill’)
```

## 3.22
```sql
WHERE title IN (SELECT DISTINCT title FROM course)
```

## 3.23
不会写

## 3.24
```sql
SELECT DISTINCT DeptName
FROM Department
WHERE Budget IN (
    SELECT Budget
    FROM Department
    WHERE DeptName = 'physics'
)
ORDER BY DeptName;
```

## 3.25
```sql
SELECT department.dept_name
FROM department
WHERE department.budget > (
    SELECT department.budget
    FROM department
    WHERE department.dept_name = &apos;Philosophy&apos;
)
ORDER BY department.dept_name ASC
```

## 3.26
```sql
SELECT takes.id, takes.course_id
FROM takes
WHERE takes.grade IS NULL AND takes.course_id IN (
    SELECT takes.course_id
    FROM takes
    WHERE takes.grade IS NOT NULL
    GROUP BY akes.id, takes.course_id
    HAVING COUNT(DISTINCT takes.grade) >= 2
)
GROUP BY takes.id, takes.course_id
HAVING COUNT(*) >= 2
```

## 3.27
```sql
SELECT takes.id
FROM takes
WHERE takes.grade IS NULL AND takes.course_id IN (
    SELECT takes.course_id
    FROM takes
    WHERE takes.grade IS NOT NULL
    GROUP BY takes.id, takes.course_id
    HAVING COUNT(DISTINCT takes.grade) >= 2
)
GROUP BY takes.id
HAVING COUNT(DISTINCT takes.course_id) >= 3
```

## 3.28
```sql
SELECT DISTINCT instructor.ID, instructor.name
FROM instructor
JOIN teaches ON instructor.ID = teaches.ID
JOIN department ON instructor.dept_name = department.dept_name
JOIN course ON teaches.course_id = course.course_id AND course.dept_name = department.dept_name
GROUP BY instructor.ID, instructor.name
HAVING COUNT(DISTINCT teaches.course_id) = (
    SELECT COUNT(*)
    FROM course
    WHERE dept_name = instructor.dept_name
)
ORDER BY instructor.name
```

## 3.29
```sql
SELECT s.ID, s.name
FROM student s
WHERE s.dept_name = &apos;History&apos; AND s.name LIKE &apos;D%&apos;
    AND NOT EXISTS (
        SELECT *
        FROM takes t, course c
        WHERE t.course_id = c.course_id AND t.id = s.ID
            AND c.dept_name = &apos;Music&apos;
        HAVING COUNT(*) >= 5
    )
```

## 3.30
假设我们有以下关系示例，其中有两个教师，一个的薪水是100，另一个的薪水是200：

ID Name Salary
101 John 100
102 Michael 200
使用该查询，我们可以计算出：

平均工资：（100 + 200）/ 2 = 150
工资总和：100 + 200 = 300
教师数量：2

因此，查询的结果将是：

150 - (300 / 2) = 150 - 150 = 0

这符合我们的预期，因为平均工资等于工资总和除以教师数量。

但是，如果我们有以下关系示例，其中有三个教师，薪水分别是100、200和300：

ID Name Salary
101 John 100
102 Michael 200
103 Sarah 300
使用该查询，我们可以计算出：

平均工资：（100 + 200 + 300）/ 3 = 200
工资总和：100 + 200 + 300 = 600
教师数量：3

因此，查询的结果将是：

200 - (600 / 3) = 200 - 200 = 0

在这种情况下，结果仍然是零，因为平均工资等于工资总和除以教师数量。

然而，如果我们有以下关系示例，其中有三个教师，薪水分别是100、200和400：

ID Name Salary
101 John 100
102 Michael 200
103 Sarah 400
使用该查询，我们可以计算出：

平均工资：（100 + 200 + 400）/ 3 = 233.33
工资总和：100 + 200 + 400 = 700
教师数量：3

因此，查询的结果将是：

233.33 - (700 / 3) = 233.33 - 233.33 = 0

在这种情况下，结果仍然是零，因为平均工资等于工资总和除以教师数量。

综上所述，无论教师的薪水如何分布，只要教师的数量是固定的，这个查询的结果就将是零。这是因为平均工资的定义是工资总和除以教师数量。

## 3.31
```sql
SELECT DISTINCT Instructors.id, Instructors.name
FROM Instructors
LEFT JOIN Teachings ON Instructors.id = Teachings.id
LEFT JOIN Enrollments ON Teachings.courseid = Enrollments.courseid
                      AND Teachings.secid = Enrollments.secid
                      AND Teachings.year = Enrollments.year
                      AND Teachings.semester = Enrollments.semester
WHERE Enrollments.grade IS NOT NULL AND Enrollments.grade != &apos;A&apos;
   OR Enrollments.grade IS NULL
ORDER BY Instructors.id;
```

## 3.32
```sql
FROM Instructors
JOIN Teachings ON Instructors.id = Teachings.id
JOIN Enrollments ON Teachings.courseid = Enrollments.courseid
                  AND Teachings.secid = Enrollments.secid
                  AND Teachings.year = Enrollments.year
                  AND Teachings.semester = Enrollments.semester
WHERE Enrollments.grade IS NOT NULL AND Enrollments.grade != &apos;A&apos;
GROUP BY Instructors.id, Instructors.name
HAVING COUNT(DISTINCT Enrollments.courseid) > 0
ORDER BY Instructors.id;
```

## 3.33
```sql
SELECT DISTINCT Courses.courseid, Courses.coursename
FROM Courses
JOIN Sections ON Courses.courseid = Sections.courseid
JOIN TimeSlots ON Sections.timeid = TimeSlots.timeid
WHERE Courses.deptname = &apos;comp.sci&apos;
AND (TimeSlots.endtime >= &apos;12:00:00&apos; OR TimeSlots.endtime LIKE &apos;%PM&apos;)
ORDER BY Courses.courseid;
```

## 3.34
```sql
SELECT DISTINCT Courses.courseid, Courses.coursename
FROM Courses
JOIN Sections ON Courses.courseid = Sections.courseid
JOIN TimeSlots ON Sections.timeid = TimeSlots.timeid
WHERE Courses.deptname = &apos;comp.sci&apos;
AND (TimeSlots.endtime >= &apos;12:00:00&apos; OR TimeSlots.endtime LIKE &apos;%PM&apos;)
ORDER BY Courses.courseid;
```

## 3.35
```sql
WITH EnrollCount AS (
  SELECT courseid, secid, year, semester, COUNT(*) AS num
  FROM Enrollments
  GROUP BY courseid, secid, year, semester
)
SELECT courseid, secid, year, semester, num
FROM EnrollCount
WHERE num = (SELECT MAX(num) FROM EnrollCount)
ORDER BY courseid, secid, year, semester, num;
```
