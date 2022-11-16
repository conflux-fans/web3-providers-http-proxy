# CHANGELOG

## v0.7.x

1. Adapt block related methods to include all tx from one Epoch
2. Support EIP-1898
3. Pass through `eth_sendRawTransaction` params
4. Fix `eth_getTransactionCount`

## v0.5.0

1. Adapt `sendRawTransaction` error to go-ethereum error, `sendRawTransaction` check balance enough.
2. Add `pendingNonceAt`

## v0.4.3

1. Restore transaction's `v` to EIP-155

## v0.4.0

1. Add address check for eth_sendRawTransaction's `from`, `to`
2. Update `JsonRpcProxy` to support `request` method
