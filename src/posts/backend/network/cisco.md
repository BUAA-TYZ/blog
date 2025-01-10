---
icon: laptop-code
date: 2025-01-04
category:
  - 计算机网络
tag:
  - Packet Tracer 仿真
footer: 凉了的馒头
---


# Cisco 实践

内容取自**湖南科技大学计网慕课**

### 实验一 认识 Packet Tracer


#### 1.2 packet tracer 简单使用


##### 1.2.2 构建网络拓扑

利用设备若干搭建拓扑

![](/assets/posts/cisco-Refs/1.png)

##### 1.2.3 进行网络测试

- `ping`
- `tracert`

##### 1.2.5 查看相关网络设备信息

- `arp -a` 查看 PC0 的 arp 缓存表
- 点击 查看按钮 再次点击 switch0 查看相关信息 或者 `show mac-address-table`
- `show ip route`

```
Router#show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2, E - EGP
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       * - candidate default, U - per-user static route, o - ODR
       P - periodic downloaded static route

Gateway of last resort is not set

     10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       10.0.0.0/30 is directly connected, Serial1/0
L       10.0.0.1/32 is directly connected, Serial1/0
     192.168.0.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.0.0/24 is directly connected, FastEthernet0/0
L       192.168.0.254/32 is directly connected, FastEthernet0/0
S    192.168.1.0/24 [1/0] via 10.0.0.2
```

- L 表示了路由器的两个端口的 ip

##### 1.2.6 单步模拟和协议过滤

可以很好地看到每个包在每个协议层的解析过程

#### 1.3 IOS 命令行模式

![](/assets/posts/cisco-Refs/2.png)

- 输入 ？可显示相关模式下的所有命令
- tab 可以自动补全
- 简写命令 `en` `conf t`
- no + 命令可以取消原先的命令



### 实验二 物理层相关实验

- 同种类型的网络设备互联使用交叉双绞线
- 不同网络设备互联使用直连双绞线



### 实验三 数据链路层相关实验



#### 3.1 点对点协议 PPP

- `enca... ppp` 配置串口 Serial1/0 使用 ppp 协议
- `show interfaces Serial1/0` 确认
- ppp 协议只要配置即可互联
  - 配置带有 CHAP 认证的 ppp
  - `hostname Router0` 全局配置路由器名称随后进入端口配置
  - `ppp authentication chap`
  - `username Router1 password 123456` 记录对方的名称和密码



#### 3.2 使用集线器构建共享式网络拓扑

 ![](/assets/posts/cisco-Refs/3.png)

- 监视 ICMP 协议
- PC0 向 PC1 发送数据

![](/assets/posts/cisco-Refs/4.png)

- 由于集线器只工作在物理层，其会对所有到来的数据进行广播（不论是单播还是广播）
- PC2 收到后知道该数据不是给自己的是，于是丢弃
- 当 PC1 发送响应数据时，数据仍会到达 PC2 一次
- **碰撞**
  - 让 PC1 和 PC2 同时向 PC0 发送一个PDU
  ![](/assets/posts/cisco-Refs/5.png)
  - 发生碰撞，集线器广播该数据，所有主机都会丢弃之

#### 3.3 使用交换机构建交换式以太网

- 交换机可以**自学习**地进行单播
- 交换机不会发生碰撞，可以看到其依次发送以太网帧
- 其工作在数据链路层，能够根据 MAC 地址**查表转发**



#### 3.4 交换机自学习和转发帧的过程

- 来回 ping 几次后交换机自学习到了 每个端口连接的 MAC 地址
- 可以看到一个 Port 可以对应多个 MAC 地址

```
Switch#show mac-address-table 
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----

   1    0001.438d.b5d2    DYNAMIC     Fa0/2
   1    0002.1676.9b6d    DYNAMIC     Fa0/1
   1    0060.2fb0.5782    DYNAMIC     Fa0/3
   1    0060.5c8e.817d    DYNAMIC     Fa0/3
```

- 清空后，观察交换机自学习的过程
  ![](/assets/posts/cisco-Refs/6.png)
  - 可以看到当交换机转发表中没有 PC2 的 MAC 地址时，其会进行广播，随后其收到 PC2 的响应后就将其记录到转发表中

 

