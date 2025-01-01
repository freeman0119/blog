# 智能合约开发

## Solidity 基础

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private value;

    event ValueChanged(uint256 newValue);

    function setValue(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}
```

## 合约安全

主要安全考虑：

1. 重入攻击防护

```solidity
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}
```

2. 整数溢出检查

```solidity
using SafeMath for uint256;

function add(uint256 a, uint256 b) public pure returns (uint256) {
    return a.add(b);
}
```

## 合约升级

使用代理模式实现升级：

```solidity
contract Proxy {
    address public implementation;

    function upgrade(address newImplementation) external {
        implementation = newImplementation;
    }

    fallback() external payable {
        // 委托调用到实现合约
        (bool success,) = implementation.delegatecall(msg.data);
        require(success);
    }
}
```
