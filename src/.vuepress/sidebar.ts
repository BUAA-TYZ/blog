import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    // {
    //   text: "如何使用",
    //   icon: "laptop-code",
    //   prefix: "demo/",
    //   link: "demo/",
    //   children: "structure",
    // },
    {
      text: "项目",
      icon: "code",
      prefix: "posts/project/",
      children: "structure",
    },
    {
      text: "文章",
      icon: "book",
      prefix: "posts/",
      children: [
        {
          text: "后端",
          icon: "code",
          prefix: "backend/",
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
    },
    "intro",
    {
      text: "幻灯片",
      icon: "person-chalkboard",
      link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    },
  ],
});
