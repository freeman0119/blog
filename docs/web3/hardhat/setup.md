# 环境配置

## 安装

```bash
mkdir my-project
cd my-project
npm init -y
npm install --save-dev hardhat
```

## 项目结构

```
my-project/
├── contracts/           # 智能合约目录
├── scripts/            # 部署脚本
├── test/               # 测试文件
├── hardhat.config.js   # Hardhat 配置
└── package.json
```

## 网络配置

```javascript
module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hardhat: {
      // 本地测试网络
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY],
      gasPrice: 120000000000,
    },
  },
};
```
