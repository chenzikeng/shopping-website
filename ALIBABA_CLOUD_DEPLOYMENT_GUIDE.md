# 阿里云服务器部署指南

本文档将指导您如何将在线购物网站项目部署到阿里云服务器上。

## 一、阿里云服务器准备

### 1. 购买ECS服务器

**注意：阿里云有两个主要网站，根据您的位置和需求选择：**
- 中国用户建议访问：https://www.aliyun.com/ (阿里云中国站)
- 国际用户建议访问：https://www.alibabacloud.com/ (阿里云国际站)

如果您是中国用户但在注册时看不到中国地区选项，可能是访问了国际站。请确保访问正确的中国站网址。

1. 登录阿里云中国官网：https://www.aliyun.com/
2. 注册/登录阿里云账号
3. 进入控制台 > 产品与服务 > 云服务器ECS
4.3. 点击"创建实例"
5. 选择配置（根据截图的详细配置指导）：

   ### 默认配置、可用区、网络类型、安全组、专有网络和实例名称配置

   在阿里云ECS创建实例页面，您会看到顶部有几个配置标签页：**默认配置** | 可用区 | 网络类型 | 安全组 | 专有网络 | 实例名称

   #### 1. 默认配置
   - 这是阿里云提供的推荐配置，包含了基本的实例规格、镜像、网络等设置
   - 如果需要更详细的配置，可以点击"自定义购买"链接进入高级配置页面

   #### 2. 可用区
   - 可用区是同一地域内电力和网络互相独立的物理区域
   - 默认选项："随机分配"（阿里云会自动选择当前最适合的可用区）
   - 建议保持默认值，除非您有特定的可用区需求（如容灾部署）

   #### 3. 网络类型
   - 默认选项："默认专有网络"
   - 阿里云专有网络（VPC）提供了更安全、更灵活的网络环境
   - 建议保持默认值，无需修改

   #### 4. 安全组
   - 默认选项："默认安全组，实例创建后可修改"
   - 安全组是一种虚拟防火墙，控制实例的入站和出站流量
   - 建议创建新的安全组并配置适当的规则，而不是使用默认安全组
   - 后续需要开放的端口：22(SSH)、80(HTTP)、443(HTTPS)、3000(Node.js)

   #### 5. 专有网络
   - 默认选项："默认专有网络交换机"
   - 专有网络交换机是VPC内的虚拟网络设备，用于连接不同的云资源
   - 建议保持默认值，除非您有特定的网络规划需求

   #### 6. 实例名称
   - 默认选项："系统命名，实例创建后可修改"
   - 系统会自动生成实例名称，如"i-2zegk52h29v57c5****"
   - 建议自定义实例名称，如"shopping-web-server"，方便后续管理

   ### 1. 实例规格配置
   - **实例规格**：选择"经济型 e"（99元套餐）
     - 配置：2vCPU, 2GiB内存, 40G ESSD Entry盘
     - 带宽：3M固定带宽
     - 价格：¥99.00/年
     - 优惠：限量1台，活动期内续费99元/年
   - **配置方案**：保持默认的"基础配置 (2vCPU, 2GiB)"

   ### 2. 镜像选择
   - **推荐选择**：Ubuntu 22.04 64位
     - 理由：长期支持版本，社区活跃，适合Node.js应用开发
   - **其他可选**：
     - Alibaba Cloud Linux 3.2104 LTS 64位（阿里云自研，优化较好）
     - CentOS 7.9 64位（稳定，适合传统应用）
   - **注意**：不建议选择Windows Server，因为Node.js应用在Linux系统上运行更高效

   ### 3. 预装应用
   - **建议选择**：Docker（如果您熟悉Docker部署）
   - **或者选择**：不安装任何预装应用（手动安装更灵活）
   - **注意**：如果选择宝塔Linux面板，会影响系统默认配置，可能需要额外学习成本

   ### 4. 付费类型
   - 保持默认：**包年包月**（勾选了"优惠"标签，更划算）
   - 适合长期稳定的业务需求

   ### 5. 地域选择
   - **建议选择**：离您或目标用户最近的地域
     - 华北2（北京）：适合北方用户
     - 华东1（杭州）：适合华东用户
     - 华南1（深圳）：适合南方用户
   - **注意**：实例创建后地域无法更改

   ### 6. 网络配置
   - **公网IP**：保持默认勾选"分配公网IPv4地址"
   - **带宽计费模式**：保持默认"按固定带宽"
   - **带宽值**：保持默认3Mbps（足够小型网站使用）
   - **其他网络配置**：使用默认值即可

   ### 7. 安全组配置
   - **安全组**：创建新安全组或选择已有安全组
   - **必须开放的端口**：
     - 22 (SSH)：用于远程连接服务器
     - 80 (HTTP)：用于网站访问
     - 443 (HTTPS)：用于加密网站访问（可选）
     - 3000 (Node.js)：用于后端API服务
   - **配置方式**：创建实例后可在安全组规则中添加这些端口

   ### 8. 登录配置
   - **建议选择**：密钥对（更安全）
     - 点击"创建密钥对"，下载私钥文件并妥善保存
   - **或者选择**：密码（更方便）
     - 设置登录密码，确保复杂度足够

   ### 9. 购买时长
   - 保持默认：1年（享受99元优惠价）
   - 如需更长使用时间，可选择2年或3年（享受更多优惠）

   ### 10. 其他配置
   - **实例名称**：可自定义（如：shopping-web-server）
   - **标签**：可根据需要添加
   - **描述**：可添加实例用途说明

   完成以上配置后，点击"立即购买"按钮，按照提示完成支付即可。