#### 3.5 以太网扩展

- 实验目的
  - 掌握集线器在物理层扩展以太网的方法
  - 掌握交换机在数据链路层扩展以太网的方法
  - 验证集线器不隔离**碰撞域** 和 **广播域**
  - 交换机隔离**碰撞域** 不隔离**广播域**
![](/assets/posts/cisco-Refs/7.png)
- 当无 Hub1 时，左右两侧各是独立的**碰撞域** 和 **广播域**；有了 Hub1 则组合成了更大的**碰撞域** 和 **广播域**
  - 当 PC1 和 PC2 同时向 PC0发送请求时，碰撞产生的结果会传遍整个网络
  - 当 PC0 广播时，发生灾难，因为在响应的时候全部发生碰撞
- 将 Hub1 换成 交换机
  - 碰撞后被隔离（碰撞产生的帧会被交换机丢弃），也就是说交换机隔离了两个域
  - 广播域仍然没有隔离，形成了更大的广播域



#### 3.6 交换机生成树协议 STP

- 实验目的
  - 验证冗余链路与 STP 配合可以**提高以太网可靠性**，**消除网络环路**
  - 验证**广播帧会在网络中永久兜圈并充斥整个网路**，浪费资源
![](/assets/posts/cisco-Refs/8.png)
- 可以看到检测到了冗余链路，Switch0 阻塞了自己的 Fa0/2 来保证没有环路
- 我们删除 Switch1 到 Switch2 间的线
  - 当交换机检测到网络拓扑发生变化时，会用 STP 重新生成一个连通整个网络不存在环路的生成树
  - Fa0/2 端口重新启动
- 禁用 STP
  - `no spanning-tree vlan 1`
  - 此时模拟广播，广播会永久循环，此时 ping 不通其余机器，因为网络资源都被浪费了



#### 3.7 划分虚拟局域网VLAN

![](/assets/posts/cisco-Refs/9.png)
- `show interfaces status`

![](/assets/posts/cisco-Refs/10.png)

- 创建 VLAN 可以划分广播域
  - `conf t`
  - `vlan 10` 创建VLAN号为10的 VLAN
  - `name VLAN10` 命令为 VLAN10
  - `end`
  - 同样创建 VLAN20
  - `show vlan brief`
- 划分VLAN
  - `conf t`
  - `interface range FastEthernet0/1-2` 批量模式
  - `switchport mode access`
  - `switchport access vlan 10`
  - 按此配置成图片样式即可
- 可以发现不同 VLAN 下的不能 ping 通
  - 因此划分成独立的广播域



### 实验四 网络层相关实验



#### 4.1 ARP 基本工作原理

- 实验目的
  - 掌握 ARP 工作原理
  - 验证 ARP 请求报文被封装在 **广播帧** 中被发送
  - 验证 ARP 响应报文被封装在 **单播帧** 中被发送
- 观察即可，因为不知道 MAC 所以只能广播
- 当 IP 匹配上后，响应报文进行单播



#### 4.2 ARP 不能夸网络使用

![](/assets/posts/cisco-Refs/11.png)

- PC0 ping PC1
  - 不是一个网络，走默认网关
  - 路由器收到后查表转发，但此时路由器不知道 PC1 的 MAC 地址（ARP 表没查到）
  - 于是将请求丢弃并进行 ARP
  - 获得地址后下一次 ping 就能 ping 通了
  - 所以 ping 的第一次会失败 
- 路由器 `show arp`



#### 4.3 IPv4地址分类编址

- 实验目的
  - 熟悉标题
  - 验证不同网络中的计算机不能直接通信

![](/assets/posts/cisco-Refs/12.png)



#### 4.4 IPv4 划分子网编址方法

- 实验目的
  - 熟悉标题
  - 验证不同网络间的计算机需通过**路由器**进行通信
![](/assets/posts/cisco-Refs/13.png)
- 将一个 C 类网均分，即占用第 25 位
- 每个子网第一个地址为网络地址，最后一个地址为广播地址，不能被使用
- 将路由器换成交换机则两边不能通信
  - 当 PC0 ping PC2 的 IP 时，如果发现不在一个子网且没有默认网关，就会将其丢弃
  - 可是换成交换机就没有默认网关
  - 证明成功



