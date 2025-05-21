---
date: 2025-03-01
category:
  - 面经
# tag:
footer: 凉了的馒头
---

# 奇奇怪怪的场景题

## 第三方服务挂了怎么办？

1. 调用第三方 api 时增加**超时重试**逻辑
2. 增加熔断器，e.g. Hystrix。当第三方服务出错，对请求进行降级。
3. 用 MQ，将消息放在 MQ 中

> 熔断（Circuit Breaker）是一种防止系统雪崩的策略，它能在某个服务发生故障时，自动阻止请求，并在合适的时候尝试恢复。
> 熔断器有 3 种状态：
>
> 1. Closed（关闭）：正常状态，所有请求都可以访问目标服务。
> 2. Open（打开）：熔断触发，所有请求立即失败（返回降级数据），防止继续影响系统。
> 3. Half-Open（半开）：尝试恢复，允许部分请求通过，测试服务是否恢复。
>    当一定比例请求失败，会触发熔断。在一定时间后，熔断器进入 Half-Open 状态。
>    降级，可以返回一个错误提示，或者返回一个默认值等

## 接口鉴权怎么做？

接口鉴权，就是保证 api 只允许合法用户访问

1. JWT/OAuth2
2. 基于 API key（一般用于第三方 api）

> JWT，登陆后服务器返回一个 token，存在 localStorage 里，可防止 CSRF 攻击。

## 业务的中间件的技术选型

就是列举常见的中间件

1. 缓存（提高查询速度，降低数据库压力）：Redis
2. 消息队列（削峰，解耦，异步）：Kafka, RocketMQ
3. 服务发现与注册（分布式服务注册与调用）：Consul
4. 日志与监控：Prometheus, Grafana

## 如何保证接口的幂等性

> **接口的幂等性**是指无论调用多少次接口，结果都应该是相同的，不会产生额外的副作用。幂等性在支付、订单、库存、消息去重等业务场景中至关重要。

### 重复调用接口的原因

1. 用户操作：等待时不确定请求是否成功于是重复点击
2. 重试机制：在很多高可用设计中都有超时重试机制
3. 消息队列中的消息重复消费

### Solution

1. 使用 Token 机制
   - 客户端每次请求生成一个唯一的 id
   - 服务端将其存储到 Redis 并设置一个合理的过期时间
   - 适合避免重复支付
2. 数据库的 Unique
   - 比如用户注册，通过将用户的比如 id 声明成 Unique，利用 ACID 的 C
3. Redis 分布式锁
   - 比如：利用 set 的幂等性，将 id 存到 set 里

```go
lockKey := "order_12345_lock"
if !RedisSetNX(lockKey, 10) {
    return errors.New("Processing, please wait")
}
defer RedisDel(lockKey) // 释放锁
ProcessOrder()
```

### 防重

防重和幂等实际上是不同的概念，幂等是保证即使重复也能正确响应。

> PRG（Post/Redirect/Get）是一种防止**表单重复提交**的常见设计模式。
> 当用户提交表单时，浏览器发送 POST 请求，服务器处理完后，返回 302 Found 重定向到一个新的 GET 页面，浏览器重定向到新的 GET 页面。当用户刷新时会刷新到 GET 页面

实际上，如果在服务器处理完之前刷新，后台还是会收到重复的 POST 请求

## 线程交替打印 1-100

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	ch1 := make(chan struct{}) // 控制 goroutine 1
	ch2 := make(chan struct{}) // 控制 goroutine 2
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		for i := 1; i <= 100; i += 2 {
			<-ch1 // 等待主 goroutine 释放信号
			fmt.Println("线程 1:", i)
			ch2 <- struct{}{} // 释放信号给另一个 goroutine
		}
	}()

	go func() {
		defer wg.Done()
		for i := 2; i <= 100; i += 2 {
			<-ch2 // 等待线程 1 释放信号
			fmt.Println("线程 2:", i)
			if i != 100 {
				ch1 <- struct{}{} // 释放信号给线程 1
			}
		}
	}()

	// 启动第一个线程
	ch1 <- struct{}{}

	wg.Wait()
}
```