### 2. 获取服务器信息
- 公网IP地址
- 用户名：默认root或ubuntu
- 密码：购买时设置的密码

## 二、环境配置

### 1. 连接服务器
**重要说明**：阿里云控制台只是管理界面，您需要通过SSH工具连接到服务器后，在**服务器终端**中执行后续的更新系统、安装软件等操作。

#### 1.1 选择SSH工具
- **Windows 10/11**：使用自带的`Windows Terminal`或`PowerShell`
- **Windows 7/8**：下载并安装`PuTTY`工具
- **Mac/Linux**：使用自带的`Terminal`应用

#### 1.2 连接到服务器
打开您选择的SSH工具，输入以下命令连接服务器：
```bash
# Ubuntu系统（默认用户名）
ssh ubuntu@您的公网IP

# Ubuntu系统（使用root用户名，特殊情况）
ssh root@您的公网IP

# CentOS系统
ssh root@您的公网IP
```

**注意**：通常Ubuntu系统的默认用户名是`ubuntu`，但在某些特殊情况下（如使用自定义镜像或特定配置），默认用户名可能是`root`。请根据您创建实例时的配置选择正确的用户名。

**第一次连接时的安全提示**：
当您第一次连接到服务器时，会看到类似以下的安全提示：
```
The authenticity of host '8.148.199.180 (8.148.199.180)' can't be established.
ED25519 key fingerprint is SHA256:mq7Cc5Uk60oiV0ub2iQ49zDVB4/qRAKiQxQfJ4SN7Y4.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

这是SSH的安全机制，用于防止中间人攻击。当您第一次连接到一个新服务器时，SSH客户端会验证服务器的公钥指纹。

**处理方法**：
1. 确认这是您刚创建的阿里云服务器IP地址
2. 如果确认无误，在提示后输入 `yes` 并按回车键
3. 系统会将服务器的公钥指纹保存到您本地的 `~/.ssh/known_hosts` 文件中
4. 下次连接时不会再出现这个提示

**注意**：如果您以后连接同一IP地址时再次出现此提示，可能意味着服务器已更换或存在安全风险，应谨慎处理。

#### 1.3 处理连接断开问题
在使用SSH连接服务器时，您可能会遇到连接断开的情况，显示类似以下错误信息：
```
client_loop: send disconnect: Connection reset
```

**错误含义**：这表示您与服务器之间的网络连接被意外中断了。

**解决方法**：
1. **重新连接服务器**：在终端中重新输入SSH连接命令
   ```bash
   ssh root@您的公网IP
   ```
2. **检查网络连接**：确保您本地的网络连接正常
3. **检查服务器状态**：登录阿里云控制台，确认服务器实例状态为"运行中"

**常见原因**：
- 网络不稳定或临时中断
- 服务器进行了重启操作
- SSH超时设置导致连接自动断开

**预防措施**：
- 在执行长时间运行的命令时，可以使用`screen`或`tmux`工具保持会话
- 调整SSH客户端的超时设置，在本地`~/.ssh/config`文件中添加：
  ```
  ServerAliveInterval 60
  ServerAliveCountMax 3
  ```

### 2. 更新系统
```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

