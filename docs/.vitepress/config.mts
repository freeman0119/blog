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
      // { text: "AI 技术", link: "/ai/" },
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
      // "/ai/": [
      //   {
      //     text: "AI 工具应用",
      //     items: [
      //       { text: "ChatGPT 开发实践", link: "/ai/chatgpt/" },
      //       { text: "GitHub Copilot 使用技巧", link: "/ai/copilot/" },
      //       { text: "Cursor 编程助手", link: "/ai/cursor/" },
      //       { text: "AI 代码生成工具", link: "/ai/code-generation/" },
      //     ],
      //   },
      //   {
      //     text: "AI 驱动开发",
      //     items: [
      //       { text: "提示工程技巧", link: "/ai/prompt-engineering/" },
      //       { text: "AI 辅助调试", link: "/ai/ai-debugging/" },
      //       { text: "自动化测试生成", link: "/ai/automated-testing/" },
      //       { text: "代码重构优化", link: "/ai/code-refactoring/" },
      //     ],
      //   },
      //   {
      //     text: "前端 AI 应用",
      //     items: [
      //       { text: "AI 聊天机器人集成", link: "/ai/chatbot-integration/" },
      //       { text: "图像识别应用", link: "/ai/image-recognition/" },
      //       { text: "自然语言处理", link: "/ai/nlp-frontend/" },
      //       { text: "推荐系统实现", link: "/ai/recommendation-system/" },
      //     ],
      //   },
      //   {
      //     text: "AI 技术理解",
      //     items: [
      //       { text: "机器学习基础", link: "/ai/ml-basics/" },
      //       { text: "深度学习概念", link: "/ai/deep-learning/" },
      //       { text: "大语言模型原理", link: "/ai/llm-principles/" },
      //       { text: "AI 技术趋势分析", link: "/ai/tech-trends/" },
      //     ],
      //   },
      // ],
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
