---
date: 2025-01-04
category:
  - 语言
tag:
  - C++
  - 规范
footer: 凉了的馒头
---

# Effective C++

## 前言

本笔记并非用于速通此书，只用于看过的人回忆此书。
写下此笔记的主要预防场景是这样：已经看过一遍，过了不久之后忘掉某些细节，但是再翻一遍书成本太高。这时，我将本书所有重点精简总结在一起，一回看便回忆起来，起到温故而知新的作用。

在我看来，这本书对我最大的帮助在于：`auto型别推导`，`右值语义及完美转发`，尤其是后者，讲解的通俗易懂，属于本书写的最好的一章了。


## 第一章 型别推导

### 条款1 理解模板型别推导

`学完这个条款，应能说清模板推导出的类型结果`
函数模板：

```cpp
template<typename T>
void f(ParamType param);

f(expr);
```

误区：认为T的型别推导结果只由 expr 类型决定

实际由 expr 和 ParamType 共同决定

以下分三类：

**情形1：ParamType 是指针或引用 但非万能引用**
则这样推导：

1. 若 expr 类型是个引用，将引用部分忽略
2. 匹配类型

```cpp
template<typename T>
void f(T& param);

int x = 27;
const int cx = x;
const int& rx = x;

f(x);		//T 为 int			param 为 int&
f(cx);		//T 为 const int	param 为 const int&
f(rx);		//T 为 const int	param 为 const int&
```

对于 rx 其引用性被忽略
指针亦是同理

**情况2 ParamType是一个万能引用**
`学完这个条款，彻底弄清auto怎么推导`

见条款24

- 如果 expr 是左值，T 和 Paramtype 均为左值引用
- 如果 expr 是右值，应用情况1，即 T 被去掉引用性，ParamType 为 && 

```cpp
template<typename T>
void f(T&& param);

int x = 27;
const int cx = x;
const int& rx = x;

f(x);		//T 为 int&			param 为 int& (引用折叠)
f(cx);		//T 为 const int&	param 为 const int&
f(rx);		//T 为 const int&	param 为 const int&
f(27);		//T 为 int	param 为 int&&
```

**情况3 ParamType既非指针，也非引用**

即按值传递，这意味着 param 将是 expr 的一个副本
规则如下：

 - 若 expr 是个引用，忽略其引用部分
 - 若 expr 是个 const ，也忽略之。若是 volatile 也忽略之

```cpp
template<typename T>
void f(T param);

int x = 27;
const int cx = x;
const int& rx = x;

f(x);		//T 为 int			param 为 int
f(cx);		//T 为 int			param 为 int
f(rx);		//T 为 int			param 为 int
```

做个总结

1. 先看 ParamType 决定哪种情形
2. 再根据 expr 本身类型进行省略，推导出 T
3. 进而推导出 Param 类型

**边缘情形1 数组实参**

```cpp
template<typename T>
void f(T param);

const char name[] = "hello world";
const char* ptrtoName = name;

f(name);		//数组名为指针，被推导为 const char*

template<typename T>
void f(T& param);
f(name);		//这时 T 会被推导为 const char [13]

```

**边缘情形2 函数实参**

```cpp
template<typename T>
void f1(T param);

template<typename T>
void f2(T& param);

void func(int, double);		
f1(func);					// void(*)(int, double)
f2(func)					// void(&)(int, double)
```

### 条款2 理解auto型别推导

与上一条款基本一致，我们将 auto 的型别饰词看作 ParamType
如：const auto& rx = x;		这里，型别饰词即为 const auto&

```cpp
auto x = 27;				//情形3，rx 推导为 int
const auto cs = x;			//情形3，rx 推导为 int
const auto& rx = x;			//情形1，rx 推导为 const int

auto&& uref1 = x;			//情形2：uref1 推导为 int&
auto&& uref2 = cx;			//情形2，uref2 推导为 const int&
auto&& uref3 = 27;			//情形2，uref3 推导为 int&&
```

唯一区别

对于大括号初始化物
auto x3 = {27};				// 推导为 std::initializer_list\<int\>
向模板传递大括号时将失败
除非指定之

```cpp
template<typename T>
void f(std::initializer_list<T> initList);
f({11, 23, 9});		// 成功
```




