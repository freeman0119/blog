# DApp 前端开发指南

## React 集成

### 基础设置

```javascript
// 安装依赖
npm install ethers @web3-react/core @web3-react/injected-connector

// 配置连接器
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42], // 支持的网络
});

// Web3Provider 组件
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <YourApp />
    </YourApp>
  );
}
```

### 钱包连接组件

```jsx
import { useWeb3React } from "@web3-react/core";

function WalletConnect() {
  const { active, account, library, activate, deactivate } = useWeb3React();

  async function connect() {
    try {
      await activate(injected);
    } catch (error) {
      console.error("连接错误:", error);
    }
  }

  async function disconnect() {
    try {
      deactivate();
    } catch (error) {
      console.error("断开连接错误:", error);
    }
  }

  return (
    <div>
      {active ? (
        <div>
          <div>已连接账户: {account}</div>
          <button onClick={disconnect}>断开连接</button>
        </div>
      ) : (
        <button onClick={connect}>连接钱包</button>
      )}
    </div>
  );
}
```

### 合约交互 Hook

```javascript
import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Contract } from "ethers";

export function useContract(address, ABI) {
  const { library, account } = useWeb3React();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (library && account) {
      const signer = library.getSigner(account);
      const contract = new Contract(address, ABI, signer);
      setContract(contract);
    }
  }, [library, account, address, ABI]);

  return contract;
}

// 使用示例
function TokenBalance() {
  const contract = useContract(tokenAddress, tokenABI);
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (contract) {
      contract.balanceOf(account).then(setBalance);
    }
  }, [contract, account]);

  return <div>余额: {ethers.utils.formatEther(balance)}</div>;
}
```

## Vue 集成

### 基础设置

```javascript
// 创建 Web3 插件
import { ethers } from "ethers";

export const web3Plugin = {
  install(app) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    app.config.globalProperties.$web3 = {
      provider,
      ethers,
      async connect() {
        await provider.send("eth_requestAccounts", []);
        return provider.getSigner();
      },
    };
  },
};

// main.js
import { createApp } from "vue";
import { web3Plugin } from "./plugins/web3";

const app = createApp(App);
app.use(web3Plugin);
```

### 钱包连接组件

```vue
<template>
  <div>
    <div v-if="isConnected">
      <p>已连接账户: {{ account }}</p>
      <button @click="disconnect">断开连接</button>
    </div>
    <button v-else @click="connect">连接钱包</button>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const account = ref("");
    const isConnected = ref(false);

    async function connect() {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        account.value = accounts[0];
        isConnected.value = true;
      } catch (error) {
        console.error("连接错误:", error);
      }
    }

    function disconnect() {
      account.value = "";
      isConnected.value = false;
    }

    onMounted(() => {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          account.value = accounts[0];
          isConnected.value = true;
        } else {
          disconnect();
        }
      });
    });

    return {
      account,
      isConnected,
      connect,
      disconnect,
    };
  },
};
</script>
```

## UI 组件库集成

### Web3Modal

```javascript
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "YOUR-INFURA-ID",
    },
  },
};

const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: true,
  providerOptions,
});

async function connectWallet() {
  try {
    const provider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    return web3Provider;
  } catch (error) {
    console.error("Could not connect to wallet:", error);
  }
}
```

### 常用 UI 组件

```jsx
// 地址显示组件
function AddressDisplay({ address }) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return <span title={address}>{shortAddress}</span>;
}

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

## 最佳实践

### 错误处理

```javascript
// 统一错误处理
function handleError(error) {
  if (error.code === 4001) {
    notification.error({ message: "用户拒绝了交易" });
  } else if (error.code === -32603) {
    notification.error({ message: "交易执行失败" });
  } else {
    notification.error({ message: "发生错误", description: error.message });
  }
}

// 使用示例
try {
  await contract.transfer(to, amount);
} catch (error) {
  handleError(error);
}
```

### 性能优化

```javascript
// 使用 useMemo 缓存合约实例
const contract = useMemo(() => {
  if (library && address) {
    return new Contract(address, ABI, library.getSigner());
  }
}, [library, address]);

// 使用 useCallback 缓存函数
const handleTransfer = useCallback(async () => {
  if (!contract) return;
  await contract.transfer(to, amount);
}, [contract, to, amount]);
```
