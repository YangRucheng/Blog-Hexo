---
title: 小程序API文档
tags: MiniProgram
date: 2023-04-07
cover: ../static/Debian-Shell/cover.jpg
katex: false
---

# API文档

## 格式
POST请求参数以JSON格式放在Body里
GET请求参数放在URL里

后端应当返回的数据格式示例:
```json
{
    "status": 0,
    "data": [],
    "msg": "如果错误就填入错误原因, 没错误就空字符串"
}
```
data可以是Array, 也可以是object
```json
{
    "status": 0,
    "data": {},
    "msg": "如果错误就填入错误原因, 没错误就空字符串"
}
```

**后面的数据示例不再重复这个结构, 只展示data的内容**

## API

### 登录
`POST`
请求体
```json
{
    "code":"微信提供的code",
    "timestamp": "16......", //时间戳
    "systemInfo": {} // 设备信息, 没什么用的
}
```

响应 (仅data)
```json
{
    "isRegister": true, // 是否绑定账号 / 是否已经注册过
    "img": "https://t.idceo.cn/LightPicture/2023/04/69fca48d6fa2a3a5.jpg", //头像
    "name": "刘思科", //姓名
    "courtyard": "须弥教令院 天马山分院", //学院
    "user_id": "202005650232", // 学工号
    "sex": "女", // 性别
    "token": "12ehifr"
}
```
**注意** 图片也可以是base64格式的URL, 但必须以`data:image/png;base64,`开头

### 获取首页轮播图
`GET`
无请求参数

响应
```json
[{
        "img": "https://t.idceo.cn/LightPicture/2023/04/ad957b0b4cd38f22.jpg", // 轮播图链接
        "title": "通知标题1",
        "notice": "通知内容1...巴拉巴拉...通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉",
        "time": "2021-01-12 12:00"
},{
        "img": "https://t.idceo.cn/LightPicture/2023/04/ad957b0b4cd38f22.jpg",
        "title": "通知标题2",
        "notice": "通知内容2...巴拉巴拉...通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉通知内容巴拉巴拉",
        "time": "2021-01-12 18:00"
}]
```

### 获取排行榜
`GET`
无请求参数

响应
```json
[{
    "img": "https://t.idceo.cn/LightPicture/2023/04/69fca48d6fa2a3a5.jpg",
    "name": "科科爱睡觉", // 用户名
    "accuracy": 100, // 榜单数据 (今日排行)
    "allNum": 300, // 做题数量 (本月排行和本周排行)
    "courtyard": "须弥教令院" // 学院
}, {
    "img": "https://t.idceo.cn/LightPicture/2023/04/69fca48d6fa2a3a5.jpg",
    "name": "科科爱打游戏",
    "accuracy": 80.12,
    "allNum": 300,
    "courtyard": "须弥教令院"
}, {
    "img": "https://t.idceo.cn/LightPicture/2023/04/69fca48d6fa2a3a5.jpg",
    "name": "科科是谁啊",
    "accuracy": 60.12,
    "allNum": 300,
    "courtyard": "须弥教令院"
}]
```

### 获取练习列表(专项练习 / 每日练习)
`GET`
请求参数
```js
/**
 * 获取练习列表 (专项练习 / 每日练习)
 * @param {number} begin 分页起点
 * @param {number} num 分页数量
 * @param {string} type 数据源, 有"每日练习"和"专项练习"两个取值, 没错就是中文字符串
 */
```
示例: `?begin=0&num=15&type=每日练习`

响应
```json
[{
    "img": "https://t.idceo.cn/LightPicture/2023/04/ad957b0b4cd38f22.jpg", // 每日练习的配图
    "exam_id": "1234455", // 练习ID, 不重复
    "title": "2021-01-12 练习题", // 标题
    "introduce": "简介数据由题目摘要生成, 简介数据由题目摘要生成", // 简介
    "completeNum": 23, // 完成人数
    "datetime": "2021-01-32 18:00" // 上传时间
}, {
    "img": "https://t.idceo.cn/LightPicture/2023/04/ad957b0b4cd38f22.jpg",
    "exam_id": "1234455",
    "title": "思科练习题1",
    "introduce": "简介数据由题目摘要生成, 简介数据由题目摘要生成",
    "completeNum": 34,
    "datetime": "2021-01-32 18:00"
}]
```

### 获取(做过的)历史题目列表 (全部历史答题 / 历史错题)
`GET`
请求参数
```js
/**
 * 获取已做题目列表 (全部历史题目 / 全部错题)
 * @param {string} token token
 * @param {number} begin 分页起点
 * @param {number} num 分页数量
 * @param {string} type 数据源, 有"all"和"error"两种取值
 */
```

