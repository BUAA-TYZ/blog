---
# icon: laptop-code
date: 2025-02-25
category:
  - 数据库
tag:
  - Mysql
footer: 凉了的馒头
---

# Mysql 的各种 Log

## RedoLog

1. 是 Innodb 引擎生成的日志，实现了事务的**持久性**。增删改的数据先改 buffer pool，然后将该操作
记录在 RedoLog 里。
2. RedoLog 也是先写到 `redolog buffer` 里，再按一个策略写入文件。
  - `redolog buffer` 是一个环形结构，会被定时的刷盘，也有一个水位线，高于水位线也会刷盘
3. RedoLog 是追加写，更快。

## BinLog

1. 是 Server 层的日志，用于**数据备份，主从复制**
2. Binlog 文件是记录了所有数据库表结构变更和表数据修改的日志，不会记录查询类的操作
3. 事务执行时将操作写入 `binlog cache`，提交后写入文件

## RedoLog 和 BinLog 的配合

两个 Log 产生于 Mysql 的不同部分，就可能出现一致性的问题。比如：RedoLog 在事务执行过程中就可能被写入，而 BinLog 只有
事务被提交后才会被写入。如果事务提交后而 BinLog 没被写入的时候发生异常，那么两个日志就可能出现不一致。不一致会导致主库与从库
数据不一致。因此 Innodb 选择将 RedoLog 的写入变成两阶段提交：
- prepare阶段
- commit阶段，binlog 被写入后 redolog 确认被提交

## UndoLog

1. 是 Innodb 引擎生成的日志，实现了事务的**原子性**，用于**事件回滚，MVCC**
2. buffer pool 中有 undo 页，undolog 被写入 undo 页后会和数据页一样被 RedoLog 记录，保证了持久化。

需要注意的是，写入文件并不代表写入磁盘，也有可能是写入 Page Cache。同时，不当的日志写入磁盘的策略会对**磁盘IO**有影响。
