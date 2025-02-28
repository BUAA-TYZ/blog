---
date: 2025-01-04
category:
  - 语言
tag:
  - Rust
footer: 凉了的馒头
---


# Rust

---

## Coding 经验

- `rustfmt.toml`: `tab_spaces=2`

- `dbg!` for quick debug

- TDD: 测试驱动开发



---

## Chapter8 crate与模块

### 8.1 crates

- 拉取 *Cargo.toml* 中指定版本的 crate 并递归地拉取 crate 的 crate
- 获得所有源代码后，cargo 会使用`--crate-type lib`编译所有 crate。这个选项告诉 **rustc** 不要寻找 `main()`，而是产生一个包含编译过代码的.rlib 文件
- 编译程序时使用`--crate-type bin`
- 对于每一个 rustc 命令，Cargo 都会传递--extern 选项，给出crate用到的每个库的名称
- Rust的编译器需要访问这些.rlib 文件并会将代码**静态链接**到最终的可执行文件中

### 8.2 模块

- crate 决定了项目间的代码共享，模块决定了项目内部的代码组织

#### 8.2.2 单独文件中的模块

- `mod spores`告诉编译器 spores 模块定义在一个单独的`spores.rs`里
  - spores.rs 只包含组成模块的 item。它并不需要任何说明来表明它是一个模块。

### 8.3 将程序变为库

- `src/lib.rs` 库crate

### 8.5 属性

```rust
#[allow(non_camel_case_types)]
pub struct git_revspec {
...
}
```

- `#[cfg]`条件编译

| #[cfg]选项             | 编译条件                                                     |
| ---------------------- | ------------------------------------------------------------ |
| test                   | cargo test/rustc --test                                      |
| unix                   | 为unix系统编译时（包括MacOS）                                |
| windows                |                                                              |
| target_arch = "x86_64" | x86-64 架构特定                                              |
| target_os = "macos"    |                                                              |
| not((A))               | A 不满足时。为了让一个函数有两种不同的实现，可以将其中一个标记 为 #[cfg(X)]，另一个表记为 #[cfg(not(X))] |

- `#[inline]`一个建议
  - `#[inline(always)]`
  - `#[inline(never)]`

### 8.6 测试与文档

- `cargo test math` 会运行名称中包含 math 的所有测试
- `#[should_panic]`

```rust
#[test]
#[allow(unconditional_panic, unused_must_use)]
#[should_panic(expected="divide by zero")]
fn test_divide_by_zero_error() {
	1 / 0;
}
```

- 用`#[test]`标记的函数会条件编译

#### 8.6.2 文档

- `cargo doc --no-deps --open`
  - `--no-deps` 只为当前crate生成文档
  - `--open` 立刻打开

- 文档从你的库中的 pub 特性生成，加上你为它们编写的任何文档注释。
- `///` 文档注释，其内容被当作markdown
- 搜索别名使其更容易被找到 `#[doc(alias="route")]`
- 当你在文档中包含代码块，rust 会自动将其看为测试
  - 四个空格缩进
  - 或者```

#### 8.6.3 文档测试

- 一个最小化测试可能包括一些细节，使用#屏蔽之





## Chapter11 trait与泛型

### 11.1 使用trait

- trait 代表一种能力
  - 比如 `std::fmt::Debug`可以使用`println!()`的`{:?}`进行打印
  - `dyn Write`被称为*trait*对象，有动态分发的开销

#### 11.1.1 trait对象

- 不允许`dyn Write`类型，其大小未知。可以`&mut dyn Write`
- 一个trait对象是一个胖指针，由指向值得指针加上一个指向该值类型的表的指针组成。
- 当需要时Rust会自动把普通引用转换为trait对象

```rust
use std::io::Write;

fn say_hello(out: &mut dyn Write) -> std::io::Result<()> {
    out.write_all(b"Hello world\n")?;
    out.flush()
}

use std::fs::File;
let mut local_file = File::create("hello.txt")?;
// &mut File -> &mut dyn Write
say_hello(&mut local_file)?;