#### 4.5 IPv4 无分类编址方法

![](/assets/posts/cisco-Refs/14.png)

- 申请到的 CIDR 地址为 218.75.230.0/24
- 根据主机数量进行划分



#### 4.6 默认路由和特定主机路由的配置

![](/assets/posts/cisco-Refs/15.png)

- 特定路由 给 router0 配置  `ip route 192.168.16.197 255.255.255.255 192.168.16.194`
- 默认路由 给 router1 配置  `ip route 0.0.0.0 0.0.0.0 192.168.16.193`



#### 4.7 路由环路问题

- 实验目的
  - 理解 TTL 的作用
  - 验证静态路由配置错误可能导致路由环路
![](/assets/posts/cisco-Refs/16.png)
- 我们将 Router1 的静态路由故意配置错误，使 Router0 和 Router1 形成环路
- 模拟一个数据报的发送，观察包 发现 TTL 减少了



#### 4.8 验证路由器即隔离广播域也隔离碰撞域

- PASS，显然路由器不会将其进行传播



#### 4.9 验证路由信息协议 RIPv1

- 实验目的
  - 掌握 RIPv1 的特点
  - RIPv1 是基于距离向量的，它认为**好的路由是 RIP 距离最短的路由**
  - 验证其等价均衡负载

![](/assets/posts/cisco-Refs/17.png)

- 开启RIP
  - `conf t`
  - `router rip`
  - `network 192.168.0.0` 通知路由器自己的直连网络
  - ...

```
Router#show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2, E - EGP
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       * - candidate default, U - per-user static route, o - ODR
       P - periodic downloaded static route

Gateway of last resort is not set

     10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       10.0.0.0/8 is directly connected, GigabitEthernet0/1
L       10.0.0.1/32 is directly connected, GigabitEthernet0/1
R    20.0.0.0/8 [120/1] via 30.0.0.2, 00:00:02, Serial0/3/0
                [120/1] via 10.0.0.2, 00:00:26, GigabitEthernet0/1
     30.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       30.0.0.0/8 is directly connected, Serial0/3/0
L       30.0.0.1/32 is directly connected, Serial0/3/0
     192.168.0.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.0.0/24 is directly connected, GigabitEthernet0/0
L       192.168.0.254/32 is directly connected, GigabitEthernet0/0
R    192.168.1.0/24 [120/1] via 30.0.0.2, 00:00:02, Serial0/3/0
```

- [120/1] 中的 120 指的是 RIP，1 指的是 RIP 距离
- ping 的时候，其会走 Router0 到 Router1，尽管其是用一条低速的串行链路连接的，证明是**实验目的2**
- 用 Router1 ping Router0的 30.0.0.1，可证明**实验目的3**
- `debug ip rip`
  - 可以看到 RIP 路由表的动态更新

```
Router#debug ip rip
RIP protocol debugging is on
Router#RIP: received v1 update from 30.0.0.2 on Serial0/3/0
      20.0.0.0 in 1 hops
      192.168.1.0 in 1 hops
RIP: sending  v1 update to 255.255.255.255 via GigabitEthernet0/0 (192.168.0.254)
RIP: build update entries
      network 10.0.0.0 metric 1
      network 20.0.0.0 metric 2
      network 30.0.0.0 metric 1
      network 192.168.1.0 metric 2
RIP: sending  v1 update to 255.255.255.255 via GigabitEthernet0/1 (10.0.0.1)
RIP: build update entries
      network 30.0.0.0 metric 1
      network 192.168.0.0 metric 1
      network 192.168.1.0 metric 2
RIP: sending  v1 update to 255.255.255.255 via Serial0/3/0 (30.0.0.1)
RIP: build update entries
      network 10.0.0.0 metric 1
      network 192.168.0.0 metric 1
RIP: received v1 update from 10.0.0.2 on GigabitEthernet0/1
      20.0.0.0 in 1 hops
      192.168.1.0 in 2 hops
```



#### 4.10 RIPv2 与 RIPv1 的对比