---

## 第三章转向现代C++

### 条款7 在创建对象时注意区分()和{}

统一初始化的用处非常广泛

- `std::vector<int> v1{1, 3, 5};`
- 为非静态成员指定默认初始化值
- 不可复制对象可以采用大括号或小括号初始化: `std::atomic<int> ai1{0};`
- 禁止类型隐式窄化性别转换 `double x, y, z; int sum{x+y+z}; //wrong!`
- 避免解析语法 `Widget w2(); // A function instead of an initialization. Widget w2{}; //Correct`

但是统一初始化也有坏处:

- 如果构造函数中有`std::initializer_list`，则编译器优先采用之(甚至会隐式转换)

```cpp
class Widget{
public:
    Widget(std::initializer_list<long double> il);
	Widget(int i, bool b);
}

Widget w1(10, true);	// 调用第二个构造函数
Widget w1{10, true};	// 隐式转换并调用第一个构造函数
```



### 条款17 理解特种成员函数的生成机制

`学完这个条款，清晰地知道编译器对默认生成函数的生成准则`

1. 复制构造，复制赋值，**这两种复制操作彼此独立**，（已经被委员会声明为废弃特性）声明一个并不会阻止编译器声明另外一个。如你声明了一个复制构造函数，并撰写了需要用到复制赋值函数的地方，则编译器会默认生成之。
2. 移动构造，移动赋值，**这两种移动操作彼此不独立**，声明了一个就会阻止编译器声明另外一个。
3. 一旦声明了复制操作，则不会再生成移动操作（说明复制很可能与按成员复制不同，很可能移动也是如此）
4. 一旦声明了移动操作，则不会再生成复制操作（只可移对象）
5. 只要生成了析构函数，则拷贝构造、拷贝赋值也应该被显示定义（由于历史原因，编译器仍然可以默认生成，但已经被委员会声明为废弃特性）出于同样道理，只要生成析构函数，移动构造、移动赋值也需被显示定义（这里作为C++11新特性，没有历史需要考虑，所以编译器不会默认生成它们）

**总结**
移动函数只有满足下面，才会被默认生成：

 - 该类未声明任何复制操作
 - 该类未声明任何移动操作
 - 该类未声明任何析构函数

**补充**
不要忘了，如果这个类是派生类而其成员的拷贝构造函数被删除或不可访问，则编译器会将不会默认生成拷贝构造。（别的同理）

最后推荐不要依赖编译器生成，请显示使用 default ，一方面可读性更强，一方面避免日后加入新函数带来影响。（如加入析构函数导致隐式生成的移动函数被删除）

---

## 第五章 右值引用、移动语义和完美转发

`它们带来的好处`

- **移动语义**使得编译器能使用效率更高的移动操作来替换昂贵的复制操作
- **移动语义**使得创建只移对象成为可能，如：std::unique_ptr, td::thread ,std::future 等
- **完美转发**使人们可以撰写接受任意实参的函数模板，并将其**以它应该的形式**转发到其他函数

---

### 条款23 理解 std::move 和 std::forward

`学完这个条款，应能对它们的作用有个认知`

这两者在运行期间什么都不做，它们不会真正地进行移动、转发，只是在编译期间负责类型的强制转换。

`std::move`
它只做一件事：把实参强制转换为右值。右值是可以移动的，所以std::move相当于告诉编译器对象具备可移动的**条件**。
考虑下面这个例子

```cpp
class Annotation {
public:
	explict Annotation(const std::string text)
	: value(std::move(text))
	{ ... }
	...
private:
	std::string value;
};
```

这段代码顺利完成编译，value在初始化时也确实接受到右值，然而最终调用的会是复制而非移动操作，理由如下：
我们的 text 属性是 const std::string，经过移动其仍然带有 const 属性，在匹配时编译器当然会将其匹配到拷贝构造函数以保证其常量性不会消失。

```cpp
class string {
public:
	string(const string & rhs);
	string(string && rhs);
	...
};
```

结论：如果我们想要移动某个对象，则不要将其声明为 const 

`std::forward`
考虑一个例子

