import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  bundler: viteBundler(),
  base: '/blog/',
  lang: 'zh-CN',
  title: '我的博客',
  description: '个人博客网站',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'author', content: '您的名字' }],
    ['meta', { name: 'keywords', content: '关键词1, 关键词2' }]
  ],
  theme: defaultTheme({
    home: '/',
    navbar: [
      { text: '首页', link: '/' },
      {
        text: '前端开发',
        children: [
          { text: 'JavaScript进阶', link: '/frontend/javascript/' },
          { text: 'TypeScript', link: '/frontend/typescript/' },
          { text: 'Vue', link: '/frontend/vue/' },
          { text: 'React', link: '/frontend/react/' },
          { text: '工程化', link: '/frontend/engineering/' },
          { text: '性能优化', link: '/frontend/performance/' }
        ]
      },
      {
        text: 'Web3',
        children: [
          { text: '基础概念', link: '/web3/basics/' },
          { text: '智能合约', link: '/web3/smart-contracts/' },
          { text: 'DApp开发', link: '/web3/dapp/' }
        ]
      },
      // { text: '关于', link: '/about/' }
    ],
    sidebar: {
      '/frontend/javascript/': [
        {
          text: 'JavaScript进阶',
          children: [
            '',
            'es6-plus',
            'async-programming',
            'design-patterns',
            'functional-programming'
          ]
        }
      ],
      '/frontend/typescript/': [
        {
          text: 'TypeScript',
          children: [
            '',
            'basic-types',
            'advanced-types',
            'decorators',
            'project-practice'
          ]
        }
      ],
      '/frontend/vue/': [
        {
          text: 'Vue 开发',
          children: [
            '',
            'vue3-composition',
            'vue3-performance',
            'vue-best-practices'
          ]
        }
      ],
      '/frontend/react/': [
        {
          text: 'React 开发',
          children: [
            '',
            'react-hooks',
            'react-state-management',
            'react-performance'
          ]
        }
      ],
      '/frontend/engineering/': [
        {
          text: '前端工程化',
          children: [
            '',
            'webpack-config',
            'vite-practice',
            'ci-cd',
            'code-standards',
            'testing'
          ]
        }
      ],
      '/frontend/performance/': [
        {
          text: '性能优化',
          children: [
            '',
            'loading-optimization',
            'rendering-optimization',
            'caching-strategies',
            'bundle-optimization'
          ]
        }
      ],
      '/web3/': [
        {
          text: 'Web3 开发',
          children: [
            '',
            'blockchain-basics',
            'ethereum-development',
            'solidity-programming'
          ]
        }
      ]
    },
    lastUpdated: true,
    lastUpdatedText: '上次更新',
    // repo: '/',
    docsDir: 'docs'
  }),
  plugins: [
    searchPlugin({
      maxSuggestions: 10
    }),
    backToTopPlugin(),
    mediumZoomPlugin()
  ]
}) 