- 实验目的
  - 验证 RIPv1 是有类路由，v2 是无类路由
  - v1 广播发送更新报文，v2 组播



#### 4.11 验证 开放最短路径优先OSPF协议

- 实验目的
  - 掌握其特点和配置
  - 验证其是基于**链路状态**的，它认为**好的路由是路径代价最少的路由**
  - 验证其是**等价负载均衡**

![](/assets/posts/cisco-Refs/18.png)

- 开启 OSPF
  - `router ospf 100` 开启 PID 100 的 OSPF
  - `network 192.168.16.0 0.0.0.127 area 0` 通知路由器直连网络，area 表示区域标识
  - ...

```
Router#show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2, E - EGP
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       * - candidate default, U - per-user static route, o - ODR
       P - periodic downloaded static route

Gateway of last resort is not set

     10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       10.0.0.0/30 is directly connected, GigabitEthernet0/1
L       10.0.0.1/32 is directly connected, GigabitEthernet0/1
     20.0.0.0/30 is subnetted, 1 subnets
O       20.0.0.0/30 [110/2] via 10.0.0.2, 00:00:27, GigabitEthernet0/1
     30.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       30.0.0.0/30 is directly connected, Serial0/3/0
L       30.0.0.1/32 is directly connected, Serial0/3/0
     192.168.16.0/24 is variably subnetted, 3 subnets, 3 masks
C       192.168.16.0/25 is directly connected, GigabitEthernet0/0
L       192.168.16.126/32 is directly connected, GigabitEthernet0/0
O       192.168.16.128/26 [110/3] via 10.0.0.2, 00:00:27, GigabitEthernet0/1
```

- Cisco 中，计算 OSPF 代价的方法是：100Mb/s 除以链路带宽

![](/assets/posts/cisco-Refs/19.png)

- 故可以看到上面的路由表中，其不会走串行线
- 在 Router2 中 ping 30.0.0.2 可验证负载均衡
- `debug ip ospf events` 



#### 4.12 验证 OSPF 可以划分区域



#### 4.13 验证边界网关协议 BGP



#### 4.14 ICMP 的应用

![](/assets/posts/cisco-Refs/20.png)

- 模拟一下 ping 和 tracert
- 可以看到 tracert 就是发 TTL 从 1 到某个值的 ICMP 报文，然后 TTL 过期就会收到响应报文，从而拿到 ip



#### 4.15 网络地址与端口号转换 NAPT

- 其是 NAT 的一种扩展，通过**端口号转换**来实现 NAT

![](/assets/posts/cisco-Refs/21.png)

- 首先我们给 Router0 配置一个默认路由
- ping 能发送到服务器，但会在 Router1 被丢弃（因为查不到发去哪）
- 开启 NAPT 
  - `inter Gig..0/0`
  - `ip nat inside`
  - `inter Seri.. ip nat outside` `exit`
  - `ip nat pool napt-pool 218.75.230.253 218.75.230.253 netmask 255.255.255.252` 指示公有地址池，显然只有一个公有 ip
  - `access-list 1 permit 192.168.0.0 0.0.0.255` 构建允许访问列表
  - `ip nat inside source list 1 pool napt-pool overload` 将其关联，overload 表示多对一
- `show ip nat translations`

```
Router#show ip nat translations 
Pro  Inside global     Inside local       Outside local      Outside global
icmp 218.75.230.253:10 192.168.0.2:10     218.75.230.1:10    218.75.230.1:10
icmp 218.75.230.253:3  192.168.0.2:3      218.75.230.1:3     218.75.230.1:3
icmp 218.75.230.253:4  192.168.0.2:4      218.75.230.1:4     218.75.230.1:4
icmp 218.75.230.253:5  192.168.0.2:5      218.75.230.1:5     218.75.230.1:5
icmp 218.75.230.253:6  192.168.0.2:6      218.75.230.1:6     218.75.230.1:6
icmp 218.75.230.253:7  192.168.0.2:7      218.75.230.1:7     218.75.230.1:7
icmp 218.75.230.253:8  192.168.0.2:8      218.75.230.1:8     218.75.230.1:8
icmp 218.75.230.253:9  192.168.0.2:9      218.75.230.1:9     218.75.230.1:9
```