#### 2.1 处理服务重启选择界面
在Ubuntu系统执行更新后，可能会出现**服务重启选择界面**，标题为"Daemons using outdated libraries"，询问"Which services should be restarted?"。

**界面含义**：系统检测到一些服务正在使用已更新的库文件，需要重启这些服务以应用更新。

**处理方法**：
1. **保留默认选择**：系统已经自动选中了需要重启的服务（前面有[*]标记）
   - 从截图可以看到，只有`aegis.service`被选中，这是正常的
   - 您不需要修改任何选择，保持默认即可

2. **确认选择**：
   - 使用键盘上的**右方向键**（→）移动到界面底部的`<Ok>`选项
   - 按下**Enter键**确认选择
   - 系统会自动重启选中的服务

**详细键盘操作步骤**：
```
1. 看到界面后，不要惊慌，这是正常的系统更新流程
2. 检查服务列表，确认只有需要更新的服务被选中（前面有[*]标记）
3. 按一次或多次右方向键（→），直到<Ok>选项被高亮显示（背景颜色会变化）
4. 只有当<Ok>选项被高亮显示时，按下Enter键才会生效
5. 系统开始重启服务
6. 服务重启完成后，自动返回终端界面```

**为什么直接按Enter键可能无效？**

在这个界面中，焦点默认可能不在<Ok>按钮上。如果您在没有将焦点移动到<Ok>按钮的情况下直接按Enter键，系统可能不会响应，因为：

1. **界面焦点机制**：这个界面使用了类似文本界面的焦点系统，只有当前获得焦点的选项才会响应Enter键
2. **默认焦点位置**：默认情况下，焦点可能在服务列表或其他位置，而不是<Ok>按钮
3. **视觉反馈**：当焦点在<Ok>按钮上时，它会被高亮显示（背景颜色变化），这是您可以按Enter键的信号

**解决方法**：

1. 首先使用右方向键（→）移动焦点到<Ok>按钮
2. 等待<Ok>按钮被高亮显示（背景颜色变化）
3. 然后再按Enter键确认

**注意事项**：
- 不要使用空格键来选择<Ok>，这在文本界面中通常用于选择/取消选择选项
- 不要连续快速按Enter键，这可能导致界面无响应
- 如果界面没有变化，请尝试再次按右方向键确保焦点在<Ok>按钮上

**特别说明**：
- 列表中可能包含`ssh.service`（SSH服务），重启此服务通常不会导致当前SSH连接断开
- 系统会优雅地重启这些服务，确保服务的连续性
- 如果您不确定是否要重启某个服务，可以保留默认选择

**示例界面**：
```
Package configuration
┌─────────────────────────────────────────────────────────┐
│ Daemons using outdated libraries                       │
├─────────────────────────────────────────────────────────┤
│ Which services should be restarted?                    │
│ [*] aegis.service                                      │
│ [ ] dbus.service                                        │
│ [ ] ModemManager.service                               │
│ [*] multipath.service                                  │
│ [*] networkd-dispatcher.service                        │
│ [*] packagekit.service                                 │
│ [*] polkit.service                                     │
│ [*] rsyslog.service                                    │
│ [*] ssh.service                                        │
│ [*] systemd-logind.service                             │
│ [*] tuned.service                                      │
│ [*] udisks2.service                                    │
│ [*] unattended-upgrades.service                        │
│ [ ] user@0.service                                     │
│                                                        │
│                           <Ok>          <Cancel>       │
└─────────────────────────────────────────────────────────┘
```

