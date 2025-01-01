# 测试

## 单元测试

```javascript
const { expect } = require("chai");

describe("Token", function () {
  it("Should return the new token name", async function () {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.deployed();

    expect(await token.name()).to.equal("MyToken");
  });
});
```

## 测试覆盖率

```bash
# 安装 solidity-coverage
npm install --save-dev solidity-coverage

# 运行覆盖率测试
npx hardhat coverage
```

## 快照测试

```javascript
describe("Staking", function () {
  it("Should revert when staking amount is too low", async function () {
    await expect(
      staking.stake({ value: ethers.utils.parseEther("0.1") })
    ).to.be.revertedWith("Stake amount too low");
  });
});
```
