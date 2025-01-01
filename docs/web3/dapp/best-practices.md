# DApp 开发最佳实践

## 架构设计

### 1. 前后端分离

```
前端 (React/Vue)
    ↓
Web3 中间层
    ↓
智能合约
```

### 2. 数据存储

- 链上数据：关键业务数据和状态
- 链下数据：用户界面和辅助信息
- IPFS：大文件和媒体内容

```javascript
// 链上数据示例
contract DataStorage {
    mapping(address => UserData) public userData;

    struct UserData {
        uint256 id;
        uint256 timestamp;
        bytes32 dataHash;  // IPFS 哈希
    }
}

// 链下数据示例
const userProfile = {
    avatar: `ipfs://${avatarHash}`,
    preferences: JSON.stringify(userPrefs),
    lastAccess: Date.now()
};
```

## 性能优化

### 1. 批量处理

```javascript
// 使用 Multicall 合约
const multicall = new Multicall({
  multicallAddress: MULTICALL_ADDRESS,
  provider,
});

// 批量获取数据
const calls = tokens.map((token) => ({
  target: token.address,
  call: ["balanceOf(address)(uint256)", userAddress],
}));

const balances = await multicall.call(calls);
```

### 2. 缓存策略

```javascript
// 使用 React Query 缓存
function useTokenBalance(address) {
  return useQuery(
    ["balance", address],
    async () => {
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    },
    {
      staleTime: 30000, // 30秒后重新获取
      cacheTime: 3600000, // 缓存1小时
    }
  );
}
```

## 安全实践

### 1. 输入验证

```javascript
// 地址验证
function validateAddress(address) {
  if (!ethers.utils.isAddress(address)) {
    throw new Error("无效的地址格式");
  }
  if (address === ethers.constants.AddressZero) {
    throw new Error("不能使用零地址");
  }
  return address;
}

// 金额验证
function validateAmount(amount, decimals = 18) {
  const parsedAmount = ethers.utils.parseUnits(amount, decimals);
  if (parsedAmount.lte(0)) {
    throw new Error("金额必须大于0");
  }
  return parsedAmount;
}
```

### 2. 交易安全

```javascript
// 交易确认
async function safeTransaction(tx) {
  const receipt = await tx.wait(2); // 等待2个区块确认
  if (!receipt.status) {
    throw new Error("交易失败");
  }
  return receipt;
}

// 签名验证
async function verifySignature(message, signature, expectedSigner) {
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  if (recoveredAddress.toLowerCase() !== expectedSigner.toLowerCase()) {
    throw new Error("签名验证失败");
  }
  return true;
}
```

## 用户体验

### 1. 错误处理

```javascript
// 统一错误处理
function handleError(error) {
  if (error.code === 4001) {
    notification.error({ message: "用户拒绝了交易" });
  } else if (error.code === -32603) {
    notification.error({ message: "交易执行失败" });
  } else if (error.message.includes("insufficient funds")) {
    notification.error({ message: "余额不足" });
  } else {
    notification.error({
      message: "发生错误",
      description: error.message,
    });
  }
}
```

### 2. 加载状态

```javascript
// 交易状态组件
function TransactionStatus({ hash }) {
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    async function checkStatus() {
      const receipt = await provider.getTransactionReceipt(hash);
      setStatus(receipt ? (receipt.status ? "success" : "failed") : "pending");
    }
    checkStatus();
  }, [hash]);

  return (
    <div className={`status ${status}`}>
      {status === "pending" && <Spinner />}
      {status === "success" && "交易成功"}
      {status === "failed" && "交易失败"}
    </div>
  );
}
```

## 测试策略

### 1. 单元测试

```javascript
describe("Token Contract", () => {
  let token;
  let owner;
  let addr1;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();
    await token.deployed();
  });

  it("Should transfer tokens", async () => {
    await token.transfer(addr1.address, 50);
    expect(await token.balanceOf(addr1.address)).to.equal(50);
  });
});
```

### 2. 集成测试

```javascript
describe("DApp Integration", () => {
  it("Should interact with multiple contracts", async () => {
    // 部署合约
    const token = await deployToken();
    const vault = await deployVault();

    // 执行交互
    await token.approve(vault.address, amount);
    await vault.deposit(amount);

    // 验证结果
    expect(await vault.balanceOf(owner.address)).to.equal(amount);
  });
});
```

## 部署流程

### 1. 环境配置

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    hardhat: {
      // 本地测试网络
    },
    testnet: {
      url: process.env.TESTNET_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

### 2. 自动化部署

```javascript
// deploy.js
async function main() {
  // 部署合约
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  // 验证合约
  await hre.run("verify:verify", {
    address: token.address,
    constructorArguments: [],
  });

  // 更新前端配置
  updateConfig({
    tokenAddress: token.address,
    networkId: network.config.chainId,
  });
}
```
