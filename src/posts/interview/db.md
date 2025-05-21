---
date: 2025-03-01
category:
  - 面经
tag:
  - 数据库
footer: 凉了的馒头
---

# 数据库

## 数据库的空洞和跳号

> 空洞问题：
>
> 1. mysql DELETE 时是懒删除，并不是真正地删除，所以表空间并不会实际地减小，如果未来没有数据插入，则这块空间将一直不会被利用
> 2. UPDATE 的新空间比旧空间大，如果发生了迁移，则原先的旧空间成为了空洞
> 3. 索引分裂也会导致空洞，B+ 树特性

解决方法： `OPTIMIZE TABLE` 可以重新建立表，解决空洞问题，但该操作会**锁表**

> 跳号问题：自增 id 出现非连续的情况
>
> 1. 删除再添加
> 2. 数据库宕机重启
> 3. 手动插入 id，后续从这开始

解决方法：一般业务不用解决，必要时手动编号

## 数据库的分页

1. 使用 `LIMIT M OFFSET N`
   - 适用于数据较小的场景，因为数据库仍要扫描前面的 M 条数据
2. `SELECT * FROM users WHERE id > 上一页最后一条的ID ORDER BY id LIMIT 10;` 利用索引加速
   - 缺点是必须记录上一次查询的最大 id
   - 不能跳页
3. `SELECT * FROM table WHERE id > (SELECT id FROM table ORDER BY id LIMIT m, 1) LIMIT n;`

## 聚簇索引，非聚簇索引，覆盖索引

> **聚簇索引**决定表中数据的物理存储顺序。在聚簇索引中，数据按照索引键的顺序存储在磁盘。因此一张表只能有一个聚簇索引。事实上，有的引擎甚至不支持聚簇索引。在 Innodb 中，主键默认就是聚簇索引。
> 与之相反的是**非聚簇索引**，对于已经存在聚簇索引的表，其叶节点存储的是主键的值，而对于不存在的，其叶节点存储的是数据行地址(RID)

Why 有了聚簇索引，非聚簇索引就不能存储 RID 了?

- 因为随着更新，数据页分裂，数据行的位置会变，则所有相应索引都必须更新，代价太高
- 而相应的，主键并不会变。主键被聚簇索引正确地维护。

可以看到，如果表中存在聚簇索引，那么如果查询非聚簇索引，则拿到主键的值还要再次**回表**查询。

但并不是查询非聚簇索引就一定会回表，因为**覆盖索引**的存在

> **覆盖索引**指的是一个索引包含了查询所需的所有列。因此不需要回表了。

## 最左匹配

> 最左匹配原则是 B+树索引在多列联合索引中的匹配规则，数据库查询时会优先使用索引的最左前缀列，如果查询条件不包含最左列，索引可能会失效。

```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    department VARCHAR(50),
    age INT,
    salary INT
);

CREATE INDEX idx_emp ON employees(department, age, salary);
```

几个场景：

```sql
-- 生效
SELECT * FROM employees WHERE department = 'IT' AND age = 30;

-- 跳过最左列，失效
SELECT * FROM employees WHERE age = 30;

-- department 生效 salary 失效
SELECT * FROM employees WHERE department = 'IT' AND salary > 5000;

-- LIKE
SELECT * FROM employees WHERE department LIKE 'I%'; -- ✅ 使用索引
SELECT * FROM employees WHERE department LIKE '%IT%'; -- ❌ 不能用索引

```

## B+Tree 作为索引的优势

1. B Tree
   - B Tree 非叶子节点也存饭数据，因此 B+ Tree 的非叶子节点能放更多的 key
   - 范围查询更强，B Tree 要回上层
2. Hash
   - 适合等值查询
   - 不适合范围查询

## 索引失效的情况

1. 左模糊匹配 `LIKE '%xx'`
2. 对索引使用函数 `SELECT * FROM xx WHERE length(name) = 6;`
3. 对索引进行计算 `SELECT * FROM xx WHERE id + 1 = 9;`
4. OR 句可能导致索引失效

## Mysql 的各种 Log

### RedoLog

