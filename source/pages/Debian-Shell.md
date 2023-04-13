---
title: Debian/Ubuntu常用命令记录
tags: Linux
date: 2023-01-20
cover: ../static/Debian-Shell/cover.jpg
katex: false
---


# Debian常用命令记录

> 本篇主要记录安装**树莓派和云服务器**软件的过程
> `Ubuntu` 是基于 `Debian` 开发的发行版, 大部分命令都通用

## 开启root账号ssh

```shell
sudo passwd --unlock root                                                         # 解除禁用root账户
sudo sed -i "s/^#PermitRootLogin.*/PermitRootLogin yes/g" /etc/ssh/sshd_config    # 设置ssh允许root账户登陆
sudo systemctl restart ssh                                                        # 重启ssh
```
>  ssh警告 (防止中间人攻击) 
>  ` ssh-keygen -R yangrucheng.top`      清除ssh指纹 

## 更换源及升级包

### 更改软件源

> 树莓派默认使用国外镜像源, 可修改为国内镜像源. 效果不如使用代理

```shell
vi /etc/apt/sources.list  # 修改软件源
```
```shell
# 树莓派arm64
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-updates main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-updates main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-backports main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-backports main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bullseye-security main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security bullseye-security main contrib non-free
```
### 更新系统源

```shell
sudo nano /etc/apt/sources.list.d/raspi.list  # 修改系统源
```
```shell
# arm64
deb https://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ bullseye main
```
### 升级包

```shell
sudo apt update      # 更新软件清单
sudo apt upgrade     # 更新所有软件
```
## 更改语言

```shell
sudo apt install ttf-wqy-zenhei   # 安装中文字库
sudo fc-cache                         # 安装中文字体
sudo dpkg-reconfigure locales         # 设置语言
```

## 网络配置

> 使用nmtui工具配置

```shell
apt install network-manger
```

## 安装Docker及常用镜像

```shell
sudo curl -sSL https://get.docker.com | sh   # 脚本安装
sudo nano /etc/docker/daemon.json            # 修改镜像源
```
```json
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"],
  "data-root": "/home/.data/var/lib/docker",
  "dns": ["114.114.114.114", "8.8.8.8"]
}
```
> 进入容器内部  
> ` docker exec -it 容器ID bash `  
> 退出容器  
> ` exit `

### 安装Docker图形管理界面

```shell
docker run -d -p 9000:9000 --name=Portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v /home/Docker/Portainer:/data outlovecn/portainer-cn:latest
```

### 安装AdGuardHome

```shell
docker run -d -p 53:53/tcp -p 53:53/udp -p 8000:3000/tcp --name AdGuardHome -v /home/Docker/AdGuardHome/Config:/opt/adguardhome/conf -v /home/Docker/AdGuardHome/WorkData:/opt/adguardhome/work --restart=always adguard/adguardhome
```
> 注意: 不要开启 **浏览安全网页服务** 功能, 否则将会导致DNS解析异常

### 安装Clash

```shell
docker run -d --name=Clash -v /home/Docker/Clash:/root/.config/clash -p 520:520 -p 521:521 -p 9090:9090 --restart=unless-stopped dreamacro/clash
```

### 青龙面板

```shell
docker run -dit \
-v /home/Docker/ql/config:/ql/config \
-v /home/Docker/ql/log:/ql/log \
-v /home/Docker/ql/db:/ql/db \
-v /home/Docker/ql/scripts:/ql/scripts \
-v /home/Docker/ql/jbot:/ql/jbot \
-v /home/Docker/ql/repo:/ql/repo \
-p 7000:5700 \
-e ENABLE_HANGUP=true \
-e ENABLE_WEB_PANEL=true \
--name Qinglong \
--hostname qinglong \
--restart always \
whyour/qinglong:latest
```

### MariaDB

``` shell
docker run --restart=always -d --name MariaDB --env MARIADB_ROOT_PASSWORD=YourPassword! -v /home/Docker/MariaDB:/var/lib/mysql -p 3306:3306  mariadb:latest
```

### MongoDB 

> 在香橙派上必须使用4.4.18版本, 不支持5.0+版本
``` shell
docker run -itd --name  MongoDB -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=YourPassword! -v /home/Docker/MongoDB:/data/db -p 27017:27017 mongo:4.4.18
```

### HomeAssistant

``` shell
docker run -d --name HomeAssistant -v /home/Docker/HomeAssistant/config:/config -p 8500:8123 homeassistant/home-assistant
```

### QBittorrent

```shell
docker run -d \
  --name=QBittorrent \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ=Asia/Shanghai \
  -e WEBUI_PORT=7500 \
  -p 7500:7500 \
  -p 6881:6881 \
  -v /home/Docker/QBittorrent/config:/config \
  -v /share/Public:/file-data \
  --restart unless-stopped \
  linuxserver/qbittorrent
```

### Flarum

```dockerfile
version: "3"

services:
  flarum:
    image: mondedie/flarum
    container_name: Flarum
    env_file:
      - /home/Docker/Forum/flarum.env
    volumes:
      - /home/Docker/Forum/assets:/flarum/app/public/assets
      - /home/Docker/Forum/extensions:/flarum/app/extensions
      - /home/Docker/Forum/storage/logs:/flarum/app/storage/logs
      - /home/Docker/Forum/nginx:/etc/nginx/flarum
    ports:
      - 8000:8888
    depends_on:
      - mariadb
```

```config
DEBUG=false
FORUM_URL=https://forum.yangrucheng.top

DB_HOST=mariadb
DB_NAME=论坛
DB_USER=user
DB_PASS=123456789    
DB_PREF=flarum_
DB_PORT=3306

FLARUM_ADMIN_USER=admin
FLARUM_ADMIN_PASS=YourPassword!
FLARUM_ADMIN_MAIL=admin@yangrucheng.top
FLARUM_TITLE=Forum By YangRucheng
```

```shell
docker run --name Flarum -p 8000:8888 

mondedie/flarum
```

## 安装Zerotier 

> 依赖Linux内核的tun模块, 可以考虑改用Cloudflare免费的内网穿透
> 
```shell
curl -s https://install.zerotier.com | sudo bash   # 安装
sudo zerotier-cli join 632ea29085dbe40e            # 加入网络
sudo killall -9 zerotier-one                       # 重启
```

### 安装 OpenSSH 沙盒 Linux

```shell
docker run -d \
  --name=OpenSSH-Server \
  --hostname=Server \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Aisa/Shanghai \
  -e PASSWORD_ACCESS=true \
  -e USER_PASSWORD=730 \
  -e USER_NAME=user \
  -p 2222:2222 \
  --restart unless-stopped \
  lscr.io/linuxserver/openssh-server:latest
```