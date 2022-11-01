如何使用 Conflux RPC-bridge 服务
===

## RPC-bridge
Conflux 社区开发了一个 RPC bridge 服务，能够将 Conflux 的 RPC 适配成以太坊的 RPC。意味着可以直接将此 RPC 配置到以太坊钱包，SDK，工具中，并同 Conflux 网络进行交互。

### 目前可以适配的方法

```js
const ETH_TO_CFX_METHOD_MAPPER = {
  eth_blockNumber: 'cfx_epochNumber',
  eth_sendRawTransaction: 'cfx_sendRawTransaction',
  eth_sendTransaction: 'cfx_sendTransaction',
  eth_getBalance: 'cfx_getBalance',
  eth_call: 'cfx_call',
  eth_estimateGas: 'cfx_estimateGasAndCollateral',
  eth_gasPrice: 'cfx_gasPrice',
  eth_accounts: 'accounts',
  eth_getTransactionCount: 'cfx_getNextNonce',
  eth_getCode: 'cfx_getCode',
  eth_getStorageAt: 'cfx_getStorageAt',
  eth_getBlockByHash: 'cfx_getBlockByHash',
  eth_getBlockByNumber: 'cfx_getBlockByEpochNumber',
  eth_getTransactionByHash: 'cfx_getTransactionByHash',
  web3_clientVersion: 'cfx_clientVersion',
  eth_chainId: 'cfx_getStatus',
  net_version: 'cfx_getStatus',   // networkId
  eth_getTransactionReceipt: 'cfx_getTransactionReceipt',
  eth_getLogs: 'cfx_getLogs',
  eth_getBlockTransactionCountByHash: 'cfx_getBlockByHash',
  eth_getBlockTransactionCountByNumber: 'cfx_getBlockByEpochNumber',
  eth_getTransactionByBlockHashAndIndex: 'cfx_getBlockByHash',
  eth_getTransactionByBlockNumberAndIndex: 'cfx_getBlockByEpochNumber',
  // eth_coinbase: null,
  eth_sign: 'sign',
  eth_signTransaction: 'cfx_signTransaction',
  web3_sha3: 'cfx_sha3',
};
```

### blockNumber
Conflux 的账本结构为树图结构，其中引入了一个 epoch 的概念，一个 epoch 中可能会有多个 block，epochNumber 是 Conflux 树图的 pivot chain 上区块的区块号。而 Conflux 的 blockNumber 为整个树图所有区块排全序之后区块的编码，即 blockNumber 用于表示 block 在树图中的唯一序列号。可以理解为 blockNumber = epochNumber + blockIndexInEpoch

`cfx_epochNumber` 方法用于获取当前树图的 epochNumber，也就是 pivot chain 的 blockNumber。
`cfx_getBlockByEpochNumber` 方法用于获取 epochNumber 所对应的轴区块。

目前 bridge 服务使用 conflux 的 epochNumber 来适配以太坊的 blockNumber。此种实现方式目前有一个问题：通过tx，或receipt 的 blockNumber 获取的 block 的 hash 可能同 tx 的 blockHash 不一致。

### block tag
以太坊有三种block tag: `earliest`, `latest`, `pending`。目前前两者分别对应 Conflux 的 `earliest` 和 `latest_state`。Conflux 目前没有与 `pending` 对应的 tag。

除此之外 Conflux 中还有 `latest_mined`, `latest_confirmed` 两种 tag。并且在 Conflux 中交易被打包后不会立刻执行，会延迟 5 个 epoch 执行。

## 地址
Conflux 地址根据类型有三种不同的前缀：
* `0x0` 内置合约地址
* `0x1` 普通账户地址
* `0x8` 合约地址
以太坊地址则没有此限制，首位有可能是任意有效的 hex 字符。如果将 Conflux 资产转移到一个非 `0x1`, `0x8` 的地址，资产将会丢失，无法取回。

因此bridge service 会对地址做一些限制:
1. 要求交易 recover 出来的 from 地址只能是 0x1 开头
2. 要求交易 to 地址只能是 0x0, 0x1, 0x8 开头
3. 如果交易是同合约交互，要求合约必须进行 ABI 注册，bridge service 会根据 ABI 对，涉及到的地址做有效性检查，以避免丢钱的发生。
4. 另外如果合约交互过程中地址通过 bytes 类型数据传递，要求 dapp 自行检查。


### 查找 `0x1` 开头地址
在使用以太坊生态工具和产品同 RPC bridge 交互时要求使用一个 `0x1` 开头的地址, 转账也只能转给 0x1 开头的地址，合约交互只能同 `0x8` 开头的地址交互。

`js-conflux-sdk` 提供了命令行工具可以随机生成 `0x1` 开头的以太坊 Conflux 兼容地址。社区也开发了一个 web 工具，可以离线从一个助记词中找到 `0x1` 开头的地址


## 以太坊生态工具和产品

### ethers.js

### hardhat

### web3.js

### Truffle



