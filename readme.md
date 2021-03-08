# web3-provider-proxy
An http provider port from web3, which can proxy eth rpc request to [conflux](https://confluxnetwork.org/).


## how to use

Install through npm
```sh
$ npm install web3-providers-http-proxy
```
Initiate and set to web3 or contract object.

```js
const {HttpProvider, ethToConflux} = require('web3-providers-http-proxy');
const provider = new HttpProvider('http://localhost:12537', {
    chainAdaptor: ethToConflux
});
web3.setProvider(provider);
```

## ETH-to-CFX what has been bridged

### Tags
* earliest -> earliest
* latest -> latest_state

### Address
1. Address's first letter change to 1
2. hex to base32

### RPC methods

```js
const ETH_TO_CFX_METHOD_MAPPER = {
  eth_blockNumber: 'cfx_epochNumber',
  eth_sendRawTransaction: 'cfx_sendRawTransaction',
  eth_getBalance: 'cfx_getBalance',
  eth_call: 'cfx_call',
  eth_gasPrice: 'cfx_gasPrice',
  eth_accounts: 'accounts',
  eth_getTransactionCount: 'cfx_getNextNonce',
  eth_getCode: 'cfx_getCode',
  eth_estimateGas: 'cfx_estimateGasAndCollateral',
  eth_sendTransaction: 'cfx_sendTransaction',
  eth_getStorageAt: 'cfx_getStorageAt',
  eth_getBlockByHash: 'cfx_getBlockByHash',
  eth_getBlockByNumber: 'cfx_getBlockByEpochNumber',
  eth_getTransactionByHash: 'cfx_getTransactionByHash',
  web3_clientVersion: 'cfx_clientVersion',
  eth_chainId: 'cfx_getStatus',
  net_version: 'cfx_getStatus',
  eth_getTransactionReceipt: 'cfx_getTransactionReceipt',
  eth_getLogs: 'cfx_getLogs',
  eth_getBlockTransactionCountByHash: 'cfx_getBlockByHash',
  eth_getBlockTransactionCountByNumber: 'cfx_getBlockByEpochNumber',
  eth_getTransactionByBlockHashAndIndex: 'cfx_getBlockByHash',
  eth_getTransactionByBlockNumberAndIndex: 'cfx_getBlockByEpochNumber',
  eth_coinbase: 'cfx_epochNumber',
  eth_sign: 'sign',
  eth_signTransaction: 'cfx_signTransaction',
};
```


### Docs

1. [Conflux RPC doc](https://developer.conflux-chain.org/docs/conflux-doc/docs/json_rpc)
2. [Ethereum RPC doc](https://eth.wiki/json-rpc/API)
