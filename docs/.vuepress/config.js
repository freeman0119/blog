import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'
import { viteBundler } from '@vuepress/bundler-vite'
import { getDirname, path } from '@vuepress/utils'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
  bundler: viteBundler(),
  alias: {
    '@theme/styles': path.resolve(__dirname, 'styles')
  },
  base: '/blog/',
  lang: 'zh-CN',
  title: '我的博客',
  description: '个人博客网站',
  head: [
    ['link', { rel: 'icon', href: '/blog/favicon.png' }],
    ['meta', { name: 'author', content: '您的名字' }],
    ['meta', { name: 'keywords', content: '关键词1, 关键词2' }]
  ],
  theme: defaultTheme({
    home: '/',
    contributors: false,
    navbar: [
      { text: '首页', link: '/' },
      {
        text: '前端开发',
        children: [
          { text: 'JavaScript进阶', link: '/frontend/javascript/' },
          // { text: 'TypeScript', link: '/frontend/typescript/' },
          // { text: 'Vue', link: '/frontend/vue/' },
          // { text: 'React', link: '/frontend/react/' },
          // { text: '工程化', link: '/frontend/engineering/' },
          // { text: '性能优化', link: '/frontend/performance/' }
        ]
      },
      {
        text: 'Web3',
        children: [
          { text: '基础概念', link: '/web3/basics/' },
          { text: '智能合约', link: '/web3/smart-contracts/' },
          { text: 'DApp开发', link: '/web3/dapp/' },
          { text: 'openzeppelin', link: '/web3/openzeppelin/' },
          { text: 'hardhat', link: '/web3/hardhat/' },

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
            'promiseA+',
            'es6-plus',
            'hybrid',
            // 'async-programming',
            // 'design-patterns',
            // 'functional-programming'
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
      '/web3/basics/': [
        {
          text: '基础概念',
          children: [
            '',
            'advanced-concepts',
            'high-concepts',
            // 'cryptography',
            // 'consensus',
            // 'architecture',
          ]
        }
      ],
      '/web3/smart-contracts/': [
        {
          text: '智能合约',
          children: [
            '',
            'solidity-basics',
            'security',
            'upgrades'
          ]
        }
      ],
      '/web3/dapp/': [
        {
          text: 'DApp 开发',
          children: [
            '',              // DApp 介绍
            'web3js',       // Web3.js 使用指南
            'interactions',  // DApp 与智能合约交互
            'ethers',       // Ethers.js 使用指南
            'libraries',    // DApp 常用库
            'web3-compare', // Web3.js vs Ethers.js
            'best-practices' // DApp 开发注意事项
          ]
        }
      ],
      '/web3/openzeppelin/': [
        {
          text: 'OpenZeppelin',
          children: [
            '',  // 介绍
            'contracts', // 常用合约
            'upgrades',  // 可升级合约
            'security',  // 安全工具
            'defender'   // Defender平台
          ]
        }
      ],
      '/web3/hardhat/': [
        {
          text: 'Hardhat',
          children: [
            '',          // 介绍
            'setup',     // 环境配置 
            'testing',   // 测试
            'deploy',    // 部署
            'plugins',   // 插件使用
            'debugging'  // 调试技巧
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