1. 是 Innodb 引擎生成的日志，实现了事务的**持久性**。增删改的数据先改 buffer pool，然后将该操作记录在 RedoLog 里。
2. RedoLog 也是先写到 `redolog buffer` 里，再按一个策略写入文件。

- `redolog buffer` 是一个环形结构，会被定时的刷盘，也有一个水位线，高于水位线也会刷盘

3. RedoLog 是追加写，更快。

### BinLog

1. 是 Server 层的日志，用于**数据备份，主从复制**
2. Binlog 文件是记录了所有数据库表结构变更和表数据修改的日志，不会记录查询类的操作
3. 事务执行时将操作写入 `binlog cache`，提交后写入文件

binlog 的三种格式

1. STATEMENT 直接记录原语句
   - 体积小
   - 非幂等性：`RAND()` `NOW()`
   - 某些 sql 可能导致数据不同步 `UPDATE employees SET salary = salary * 1.1 LIMIT 10;` 可能在主从库更新十个不同的行
2. ROW 记录的是行数据的更改
   - 体积大
3. MIXED
   - 正常都是 STATEMENT，当可能出问题时 ROW

### RedoLog 和 BinLog 的配合

两个 Log 产生于 Mysql 的不同部分，就可能出现一致性的问题。比如：RedoLog 在事务执行过程中就可能被写入，而 BinLog 只有事务被提交后才会被写入。如果事务提交后而 BinLog 没被写入的时候发生异常，那么两个日志就可能出现不一致。不一致会导致主库与从库数据不一致。因此 Innodb 选择将 RedoLog 的写入变成两阶段提交：

- prepare 阶段
- commit 阶段，binlog 被写入后 redolog 确认被提交

### UndoLog

1. 是 Innodb 引擎生成的日志，实现了事务的**原子性**，用于**事件回滚，MVCC**
2. buffer pool 中有 undo 页，undolog 被写入 undo 页后会和数据页一样被 RedoLog 记录，保证了持久化。

需要注意的是，写入文件并不代表写入磁盘，也有可能是写入 Page Cache。同时，不当的日志写入磁盘的策略会对**磁盘 IO**有影响。

## Mysql 主从复制的方式

1. 基于 Binlog 的异步复制

- Master 的事务提交不需要 Slave 的确认
  ![](./Ref/11.png)

2. 半同步复制

- 需要一个 Slave 的确认，Master 才提交事务

3. 组复制

- 基于共识协议，至少一半以上的节点同步才提交事务

## 事务隔离级别

1. Read Uncommitted
   - 脏读：读到别的事务正在修改的数据
2. Read Committed
   - 不可重复读：多次读取同一行数据不一致，因为读到别的事务提交后的数据
3. Repeatable Read
   - 幻读：比如 `SELECT *` 结果不一样，因为别的事务插入了新的数据
4. Serializable

### MVCC

对每一行数据维护多个版本，当一个事务修改数据时，MVCC 会为其创建一个数据快照而不是实际修改该行。进行快照读的时候不需要获取锁。
Innodb 为每一个行数据额外维护两个变量：`DB_TRX_ID` 最近一次修改该行的事务 id，`DB_ROLL_PTR` 回滚指针，指向 undo log 中上一个版本

## 一些杂问

### B+ 树把 16kb 页写入磁盘是原子性的吗，会存在一部分写成功，一部分没写成功的情况吗

- 会存在，考虑硬件的层面，磁盘无法保证原子的写入
- 但可以通过日志进行发现，日志一般会有 checksum 等机制来判断日志是否损坏

## 分库分表

成熟的分库分表中间件 [ShardingSphere](https://shardingsphere.apache.org/document/current/cn/overview/)

垂直分库：将一个库中的不同表分散到不同的节点
垂直分表：按照表特征分表

垂直分片无法解决单点瓶颈

水平分表：将表中的行按 rule 分配到不同节点的表中

分片带来的挑战：

1. 数据去哪找（路由）
2. 分页，排序，聚合等操作需要更复杂的逻辑
3. 跨库事务：合理的分表可以尽量使用本地事务

分片规则 = 分片键 + 分片算法，比如对主键进行取模