```cpp
void proccess(const Widget& lvalArg);
void process(Widget&& rvalArg);

template<typename T>
void logAndProcess(T&& param) {
	...
	process(std::forward(param));
}

Widget w;
logAndProcess(w);					//我们希望调用左值版本
logAndProcess(std::move(w));		//我们希望调用右值版本
```

然而 param 是形参，其一定是个左值，如果没有 std::forward，process 一定会调用左值版本。这时使用 std::forward 转发即可得到正确结果。
std::forward 只做一件事：仅在 **param的实参** 为右值的情况下把 param 转换成右值类型。换言之，它保留了对象的左值性与右值性，该是什么就是什么。

---

### 条款24 区分万能引用与右值引用

`学完这个条款，应能辨别万能引用与右值引用`

万能引用作用：
首先是个引用，其对应一个初始化物。
如果初始化物是左值引用，则万能引用对应到一个左值引用
如果初始化物是右值引用，则万能引用对应到一个右值引用

```cpp
template<typename T>
void f(T&& param);
Widget w;
f(w);				//param 是 Widget&
f(std::move(w));	//param 是 Widget&&
```

一些右值引用和万能引用的例子

```cpp
Widget&& var1 = Widget();		//右值引用
auto&& var2 = var1;				//万能引用

template<typename T>
void f(std::vector<T>&& param);	//右值引用

template<typename T>
void f(T&& param);				//万能引用
```

关键看该引用是否真的涉及到类型推导，并且其类型必须形如 `T&&`

```cpp
template<typename T>
void f(std::vector<T>&& param);
template<typename T>
void f(const T&& param);
```

这个例子中， param 类型为 `std::vector<T> / const T&&` 不为`T&&` 故不为万能引用
即使形式对了，还需真的满足类型推导

```cpp
template<class T, class Allocator = allocator<T>>
class vector {
public:
	void push_back(T&& x);
	...
};
```

这个例子中， push_back 作为 vector 的一部分，只有当 vector 实例化，其才会存在，实例化后，T的类型就已经确定，它自然就不是万能引用了。 

---

### 条款25 针对右值引用实施std::move，针对万能引用实施std::forward

`学完这个条款应能正确地使用它们`

这个条款必须遵守，没有多少余地，不遵守很可能会出错，理由是很平凡的：
如果对万能引用使用 std::move()时， 则我们保证我们不会再使用这个初始化物了（这是因为这个初始化物会被 move 成 右值，而右值是将亡值。）这就意味着，万能引用的初始化物必须是右值才能有这样的保证。这是不对的。

针对右值引用的最后一次使用，使用 std::move ，针对万能引用的最后一次使用，使用 std::forward

```cpp
template<typename T>
void setSignText(T&& text) {
	sign.setText(text);								//使用text
													//但不改其值
	...
	sighHistory.add(now, std::forward<T>(text));	//转换
}
```

在按值返回的函数中，如果返回的是一个绑定到右值引用或万能引用的对象，则返回时，请使用 `std::move / std::forward`
考虑一个例子

```cpp
Matrix operator+(Matrix&& lhs, const Matrix& rhs) {
	lhs += rhs;
	return std::move(lhs);
}
Matrix operator+(Matrix&& lhs, const Matrix& rhs) {
	lhs += rhs;
	return lhs;
}
```

毫无疑问，上面的版本比下面的版本更好，如果 Matrix 有移动构造函数，则上面的版本将使用移动而非复制操作。如果Matrix很大，则效率会有较大差别。其次，就算Matrix 没有移动构造函数，上面的版本也会使用复制构造函数，与下面的版本达到相同的效果。所以，没有理由不使用 `std::move`

但是考虑对局部变量的优化时，则全然不同

```cpp
Widget makeWidget() {
	Widget w;
	...
	return w;
}
// 请不要使用下面的版本！！
Widget makeWidget() {
	Widget w;
	...
	return std::move(w);
}
```

这里涉及到的是编译器的**返回值优化(RVO)**操作：直接在为函数返回值分配的内存上创建局部变量w来避免复制之。（有点像 STL 里的 emplace_back 就地构造而非 移动 / 复制）

RVO要满足两个条件

1. 局部对象类型与函数返回值类型相同
2. 返回的就是局部对象本身

