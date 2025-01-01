# 插件使用

## 常用插件

1. hardhat-ethers
   - 以太坊开发工具
   - 合约交互
   - 钱包管理

```javascript
require("@nomiclabs/hardhat-ethers");

// 使用示例
const Token = await ethers.getContractFactory("Token");
const token = await Token.deploy();
```

2. hardhat-waffle
   - 测试框架
   - 断言库
   - 模拟功能

```javascript
require("@nomiclabs/hardhat-waffle");

// 测试示例
expect(await token.balanceOf(wallet.address)).to.equal(
  ethers.utils.parseEther("1.0")
);
```

## 自定义插件

```javascript
// myplugin.js
module.exports = function () {
  return {
    name: "my-plugin",

    // 扩展配置
    extendConfig: (config, userConfig) => {
      config.myPlugin = {
        enabled: true,
        ...userConfig.myPlugin,
      };
    },

    // 添加任务
    task:
      ("my-task",
      "Task description",
      async (args, hre) => {
        // 任务实现
      }),

    // 扩展环境
    extendEnvironment: (hre) => {
      hre.myFunction = () => {
        // 自定义功能
      };
    },
  };
};
```

## 插件配置

```javascript
// hardhat.config.js
require("./myplugin");

module.exports = {
  solidity: "0.8.4",
  myPlugin: {
    // 插件配置选项
    option1: "value1",
    option2: true,
  },
};
```

## 常见插件列表

1. 开发工具

   - hardhat-deploy
   - hardhat-etherscan
   - hardhat-gas-reporter

2. 测试工具

   - hardhat-coverage
   - hardhat-tracer
   - hardhat-docgen

3. 安全工具
   - hardhat-contract-sizer
   - hardhat-abi-exporter
   - hardhat-upgrades