**注意**：如果您在非交互式环境下执行更新（如使用screen/tmux），系统可能会自动处理服务重启，无需手动干预。

### 3. 安装Node.js
```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS
sudo yum install -y nodejs
```

验证安装：
```bash
node -v
npm -v
```

### 4. 安装MySQL
```bash
# Ubuntu
sudo apt install -y mysql-server

# CentOS
sudo yum install -y mysql-server
```

启动MySQL服务：
```bash
# Ubuntu
sudo systemctl start mysql
sudo systemctl enable mysql

# CentOS
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

设置MySQL密码：
```bash
# 运行安全脚本
sudo mysql_secure_installation
```

#### 4.1 MySQL安全配置详细步骤

运行`mysql_secure_installation`脚本后，会出现一系列安全配置问题。以下是每个问题的详细说明和推荐选择：

##### 1. 密码验证组件配置
```
VALIDATE PASSWORD COMPONENT can be used to test passwords
and improve security. It checks the strength of password
and allows the users to set only those passwords which are
secure enough. Would you like to setup VALIDATE PASSWORD component?
Press y|Y for Yes, any other key for No: 
```

**问题含义**：是否启用密码验证组件，该组件会检查密码强度并要求设置安全的密码。

**推荐选择**：
- 输入 `y` 或 `Y` 启用密码验证组件（推荐用于生产环境）
- 或直接按Enter键跳过（如果您想使用简单密码进行测试）

**操作说明**：
- 如果选择启用，后续会要求选择密码强度策略
- 如果选择跳过，可以设置任意复杂度的密码

##### 2. 密码强度策略选择
如果您在上一步选择了启用密码验证组件，会出现以下选项：
```
There are three levels of password validation policy:
LOW    Length >= 8
MEDIUM Length >= 8, numeric, mixed case, and special characters
STRONG Length >= 8, numeric, mixed case, special characters and dictionary file

Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG: 
```

**推荐选择**：
- 输入 `0`（LOW级别）：密码长度至少8位
- 或输入 `1`（MEDIUM级别）：密码长度至少8位，包含数字、大小写字母和特殊字符

**注意**：对于生产环境，建议使用MEDIUM或STRONG级别；对于测试环境，可以使用LOW级别。

##### 3. 设置MySQL root密码
```
Please set the password for root here.

New password: 
Re-enter new password: 
```

**操作说明**：
1. 输入您要设置的root密码（屏幕不会显示输入内容，这是正常的安全机制）
2. 再次输入相同的密码进行确认

**注意**：
- 如果启用了密码验证组件，密码必须符合所选的强度策略
- 请务必记住这个密码，后续配置数据库时需要使用

##### 4. 删除匿名用户
```
By default, a MySQL installation has an anonymous user,
allowing anyone to log into MySQL without having to have
user account created for them. This is intended only for
testing, and to make the installation go a bit smoother.
You should remove them before moving into a production
environment.

Remove anonymous users? (Press y|Y for Yes, any other key for No) : 
```

**推荐选择**：输入 `y` 或 `Y` 删除匿名用户

**原因**：匿名用户存在安全风险，可能被攻击者利用

##### 5. 禁用root远程登录
```
Normally, root should only be allowed to connect from
'localhost'. This ensures that someone cannot guess at
the root password from the network.

Disallow root login remotely? (Press y|Y for Yes, any other key for No) : 
```

**推荐选择**：输入 `y` 或 `Y` 禁用root远程登录

**原因**：限制root用户只能从本地登录可以提高安全性，防止网络攻击

##### 6. 删除测试数据库
```
By default, MySQL comes with a database named 'test' that
anyone can access. This is also intended only for testing,
and should be removed before moving into a production
environment.