- 第二列是ip和虚拟端口号（因为 ICMP 是网络层协议，非重点）
- 第二列是转换后的，第三列是转换前的

观察一下 http 协议

```
Router#show ip nat translations 
Pro  Inside global     Inside local       Outside local      Outside global
tcp 218.75.230.253:1025192.168.0.2:1025   218.75.230.1:80    218.75.230.1:80
tcp 218.75.230.253:1026192.168.0.2:1026   218.75.230.1:80    218.75.230.1:80
```

- 可以看到端口号的转换
- 事实上，当今的家庭路由器都是 NAPT 转换器，而并不运行路由选择协议
- 还可以发送一个 ICMP，在 NAPT 路由器上观察数据报（重点是 IP）



#### 4.16 从 IPv4 向 IPv6 过渡所使用的隧道技术

- 实验目的
  - 掌握在路由器上配置隧道的方法
  - 验证通过隧道两个IPv6可以通过IPv4通信
- `ipv6 address ...` `ipv6 enable` `ipv6 unicast-routing`

![](/assets/posts/cisco-Refs/22.png)



#### 4.17 VLAN 间单播通信的实现方法--"多臂路由"

![](/assets/posts/cisco-Refs/23.png)

- 划分 VLAN 后尽管隔离了广播域，但是不同的 VLAN 间不能通信
- 借助 **网络层设备** 实现不同 VLAN 间的通信
- 劣势：每增加一个 VLAN 就多占用一个交换机接口和一个路由器接口，多一条线，所以使用很少



#### 4.18 VLAN 间单播通信的实现方法--"单臂路由"

- 创建逻辑子接口
- `inter Gig..0/0.1`
- `encapsulation dolQ 10` 配置其可以接收和封装VLAN号为10的802.1Q帧
- `ip address..`
- 只需要交换机上的一个接口和路由器上的一个局域网接口连接



#### 4.19 VLAN 间单播通信的实现方法--三层交换机

- 路由功能由硬件提供，因此速度更快
- `interface vlan 10` 创建VLAN号为10的交换机虚拟接口
- `ip address ...` 给该接口配置
- `no shutdown` `..`
- `exit` `ip routing`



### 第五章 运输层相关实验

PASS



### 第六章 应用层相关实验



#### 6.1 熟悉动态主机配置协议 DHCP

![](/assets/posts/cisco-Refs/24.png)

- 我们没有静态配置 PC0 和 PC1 的网络信息
- 对 Server0 配置 DHCP 服务
- 随后我们观察 PC0 进行 DHCP 的过程
  - 首先是 DHCP 发现报文，srcIP 是 0.0.0.0 srcPort 67 destIP 是 255.255.255.255（广播）destPort 68
  - 被广播后，因为只有 Server 开启了 DHCP 服务，其在相对应的端口有服务，其接收到了 DHCP 发现报文
  - 回送一个 DHCP offer 报文，表示可以提供网络信息
  - 随后继续一个来回（此时尽管知道了 DHCP 服务器的 IP，但**仍然进行广播**，因为DHCP 发现报文可能被多个 DHCP 服务器接收，这次的广播可以通知未被选中的 DHCP 服务器将分配的 IP 分配给别的 PC）获得相关网络信息
- 现在笔记本/手机上无线网基本都是通过此协议获得 IP



#### 6.2 配置 DHCP 中继代理

- 路由器隔离广播，所以如果 PC2 和 PC3 也想使用 DHCP，要配置中继代理
- DHCP 中继代理可以转发跨网的 DHCP 请求和响应，因此可以避免每个物理网络中都有一个 DHCP 服务器，当中继代理收到 DHCP 发现报文后，就单独将其转发给 DHCP 服务器
  - `inter Gig..0/1` `ip helper-address 192.168.0.252` 指明 DHCP 服务器 IP



#### 6.3 熟悉 DNS 的递归查询

![](/assets/posts/cisco-Refs/25.png)

- 配置 DNS 服务

![](/assets/posts/cisco-Refs/26.png)

- NS 指示了所有查询都走 dns_root



#### 6.4 熟悉文件传送协议 FTP

