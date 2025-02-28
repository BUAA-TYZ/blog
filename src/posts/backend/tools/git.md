---
date: 2025-01-04
category:
  - 工具链
tag:
  - git
footer: 凉了的馒头
---

# ProGit

[Progit here](https://bingohuang.gitbooks.io/progit2/content/)

### Git 基础



#### 一些命令

- `git add` 跟踪新文件
  - 这是个多功能命令：可以用它开始跟踪新文件，或者把已跟踪的文件放到暂存区，还能用于合并时把有冲突的文件标记为已解决状态等
- `git commit` 提交文件
  - `--amend` 如果一次提交忘记提交某个文件，通过此选项补交进上一次的提交；加 `-m` 可以更改上一次提交的 description
- `git diff`
- `git mv`
- `git rm` 
  - `--cached` 只删除 git 追踪
- `git status`
- `git log`
  - `-p` 显示每次提交的差异
  - `-2` 显示最近的两次提交
- `git reset`
  - `HEAD <file>` 取消暂存
- `git restore`
  - `--staged` 仅取消暂存（不改动工作区）



#### 分支命令


- `git branch`：显示所有分支

  - `<branch name>` 创建分支
  - `-d <branch name>` 删除一个分支
  - `-u <remote>/<branch>` 跟踪一个远程分支

- `git checkout`
  - `-b <branch name>` 等价于 `git br <branch name> git checkout <branch name>`
  - `-b <branch> <remote>/<branch>` 创建指定起点的新分支并从其开始工作
  - `<branch name>` 切换 HEAD 至新分支
  - :warning: `-- <file>` 被 `git restore` 替代，为了避免 checkout 语义的混乱，用于丢弃工作区的改动
- `git rebase` 变基

  - `<branch>`：将当前分支续到 branch 后
  - `<a-br> <b-br>`：将 b-br 续到 a-br 后




#### gitignore

- **.gitignore**

  - 规范

    - 所有空行或者以 ＃ 开头的行都会被 Git 忽略
    - 可以使用标准的 glob 模式（简化正则）匹配
    - 匹配模式可以以（/）开头防止递归
    - 匹配模式可以以（/）结尾指定目录
    - 要忽略指定模式以外的文件或目录，可以在模式前加上惊叹号（!）取反

  - `*` 匹配多个字符 `**` 匹配任意中间目录

  - ```
    # no .a files
    *.a
    # but do track lib.a, even though you're ignoring .a files above
    !lib.a
    # only ignore the TODO file in the current directory, not subdir/TODO
    /TODO
    # ignore all files in the build/ directory
    build/
    # ignore doc/notes.txt, but not doc/server/arch.txt
    doc/*.txt
    # ignore all .pdf files in the doc/ directory
    doc/**/*.pdf
    ```



#### 远程仓库命令

- `git remote`
  - `-v`
  - `<shortname> <url>` 添加远程仓库
- `git fetch` 从远程仓库拉取
- `git push` 推送
  - `<remote-name> <branch-name>`
  - `<remote> <a-branch>[:<b-branch>]`：向 remote 端推送本地的 a-branch 到远程的 b-branch（省略则推送到同名分支）
  - `<remote> --delete <branch>`：删除远程分支 

#### 打标签

- `git tag`

#### Git 别名

- 见 [here](https://github.com/BUAA-TYZ/TYZ_Configs/tree/main)



### Git 分支



#### 分支简介

![](/assets/posts/git-Refs/1.png)
- 一次提交是一个指针，指向这次提交的结构
![](/assets/posts/git-Refs/2.png)
- 一个分支就是一个指向提交的指针

#### 一个例子

![](/assets/posts/git-Refs/3.png)

- 我们要将几个分支融合

  1. `git checkout master`
  2. `git merge hotfix`

![](/assets/posts/git-Refs/4.png)

- 因为只有单一历史线，所以 `master` 分支直接快进

  1. `git branch -d hotfix`
  2. `git checkout iss53`
  3. `git commit ...`

![](/assets/posts/git-Refs/5.png)

  1. `git checkout master`
  2. `git merge iss53`

- 在这里，系统会根据 两个分支的共同祖先 `C2` 以及 `C4` `C5` 进行 merge

- 如果遇到分支冲突，git 会暂停等待我们解决冲突

  - ```html
    <<<<<<< HEAD:index.html
    <div id="footer">contact : email.support@github.com</div>
    =======
    <div id="footer">
     please contact us at support@github.com
    </div>
    >>>>>>> iss53:index.html
    
    ======= 将两个分支分成上下两部分
    
    ```

  - 选择其中之一，然后将剩余的部分删除掉后 `git add` 即视为解决冲突



#### 分支开发工作流



##### 长期分支

- 一种常见的开发方式：在 `master` 分支上保留稳定的代码，用 `develop` 等分支进行后续开发，等到达到稳定，合入 `master` 

##### 特性分支

- 一种短期分支，被用来实现单一特性



#### 远程分支

- 远程分支以 `<remmote>/<branch>` 命名
![](/assets/posts/git-Refs/6.png)
- 本地和远程被提交了几次
![](/assets/posts/git-Refs/7.png)
- 执行 `git fetch origin`
![](/assets/posts/git-Refs/8.png)
- `git remote add teamone ...` && `git fetch teamone`
![](/assets/posts/git-Refs/9.png)



##### 跟踪分支

- 通常克隆下来后会自动创建一个跟踪 origin/master 的本地 master 分支
- 从一个远程分支 checkout 也会自动进行跟踪
- 通过 `-u` 设置跟踪



#### 变基

![](/assets/posts/git-Refs/10.png)

- experiment 原本指向 C4

  1. `git checkout experiment`

  2. `git rebase master`

- 原理：将当前分支 C4 对共同祖先 C2 的修改提取为临时文件，指向要变基的 branch C3，应用临时文件

- 随后进行整合

  1. `git checkout master`
  2. `git merge experiment`

- 变基使提交历史变得线性

  - 例如：向某个开源项目贡献代码，先在自己的分支开发，开发完成后需要将代码变基到 origin/master 上（`git checkout master git pull git checkout <branch> git rebase master`）再提交修改

##### 一个更复杂的变基例子

![](/assets/posts/git-Refs/11.png)
- `git rebase --onto master server server client`：取出 client，找出处于 server 和 client 共同祖先 C3 之后的修改（C8 C9）续到 master 后
![](/assets/posts/git-Refs/12.png)
- `git checkout master git merge client` && `git rebase master server`
![](/assets/posts/git-Refs/13.png)



##### 变基的风险

- :warning: **不要对你的仓库外有副本的分支执行变基**
- 变基本质上是丢弃了一个 commit 将其续到另一个 commit 之后，如果你对远程仓库的分支进行变基后推送就会导致别人拉取的分支出现问题（他早在之前就拉取了分支，随后你变基导致他拉取的某些提交应该是不存在的）
- 总的来说，将变基视为整合自己**独立**开发分支历史的一种手段是安全的



### 分布式 Git



#### 分布式工作流程



- 集中式工作流：
  ![](/assets/posts/git-Refs/14.png)
  - 一个仓库，若干个开发者向其推送修改
  - 若两个人前后推送同一分支，只有第一个能成功，第二个会被拒绝，通知其需要先合并第一个的修改
- 集成管理者工作流（Github）：
  ![](/assets/posts/git-Refs/15.png)
  - 项目维护者推送到主仓库
  - 贡献者 clone 修改 推送到自己的仓库
  - 贡献者 pull request
  - 维护者同意修改



#### 向一个项目贡献



##### 私人小型团队

- `A: git clone john@githost:simplegit.git 修改后提交`
- `B: git clone jessica@githost:simplegit.git 修改后提交并 git push origin master`
- A 无法推送
  - ` git fetch origin && git merge origin/master` or `git pull`
  ![](/assets/posts/git-Refs/16.png)
- 现在 A 进行了推送，origin/master 指向 72bbc
- B 在此期间在一个特性分支上工作，并做了三次提交，且未抓取远程仓库
  ![](/assets/posts/git-Refs/17.png)
- `B: git fetch origin`
  ![](/assets/posts/git-Refs/18.png)
  - B 的本地历史如图
  - master 合并两个分支
    1. `git checkout master`
    2. `git merge issue54` 发生一次 fast-forward
    3. `git merge origin/master`
![](/assets/posts/git-Refs/19.png)
- 此时便可以进行推送了



##### 私人管理团队

- 没有 master 分支的更新权限
- A 与 B 和 C 分别在不同的两个特性分支上进行工作
- A 在 FeatureA 上工作 `git checkout -b featureA && git commit ... &&  git push -u origin featureA`
  - A 发邮件给 B 通知自己进行了一些修改
- 同时他进行 FeatureB 的工作 `git fetch origin && git checkout -b featureB origin/featureB && git commit ...`
![](/assets/posts/git-Refs/20.png)
  - A 准备提交时被C告知，C已经进行了一些提交，需要合并 origin/featureBee
  - `git fetch origin && git merge origin/featureBee`
  - `git push -u origin featureB:featureBee`
- A 又被告知 B 已经推送了一些新东西在 featureA
  - `git fetch origin && git checkout featureA && git merge origin/featureA` （一次 fast-forward）
  - A 再次进行了一些提交...
![](/assets/posts/git-Refs/21.png)
- 整合者合并入 master 分支
![](/assets/posts/git-Refs/22.png)















