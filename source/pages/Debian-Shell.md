---
title: Debian常用命令记录
tags: Linux
cover: ../static/Debian-Shell/cover.jpg
katex: false
---


# Debian常用命令记录

> 本篇主要记录折腾树莓派的过程
> 记录常用的软件和命令

## 开启root账号ssh

```shell
sudo passwd root                                                                  # 设置root账户密码
sudo passwd --unlock root                                                         # 解除禁用root账户
sudo sed -i "s/^#PermitRootLogin.*/PermitRootLogin yes/g" /etc/ssh/sshd_config    # 设置ssh允许root账户登陆
sudo systemctl restart ssh                                                        # 重启ssh
sudo cp ~/.bashrc /root/.bashrc                                                   # 将当前账户配置应用到root账号
```
>  ssh遇到警告  
>  ` ssh-keygen -R 123.60.208.1       # 清除ssh指纹 `
## 更换源及升级包

### 更改软件源

```shell
sudo nano /etc/apt/sources.list  # 修改软件源
```
```shell
# arm64
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
sudo apt-get update      # 更新软件清单
sudo apt-get upgrade     # 更新所有软件
```
## 更改语言

```shell
sudo apt-get install ttf-wqy-zenhei   # 安装中文字库
sudo fc-cache                         # 安装中文字体
sudo dpkg-reconfigure locales         # 设置语言
```
## 连接WIFI

```shell
nmtui
```

## 树莓派获取CPU温度及控制GPIO电平

```shell
cat sys/class/thermal/thermal_zone0/temp   # 获取CPU温度
cd /sys/class/gpio                         # 进入系统目录
ls                                         # 列举启用的IO引脚
sudo echo 15 > export                      # 启用GPIO15
cd gpio15                                  # 进入GPIO15目录
sudo echo out > direction                  # 设置GPIO模式为输出
sudo echo 1 > value                        # 开
sudo echo 0 > value                        # 关
sudo echo 15 > unexport                    # 禁用GPIO15
```
## 挂载SMB和U盘

永久挂载
```shell
apt-get install exfat-fuse   # 安装exFAT软件
blkid                        # 查看U盘的UUID
sudo nano /etc/fstab         # 添加挂载配置
sudo mount -a                # 重启挂载软件
```
```shell
//192.168.123.2 /home/share cifs username=root,password=YourPassword,vers=1.0
UUID=****** /opt/Disk exfat defaults 0 0
```
临时挂载
```shell
sudo mount -t cifs -o username=root,password=YourPassword,file_mode=0777,dir_mode=0777 //192.168.123.2 /home/share
```
## 网络配置

> 使用nmtui工具配置

## 安装Docker及常用镜像

```shell
sudo curl -sSL https://get.docker.com | sh   # 脚本安装
sudo nano /etc/docker/daemon.json            # 修改镜像源
```
```json
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"],
  "graph": "/data/docker/lib/docker",
  "dns": ["114.114.114.114", "8.8.8.8"]
}
```
> 进入容器内部  
> ` docker exec -it 容器ID bash `  
> 退出容器  
> ` exit `
### 1. 安装Docker图形管理界面

```shell
docker run -d -p 9000:9000 --name=Portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v /home/root/Docker/Portainer:/data outlovecn/portainer-cn:latest
```
### 2. 安装AdGuardHome广告拦截

```shell
docker run -d -p 53:53/tcp -p 53:53/udp -p 8000:3000/tcp --name AdGuardHome -v /home/root/Docker/AdGuardHome/Config:/opt/adguardhome/conf -v /home/root/Docker/AdGuardHome/WorkData:/opt/adguardhome/work --restart=always adguard/adguardhome
```
> 注意: 不要开启 **浏览安全网页服务** 功能, 否则将会导致DNS解析异常
### 3. 安装Nginx `容器化的意义不大, 弃用`

```shell
docker run -d --name Nginx-Web -p 443:443 -p 80:80 -v /home/root/Docker/Nginx/HTML:/usr/share/nginx/html:rw -v /home/root/Docker/Nginx/Config:/etc/nginx:rw -v /home/root/Docker/Nginx/Logs:/var/log/nginx/:rw -v /home/root/Docker/Nginx/SSL:/ssl/:rw --restart=always -d nginx
```
### 4. 安装Speedtest `落后的PHP实现, 弃用`

```shell
docker run -d --name Speedtest -p 7000:80 -v /home/root/Docker/Speedtest:/var/www/html -e SAME_IP_MULTI_LOGS=true --restart=always -it badapple9/speedtest-x
```
### 5. 安装Clash

```shell
docker run -d --name=Clash -v /home/root/Docker/Clash:/root/.config/clash -p 520:520 -p 521:521 -p 9090:9090 --restart=unless-stopped dreamacro/clash
```

### 6. 安装Aria2 `功能较少, 弃用`

```shell
docker run -d --name Aria2-Web -v /home/root/Docker/Aria2/Downloads:/data -p 7000:80 wahyd4/aria2-ui
```

### 7. 青龙面板 ` 占用过高, 弃用`

