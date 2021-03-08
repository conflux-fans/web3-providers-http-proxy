
### default block parameter 
The following methods have an extra default block parameter: 

* eth_getBalance
* eth_getCode
* eth_getTransactionCount
* eth_getStorageAt
* eth_call

The following options are possible for the defaultBlock parameter:

* HEX String - an integer block number
* String "earliest" for the earliest/genesis block
* String "latest" - for the latest mined block
* String "pending" - for the pending state/transactions

##### Conflux
When requests are made that act on the state of conflux, the epoch number parameter determines the height of the epoch. The following options are possible for the epoch number parameter:

* HEX String - an integer epoch number
* String "earliest" for the epoch of the genesis block
* String "latest_checkpoint" for the earliest epoch stored in memory
* String "latest_state" - for the latest epoch that has been executed
* String "latest_mined" - for the latest known epoch
* String "latest_confirmed"

Noticed that for performance optimization concern, the lasted mined epochs are not executed, so there is no state available in these epochs. For most of RPCs related to state query, the "latest_state" is recommended.


### RPC method mapping

* eth_protocolVersion
* eth_gasPrice
* eth_accounts
* eth_blockNumber -- epochNumber
* eth_getBalance
* eth_getStorageAt
* eth_getTransactionCount
* eth_getBlockTransactionCountByHash
* eth_getBlockTransactionCountByNumber
* eth_getCode
* eth_sign
* eth_signTransaction
* eth_sendTransaction
* eth_sendRawTransaction
* eth_call
* eth_estimateGas
* eth_getBlockByHash
* eth_getBlockByNumber
* eth_getTransactionByHash
* eth_getTransactionByBlockHashAndIndex  ?
* eth_getTransactionByBlockNumberAndIndex  ?
* eth_getTransactionReceipt
* eth_getLogs
* web3_clientVersion
* net_version


* eth_getUncleCountByBlockHash  ? 
* eth_getUncleCountByBlockNumber  ?
* eth_getUncleByBlockHashAndIndex  ?
* eth_getUncleByBlockNumberAndIndex  ?


* eth_getCompilers  ?
* eth_compileLLL  ?
* eth_compileSolidity  ?
* eth_compileSerpent  ?


* eth_newFilter  ?
* eth_newBlockFilter ?
* eth_newPendingTransactionFilter  ?
* eth_uninstallFilter ?
* eth_getFilterChanges  ?
* eth_getFilterLogs  ?


* eth_syncing
* eth_coinbase
* eth_mining
* eth_hashrate
* eth_getWork ?
* eth_submitWork ?
* eth_submitHashrate ?


* web3_sha3
* net_peerCount
* net_listening

db & shh