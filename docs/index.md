---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "前端技术博客"
  text: "探索现代前端开发"
  tagline: 从传统框架到Web3，记录技术成长的每一步
  image:
    src: /avatar.svg
    alt: 博客头像
  actions:
    - theme: brand
      text: 开始阅读
      link: /frontend/react/concurrent-features
    - theme: alt
      text: 关于我
      link: /about

features:
  - icon: ⚡️
    title: 前端框架深度解析
    details: 深入探讨 React、Vue 等主流框架的原理、最佳实践和跨端开发技巧
  - icon: 🛠️
    title: 工程化实战经验
    details: 分享 Webpack、Vite、Docker 等工具的配置优化和DevOps最佳实践
  - icon: 🤖
    title: AI 驱动开发
    details: 探索 ChatGPT、Copilot 等AI工具在开发中的应用，提升编程效率
  - icon: 🚀
    title: Web3 技术探索
    details: 从智能合约到 DeFi，探索区块链技术在前端开发中的应用
  - icon: 📈
    title: 性能优化专题
    details: 深入研究前端性能优化策略，提升用户体验和开发效率
  - icon: 💡
    title: 技术趋势洞察
    details: 关注前端技术发展趋势，分享对新技术的思考和实践
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
