# Hardhat 介绍

Hardhat 是一个专业的以太坊开发环境,提供了完整的开发、测试、部署工具链。

## 核心特性

1. 开发环境

   - 本地以太坊网络
   - 控制台调试
   - Gas 报告
   - 堆栈追踪

2. 测试框架

   - Mocha 集成
   - Waffle 断言
   - 代码覆盖
   - 快照功能

3. 部署工具
   - 多网络部署
   - 合约验证
   - 任务自动化
   - 插件系统

## 快速开始

```bash
# 创建项目
npx hardhat

# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 部署合约
npx hardhat run scripts/deploy.js --network <network-name>
```

## 配置示例

```javascript
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY],
    },
  },
};
```
