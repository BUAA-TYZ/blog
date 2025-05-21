import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  // "/demo/",
  {
    text: "项目",
    icon: "code",
    link: "/posts/project/",
  },
  {
    text: "后端笔记",
    icon: "pen-to-square",
    link: "/posts/backend/",
  },
  {
    text: "面经思考",
    icon: "pen-to-square",
    link: "/posts/interview/",
  },
  {
    text: "E-book",
    icon: "book",
    children: [
      {
        text: "DDIA",
        link: "http://ddia.vonng.com",
      },
      {
        text: "OSTEP",
        link: "https://itanken.github.io/ostep-chinese/",
      },
      {
        text: "Pro Git",
        link: "https://bingohuang.gitbooks.io/progit2/content/",
      },
      {
        text: "go语言设计与实现",
        link: "https://draveness.me/golang/",
      },
      {
        text: "go圣经",
        link: "https://gopl-zh.github.io/",
      },
      {
        text: "现代javascript教程",
        link: "https://zh.javascript.info/",
      },
      {
        text: "设计模式",
        link: "https://refactoringguru.cn/design-patterns/catalog",
      },
    ],
  },
  {
    text: "V2 文档",
    icon: "book",
    link: "https://theme-hope.vuejs.press/zh/",
  },
]);
