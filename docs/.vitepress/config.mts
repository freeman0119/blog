import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "前端技术博客",
  description: "记录前端开发、工程化和Web3的技术探索之路",
  base: "/blog/",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "前端框架", link: "/frontend/" },
      { text: "工程化", link: "/engineering/" },
      { text: "Web3开发", link: "/web3/" },
      { text: "关于我", link: "/about" },
    ],

    sidebar: {
      "/frontend/": [
        {
          text: "前端框架",
          items: [
            { text: "React 技术栈", link: "/frontend/react/" },
            { text: "Vue 生态", link: "/frontend/vue/" },
            { text: "性能优化", link: "/frontend/performance/" },
          ],
        },
      ],
      "/engineering/": [
        {
          text: "工程化工具",
          items: [
            { text: "Webpack 深度解析", link: "/engineering/webpack/" },
            { text: "Vite 构建优化", link: "/engineering/vite/" },
            { text: "包管理与发布", link: "/engineering/package/" },
            { text: "CI/CD 实践", link: "/engineering/cicd/" },
          ],
        },
      ],
      "/web3/": [
        {
          text: "Web3 开发",
          items: [
            { text: "区块链基础", link: "/web3/blockchain/" },
            { text: "智能合约开发", link: "/web3/smart-contracts/" },
            { text: "DeFi 应用", link: "/web3/defi/" },
            { text: "NFT 项目", link: "/web3/nft/" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/your-username" }],

    search: {
      provider: "local",
    },

    outline: {
      level: [2, 3],
    },

    footer: {
      message: "持续学习，持续成长",
      copyright: "Copyright © 2025 前端技术博客",
    },
  },
});
