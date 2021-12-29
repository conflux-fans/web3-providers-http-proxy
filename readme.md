# web3-provider-proxy

An provider port from web3, which can proxy eth rpc request to [conflux](https://confluxnetwork.org/).

## How to use

Install through npm

```sh
$ npm install web3-providers-http-proxy
```

## JsonRpcProxy

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

* hex40 to base32

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
  eth_getBlockByNumber: 'cfx_getBlockByBlockNumber',
  eth_getTransactionByHash: 'cfx_getTransactionByHash',
  web3_clientVersion: 'cfx_clientVersion',
  eth_chainId: 'cfx_getStatus',
  net_version: 'cfx_getStatus',   // networkId
  eth_getTransactionReceipt: 'cfx_getTransactionReceipt',
  eth_getLogs: 'cfx_getLogs',
  eth_getBlockTransactionCountByHash: 'cfx_getBlockByHash',
  eth_getBlockTransactionCountByNumber: 'cfx_getBlockByBlockNumber',
  eth_getTransactionByBlockHashAndIndex: 'cfx_getBlockByHash',
  eth_getTransactionByBlockNumberAndIndex: 'cfx_getBlockByBlockNumber',
  eth_coinbase: null,
  eth_sign: 'sign',
  eth_signTransaction: 'cfx_signTransaction',
  web3_sha3: 'web3_sha3',
  eth_subscribe: 'cfx_subscribe',
  eth_unsubscribe: 'cfx_unsubscribe',
  personal_unlockAccount: 'unlock_account'
};
```

## References

1. [Conflux RPC doc](https://developer.confluxnetwork.org/conflux-doc/docs/json_rpc)
2. [Ethereum RPC doc](https://eth.wiki/json-rpc/API)
3. [Ethereum open-RPC](https://playground.open-rpc.org/?schemaUrl=https://raw.githubusercontent.com/ethereum/eth1.0-apis/assembled-spec/openrpc.json&uiSchema%5BappBar%5D%5Bui:splitView%5D=false&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false)
4. [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193#provider-errors)
5. [eth-provider](https://github.com/floating/eth-provider)