let mut bytes = vec![];
say_hello(&mut bytes)?;
```

#### 11.1.2 泛型函数和类型参数

- Rust会为推导出类型的函数生成机器码。Rust从参数的类型推导出W，这个过程被称为*单态化*
- 如果你正在调用的泛型函数不能推导出参数类型则需要指明

```rust
fn say_hello<W: Write>(out: &mut W) -> std::io::Result<()> {
    out.write_all(b"Hello world\n")?;
    out.flush()
}

// ...
// Invoke say_hello::<File>
say_hello(&mut local_file)?;
// Invoke say_hello::<Vec<u8>>
say_hello(&mut bytes)?;

// Error
let v1 = (0..1000).collect();
// Ok
let v2 = (0..1000).collect::<Vec<_>>();
```

#### 11.1.3 选择哪一种

- 泛型优势：更快、更容易添加多个trait约束

```rust
trait Vegetable {
    ...
}

// Bad design
// 一个沙拉可能由多种蔬菜构成
struct Salad<V: Vegetable> {
	veggies: Vec<V>
}
// Good design
struct Salad {
    veggies: Vec<Box<dyn Vegetable>>
}
```

### 11.2 定义和实现trait

```rust
trait Visible {
    fn draw(&self, canvas: &mut Canvas);
    fn hit_test(&self, x: i32, y: i32) -> bool;
}

impl Visible for Broom {...}
```

#### 11.2.2 trait和其他人的类型

- 可以通过trait给类型添加方法，这称为扩展*trait*

```rust
use std::io::{self, Write};

trait WriteHtml {
    fn write_html(&mut self, html: &HtmlDocument) -> io::Result<()>;
}

impl <W: Write> WriteHtml for W {
    fn write_html...
}
```

- 对所有实现Write的类型W，实现这个Trait

#### 11.2.3 trait中的Self

- 这里使用Self作为返回类型意味着`x.clone()`的返回类型和`x`类型相同。如果`x`是一个`String`，那么返回一个`String`而不是`dyn Clone`等等别的类型

- 一个使用Self类型的trait和trait对象并不兼容

```rust
pub trait Clone {
    fn clone(&self) -> Self:
    ...
}

pub trait Spliceable {
    fn splice(&self, other: &Self) -> Self;
}

// Wrong, 编译器无法确定left和right是同一类型
fn splice_anything(left: &dyn Spliceable, right: &dyn Spliceable) {
    let combo = left.splice(right);
}
```

#### 11.2.4 子trait

- 事实上子trait只是缩写，下面两者等价

```rust
trait Creature: Visible {
    fn position(&self) -> (i32, i32);
    fn facing(&self) -> Direction;
    ...
}

trait Creature where Self: Visible {
    ....
}
```

#### 11.2.5 类型关联函数



### 11.3 完全限定方法调用

- `"hello".to_string()`指的是`ToString`trait的`to_string()`方法

```rust
"hello".to_string();

// 当Self的类型不能被推断
str::to_string("hello");
let zero = 0;
// Wron


i64::abs(zero);


// 当两个方法名称相同，它们来自不同的trait
ToString::to_string("hello");
Visible::draw(&outlaw);
HasPistol::draw(&outlaw);


// 完全限定方法调用
<str as ToString>::to_string("hello");
```

### 11.4 定义类型关系的trait

- trait可以实现多个类型协同 工作的场景

#### 11.4.1 关联类型

- **type Item**是一个*关联类型*
- 泛型代码也可以使用关联类型

```rust
pub trait Iterator {
    type Item;
    
    fn next(&mut self) -> Option<Self::Item>;
}

// std::env
impl Iterator for Args {
    type Item = String;
    fn next(&mut self) -> Option<String> {
        ...
    }
}

// We can use I::Item
fn collect_into_vector<I: Iterator>(iter: I) -> Vec<I::Item> {
    let mut results = Vec::new();
    for value in iter {
        results.push(value);
    }
    results
}

fn dump<I>(iter: I)
	where I: Iterator, I::Item: Debug {...}
```

#### 11.4.2 泛型trait（运算符重载）

```rust
// std::ops
pub trait Mul<RHS=Self> {
    type Output;
    fn mul(self, rhs: RHS) -> Self::Output;
}
```

#### 11.4.3 impl Trait

- 如下面的例子，实现了`Iterator<Item=u8>`这一trait的返回类型都能被接受

```rust
use std::iter;
use std::vec::IntoIter;

