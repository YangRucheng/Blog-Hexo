---
title: Linux系统常用命令
tags: Linux
cover: ../static/Linux-Shell/cover.jpg
katex: false
---

# Linux常用命令记录

## 0.常见Linux命令

`mkdir` 创建目录  	

`cd` 转换工作目录

`rm` 删除 `-r` 参数表示递归

`cp` 复制

`mv` 移动或重命名

`ln` 或 `ln -s ` 创造硬链接或符号链接 硬链接不能链接目录，常用符号链接

`file` 描述文件

`ls` `tree` 列出文件 `-l` `-a` 参数

`alias` 命名

`which` 查询路径

## 1.IO重定向

一般来说，输入输出都由 `stdin` `stdout` 或 `stderr` 直接读取。下列命令可改变IO读取方式

如 `ls -l /usr/bin > ls-outputs.txt` ps:清空文件技巧 ` > ls-output.txt` 错误信息不会被定向到输出。`>>` 代表追加，而不会清空之前的内容。

如何定向标准错误输出

标准错误输出重定向没有专用的重定向操作符。为了重定向标准错误输出，我们必须用到其文件描述符。 一个程序的输出会流入到几个带编号的文件中。这些文件的前 三个称作标准输入、标准输出和标准错误输出，shell 内部分别将其称为文件描述符0、1和2。shell 使用文件描述符提供 了一种表示法来重定向文件。因为标准错误输出和文件描述符2一样，我们用这种 表示法来重定向标准错误输出：

```shell
ls -l /bin/usr 2> ls-error.txt
```

如何将二者重定向至同一文件 

`ls -l /bin/usr &>> ls-outputs.txt`

### TIP

一行执行多个命令可使用 `;` 分隔