响应
```json
[{
    "problem_id": "sdh38dh", // 题目ID, 不重复
    "problem": "刘思科是哪个学院的学生?题目长度测试题目长度测试题目长度测试", // 题目内容
    "type": "单选题", // 题目类型, 只有"单选题","多选题","判断题"三种
    "result": true, // 
    "complete_time": "30秒" // 完成用时, 目前还没想好怎么得到, 先随便编
}, {
    "problem_id": "sdh3822dh",
    "problem": "刘思科是哪个学院的学生?",
    "type": "单选题",
    "result": true,
    "complete_time": "1分30秒"
}]
```

### 修改用户资料 (含头像)
`POST`
请求体
```json
{
    "token": "登录时下发的token",
    "userInfo": {
        "img": "https://t.idceo.cn/LightPicture/2023/04/69fca48d6fa2a3a5.jpg", //头像
        "name": "刘思科", //姓名
        "courtyard": "须弥教令院 天马山分院", //学院
        "user_id": "202005650232", // 学工号
        "sex": "女", // 性别
        "token": "12ehifr" // 别问为什么重复, 少管, 忽略这个就行了
    }, // 与登录时返回的数据一致
}
```

返回值
```json
{
    "img": "https://t.idceo.cn/LightPicture/2023/04/69fca48d6fa2a3a5.jpg", //头像
    "name": "刘思科", //姓名
    "courtyard": "须弥教令院 天马山分院", //学院
    "user_id": "202005650232", // 学工号
    "sex": "女", // 性别
    "token": "12ehifr" // 可以在此时刷新token, 会更新到全局变量
}
```

### 获取单个题目的详情, 在查看错题时获取
`GET`
```js
/**
 * 获取单个题目详情
 * @param {string} token token
 * @param {string} problem_id 题目ID
 */
```

响应
```json
{
    "problem_id": "sdh38dh",
    "problem": "刘思科是哪个学院的学生?.............",
    "type": "单选题",
    "options": [
        {"key": "A", "value": "计算机学院"},
        {"key": "B", "value": "计网院"},
        {"key": "C", "value": "自电院"},
        {"key": "D", "value": "湘潭大学"}
    ],
    "correct_answer": "ABD", // 正确答案
    "analysis": "这题之所以选E是因为巴拉巴拉", // 题目解析
    "user_answer": "BD", // 用户做的答案
    "result": false, // 是否正确
    "complete_time": "1分30秒" // 耗时
}
```

### 获取随机练习题
`GET`
```js
/**
 * 获取练习题, 由后端返回随机题目, 后端无需保存生成的题目, 每次随机生成即可, 注意避免重复题目
 * @param {string} token token
 * @param {string} exam_id 每日练习ID / 专项练习ID
 */
```

响应
```json
[{
    "problem_id": "sdh328dh",
    "problem": "刘思科是哪个学院的学生?长度不够刘思科是哪个学院的学生?刘思科是哪个学院的学生?",
    "type": "单选题",
    "options": [
        {"key": "A", "value": "计算机学院"},
        {"key": "B", "value": "计网院"},
        {"key": "C", "value": "自电院"},
        {"key": "D", "value": "湘潭大学, 特别长的选项, 特别长的选项, 特别长的选项 湘潭大学, 特别长的选项, 特别长的选项, 特别长的选项"}
    ],
    "correct_answer": "ABD"
}, {
    "problem_id": "sdh328dh",
    "problem": "刘思科是哪个学院的学生?长度不够刘思科是哪个学院的学生?刘思科是哪个学院的学生?",
    "type": "单选题",
    "options": [
        {"key": "A", "value": "计算机学院"},
        {"key": "B", "value": "计网院"},
        {"key": "C", "value": "自电院"},
        {"key": "D", "value": "湘潭大学"}
    ],
    "correct_answer": "ABD"
}]
```

### 提交用户答案
`POST`
```json
{
    "token": "token",
    "exam_id": "exam_id",
    "answer": [{
        "problem_id": "wndjn",
        "answer": ["A", "B"], // 之所以写成这样, 是因为在Python中 `["A", "B"]` 和 `"AB"` 几乎没有区别
        "complete_time": "1分12秒" // 单个题目的用时
    },{
        "problem_id": "wn2djn",
        "answer": ["A", "B", "C"],
        "complete_time": "12秒"
    }],
    "complete_time": "1分24秒" // 总共用时
}
```

响应
```json
{
    "correctNum": 1, // 总共对了几道题, 不需要具体哪几道, 因为还是要去历史错题那里查看
}
```