fn cyclical_zip(v: Vec<u8>, u: Vec<u8>) ->
	iter::Cycle<iter::Chain<IntoIter<u8>, IntoIter<u8>>> {
	v.into_iter().chain(u.into_iter()).cycle()
}

// 返回值替换为trait对象
// 带来了额外开销
... -> Box<dyn Iterator<Item=u8>>


// impl Trait
... -> impl Iterator<Item=u8>
```

### 11.5 逆向工程约束

- 利用编译器来指导我们对泛型参数的约束

```rust
// N 需要支持加法和乘法
// 加法乘法后输出应保持同一类型
fn dot<N>(v1: &[N], v2: &[N]) -> N {
    let mut total: N = 0;
    for i in 0..v1.len() {
        total = total + v1[i] * v2[i];
    }
    total
}

fn dot<N>(v1: &[N], v2: &[N]) -> N 
	where N: Mut<Output=N> + Add<Output=N> + Default + Copy {
    let mut total: N = N::default();
    for i in 0..v1.len() {
        total = total + v1[i] * v2[i];
    }
    total
}
```



## Chapter12 运算符重载



## Chapter13 实用Trait

### 13.1 Drop

- drop意味着释放这个值拥有的资源，堆上的存储空间
- 通常不需要自己实现drop

### 13.2 Sized

- Sized这个trait由Rust自动实现，我们无法实现
- Sized的唯一用途是约束类型参数，这种被称为标记*trait*，因为Rust用它们来标记有特定特点的类型
- Rust还有少量大小不固定的类型，比如：字符串切片str，dyn类型
- 类型参数默认带 Sized，通过`?Sized`取消
  - `struct S<T: ?Sized>`：Rust允许使用`S<Str>/S<dyn Write>`，此时其是胖指针

### 13.3 Clone

- 如果你的类型只是简单的拷贝每一个字段，`#[derive(Clone)]`就够了

```rust
trait Clone: Sized {
    fn clone(&self) -> Self;
    fn clone_from(&mut self, source: &Self) {
        *self = source.clone()
    }
}
```

### 13.4 Copy

- 标记trait。Rust只允许可以通过**逐字节的浅拷贝**来拷贝自身的类型实现Copy
- 如果一个类有任何其他资源，如堆，或者OS句柄，将不能实现Copy

```rust
trait Copy: Clone {}
```



### 13.5 Deref与DerefMut

- 像`Box<T>`和`Rf<T>`这样的指针类型都实现了这个trait，如果你有一个`Box<Complex>`类型的值b，那么`*b`就是被指向的值，`b.re`就是实部
- Deref 以Self的引用作为参数返回`Self::Target`的引用。Rust会自动将前者转成后者
  - 如果插入一个deref会让类型匹配，那么Rust就会自动插入。这被称为强制解引用
  - 如果你有`Rc<String>`的值r，`r.find('?')`比`(*r).find('?')`更简单
  - 你可以对String调用str切片类型的方法，这是因为String实现了`Deref<Target=str>`. &String->&str
  - `Vec<T>`实现了`Deref<Target=[T]>`所以我们可以向接受一个`&[u8]`字节序列的函数传递字节vector`&v`
  - 如果需要Rust还会多次解引用

```rust
trait Deref {
    type Target: ?Sized;
    fn deref(&self) -> &Self::Target;
}

trait DerefMut: Deref {
    fn deref_mut(&mut self) -> &mut Self::Target;
}
```

### 13.6 Default

- Rust的所有集合类型（vec, HashMap, BinaryHeap）都实现了Default
  - 如果所有字段都实现了default，那么可以用`#[derive(Default)]`

```rust
trait Default {
    fn default() -> Self;
}
```

### 13.7 AsRef与AsMut

- 如果一个类型实现了`AsRef<T>`那么你可以从它高效借用一个&T。AsMut用于可变引用
- 比如，`Vec<T>`实现了`AsRef<[T]>`，String实现了`AsRef<[u8]>`
- 任何类型只要实现了AsRef就可以

