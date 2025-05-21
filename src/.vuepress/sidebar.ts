import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/posts/project/": "structure", 
  "/posts/interview/": "structure", 
  "/posts/backend/": [
    {
      text: "后端",
      icon: "code",
      link: "README.md",
      children: [
        {
          text: "C++",
          icon: "c",
          prefix: "c/",
          children: "structure",
        },
        {
          text: "Rust",
          icon: "language",
          prefix: "rust/",
          children: "structure",
        },
        {
          text: "计算机网络",
          icon: "globe",
          prefix: "network/",
          children: "structure",
        },
        {
          text: "数据库",
          icon: "database",
          prefix: "db/",
          children: "structure",
        },
        {
          text: "云",
          icon: "cloud",
          prefix: "cloud/",
          children: "structure",
        },
        {
          text: "工具链",
          icon: "toolbox",
          prefix: "tools/",
          children: "structure",
        }
      ]
    },
  ],
  "/": [
    "",
    "intro",
    {
      text: "幻灯片",
      icon: "person-chalkboard",
      link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    },
  ],
});
