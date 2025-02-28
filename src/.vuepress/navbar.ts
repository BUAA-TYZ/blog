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
      }
    ],
  },
  {
    text: "V2 文档",
    icon: "book",
    link: "https://theme-hope.vuejs.press/zh/",
  },
]);