```rust
trait AsRef<T: ?Sized> {
    fn as_ref(&self) -> &T;
}

trait AsMut<T: ?Sized> {
    fn as_mut(&mut self) -> &mut T;
}

fn open<P: AsRef<Path>>(path: P) -> Result<File>;
```

### 13.9 From与Into

```rust
trait Into<T>: Sized {
    fn into(self) -> T;
}

trait From<T>: Sized {
    fn from(other: T) -> Self;
}
```



## Chapter14 闭包

### 14.1 捕获变量



### 14.4 闭包和安全性

#### 14.1.1 杀死值的闭包

```rust
let my_str = "hello".to_string();
let f = || drop(my_str);

f() // ok
f() // 使用了被move的值
```

#### 14.1.2 FnOnce

- 当一个闭包消耗值时，会实现FnOnce这一trait。第一次调用后闭包本身会被消耗





## Chapter 15 迭代器

### 15.1 Iterator与IntoIterator trait

- 一个迭代器是任何实现了`std::iter::Iterator`trait的类型
- 如果某个类型有一种自然的迭代方法，那么它可以实现`std::iter::IntoIterator`
  - 实现了这一trait，称为*可迭代对象*(Iterable)

```rust
trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
    ...
}

trait IntoIterator where Self::IntoIter: Iterator<Item=Self::Item> {
    type Item;
    type IntoIter: Iterator;
    fn into_iter(self) -> Self::Iterator;
}

for element in &v {
    ...
}
// 等价于
let mut iterator = (&v).into_iter();
while let Some(element) = iterator.next() {
    ...
}
```

### 15.2 创建迭代器

#### 15.2.1 iter & iter_mut

- `iter()`返回共享引用的迭代器
- `iter_mut()`返回可变引用的迭代器
- 这两者更可以看成Rust提供的*语法糖*，可以用`into_iter()`替代

#### 15.2.2 IntoIterator 实现

- 大多数集合提供了好几个IntoItearator的实现，分别为共享引用（&T）、可变引用（&mut T）、移动（T）的实现
  - `(&v).into_iter()` <- `for ele in &collection {...}`
  - `(&mut v).into_iter()` <- `for ele in &mut collection {...}`
  - `v.into_iter()` <- `for ele in collection {...}`
    - 会获取集合所有权
- HashSet, BTreeSet等结构没有实现可变引用的IntoItearator，这是因为如果可变会破坏Invariant。

#### 15.2.3 from_fn和successors

- 给定一个返回`Option<T>`的函数，`std::iter::from_fn`返回一个迭代器不断调用函数产生Item
- `std::iter::successors` 会将前一次生成的Item当作这一次的参数

```rust
use rand::random;
use std::iter::from_fn;
let lengths: Vec<f64> =
    from_fn(|| Some((random::<f64>() - random::<f64>()).abs()))
    .take(10)
    .collect();

let pow2: Vec<_> =
    successors(Some(1), |x: &i32| Some(2 * *x))
    .take(10)
    .collect();
```

### 15.3 迭代器适配器

- *adapter* 消耗一个迭代器然后构建一个迭代器

#### 15.3.1 map, filter

- 拥有函数式的优雅

```rust
let text = "   ponies  \n giraffes\niguanas  \nsquid".to_string();
    let v: Vec<&str> = text
        .lines()
        .map(str::trim)
        .filter(|s| *s != "iguanas")
        .collect();
    assert_eq!(v, ["ponies", "giraffes", "squid"]);
```

#### 15.3.3 flatten

- flatten 把迭代器的 item 连接起来

#### 15.3.4 take take_while

#### 15.3.5 skip skip_while

#### 15.3.11 enumerate

#### 15.3.12 zip

- 将两个迭代器缝合成一个pair
- 其中一个结束则结束

### 15.4 消耗迭代器

#### 15.4.12 find

- 返回第一个使给定闭包返回true的item，若无则None

#### 15.4.13 collect

```rust
let args: HashSet<String> = std::env::args().collect();
let args = std::env::args().collect::<BTreeSet<String>>();
let args: LinkedList<String> = std::env::args().collect();

let args: HashMap<String, usize> = std::env::args().zip(0..).collect();
let args: BTreeMap<String, usize> = std::env::args().zip(0..).collect();
```



