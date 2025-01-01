# OpenZeppelin 合约库

## 代币标准

### ERC20 代币

```solidity
// 基础 ERC20
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

// 可销毁的 ERC20
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BurnableToken is ERC20Burnable {
    constructor() ERC20("Burnable Token", "BTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

// 可快照的 ERC20
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";

contract SnapshotToken is ERC20Snapshot {
    constructor() ERC20("Snapshot Token", "STK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function snapshot() public onlyOwner {
        _snapshot();
    }
}
```

### ERC721 NFT

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract GameItem is ERC721, ERC721URIStorage, ERC721Enumerable {
    constructor() ERC721("GameItem", "ITEM") {}

    function safeMint(address to, uint256 tokenId, string memory uri) public {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // 覆盖必要的函数
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

### ERC1155 多代币

```solidity
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract GameItems is ERC1155 {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant SWORD = 2;
    uint256 public constant SHIELD = 3;

    constructor() ERC1155("https://game.example/api/item/{id}.json") {
        _mint(msg.sender, GOLD, 10**18, "");
        _mint(msg.sender, SILVER, 10**27, "");
        _mint(msg.sender, SWORD, 1000, "");
        _mint(msg.sender, SHIELD, 2000, "");
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public {
        _mint(account, id, amount, data);
    }
}
```

## 访问控制

### 基础访问控制

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    function normalThing() public {
        // 任何人都可以调用
    }

    function specialThing() public onlyOwner {
        // 只有所有者可以调用
    }
}
```

### 角色控制

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ModularAccess is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        // 铸造逻辑
    }

    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        // 销毁逻辑
    }
}
```

## 安全工具

### 重入保护

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    mapping(address => uint256) private _balances;

    function withdraw() public nonReentrant {
        uint256 balance = _balances[msg.sender];
        require(balance > 0, "No balance");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");

        _balances[msg.sender] = 0;
    }
}
```

### 暂停功能

```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract Token is ERC20, Pausable {
    constructor() ERC20("MyToken", "MTK") {}

    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
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

## 代理和升级

### 透明代理

```solidity
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

// 实现合约
contract BoxV1 {
    uint256 private _value;

    function store(uint256 value) public {
        _value = value;
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }
}

// 升级后的合约
contract BoxV2 is BoxV1 {
    function increment() public {
        store(retrieve() + 1);
    }
}
```

### 使用 Hardhat 部署可升级合约

```javascript
const { ethers, upgrades } = require("hardhat");

async function main() {
  // 部署 V1
  const BoxV1 = await ethers.getContractFactory("BoxV1");
  const box = await upgrades.deployProxy(BoxV1, [42], { initializer: "store" });
  await box.deployed();
  console.log("Box deployed to:", box.address);

  // 升级到 V2
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  const upgraded = await upgrades.upgradeProxy(box.address, BoxV2);
  console.log("Box upgraded");
}
```

## 工具和实用程序

### 密码学工具

```solidity
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Verifier {
    using ECDSA for bytes32;

    function verifySignature(bytes32 hash, bytes memory signature, address signer) public pure returns (bool) {
        return hash.recover(signature) == signer;
    }

    function verifyMerkleProof(bytes32[] memory proof, bytes32 root, bytes32 leaf) public pure returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }
}
```

### 数学运算

```solidity
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract MathExample {
    using SafeMath for uint256;

    function safeMath(uint256 a, uint256 b) public pure returns (uint256) {
        return a.add(b);  // 安全加法
    }

    function maxValue(uint256 a, uint256 b) public pure returns (uint256) {
        return Math.max(a, b);
    }
}
```