```shell
docker run -dit \
-v /home/root/Docker/ql/config:/ql/config \
-v /home/root/Docker/ql/log:/ql/log \
-v /home/root/Docker/ql/db:/ql/db \
-v /home/root/Docker/ql/scripts:/ql/scripts \
-v /home/root/Docker/ql/jbot:/ql/jbot \
-v /home/root/Docker/ql/repo:/ql/repo \
-p 7000:5700 \
-e ENABLE_HANGUP=true \
-e ENABLE_WEB_PANEL=true \
--name Qinglong \
--hostname qinglong \
--restart always \
whyour/qinglong:latest
```

### 8. EMQX

> 默认登录名: admin 密码: public

> 注意: 应先创建未映射目录的容器, 并将文件复制到宿主机, 再创建映射目录的容器, 否则会导致文件缺失

``` shell
docker run -d --name EMQX -p 1883:1883 -p 8083:8083 -p 8084:8084 -p 8883:8883 -p 7000:18083 emqx/emqx
docker run -d --name EMQX -p 1883:1883 -p 8083:8083 -p 8084:8084 -p 8883:8883 -p 7000:18083 -v /home/root/Docker/EMQX/log:/opt/emqx/log -v /home/root/Docker/EMQX/data:/opt/emqx/data emqx/emqx
```

### 9. MariaDB

``` shell
docker run --restart=always -d --name MariaDB --env MARIADB_ROOT_PASSWORD=YourPassword! -v /home/root/Docker/MariaDB:/var/lib/mysql -p 3306:3306  mariadb:latest
```

### 10. MongoDB `在香橙派上必须使用4.4.18版本, 不支持5.0+版本`

``` shell
docker run -itd --name  MongoDB -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=YourPassword! -v /home/root/Docker/MongoDB:/data/db -p 27017:27017 mongo:4.4.18
```

### 11. HomeAssistant

``` shell
docker run -d --name HomeAssistant -v /home/root/Docker/HomeAssistant/config:/config -p 8500:8123 homeassistant/home-assistant
```

### 12. QBittorrent

```shell
docker run -d \
  --name=QBittorrent \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ=Asia/Shanghai \
  -e WEBUI_PORT=7500 \
  -p 7500:7500 \
  -p 6881:6881 \
  -p 6881:6881/udp \
  -v /home/root/Docker/QBittorrent/config:/config \
  -v /home/root/Docker/QBittorrent/downloads:/downloads \
  --restart unless-stopped \
  linuxserver/qbittorrent:4.4.3
```

### 13. Debian基础镜像

```shell
ip link set eth0 promisc on # 网卡开启混杂模式
docker network create -d macvlan --subnet=192.168.123.0/24 --gateway=192.168.123.1 -o parent=eth0 macvlan  # 创建macvlan网络
```

```shell
docker run --restart always --name Debian -d -v /home/root/Docker/Debian:/home --network 4G mydebian # 自定义网桥
docker run --restart always --name Debian -d -v /home/root/Docker/Debian:/home mydebian              # 默认网桥
```

### 14. OpenWrt

创建Macvlan
```
docker network create -d macvlan --subnet=192.168.0.0/24 --gateway=192.168.0.1  -o parent=enx344b50000000 macvlan-4G
```

```
docker run --restart always --name OpenWrt -d --network macvlan --ip=192.168.123.2 --hostname Openwrt sulinggg/openwrt:aarch64_generic /sbin/init
```

### 15. SpeedTest

```shell
docker run --name SpeedTest -p 9500:80 -v /home/root/Docker/SpeedTest:/config -e OOKLA_EULA_GDPR=true --restart unless-stopped bricksoft/speedtest
```

### 16. Flarum

```dockerfile
version: "3"

services:
  flarum:
    image: mondedie/flarum
    container_name: Flarum
    env_file:
      - /home/root/Docker/Forum/flarum.env
    volumes:
      - /home/root/Docker/Forum/assets:/flarum/app/public/assets
      - /home/root/Docker/Forum/extensions:/flarum/app/extensions
      - /home/root/Docker/Forum/storage/logs:/flarum/app/storage/logs
      - /home/root/Docker/Forum/nginx:/etc/nginx/flarum
    ports:
      - 8000:8888
    depends_on:
      - mariadb
```

```shell
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

### 17.学习强国

```shell
docker run -it --rm --name=TechXuexi --shm-size="2g" -e "ZhuanXiang=True" -e "Pushmode=6" -p 9500:80 techxuexi/techxuexi-arm64v8
```

## 安装Zerotier `香橙派无tun, 无法使用, 改用Autossh`

```shell
curl -s https://install.zerotier.com | sudo bash   # 安装
sudo zerotier-cli join 632ea29085dbe40e            # 加入网络
sudo killall -9 zerotier-one                       # 重启
```

```shell
autossh -M 4010 -NR 8080:localhost:8080 root@123.60.208.1
```

## 路由表
```shell
iptables -t nat -A POSTROUTING -s 172.18.0.0/16 -j SNAT --to 192.168.0.100
# 172.18.0.0/16是Docker网段, 指定来自该网段的包转发到192.168.0.100的网络上
```