Remove test database and access to it? (Press y|Y for Yes, any other key for No) : 
```

**推荐选择**：输入 `y` 或 `Y` 删除测试数据库

**原因**：测试数据库存在安全风险，可能被攻击者利用

##### 7. 刷新权限表
```
Reloading the privilege tables will ensure that all changes
made so far will take effect immediately.

Reload privilege tables now? (Press y|Y for Yes, any other key for No) : 
```

**推荐选择**：输入 `y` 或 `Y` 刷新权限表

**原因**：刷新权限表可以确保所有安全配置立即生效

#### 4.2 MySQL安全配置完成

完成所有配置后，系统会显示安全配置完成的消息。您现在可以使用设置的root密码登录MySQL：

```bash
mysql -u root -p
```

**注意**：后续配置项目数据库时，需要使用这个root密码。请务必妥善保管。

### 5. 安装Nginx（可选，用于反向代理和静态文件服务）

#### Nginx是否必须安装？
**不是必须的，但强烈推荐**，原因如下：

1. **默认后端配置**：当前后端代码(`server.js`)仅配置了`backend/public`目录作为静态文件服务路径，而前端文件实际位于`frontend`目录，默认无法直接访问
2. **性能优化**：Nginx比Express更适合处理静态文件请求，提供更好的性能和并发支持
3. **生产环境标准**：在生产环境中，通常使用Nginx作为前端静态文件服务器和后端API的反向代理
4. **简化部署**：使用Nginx可以避免修改后端代码，保持前后端分离

#### 部署方案选择

##### 方案一：使用Nginx（推荐）
适合生产环境，提供更好的性能和安全性

安装Nginx：
```bash
# Ubuntu
sudo apt install -y nginx

# CentOS
sudo yum install -y nginx
```

启动Nginx：
```bash
# Ubuntu/CentOS
sudo systemctl start nginx
sudo systemctl enable nginx
```

配置Nginx（后续文档会提供完整配置步骤）

##### 方案二：不使用Nginx（仅测试环境推荐）
适合快速测试，但不建议用于生产环境

需要修改后端代码，将前端文件作为静态资源提供：

1. 修改`backend/server.js`文件，添加前端静态文件服务配置
2. 调整路由，使根路径指向前端首页
3. 重启后端服务

（详细配置请参考"不使用Nginx的替代方案"部分）

## 三、项目部署

### 1. 上传项目文件
使用SCP或SFTP工具上传项目文件夹到服务器：

```bash
# 从本地上传到服务器### 1. 上传项目文件

**重要注意事项**：SCP命令需要在您的**本地计算机**上执行，而不是在服务器上执行！如果您已经登录到服务器，请先退出服务器连接。

#### 方式一：使用SCP命令（适用于Linux/Mac用户）
在本地终端执行：
```bash
scp -r /本地项目路径 shopping\ web root@您的公网IP:/home/
```

#### 方式二：Windows用户的SCP命令使用方法

**获取本地项目路径**：
1. 在Windows文件资源管理器中打开项目文件夹
2. 点击地址栏，复制完整路径（例如：`D:\trae\shopping web`）

**根据本地终端环境选择命令格式**：

##### 1. 使用Git Bash终端：
```bash
# 将 D:\trae\shopping web 转换为 /d/trae/shopping web
scp -r /d/trae/shopping\ web root@您的公网IP:/home/
```

##### 2. 使用Windows PowerShell：
```powershell
# 确保已安装OpenSSH客户端（设置-应用-可选功能-添加功能-OpenSSH客户端）
scp -r "D:\trae\shopping web" root@您的公网IP:/home/
```

**常见错误示例及解决方案**：
```bash
# 错误示例1：在服务器上执行SCP命令（错误）
root@server:~# scp -r /d/trae/shopping\ web root@8.148.199.180:/home/
# 错误原因：SCP命令应该在本地执行，服务器上没有/d/trae/路径

# 错误示例2：IP地址格式错误（错误）
scp -r "D:\trae\shopping web" root@8.148.199.180IP:/home/
# 错误原因：IP地址后面多了"IP"字符，正确格式是8.148.199.180

# 正确示例
scp -r "D:\trae\shopping web" root@8.148.199.180:/home/
```

