# 部署

## 基本部署脚本

```javascript
const main = async () => {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("MyToken", "MTK");
  await token.deployed();

  console.log("Token deployed to:", token.address);

  // 验证合约
  await hre.run("verify:verify", {
    address: token.address,
    constructorArguments: ["MyToken", "MTK"],
  });
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 多网络部署

```javascript
task("deploy", "Deploys the contract").setAction(async (taskArgs, hre) => {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log(`Deployed to ${token.address} on ${hre.network.name}`);

  if (hre.network.name !== "hardhat") {
    await token.deployTransaction.wait(6); // 等待确认
    await verify(token.address, []);
  }
});
```

## 部署配置

```javascript
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // 网络配置
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
```
