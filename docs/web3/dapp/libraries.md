# DApp 常用库

## 区块链交互

### 1. Web3 Provider

```javascript
// ethers.js Provider
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

// MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);

// WalletConnect
const wcProvider = new WalletConnectProvider({
  infuraId: "YOUR_INFURA_ID",
});
```

### 2. IPFS 客户端

```javascript
// IPFS HTTP Client
import { create } from "ipfs-http-client";

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

// 上传文件
const file = await ipfs.add(buffer);
console.log("IPFS Hash:", file.path);

// 获取文件
const chunks = [];
for await (const chunk of ipfs.cat(hash)) {
  chunks.push(chunk);
}
```

## UI 组件库

### 1. Web3Modal

```javascript
import Web3Modal from "web3modal";

const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "YOUR_INFURA_ID",
      },
    },
  },
});

// 连接钱包
const provider = await web3Modal.connect();
```

### 2. wagmi

```javascript
import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

// React 组件
function App() {
  return (
    <WagmiConfig client={client}>
      <YourApp />
    </WagmiConfig>
  );
}
```

## 数据处理

### 1. ethers-multicall

```javascript
import { Provider } from "ethers-multicall";

const multicallProvider = new Provider(provider);
await multicallProvider.init();

// 批量调用
const calls = [contract.balanceOf(address1), contract.balanceOf(address2)];
const [balance1, balance2] = await multicallProvider.all(calls);
```

### 2. web3-utils

```javascript
import Web3Utils from "web3-utils";

// 单位转换
const weiValue = Web3Utils.toWei("1", "ether");
const etherValue = Web3Utils.fromWei("1000000000000000000");

// 哈希计算
const hash = Web3Utils.keccak256("Hello");
const solidityHash = Web3Utils.soliditySha3("Hello");
```

## 开发工具

### 1. hardhat-ethers

```javascript
import { ethers } from "hardhat";

async function deploy() {
  const Contract = await ethers.getContractFactory("MyContract");
  const contract = await Contract.deploy();
  await contract.deployed();

  return contract;
}
```

### 2. @openzeppelin/contracts

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
```

## 测试工具

### 1. Waffle

```javascript
import { expect } from "chai";
import { waffle } from "hardhat";

describe("Token", () => {
  it("Should transfer tokens", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const token = await deployContract(owner, TokenArtifact);

    await token.transfer(addr1.address, 50);
    expect(await token.balanceOf(addr1.address)).to.equal(50);
  });
});
```

### 2. Jest

```javascript
import { jest } from "@jest/globals";

describe("Web3 Service", () => {
  beforeEach(() => {
    jest.spyOn(web3.eth, "getBalance");
  });

  it("Should get balance", async () => {
    const balance = await getBalance(address);
    expect(web3.eth.getBalance).toHaveBeenCalledWith(address);
  });
});
```

## 安全工具

### 1. eth-sig-util

```javascript
import { signTypedData, recoverTypedSignature } from "eth-sig-util";

// 签名数据
const signature = signTypedData({
  privateKey: Buffer.from(privateKey, "hex"),
  data: typedData,
  version: "V4",
});

// 恢复签名者
const signer = recoverTypedSignature({
  data: typedData,
  signature: signature,
  version: "V4",
});
```

### 2. ethereumjs-util

```javascript
import {
  toChecksumAddress,
  isValidPrivate,
  hashPersonalMessage,
} from "ethereumjs-util";

// 地址校验
const validAddress = toChecksumAddress(address);
const isValid = isValidPrivate(Buffer.from(privateKey, "hex"));

// 消息哈希
const messageHash = hashPersonalMessage(Buffer.from(message));
```
