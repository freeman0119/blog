# Aave V3 项目架构分析

## 简介

aave 是去中心化 Defi 协议，用户可以在上面存款、贷款、闪电贷等。

官网：[https://aave.com](https://aave.com)

## 项目架构

```yml
contracts/
├── dependencies/ # 外部依赖合约
├── deployments/ # 部署相关合约
├── flashloan/ # 闪电贷相关合约
├── interfaces/ # 接口定义
├── misc/ # 杂项合约
├── mocks/ # 测试模拟合约
└── protocol/ # 核心协议合约
├── configuration/ # 配置相关
├── libraries/ # 库合约
├── pool/ # 流动性池相关
└── tokenization/ # 代币化相关
```

## 核心逻辑

资金池模块，是 aave 的核心模块，它管理着所有存款和贷款。关键功能：

- supply：存款。用户调用传入资产类型和数额,合约记录存款、增发 aToken、更新资产等。
- withdraw：取款。合约销毁对应 aToken、减少资产、转移资产到用户账户。
- borrow: 借款。合约检查抵押率,为用户增发债务 token,并转移借出资产到用户账户。
- repay: 还款。合约记录还款数额,销毁对应债务 token,更新资产。
- liquidationCall: 清算。触发条件为抵押率低于清算阈值,合约出售抵押资产偿还债务。

### 存款

以在银行存款进行举例，我们将现金存入银行账户，银行会给我们一个存储凭证。同样我们将资金存到 aave 协议中，aave 会给我们铸造对应的 aToken 做为凭证。

**流程图**
![](/images/project01.png)
**存款流程整体分两步**

**源码分析**
:::info 1. 用户调用 supply 方法

```solidity
// 用户调用入口
function supply(
    address asset,      // 要存入的 ERC20 代币地址
    uint256 amount,    // 要存入的代币数量
    address onBehalfOf,// 存款受益人的地址（可以是调用者自己或其他人）
    uint16 referralCode// 推荐码，用于追踪存款来源
) public virtual override {
  SupplyLogic.executeSupply(
    _reserves, // 所有资产数据
    _reservesList, // 所有支持的资产地址
    _usersConfig[onBehalfOf],
    DataTypes.ExecuteSupplyParams({
      asset: asset,
      amount: amount,
      onBehalfOf: onBehalfOf,
      referralCode: referralCode
    })
  );
}
```

:::

:::info 2. 存款执行流程，调用 executeSupply

```solidity
  function executeSupply(
    mapping(address => DataTypes.ReserveData) storage reservesData,
    mapping(uint256 => address) storage reservesList,
    DataTypes.UserConfigurationMap storage userConfig,
    DataTypes.ExecuteSupplyParams memory params
  ) external {
    // 获取资产数据
    DataTypes.ReserveData storage reserve = reservesData[params.asset];
    // 创建资产缓存
    DataTypes.ReserveCache memory reserveCache = reserve.cache();
    // 更新资产状态
    reserve.updateState(reserveCache);
    // 验证存款参数
    ValidationLogic.validateSupply(reserveCache, reserve, params.amount);
    // 更新利率
    reserve.updateInterestRates(reserveCache, params.asset, params.amount, 0);
    // 将代币从用户转移到协议
    IERC20(params.asset).safeTransferFrom(msg.sender, reserveCache.aTokenAddress, params.amount);
    // 铸造 aToken 给用户
    bool isFirstSupply = IAToken(reserveCache.aTokenAddress).mint(
      msg.sender, // 存款操作执行者
      params.onBehalfOf, // aToken 接收者
      params.amount, // 铸造数量
      reserveCache.nextLiquidityIndex // 下一个流动性指数
    );
    // 如果是首次存款，检查是否可以作为抵押品
    if (isFirstSupply) {
      if (
        ValidationLogic.validateAutomaticUseAsCollateral(
          reservesData,
          reservesList,
          userConfig,
          reserveCache.reserveConfiguration,
          reserveCache.aTokenAddress
        )
      ) {
        userConfig.setUsingAsCollateral(reserve.id, true);
        emit ReserveUsedAsCollateralEnabled(params.asset, params.onBehalfOf);
      }
    }
    // 触发存款事件
    emit Supply(params.asset, msg.sender, params.onBehalfOf, params.amount, params.referralCode);
  }
```

:::

**这里有 3 个需要注意的点：**

在执行存逻辑时：

先更新了资产状态 `reserve.updateState(reserveCache);`

然后更新了利率 `reserve.updateInterestRates(...)`

最后转移代币` IERC20(params.asset).safeTransferFrom(...)`，并铸造 aToken

**updateState 源码**

```solidity
function updateState(
  DataTypes.ReserveData storage reserve,
  DataTypes.ReserveCache memory reserveCache
) internal {
  // 如果时间相等，说明不需要更新，直接跳过
  if (reserve.lastUpdateTimestamp == uint40(block.timestamp)) {
    return;
  }

  // 更新流动性指数（liquidityIndex） 和 借款指数（variableBorrowIndex）。
  // liquidityIndex 会影响存款人的利息计算
  // variableBorrowIndex 会影响借款人的利息计算
  _updateIndexes(reserve, reserveCache);

  // 计算并将产生的利息收入（利息）归集到资金池的金库
  _accrueToTreasury(reserve, reserveCache);

  reserve.lastUpdateTimestamp = uint40(block.timestamp);
}
```

先更新资金池状态的原因是因为每一笔存款，都会导致资金池状态的变化，为了不影响之前资产的利息，需要在先计算之前的利息，之后再执行存款的操作。

**之后更新利率的原因是为了让新存入的资金，获得正确的利率进行利息的计算，如果不更新利率，那么新存入的资金，会获得之前资产利率，导致利息计算错误。**

:::info 铸造 aToken

```solidity
bool isFirstSupply = IAToken(reserveCache.aTokenAddress).mint(
  msg.sender,
  params.onBehalfOf,
  params.amount,
  reserveCache.nextLiquidityIndex // 用于计算利息
);
```

:::

### 取款

在 aave 中取款时，使用 aToken 做为凭证取回我们存入的资产。

取回资产后资金池的总量发生了变化，导致资金使用率发生变化 --> 贷款利率发生变换 --> 存储利率发生变化。所以需要重新计算贷款利率、存款利率。

```solidity
function withdraw(
  address asset,
  uint256 amount,
  address to
) public virtual override returns (uint256) {
  return
    SupplyLogic.executeWithdraw(
      _reserves,
      _reservesList,
      _eModeCategories,
      _usersConfig[msg.sender],
      DataTypes.ExecuteWithdrawParams({
        asset: asset,
        amount: amount,
        to: to,
        reservesCount: _reservesCount,
        oracle: ADDRESSES_PROVIDER.getPriceOracle(),
        userEModeCategory: _usersEModeCategory[msg.sender]
      })
    );
}
```
