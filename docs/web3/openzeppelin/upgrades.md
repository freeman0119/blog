# 可升级合约

OpenZeppelin 提供了完整的可升级合约解决方案。

## 代理模式

```solidity
// 实现合约
contract BoxV1 {
    uint256 private value;

    function store(uint256 newValue) public {
        value = newValue;
    }

    function retrieve() public view returns (uint256) {
        return value;
    }
}

// 升级后的合约
contract BoxV2 is BoxV1 {
    function increment() public {
        store(retrieve() + 1);
    }
}
```

## 部署可升级合约

```javascript
const { deployProxy } = require("@openzeppelin/hardhat-upgrades");

async function main() {
  const Box = await ethers.getContractFactory("Box");
  const box = await deployProxy(Box, [42], { initializer: "store" });
  await box.deployed();

  console.log("Box deployed to:", box.address);
}
```

## 升级合约

```javascript
const { upgradeProxy } = require("@openzeppelin/hardhat-upgrades");

async function main() {
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  const box = await upgradeProxy(PROXY_ADDRESS, BoxV2);
  console.log("Box upgraded");
}
```
