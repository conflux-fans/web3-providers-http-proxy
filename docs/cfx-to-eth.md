
# 如何为 Conflux 适配以太坊生态

1. fullnode 7 月份会进行 hardfork，兼容以太坊签名格式的 TX
2. 需要开发一个 bridge service 将 Conflux RPC 适配成以太坊 RPC （需要确定钱包，Dapp 需要的最小 RPC 方法集合）
3. 开发一个纯前端页面，用于快速从助记词中找到 0x1 开头的地址，给出序号及私钥 (注意 coinType )
4. 修改 web3.js 的 account 模块，主要调整地址生成逻辑部分
5. 适配合约开发工具： truffle，hardhat，remix
6. 梳理以太坊 Dapp 迁移至 Conflux 需要做的工作
7. hd wallet 适配
8. 编写完整全面的文档



## web3.js account 模块适配
1. web3-eth-accounts 模块适配
  a. 生成的账户地址改为 0x1
  b. recover 方法出来的地址为 0x1
  c. encrypt, decrypt 不做处理，保持不变

2. 如何设置（使用）新的模块：web3.eth.accounts = new Accounts(web3)


## 以太坊 Dapp 迁移适配

### 合约层面工作
TODO

### 前端层面

1. web3.js + metamask
2. web3.js + portal (bridge service 同时支持 eth + cfx method)
            fluentwallet