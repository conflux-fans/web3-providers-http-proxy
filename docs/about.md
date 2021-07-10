
### current issues
1. conflux 中没有与以太坊 pending 对应的 tag
2. 部分以太坊方法不支持
3. getCode 接口对 error 的修改不起作用，应该是 json-rpc-engine 的 bug


### Work with MetaMask
1. RPC bridge service 如果在 metamask 中使用，建议对于所有涉及到地址的查询方法，建议将地址首位改为 0x1
2. gasPrice 如果太小在 metamask 无法成功发送交易


### 以太坊 Dapp 迁移适配(前端)
1. web3.js + metamask
2. web3.js + portal (bridge service 同时支持 eth + cfx method)
           + fluentwallet

### Useful tools
https://www.npmjs.com/package/json-rpc-engine
https://www.npmjs.com/package/eth-json-rpc-middleware