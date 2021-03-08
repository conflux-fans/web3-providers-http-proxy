module.exports = {
    eth_accounts: require('./eth_accounts'),
    eth_blockNumber: require('./eth_blockNumber'),
    eth_call: require('./eth_call'),
    eth_chainId: require('./eth_chainId'),
    eth_estimateGas: require('./eth_estimateGas'),
    eth_getBalance: require('./eth_getBalance'),
    eth_getBlockByHash: require('./eth_getBlockByHash'),
    eth_getBlockByNumber: require('./eth_getBlockByNumber'),
    eth_getCode: require('./eth_getCode'),
    eth_getLogs: require('./eth_getLogs'),
    eth_getStorageAt: require('./eth_getStorageAt'),
    eth_getTransactionByHash: require('./eth_getTransactionByHash'),
    eth_getTransactionCount: require('./eth_getTransactionCount'),
    eth_getTransactionReceipt: require('./eth_getTransactionReceipt'),
    eth_sendTransaction: require('./eth_sendTransaction'),
    net_version: require('./net_version'),
    eth_getBlockTransactionCountByHash: require('./eth_getBlockTransactionCountByHash'),
    eth_getBlockTransactionCountByNumber: require('./eth_getBlockTransactionCountByNumber'),
    eth_getTransactionByBlockHashAndIndex: require('./eth_getTransactionByBlockHashAndIndex'),
    eth_getTransactionByBlockNumberAndIndex: require('./eth_getTransactionByBlockNumberAndIndex'),
};