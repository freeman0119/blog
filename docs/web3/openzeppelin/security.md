# 安全工具

OpenZeppelin 提供了多种安全工具和最佳实践。

## 重入防护

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    mapping(address => uint256) private balances;

    function withdraw() public nonReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");

        balances[msg.sender] = 0;
    }
}
```

## 暂停机制

```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract Token is ERC20, Pausable {
    function transfer(address to, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.transfer(to, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
```

## 权限控制

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Governance is AccessControl {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function propose(bytes memory data) public onlyRole(PROPOSER_ROLE) {
        // 提案逻辑
    }

    function execute(uint256 proposalId) public onlyRole(EXECUTOR_ROLE) {
        // 执行逻辑
    }
}
```
