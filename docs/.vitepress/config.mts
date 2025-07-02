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
        {
          text: "跨端技术",
          items: [
            { text: "移动端开发", link: "/frontend/mobile/" },
            { text: "JSbridge 通信", link: "/frontend/jsbridge/" },
            { text: "小程序开发", link: "/frontend/miniprogram/" },
            { text: "Electron 桌面应用", link: "/frontend/electron/" },
          ],
        },
        {
          text: "前端架构",
          items: [
            { text: "微前端", link: "/frontend/microfrontend/" },
            { text: "状态管理", link: "/frontend/state-management/" },
            { text: "设计模式", link: "/frontend/design-patterns/" },
          ],
        },
      ],
      "/engineering/": [
        {
          text: "构建工具",
          items: [
            { text: "Webpack 深度解析", link: "/engineering/webpack/" },
            { text: "Vite 构建优化", link: "/engineering/vite/" },
            { text: "包管理与发布", link: "/engineering/package/" },
          ],
        },
        {
          text: "DevOps & 部署",
          items: [
            { text: "Docker 容器化", link: "/engineering/docker/" },
            { text: "CI/CD 实践", link: "/engineering/cicd/" },
            { text: "Nginx 配置", link: "/engineering/nginx/" },
            { text: "云服务部署", link: "/engineering/cloud/" },
          ],
        },
        {
          text: "开发工具",
          items: [
            { text: "Git 版本控制", link: "/engineering/git/" },
            { text: "代码规范", link: "/engineering/code-standards/" },
            { text: "调试技巧", link: "/engineering/debugging/" },
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