而上面的第二个版本返回的是一个右值引用，不满足条件2，因此我们限制了编译器的优化。并且就算编译器禁用了RVO操作，我们仍无需加`std::move`
因为标准要求如果实施RVO的条件满足但没有实施RVO（如被禁用）的话，返回对象必须作为右值处理，这就意味着编译器会隐式帮我们加上 `std::move`

---

### 条款26 避免依万能引用型别进行重载

`直接照做`
这个条款的理由是：万能引用几乎总能精确匹配类型，所以函数几乎不会像我们预想的那样被重载

---

### 条款27 熟悉依万能引用型别进行重载的替代方案

`我的建议是条款26、27能大致看懂书的内容即可，不用深究`

---

### 条款28 理解引用折叠

`学完这个条款，应当理解前面机制的底层理由`
引用折叠，就是引用的引用，虽然我们被禁止声明，但编译器可以在特殊时刻产生引用的引用。
规则如下：

> 如果任一引用为左值，则结果为左值引用，否则（两个皆为右值引用）结果为右值引用。

```cpp
template<typename T>
void f(T&& param);	

Widget w;
f(w);					//T的推导结果为Widget&
						//T & && = T& 所以传递了左值引用
f 被实例化为 f(Widget& param);
```

这里忘记 T 为什么被推导为 Widget& 的话，请回看 条款1

我们再加上 `std::forward`

```cpp
//std::forward的一种简单实现
template<typename T>
T&& forward(typename remove_reference<T>::type& param) {
	return static_cast<T&&> param;
}

template<typename T>
void f(T&& param){
	...
	someFunc(std::forward<T>(param));
}
```

回忆：
std::forward 只做一件事：仅在 **param的实参** 为右值的情况下把 param 转换成右值类型。
如果我们传给 函数f 一个左值， T 被推导为 Widget& ，然后 `std::forward<T> 变为 std::forward<Widget&>`，代入上面的 forward 实现

```cpp
Widget& && forward(typename remove_reference<Widget&>::type& param) {
	return static_cast<Widget& &&> param;
}
//变为
Widget& forward(Widget& param) {
	return static_cast<Widget&> param;
}
我们成功得到左值的param 
```

如果我们传给 函数f 一个右值， T 被推导为 Widget ，然后 `std::forward<T> 变为 std::forward<Widget>`

```cpp
Widget&& forward(typename remove_reference<Widget>::type& param) {
	return static_cast<Widget&&> param;
}
//变为
Widget&& forward(Widget& param) {
	return static_cast<Widget&&> param;
}
我们成功得到右值的param 
```

---

### 条款29 假定移动操作不存在、成本高、未使用

`学完这个条款，应当合理的使用移动操作`

`不要过分夸张移动操作带来的收益`

STL容器大多都是基于堆的容器，内存在堆上分配，如 `std::vector<>、哈希表等等`。
`std::array<>`本质是C-style 数组，故在栈上分配内存。
对于分配在堆上的标准容器，在概念上，我们持有指涉到一个容器的堆内存的指针，因此移动操作的效率是常数时间的。

```cpp
std::vector<Widget> vw1;
...
// 常数时间，仅仅移动了指针
auto vw2 = std::move(vw1);

std::array<Widget> aw1;
...
// 线性时间，需要把所有元素移入aw1
auto aw2 = std::move(aw1);
```

在这个例子中，我们可以看到对于 std::array 我们不能太过夸张其移动的效率。

考虑 `std::string`，提供常数时间的移动，线性时间的复制
似乎移动一定比复制快，但结果并非如此。
许多 string 的实现都采用了 SSO(small string optimization) 小型字符串会存储在std::string对象的某个缓冲区内，而不去使用堆上分配的内存。因此，移动实际上并不比复制更快

同时，移动必须不抛出异常，即使用 `noexcept`

---

### 条款30 熟悉完美转发失败的场景

考虑这样一个函数

```cpp
template<typename... Ts>
void fwd(Ts&&... param) {
	f(std::forward<Ts>(param)...);
}

//定义完美转发失败为
//如下两个函数调用结果不同
f(expression);
fwd(expression);
```

有若干钟实参将导致完美转发失败。
**大括号初始化物**

```cpp
f({1, 2, 3})	//正确，{1, 2, 3}隐式转换为vector<int>
fwd({1, 2, 3})	//错误，编译失败
```