#### 方式三：使用WinSCP工具（推荐给Windows用户）
如果SCP命令使用困难，推荐使用图形化工具：
1. 下载并安装WinSCP：https://winscp.net/eng/download.php
2. 登录信息：
   - 协议：SFTP
   - 主机名：您的公网IP（如：8.148.199.180）
   - 用户名：root
   - 密码：您的服务器密码
3. 连接后，将左侧本地项目文件夹拖拽到右侧服务器的`/home`目录即可

### 上传时间估算

#### 项目大小信息
通过检查，您的项目总大小约为 **70 MB**（包含8418个文件）。

#### 上传时间参考（基于阿里云服务器的典型网络环境）

| 本地网络上传速度 | 估算上传时间 |
|----------------|------------|
| 1 Mbps（较慢）  | 约10分钟   |
| 5 Mbps（普通）  | 约2分钟    |
| 10 Mbps（较好） | 约1分钟    |
| 50 Mbps（优秀） | 约12秒     |

#### 影响上传速度的因素
1. **本地网络上传速度**：这是最主要的影响因素
2. **服务器网络状况**：阿里云服务器通常有稳定的网络连接
3. **文件数量**：项目包含8418个文件，文件数量较多会增加建立连接的时间
4. **网络延迟**：如果您的网络与阿里云服务器的延迟较高，上传速度会受影响

#### 加速上传的建议

1. **压缩项目后上传**（推荐）：
   ```bash
   # 在本地压缩项目
   # Windows PowerShell
   Compress-Archive -Path "D:\trae\shopping web" -DestinationPath "D:\trae\shopping-web.zip"
   
   # 上传压缩包
   scp "D:\trae\shopping-web.zip" root@8.148.199.180:/home/
   
   # 在服务器上解压
   ssh root@8.148.199.180
   unzip /home/shopping-web.zip -d /home/
   ```

2. **使用Git克隆**（如果项目已上传到Git仓库）：
   ```bash
   # 在服务器上执行
   cd /home
   git clone 您的项目仓库地址
   ```

3. **排除不必要的文件**：
   - 如果有`node_modules`文件夹，建议在上传前删除，然后在服务器上重新安装依赖
   - 排除测试文件、日志文件等不必要的文件

4. **使用更稳定的网络**：
   - 尽量使用有线网络而不是无线网络
   - 避免在上传过程中使用网络密集型应用

### 验证上传是否成功

上传完成后，您可以登录服务器验证：

```bash
# 登录服务器
ssh root@8.148.199.180

# 检查项目是否存在
ls -la /home/

# 查看项目内容
ls -la /home/shopping\ web

# 查看项目总大小
du -sh /home/shopping\ web
```

#### 上传成功的判断标准
如果您看到类似以下输出，说明上传成功：
```bash
# 检查项目是否存在
root@server:~# ls -la /home/
total 12
drwxr-xr-x  3 root root 4096 Dec 29 14:57 .
drwxr-xr-x 19 root root 4096 Dec 29 14:18 ..
drwx--rwx  5 root root 4096 Dec 29 15:03 'shopping web'
```

#### 验证项目内容完整性
为确保所有重要文件都已上传，您可以检查以下关键目录和文件是否存在：

```bash
# 检查前后端目录是否存在
ls -la /home/shopping\ web/backend
ls -la /home/shopping\ web/frontend

# 检查重要配置文件
ls -la /home/shopping\ web/backend/package.json
ls -la /home/shopping\ web/backend/.env.example
ls -la /home/shopping\ web/frontend/index.html
```

#### 上传成功后的下一步操作
如果上传成功，您可以继续执行部署指南中的后续步骤：
1. 安装项目依赖
2. 配置环境变量
3. 配置数据库
4. 启动后端服务
5. 配置Nginx（可选但推荐）

#### 方式三：使用Git克隆项目（如果项目已上传到Git仓库）
```bash
cd /home
git clone 您的项目仓库地址
```

