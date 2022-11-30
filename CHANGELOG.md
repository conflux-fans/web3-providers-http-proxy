# CHANGELOG

## v0.7.19

1. Update tx.blockHash to pivot block hash
2. Update block.transactions blockNumber, blockHash to pivot block hash
3. Update eth_getLogs response logs blockHash to pivot block hash

## v0.7.18

1. Use batch RPC when get epoch blocks

## v0.7.x

1. Adapt block related methods to include all tx from one Epoch
2. Support EIP-1898
3. Pass through `eth_sendRawTransaction` params
4. Fix `eth_getTransactionCount`
5. Add support for `eth_maxPriorityFeePerGas`, `eth_getUncleCountByBlockHash`, `eth_getUncleCountByBlockNumber`
6. Block add field `baseFeePerGas` set value to `0x0`
7. Add support for block number tag `safe` and `finalized`
8. Fix `getLogs` multiple address filter bug

## v0.5.0

1. Adapt `sendRawTransaction` error to go-ethereum error, `sendRawTransaction` check balance enough.
2. Add `pendingNonceAt`

## v0.4.3

1. Restore transaction's `v` to EIP-155

## v0.4.0

1. Add address check for eth_sendRawTransaction's `from`, `to`
2. Update `JsonRpcProxy` to support `request` method
