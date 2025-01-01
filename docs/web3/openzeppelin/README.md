# OpenZeppelin 介绍

OpenZeppelin 是以太坊智能合约开发中最流行的库,提供了安全、标准化的智能合约实现。

## 主要功能

1. 标准合约实现

   - ERC20
   - ERC721
   - ERC1155
   - 访问控制
   - 代理合约

2. 安全工具

   - 合约审计
   - 自动化测试
   - 形式化验证

3. 开发框架
   - CLI 工具
   - SDK
   - 测试助手

## 快速开始

```bash
# 安装
npm install @openzeppelin/contracts

# 导入合约
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

# 使用合约
contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
```
