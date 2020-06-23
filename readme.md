# web3-provider-proxy
An http provider port from web3, which can proxy eth rpc request to [conflux](https://confluxnetwork.org/).


### how to use

Install through npm
```sh
$ npm install web3-provider-proxy
```
Initiate and set to web3 or contract object.

```js
const HttpProvider = require('web3-provider-proxy');
const provider = new HttpProvider('http://localhost:12539');
web3.setProvider(provider);
```


### Implemented rpc method

1. eth_blockNumber -> cfx_epochNumber
2. eth_call -> cfx_call


### rpc that can't handle by this proxy

1. which conflux doesn't have respond rpc
2. parameter not compatible
3. response not compatible