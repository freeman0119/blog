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
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '前端开发', link: '/docs/frontend/react/principle' },
      { text: 'Web3', link: '/docs/web3/' }
    ],
    sidebar: [
      {
        text: 'React',
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
        items: [
          { text: '原理', link: '/docs/frontend/vue' },
        ]
      },
      {
        text: '性能优化',
        items: [
          { text: 'sdf', link: '/docs/frontend/vue' },
        ]
      },
    ],
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
