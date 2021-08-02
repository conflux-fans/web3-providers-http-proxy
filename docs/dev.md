# Dev

## Progress

1. Support eth_subscribe & eth_unsubsribe
2. Adapt eth_getStorageAt
3. Adapt eth_sendRawTransaction error code
4. Test with truffle (work with truffle v5.4+)
5. Docs

## TODOs

1. support metamask -- Done
2. work with ethers.js -- Basic tests  重点
3. work with hardhat -- Basic tests  重点
4. ABI whitelist
5. Support Dapp migrate  重点

## What has been adapted

0. RPC method
1. address: block's miner, tx's from, tx's to, receipt's from receipt's to, receipt's contractCreated
2. epochTag
3. Object: block, tx, receipt, log

### More RPC methods

1. getBlockByEpoch should return all TX of one epoch
2. Trace related methods
3. pendingTransaction

### More tests

1. check method's default parameter, empty response, empty field
2. Test with ethereum SDKs: web3.js, ethers.js, web3j, web3py
3. Test with MetaMask
4. Test with truffle and hardhat

### Documentation

### Support websocket/PubSub
