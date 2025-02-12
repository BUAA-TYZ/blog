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
    text: "V2 文档",
    icon: "book",
    link: "https://theme-hope.vuejs.press/zh/",
  },
]);
