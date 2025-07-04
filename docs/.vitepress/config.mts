import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Freeman's Blog",
  description: "记录前端开发、工程化和Web3的技术探索之路",
  base: "/blog/",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "前端开发", link: "/frontend/react/concurrent-features" },
      { text: "Web3开发", link: "/web3/" },
      { text: "关于我", link: "/about" },
    ],

    sidebar: {
      "/frontend/": [
        {
          text: "JavaScript",
          items: [
            { text: "Promise 实现", link: "/frontend/js/promiseA+" },
            { text: "事件循环", link: "/frontend/js/event-loop" },
            { text: "PWA", link: "/frontend/js/pwa" },
            { text: "ES6+ 新特性全解析", link: "/frontend/js/es6+" },
          ],
        },
        {
          text: "React 技术栈",
          items: [
            {
              text: "React 18 并发特性深度解析",
              link: "/frontend/react/concurrent-features",
            },
            {
              text: "Fiber 架构原理与实现机制",
              link: "/frontend/react/fiber-architecture",
            },
            {
              text: "React Hooks 实现原理",
              link: "/frontend/react/hooks-best-practices",
            },
          ],
        },
        {
          text: "Vue 技术栈",
          items: [
            {
              text: "Vue3 响应式原理",
              link: "/frontend/vue/reactivity-principles",
            },
            { text: "Vue3 新特性", link: "/frontend/vue/vue3-new-features" },
            {
              text: "Vue 中组件通讯方式",
              link: "/frontend/vue/component-communication",
            },
            {
              text: "keep-alive 实现原理",
              link: "/frontend/vue/keep-alive-principle",
            },
            { text: "Vue2 响应式原理", link: "/frontend/vue/vue2-reactivity" },
          ],
        },
        {
          text: "工程化",
          link: "/frontend/engineering/",
        },
        {
          text: "跨端技术",
          items: [
            { text: "JSbridge 通信", link: "/frontend/jsbridge/" },
            { text: "小程序开发", link: "/frontend/miniprogram/" },
            { text: "Electron", link: "/frontend/electron/" },
          ],
        },
        {
          text: "前端架构",
          items: [
            { text: "微前端", link: "/frontend/microfrontend/" },
            { text: "Monorepo 架构", link: "/frontend/monorepo/" },
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
