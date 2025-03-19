import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "三石的博客",
  description: "前端与Web3技术博客",
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
  ],
  themeConfig: {
    // logo
    logo: '/logo.svg',
    // 导航栏Logo
    siteTitle: '三石的博客',
    outline: [2,3],
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '前端开发', link: '/docs/frontend/react/principle' },
      { text: 'Web3', link: '/docs/web3/' }
    ],
    sidebar: {
      '/docs/frontend':[{
        text: 'React',
        collapsed: true,
        items: [
          { text: '原理', link: '/docs/frontend/react/principle' },
          { text: '使用', link: '/docs/frontend/react/usage' },
          { text: '性能优化', link: '/docs/frontend/react/perf-optimize' },
          { text: '错误捕获', link: '/docs/frontend/react/error-catch' },
          { text: 'React19新特性', link: '/docs/frontend/react/v19-feature' },
        ]
      },
      {
        text: 'Vue',
        collapsed: true,
        items: [
          { text: '原理', link: '/docs/frontend/vue/principle' },
          { text: '使用', link: '/docs/frontend/vue/usage' },
          { text: '性能优化', link: '/docs/frontend/vue/perf-optimize' },
          { text: '错误捕获', link: '/docs/frontend/vue/error-catch' },
        ]
      },
      {
        text: '高级进阶',
        collapsed: true,
        items: [
          { text: '实现promise', link: '/docs/frontend/high-advanced/promise' },
          { text: 'Hybrid原理', link: '/docs/frontend/high-advanced/js-bridge' },
        ]
      }],
      '/docs/web3':[
        {
          text: 'dapp',
          collapsed: true,
          items: []
        }
      ]
    },
    // 社交链接
    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/yourusername/blog2' }
    // ],
    search: {
      provider: 'local'
    },
    // 页脚
    footer: {
      message: '用技术改变世界',
      copyright: 'Copyright © 2024-present'
    }
  }
})