### 2. 安装依赖
```bash
cd /home/shopping\ web
npm install

cd backend
npm install
```

### 3. 配置环境变量
复制并修改环境变量文件：

```bash
cd /home/shopping\ web/backend
cp .env.example .env
nano .env
```

修改以下配置：
```
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=您的MySQL密码
DB_NAME=shopping_db

# JWT配置
# JWT密钥用于签名和验证访问令牌，必须使用强密钥确保安全
# 生成方式：
# 1. 在Linux/Mac终端：openssl rand -base64 32
# 2. 在Windows PowerShell：[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
# 3. 在线生成：使用密码生成工具创建至少32个字符的随机字符串
JWT_SECRET=your_jwt_secret_key  # 替换为您生成的强密钥

 

# 服务器配置
PORT=3000
```

### 4. 配置数据库
登录MySQL并创建数据库：

```bash
mysql -u root -p
```

在MySQL命令行中执行：
```sql
CREATE DATABASE shopping_db;
-- MySQL 8.0+版本使用此语法
GRANT ALL PRIVILEGES ON shopping_db.* TO 'root'@'localhost' WITH GRANT OPTION;
-- MySQL 5.7及以下版本使用此语法（已过时）
-- GRANT ALL PRIVILEGES ON shopping_db.* TO 'root'@'localhost' IDENTIFIED BY '您的MySQL密码';
FLUSH PRIVILEGES;
EXIT;
```

### 5. 启动后端服务

#### 方式一：直接启动（适用于测试）
```bash
cd /home/shopping\ web/backend
node server.js
```

## 七、常见问题与故障排除

### 1. 数据库连接失败：Access denied for user 'root'@'localhost'

#### 错误原因：
- MySQL root用户密码与.env文件中配置的密码不匹配
- 数据库用户权限配置不正确
- 数据库不存在

#### 解决方案：

1. **验证密码匹配**：
   ```bash
   # 检查.env文件中的密码配置
   cat /home/shopping\ web/backend/.env | grep DB_PASSWORD
   ```

2. **重置MySQL root密码**（如果忘记密码）：
   ```bash
   # 停止MySQL服务
sudo systemctl stop mysql

# 以跳过权限检查的方式启动MySQL
sudo mysqld_safe --skip-grant-tables &

# 登录MySQL
mysql -u root

# 在MySQL命令行中重置密码
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
EXIT;

# 重启MySQL服务
sudo systemctl start mysql
   ```

