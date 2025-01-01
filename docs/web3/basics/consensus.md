# 共识机制

## PoW（工作量证明）

工作量证明是比特币采用的共识机制：

```js
class Block {
  constructor(data, previousHash) {
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    );
  }

  mine(difficulty) {
    while (!this.hash.startsWith("0".repeat(difficulty))) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}
```

## PoS（权益证明）

以太坊 2.0 采用的共识机制：

1. 质押机制

```solidity
contract Staking {
    mapping(address => uint256) public stakes;

    function stake() public payable {
        stakes[msg.sender] += msg.value;
    }

    function withdraw() public {
        require(stakes[msg.sender] > 0, "No stake");
        uint256 amount = stakes[msg.sender];
        stakes[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
```

2. 验证者选择

```js
function selectValidator(validators, seed) {
  const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
  const target = seed % totalStake;

  let accumulator = 0;
  for (const validator of validators) {
    accumulator += validator.stake;
    if (accumulator > target) {
      return validator;
    }
  }
}
```

## DPoS（委托权益证明）

EOS 等采用的共识机制：

```js
class DPoSChain {
  constructor(delegates) {
    this.delegates = delegates;
    this.votes = new Map();
  }

  vote(voter, delegate) {
    this.votes.set(voter, delegate);
  }

  getTopDelegates(count) {
    const voteCount = new Map();
    for (const [_, delegate] of this.votes) {
      voteCount.set(delegate, (voteCount.get(delegate) || 0) + 1);
    }

    return Array.from(voteCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([delegate]) => delegate);
  }
}
```