- FTP 登陆后即可下载或上传文件
- 下载会单独临时创建一条 TCP 连接（与控制命令的 TCP 连接区分）
- 事实上，ftp 已经不被浏览器弃用（因为其是**明文传输**）
  - sftp/scp/rsync



#### 6.5 熟悉电子邮件相关协议



#### 6.6 熟悉 HTTP

PASS



### 第七章 网络安全相关实验



#### 7.1 配置访问控制列表 ACL

![](/assets/posts/cisco-Refs/27.png)

1. 拒绝部门A网络的计算机访问部门B的Web服务
   - `access-list 100 deny tcp 192.168.0.0 0.0.0.255 host 192.168.1.2 eq 80`
2. 拒绝 PC0 访问 FTP
   - `access-list 100 deny tcp host 192.168.0.1 host 192.168.1.2 eq 20`
   - `access-list 100 deny tcp host 192.168.0.1 host 192.168.1.2 eq 21`
3. 拒绝部门A的PC1与部门B的PC2通信
   - `access-list 100 deny ip host 192.168.0.2 host 192.168.1.1`
4. 拒绝部门A ping Router1
   - `access-list 100 deny icmp 192.168.0.0 0.0.0.255 host 10.0.0.2`
5. `access-list 100 permit ip any any`
6. `inter Gig0/1` `ip access-group 100 in`
7. `show access-lists`



#### 7.2 配置基于IPSec的虚拟专用网 VPN

- 实验目的
  - 掌握在路由器上配置 IPSec 并实现**VPN**的方法
  - 观察IP数据报经处理后成为IP安全数据报并被传送的过程

![](/assets/posts/cisco-Refs/28.png)

- PC0 无法与 PC1 通信，因为 Router1 中没有配置到达 部门A 和 B 的私有网络 entry。这与实际一致，因特网的路由器一般都是运营商配置，对目的地址为私有地址的IP数据报一律不转发
- Router0
  - `crypto isakmp enable`
  - `crypto isakmp policy 1`
  - `encryption 3des` 设置 isakmp 加密方式
  - `hash md5` 设置 isakmp 散列算法
  - `authentication pre-share` 设置 isakmp 采用的认证方式为预共享密钥
  - `exit` `crypto isakmp key 123456 address 192.2.2.1` 设置交换密钥和对方ip
  - `crypto ipsec transform-set myts ah-md5-hmac esp-3des` 创建 IPSec 转换集，myts是名称（可自定义），对方的转换集名称可以不同，但别的要对应。本命令创建的转换集为AH-...转换和使用3des的esp转换
  - `access-list 101 permit ip 192.168.0.0 0.0.0.255 192.168.1.0 0.0.0.255`
  - `crypto map mymap 10 ipsec-isakmp`
  - `set peer 192.2.2.1` 设置对方路由器
  - `set transform-set myts`
  - `match address 101` 指定控制访问列表
  - `inter Serial1/0` `crypto map mymap` 映射加密表



### 第八章 综合实验



#### 8.1 构建采用三层网络架构的小型园区网

![](/assets/posts/cisco-Refs/29.png)

-   在三层交换机上开启 DHCP
    - `ip dhcp excluded-address 192.168.10.254`
    - `... 20.254`
    - `inter vlan 10` `ip add...``ip routing` `exit`
    - `ip dhcp pool 10`
    - `network 192.168.10.0 255.255.255.0`
    - `default-router 192.168.10.254`
    - `dns-server 192.168.50.1`
    - `exit`
-   server 0 上配置 dns 服务
-   在三层交换机上配置 RIPv2 路由信息协议
    - `router rip` `version 2`
    - `no auto-summary` 关闭自动汇总
    - 通知直连网络
-   我们需要关闭某些接口的交换功能（将接口配置为三层接口）并赋予 IP 地址
    - `no switchport`
    - `ip add...`
-   给路由器安装 HWIC-2T 串行接口模块，为 Router0 配置 RIPv2 和 IP 和 NAT，ACL
-   三层交换机需要额外配置默认路由（起着默认网关的作用）
    -   `ip route 0.0.0.0 0.0.0.0 192.168.3.2`