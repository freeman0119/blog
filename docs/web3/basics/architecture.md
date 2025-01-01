# 区块链架构

## 区块结构

区块是区块链的基本组成单位：

```js
class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data)
    );
  }
}
```

## 区块链网络

P2P 网络实现：

```js
class Node {
  constructor(address) {
    this.address = address;
    this.peers = new Set();
    this.blockchain = [];
  }

  connect(peer) {
    this.peers.add(peer);
    peer.peers.add(this);
  }

  broadcast(message) {
    for (const peer of this.peers) {
      peer.receiveMessage(message);
    }
  }

  receiveMessage(message) {
    // 处理接收到的消息
    if (message.type === "NEW_BLOCK") {
      this.validateAndAddBlock(message.block);
    }
  }
}
```

## 交易池

管理待确认的交易：

```js
class TransactionPool {
  constructor() {
    this.transactions = new Map();
  }

  addTransaction(transaction) {
    const hash = transaction.calculateHash();
    if (this.isValid(transaction)) {
      this.transactions.set(hash, transaction);
    }
  }

  getTransactions(limit) {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.fee - a.fee)
      .slice(0, limit);
  }

  removeTransactions(transactions) {
    for (const tx of transactions) {
      this.transactions.delete(tx.hash);
    }
  }
}
```

## 状态管理

UTXO 模型示例：

```js
class UTXO {
  constructor() {
    this.utxoSet = new Map();
  }

  addUTXO(txId, index, amount, owner) {
    const utxoId = `${txId}:${index}`;
    this.utxoSet.set(utxoId, { amount, owner });
  }

  spendUTXO(utxoId) {
    if (!this.utxoSet.has(utxoId)) {
      throw new Error("UTXO not found");
    }
    const utxo = this.utxoSet.get(utxoId);
    this.utxoSet.delete(utxoId);
    return utxo;
  }

  getBalance(address) {
    return Array.from(this.utxoSet.values())
      .filter((utxo) => utxo.owner === address)
      .reduce((sum, utxo) => sum + utxo.amount, 0);
  }
}
```
