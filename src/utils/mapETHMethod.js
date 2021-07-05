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
  web3_sha3: 'web3_sha3', // TODO
};

module.exports = function (method) {
  return ETH_TO_CFX_METHOD_MAPPER[method] || method;
}

/**
 * CORE methods
 * 
 * Get basic info:
 * chainId
 * networkId
 * clientVersion
 * blockNumber
 * gasPrice
 * 
 * Get user info:
 * nonce
 * balance
 * 
 * Send transaction:
 * sendRawTransaction
 * sendTransaction
 * 
 * Get blockChain info:
 * getBlockByHash
 * getBlockByNumber
 * getTxByHash
 * getTxReceipt
 * getLogs
 * 
 * Call & estimate
 * call
 * estimate
 * 
 * 
 */