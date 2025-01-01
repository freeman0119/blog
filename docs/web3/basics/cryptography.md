# 密码学基础

## 哈希函数

哈希函数是区块链中最基础的密码学工具，具有以下特性：

- 确定性：相同输入产生相同输出
- 不可逆性：无法从哈希值反推原始数据
- 雪崩效应：输入的微小变化导致输出的巨大变化
- 抗碰撞性：很难找到两个不同的输入产生相同的哈希值

### 常用哈希函数

```js
// SHA256
const crypto = require("crypto");
const hash = crypto
  .createHash("sha256")
  .update("Hello, Blockchain!")
  .digest("hex");
console.log(hash);
```

## 非对称加密

区块链使用非对称加密来管理身份和签名：

1. 密钥对生成

```js
const { generateKeyPairSync } = require("crypto");
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
```

2. 数字签名

```js
const sign = crypto.createSign("SHA256");
sign.update("交易数据");
const signature = sign.sign(privateKey, "hex");
```

3. 签名验证

```js
const verify = crypto.createVerify("SHA256");
verify.update("交易数据");
const isValid = verify.verify(publicKey, signature, "hex");
```

## 梅克尔树

梅克尔树（Merkle Tree）用于高效验证大量数据：

```js
class MerkleTree {
  constructor(leaves) {
    this.leaves = leaves.map((x) => SHA256(x));
    this.tree = this.build();
  }

  build() {
    let level = this.leaves;
    while (level.length > 1) {
      level = this.buildLevel(level);
    }
    return level[0]; // root
  }

  buildLevel(level) {
    return level.reduce((result, leaf, i) => {
      if (i % 2 === 0) {
        const hash = SHA256(leaf + (level[i + 1] || leaf));
        result.push(hash);
      }
      return result;
    }, []);
  }
}
```