3. **重新配置数据库权限**：
   ```bash
   mysql -u root -p
   ```
   在MySQL命令行中执行：
   ```sql
   CREATE DATABASE IF NOT EXISTS shopping_db;
   GRANT ALL PRIVILEGES ON shopping_db.* TO 'root'@'localhost' WITH GRANT OPTION;
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **使用修复脚本**：
   项目提供了自动化修复脚本：
   ```bash
   cd /home/shopping\ web/backend
   node ../fix_db_connection.js
   ```

### 2. 数据库表同步失败

#### 错误原因：
- 数据库连接失败
- 表结构变更导致的冲突
- 权限不足

#### 解决方案：
1. 确保数据库连接正常
2. 检查并修复数据库权限
3. 如果需要重新创建表结构，可以使用：
   ```javascript
   // 在server.js中临时修改
   sequelize.sync({ force: true }) // 注意：这会删除所有现有数据！
   ```
   修改后重启服务器，然后改回`force: false`

#### 方式二：使用PM2（推荐用于生产环境）
安装PM2：
```bash
npm install -g pm2
```

启动服务：
```bash
cd /home/shopping\ web/backend
npm start
```

或者使用PM2直接启动：
```bash
cd /home/shopping\ web/backend
npm install pm2 -D
npm run dev
```

### 6. 部署前端静态文件

#### 方式一：直接访问后端静态文件（简单但不推荐）
后端已经配置了静态文件服务，您可以通过 http://您的公网IP:3000 访问前端页面。

#### 方式二：使用Nginx部署前端（推荐）
创建Nginx配置文件：

```bash
sudo nano /etc/nginx/conf.d/shopping-web.conf
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name 您的域名或公网IP;

    # 前端静态文件
    location / {
        root /home/shopping\ web/frontend;
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 虚拟邮件服务
    location /email {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

检查并重启Nginx：
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 四、域名配置（可选）

1. 在阿里云购买域名
2. 进入域名控制台 > 解析设置
3. 添加A记录，将域名指向您的服务器公网IP
4. 等待DNS解析生效（通常1-10分钟）

## 五、安全配置

### 1. 配置防火墙

```bash
# Ubuntu
 sudo ufw allow 22
 sudo ufw allow 80
 sudo ufw allow 443
 sudo ufw allow 3000
 sudo ufw enable

# CentOS
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### 2. 安装SSL证书（可选）
使用Let's Encrypt免费SSL证书：

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d 您的域名
```

## 六、测试访问

1. 前端：http://您的公网IP 或 http://您的域名
2. 后端API：http://您的公网IP:3000/api 或 http://您的域名/api
3. 虚拟邮件：http://您的公网IP/email.html 或 http://您的域名/email.html

## 七、常见问题及解决方案

### 7. 常见问题及解决方案

### 1. SSH登录密码错误

**症状**：
```
Warning: Permanently added '8.148.199.180' (ED25519) to the list of known hosts.
ubuntu@8.148.199.180's password:
Permission denied, please try again.
```

**可能的原因及解决方案**：

1. **密码输入错误**
   - 确保输入的密码是创建实例时设置的登录密码
   - 注意密码的大小写和特殊字符
   - 密码输入时屏幕不会显示任何字符，这是正常的安全机制

2. **用户名错误**
   - 通常Ubuntu系统默认用户名是 `ubuntu`
   - 但在某些特殊情况下（如使用自定义镜像或特定配置），Ubuntu系统的默认用户名可能是 `root`
   - CentOS系统默认用户名是 `root`
   - Alibaba Cloud Linux系统默认用户名是 `root`
   - 确保使用了创建实例时配置的正确用户名登录

3. **密钥对配置问题**
   - 如果创建实例时选择了密钥对登录，但现在尝试使用密码登录，会失败
   - 解决方案：
     - 方案一：使用密钥对登录（推荐）
       ```bash
       # Windows使用PowerShell
       ssh -i "C:\path\to\your\key.pem" ubuntu@8.148.199.180
       
       # Linux/macOS
       ssh -i /path/to/your/key.pem ubuntu@8.148.199.180
       ```
     - 方案二：在阿里云控制台重置密码
       1. 登录阿里云ECS控制台
       2. 找到对应的实例
       3. 点击"更多" > "密码/密钥" > "重置实例密码"
       4. 按照提示设置新密码
       5. 重启实例后生效

4. **安全组限制**
   - 检查安全组是否开放了22端口（SSH）
   - 解决方案：
     1. 登录阿里云ECS控制台
     2. 找到对应的实例
     3. 点击实例ID进入实例详情页
     4. 点击"安全组" > "配置规则"
     5. 确保入方向有22端口的允许规则

5. **服务器未正常启动**
   - 检查实例状态是否为"运行中"
   - 解决方案：如果实例状态异常，尝试重启实例

### 2. 数据库连接失败
- 检查MySQL服务是否运行
- 检查.env文件中的数据库配置是否正确
- 检查数据库用户权限

### 3. 端口无法访问
- 检查阿里云安全组是否开放了对应的端口
- 检查服务器防火墙是否允许该端口

### 4. 前端页面无法加载
- 检查Nginx配置是否正确
- 检查前端文件路径是否正确

### 5. 502 Bad Gateway错误
- 检查后端服务是否正在运行
- 检查Nginx配置中的proxy_pass是否指向正确的端口

## 八、维护建议

1. 定期备份数据库
2. 定期更新系统和依赖
3. 监控服务器资源使用情况
4. 配置日志记录和分析

如需进一步帮助，请参考阿里云官方文档或联系阿里云技术支持。