---
date: 2025-03-07
category:
  - 面经
tag:
  - Redis
footer: 凉了的馒头
---

# Redis

## Redis 为什么快？

1. 内存
2. 单线程 + IO 多路复用，避免线程切换开销和同步开销，同时 epoll/kqueue 等多路复用技术让单个线程能高效处理多个请求
3. 高效的数据结构
   - String: SDS
   - Hash
   - List: 基于双向链表或者压缩链表，适用于队列场景
   - Set
   - Sorted Set: 基于跳表
   - Bitmap, HyperLogLog 等针对特定场景进行优化
4. 尽管有持久化操作，但磁盘 IO 并不多
5. pipeline 技术减少网络开销，允许一次发多个请求
6. Redis 集群，复制+分片 可以增加读写负载

## Redis 为什么单线程

Redis 的单线程指的是处理指令的主线程是单线程。实际上，Redis 还有一些后台线程负责刷盘，释放内存等操作。在 6.0 版本之后，也采用多个线程来处理网络 IO

> 官方回复：CPU 通常不是瓶颈，更多情况下是受到内存大小和网络 I/O 的限制，所以 Redis 核心网络模型使用单线程并没有什么问题，如果想要使用服务的多核 CPU，可以在一台服务器上启动多个节点或者采用分片集群的方式。
> 补充；同时避免了**线程切换开销和同步开销**

## Bitmap 使用及场景

理解为一个二进制数组，适用于 用户签到 以及 用户活跃状态等场

```shell
SETBIT user:active:20250307 0 1  # 设置第0个用户活跃
SETBIT user:active:20250307 1 0  # 设置第1个用户不活跃
SETBIT user:active:20250307 2 1  # 设置第2个用户活跃

GETBIT user:active:20250307 0
# 返回 1，表示用户活跃

GETBIT user:active:20250307 1
# 返回 0，表示用户不活跃

BITCOUNT user:active:20250307
# 统计活跃总人数
```

## AOF 持久化

如何开启：

```text
// redis.conf
appendonly yes
appendfilename "appendonly.aof"
```

Redis 先执行命令，随后写 AOF 日志。好处是，不用进行额外的命令检查，并且写 AOF 不会阻塞当前命令。（但是可能会阻塞下一条命令）

### 写回策略

Redis 写 AOF 流程：写操作->命令追加到 `server.aof_buf` 缓冲区->`write`系统调用->写入内核缓冲区`page cache`->内核写磁盘

> `fsync()`: fsync 是 文件系统同步（File Synchronization）的缩写，它是一个 系统调用，用于强制将数据从内存缓冲区（Buffer Cache）同步到磁盘，保证数据真正落盘，防止系统宕机或断电导致数据丢失。

写回策略控制内核什么时候写入磁盘，即调用`fsync()`函数。总共三种模式：

1. Always：每次写入都写磁盘，显然性能差
2. EverySec：每秒调用一次，如果宕机最多丢失一秒的数据
3. No：从不，让操作系统自行选择时机写回，性能最好但可能丢更多数据
   显然这是一个性能和可靠性的 tradeoff

### AOF 重写机制

当 AOF 文件过大，进行重写。比如 `set name ty set name tyz` 两条命令将被合成。
重写是由**子进程**完成的，利用了 `fork()` 的 **copy on write**。重写过程中，修改的数据如果应用到新 AOF 文件呢？Redis 会启用一个新的 AOF 重写缓冲区，重写过程中的所有命令不仅会被写到 AOF 缓冲区，还会被额外写入重写缓冲区。这样，当 AOF 重写完旧日志后再应用重写缓冲区的内容即可。随后，应用新的 AOF 文件。

AOF 恢复数据并不快，我们还需要借助 RGB。

## RDB 快照

SAVE 命令在主进程执行快照 ❎
BGSAVE 命令创建一个子进程负责快照 ✅

```text
// redis.conf
# 尽管配置里是 save，实际执行的是 bgsave
save 900 1     # 900秒内，至少有1次数据修改，就生成快照
save 300 10    # 300秒内，至少有10次数据修改，就生成快照
save 60 10000  # 60秒内，至少有10000次数据修改，就生成快照

dbfilename dump.rdb
dir /var/lib/redis
```

仍然利用 `fork()` 的 **copy on write**，可以注意到快照期间的修改是不会被记录到 RDB 快照里的。

### RDB 和 AOF 混合持久化

在 AOF 文件中嵌入 RDB 二进制。当开启后，fork 出来的进程会先将 RGB 写入 AOF，随后将 AOF 重写缓冲区的方式增量写入 AOF。

```text
// redis.conf
aof-use-rdb-preamble yes # 开启混合持久化
```

## 大 key

> - 字符串类型：单个 key 的值长度超过 10 KB
> - 集合、列表等集合类型：元素数量超过 5000

### 风险：

- 用 DEL 删除大 key 会阻塞主进程，用 UNLINK 异步删除
- GET 的时候导致内存增大，网络传输超时（网络阻塞）
- 操作可能会阻塞 Redis，比如取集合所有元素

### 如何排查大 key

```shell
redis-cli -h <host> -p <port> --bigkeys
```

## Redis 实现
