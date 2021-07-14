### TODOs
1. support metamask -- Done
2. work with ethers.js
3. work with hardhat

### What has been adapted
0. RPC method
1. address: block's miner, tx's from, tx's to, receipt's from receipt's to, receipt's contractCreated
2. epochTag
3. Object: block, tx, receipt, log

##### More RPC methods
2. getBlockByEpoch should return all TX of one epoch
3. Trace related methods
4. pendingTransaction

##### More tests
1. check method's default parameter, empty response, empty field
2. Test with ethereum SDKs: web3.js, ethers.js, web3j, web3py
3. Test with MetaMask
4. Test with truffle and hardhat

##### Support truffle, hardhat

##### Documentation

##### Support websocket/pubsub