完美转发在下面两个条件之一成立时失败：

1. 编译器无法为一个或多个fwd形参推导出类型
2. 编译器为一个或多个fwd形参推导出“错误的”结果

这个例子中，我们向未声明为 `std::initializer_list`类型的函数模板形参传递了大括号初始化物。由于fwwd形参未声明为`std::initializer_list`，编译器禁止从{1，2，3}推导类型。

**0和NULL指针**
这里的为空指针语义。但最终会被隐式转型为int类型。解决方法：：使用nullptr

**仅有整型声明的static const成员变量**

**模板或重载函数的名字**
原因很简单：模板推导不出来类型

**位域**
原因很简单：引用本质还是指针，而对一个位我们无法取指针，最小取址单位是char。既然无法引用，自然就无法完美转发

---

## 第六章 lambda表达式

`补充：`

1. **lambda**表达式本身会被编译器解释为一个重载了 () 的类，对于其捕获的对象，就相当于类的成员变量。
2. lambda 表达式和函数指针不一样，其可以捕获变量，可以在函数中调用...

### 条款31 避免默认捕获模式

按引用捕获会导致闭包指涉到局部变量的引用。一旦由 lambda 式创建的闭包越过了该局部变量或形参的生命周期，那闭包内的引用就会空悬。
`例子：`

```cpp
using FilterContainer = std::vector<std::function<bool(int)>>;

FilterContainer filters;		// 元素为筛选函数的容器

viod addDivisorFilter () {
	auto calc1 = computeSomeValue1();
	auto calc2 = computeSomeValue2();
	auto divisor = computeDivisor(calc1, calc2);
	// 写法1
	filters.emplace_back(
	[&](int value) { return value % divisor == 0; });
	// 写法2
	filters.emplace_back(
	[&divisor](int value) { return value % divisor == 0; });
}
```

上面两种写法都是错的，原因是 divisor 已经失效了。然而写法2更容易看出 lambda 的依赖从而找到错误。
如果你知道闭包会立即被使用并且不会被复制，那儿引用比它持有的局部变量或形参生命周期更长，就不存在风险。然而这时仍然不推荐 使用默认捕获，原因是之后万一出错，更好找到依赖而改错。

解决方法：按值默认捕获

```cpp
filters.emplace_back(
// lambda 中使用 auto (C++14)
[=](const auto& value) { return value % divisor == 0; }
);
```

然而按值捕获并不能完全解决这类问题。
如果按值捕获指针，那么无法确定是否有别的对象会对指针释放造成空悬指针。
下面这个例子，我完全没看出错误。。书上解释完方才恍然大悟

```cpp
class Widget{
public:
	...
	void addFilter() const;
private:
	int divisor;
};

void Widget::addFilter() const {
	filters.emplace_back(
	[=](int value) { return value % divisor == 0; }
	);
}
```

这里的问题在于==捕获只能针对在创建lambda式作用域内可见的非静态局部变量（包括形参）== 但 divisor 不是局部变量，而是 Widget 类的成员变量，其根本无法被捕获

```cpp
void Widget::addFilter() const {
	filters.emplace_back(
	[](int value) { return value % divisor == 0; }	// 错误，无法被捕获
	);
}

void Widget::addFilter() const {
	filters.emplace_back(
	// 错误，局部没有可捕获的 divisor
	[divisor](int value) { return value % divisor == 0; }
	);
}
```

然而如果使用默认值捕获模式，实际捕获的是 this 指针：

```cpp
// 等价于以下内容
void Widget::addFilter() const {
	auto currentObjectPtr = this;
	filters.emplace_back(
	[currentObjectPtr](int value) 
	{ return value % currentObjectPtr->divisor == 0; }
	);
}
```

所以这里 lambda 的存活就与 this 指针所指对象的生命周期绑定了。

`注意：lambda不能捕获静态变量！可以直接在其中使用之，不必捕获`

### 条款32 使用初始化捕获将对象移入闭包

```cpp
auto pw = std::make_unique<Widget>();
...
auto func = [pw = std::move(pw)]
			{ return pw->isValidated(); }
			
auto func = [pw = std::make_unique<Widget>()]
			{ return pw->isValidated(); }
```

