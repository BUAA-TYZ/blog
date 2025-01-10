import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  // "/demo/",
  {
    text: "项目",
    icon: "code",
    prefix: "/posts/project/",
    children: [
      "CMU15445/",
      "MIT6.5840/",
    ]
  },
  {
    text: "后端笔记",
    icon: "pen-to-square",
    prefix: "/posts/backend/",
    children: [
      {
        text: "C++",
        prefix: "c/",
        children: [
          "effective-cpp",
        ],
      },
      {
        text: "Rust",
        prefix: "rust/",
        children: [
          "rust"
        ],
      },
      {
        text: "计算机网络",
        prefix: "network/",
        children: [
          "how-network-connect",
          "cisco",
        ],
      },
      {
        text: "云",
        prefix: "cloud/",
        children: [
          "docker",
          "cloud",
        ],
      },
      {
        text: "工具链",
        prefix: "tools/",
        children: [
          "git",
        ],
      },
    ],
  },
  {
    text: "V2 文档",
    icon: "book",
    link: "https://theme-hope.vuejs.press/zh/",
  },
]);
