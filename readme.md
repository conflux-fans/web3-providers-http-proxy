# web3-provider-proxy
An http provider port from web3, which can proxy eth rpc request to [conflux](https://confluxnetwork.org/).

## How to use
Install through npm
```sh
$ npm install web3-providers-http-proxy
```
Initiate and set to web3 or contract object.

```html
<script src="./web3-providers-http-proxy/dist/web3-provider-proxy.min.js"></script>
<script>
const URL = 'https://testnet-rpc.conflux-chain.org.cn/v2';
const provider = new HttpProvider(URL, {
  chainAdaptor: ethToConflux,
  networkId: 1,
});
web3.setProvider(provider);
</script>
```

#### JsonRpcProxy

* support **websocket** and **http** url 

```js
const { JsonRpcProxy } = require('web3-provider-http-proxy');
const URL = 'https://test.confluxrpc.com';
const networkId = 1;
const proxy = new JsonRpcProxy(URL, networkId);
// then use proxy as an provider
```

See tests for usage details.

## ETH-to-CFX what has been bridged

### Tags
* earliest -> earliest
* latest -> latest_state

### Address
2. hex to base32

### Supported RPC methods

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
  eth_coinbase: null,
  eth_sign: 'sign',
  eth_signTransaction: 'cfx_signTransaction',
  web3_sha3: 'cfx_sha3',
};
```


### Docs

1. [Conflux RPC doc](https://developer.conflux-chain.org/docs/conflux-doc/docs/json_rpc)
2. [Ethereum RPC doc](https://eth.wiki/json-rpc/API)