上述 `pw = std::move(pw)` 左侧作用域位于闭包内，右侧作用域位于定义 lambda 对象的作用域

然而这些都只在 C++14 中被支持，C++11 欲在 lambda 中移动对象，只能手写一个类或者用 std::bind
模拟初始化捕获

---

### 条款33 对auto&&型别的形参使用decltype，以std::forward之

C++14 支持泛型 lambda，其可以在形参中使用 auto

```cpp
auto f = [](auto x) { return func(normalize(x)); };

// 等价于
class SomeCompilerGeneratedClassName {
public:
	template<typename T>
	auto operator()(T x) const 
	{ return func(normalize(x)); }
};
```

于是想要正确转发 x ，我们自然将其写成这样

```cpp
auto f = [](auto &&x)
		 { return func(normalize(std::forward<???>(x) )); }
```

???应该是T，但T是隐式的， 所以怎么写是之后要讨论的问题

回忆`std::forward`

```cpp
template<typename T>
T&& forward(std::remove_reference_t<T>& param) {
	return static_cast<T&&>(param);
}
T 取 Widget 无疑是对的
如果 T 取 Widget&&
那么经过引用折叠也是对的。
所以用 decltype 虽然不符合惯例，但结果最终都是对的。

auto f = [](auto &&x)
		 { return func(normalize(std::forward<decltype(x)>(x) )); }

// 还可以使用可变长参数
auto f = [](auto &&... param)
		 { return func(normalize(std::forward<decltype(param)>(param)...)); }
```


---

### 条款34 优先选用lambda表达式，而非std::bind

在C++14后，lambda 全面替代 bind
有以下几个理由：

1. lambda表达式 表达力更强，同样的代码用其书写，代码更简洁
   如我们返回一个实参是否在极小值和极大值之间：

```cpp
auto betweenL = [lowval, maxval](const auto &val) {
	return lowval <= val && val <= maxval;
};

auto betweenB = std::bind(std::logical_and<>(), 
				std::bind(std::less_equal<>, lowval, _1), 
				std::bind(std::less_equal<>, _1, maxval));
```

2. 对于一个参数是按值传递还是按引用传递，lambda 更加明确，bind则总是默认按值传递，除非用 std::ref
3. 对于一个重载的函数， bind 无法判断调用哪一个版本

```cpp
void f(int );
void f(int, int );

// wrong !!
auto gB = std::bind(f, _1);
// right 
using Type = void(*)(int);
auto gB = std::bind(std::static_cast<Type>(f), _1);

// lambda 
auto gL = [](int val){ f(val); }
```

---

## 第七章 并发API

C++ 的一大哲学就是 您永远不用操心您不需要的东西。最近学习并发，才发现并发是一个多大的坑，然而我之前连了解都没了解过，hhh

### 条款35 优先选用基于任务而非基于线程的程序设计

基于任务：使用`std::async`
基于线程：使用`std::thread`

书上的理由是，`std::async`能根据当前机器线程使用情况，灵活调用线程。而自己使用线程容易造成 申请线程超过机器线程情况造成异常，或者 超订 情况。

然而这个条款本身我并不同意，经过上网搜索，得出的结论也是不推荐使用。它更适用于简单的，可掌控的场景。
理由如下：

- `std::async`的行为稍微反直觉

```cpp
std::async(std::launch::async, f);
// g 不会运行直到 f 结束
std::async(std::launch::async, g);
```

解决方法是使用 future 与之绑定

- C++异常不带栈信息，所以如果在 async 中发生异常，有的信息可能当场丢失。
- 对于书上的理由，我们可以使用线程池统一分配资源，并使用`std::thread::hardware_concurrency()`获得核的数量来申请相应数量的线程。

### 条款36 如果异步是必要的，则指定std::launch::async

理由是您不指定，其可能使用 std::launch::deferred 导致同步执行。
这带来的后果是

- 使用 thread_local 对象的不确定性
- 任务可能永远不会执行
- 影响计时逻辑

### 条款37 使std::thread型别对象在所有路径皆不可联结

解决方法：使用 RAII ，如: C++20 的 jthread

- 在析构时调用 join 可能导致难以调试的性能异常
- 在析构时调用 detach 可能导致难以调试的未定义行为