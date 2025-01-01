# DApp 安全与优化

## 安全最佳实践

### 合约交互安全

```javascript
// 1. 检查网络状态
async function checkNetwork() {
  const { chainId } = await provider.getNetwork();
  if (chainId !== expectedChainId) {
    throw new Error("请切换到正确的网络");
  }
}

// 2. 交易确认检查
async function waitForTransaction(tx) {
  const receipt = await tx.wait(2); // 等待2个区块确认
  if (!receipt.status) {
    throw new Error("交易失败");
  }
  return receipt;
}

// 3. 金额验证
function validateAmount(amount) {
  const parsedAmount = ethers.utils.parseEther(amount);
  if (parsedAmount.lte(0)) {
    throw new Error("金额必须大于0");
  }
  return parsedAmount;
}
```

### 输入验证

```javascript
// 地址验证
function validateAddress(address) {
  if (!ethers.utils.isAddress(address)) {
    throw new Error("无效的地址格式");
  }
  // 检查是否为零地址
  if (address === ethers.constants.AddressZero) {
    throw new Error("不能使用零地址");
  }
  return address;
}

// 数据签名验证
async function verifySignature(message, signature, expectedSigner) {
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  if (recoveredAddress.toLowerCase() !== expectedSigner.toLowerCase()) {
    throw new Error("签名验证失败");
  }
  return true;
}
```

## 性能优化

### 数据缓存

```javascript
// 使用 React Query 缓存链上数据
import { useQuery } from "react-query";

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

// 使用 localStorage 缓存用户设置
const CACHE_KEY = "web3_settings";

function saveSettings(settings) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const cached = localStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached) : defaultSettings;
}
```

### 批量请求

```javascript
// 使用 Multicall 合约批量获取数据
import { Contract as MulticallContract } from "ethers-multicall";

async function batchGetBalances(addresses) {
  const multicallProvider = new Provider(provider);
  await multicallProvider.init();

  const multicallContract = new MulticallContract(tokenAddress, tokenABI);

  const calls = addresses.map((address) =>
    multicallContract.balanceOf(address)
  );

  const results = await multicallProvider.all(calls);
  return results;
}
```

## 错误恢复

### 交易重试机制

```javascript
async function sendTransactionWithRetry(txPromise, maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const tx = await txPromise();
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      attempt++;
      if (attempt === maxAttempts) throw error;

      // 指数退避
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// 使用示例
const tx = () => contract.transfer(to, amount);
await sendTransactionWithRetry(tx);
```

### 状态恢复

```javascript
// 保存交易状态
function saveTransactionState(tx) {
  const transactions = JSON.parse(
    localStorage.getItem("pending_transactions") || "[]"
  );

  transactions.push({
    hash: tx.hash,
    timestamp: Date.now(),
    data: tx.data,
  });

  localStorage.setItem("pending_transactions", JSON.stringify(transactions));
}

// 恢复未完成的交易
async function recoverPendingTransactions() {
  const transactions = JSON.parse(
    localStorage.getItem("pending_transactions") || "[]"
  );

  for (const tx of transactions) {
    try {
      const receipt = await provider.getTransactionReceipt(tx.hash);
      if (receipt) {
        // 交易已完成，从列表中移除
        removePendingTransaction(tx.hash);
      } else {
        // 交易未完成，显示在UI中
        addToPendingList(tx);
      }
    } catch (error) {
      console.error("恢复交易状态失败:", error);
    }
  }
}
```

## 监控和日志

```javascript
// 交易监控
function monitorTransaction(tx) {
  // 发送到监控服务
  const monitorData = {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value.toString(),
    timestamp: Date.now(),
  };

  sendToMonitoring(monitorData);

  // 记录到本地日志
  console.log("[Transaction]", {
    type: "send",
    ...monitorData,
  });
}

// 错误追踪
function trackError(error, context) {
  // 发送到错误追踪服务
  const errorData = {
    message: error.message,
    code: error.code,
    context,
    timestamp: Date.now(),
  };

  sendToErrorTracking(errorData);

  // 记录到本地日志
  console.error("[Error]", {
    type: "error",
    ...errorData,
  });
}
```
