const { createScaffoldMiddleware } = require('json-rpc-engine');
const { Conflux, Transaction, sign } = require('js-conflux-sdk');
const _ = require('lodash');
const { ethers } = require('ethers');
// const { RLP } = require("ethers/lib/utils");
const format = require('../utils/format');
const { numToHex, delKeys, createAsyncMiddleware, isHex } = require('../utils');
const adaptErrorMsg = require('../utils/adaptErrorMsg')

const defaultOptions = {
  respAddressBeHex: false,
  respTxBeEip155: false,
  url: undefined
}

// transaction index cache
const TransactionIndexCache = {};

function cfx2Eth(options = defaultOptions) {

  const cfx = new Conflux(options);
  let { respAddressBeHex, respTxBeEip155 } = options;
  let networkId = undefined;

  return createScaffoldMiddleware({
    'eth_accounts': createAsyncMiddleware(getAccounts),
    'eth_blockNumber': createAsyncMiddleware(getBlockNumber),
    'eth_call': createAsyncMiddleware(call),
    'eth_chainId': createAsyncMiddleware(getChainId),
    'eth_estimateGas': createAsyncMiddleware(estimateGas),
    'eth_getBalance': createAsyncMiddleware(getBalance),
    'eth_getBlockByHash': createAsyncMiddleware(getBlockByHash),
    'eth_getBlockByNumber': createAsyncMiddleware(getBlockByNumber),
    'eth_getBlockTransactionCountByHash': createAsyncMiddleware(getBlockTransactionCountByHash),
    'eth_getBlockTransactionCountByNumber': createAsyncMiddleware(getBlockTransactionCountByNumber),
    'eth_getCode': createAsyncMiddleware(getCode),
    'eth_getLogs': createAsyncMiddleware(getLogs),
    'eth_getStorageAt': createAsyncMiddleware(getStorageAt),
    'eth_getTransactionByBlockHashAndIndex': createAsyncMiddleware(getTransactionByBlockHashAndIndex),
    'eth_getTransactionByBlockNumberAndIndex': createAsyncMiddleware(getTransactionByBlockNumberAndIndex),
    'eth_getTransactionByHash': createAsyncMiddleware(getTransactionByHash),
    'eth_getTransactionCount': createAsyncMiddleware(getTransactionCount),
    'eth_getTransactionReceipt': createAsyncMiddleware(getTransactionReceipt),
    'eth_sendTransaction': createAsyncMiddleware(sendTransaction),
    'net_version': createAsyncMiddleware(getNetVersion),
    'web3_sha3': createAsyncMiddleware(webSha3),
    'eth_sendRawTransaction': createAsyncMiddleware(sendRawTransaction),
    'eth_subscribe': createAsyncMiddleware(subscribe),
    'eth_maxPriorityFeePerGas': createAsyncMiddleware(getMaxPriorityFeePerGas),
    'eth_getUncleCountByBlockHash': createAsyncMiddleware(getUncleCount),
    'eth_getUncleCountByBlockNumber': createAsyncMiddleware(getUncleCount),
    //eth_ => cfx_ 
    // 'eth_unsubscribe': createAsyncMiddleware(adaptMethod), 
    // 'eth_gasPrice': createAsyncMiddleware(adaptMethod),
    // 'web3_clientVersion': createAsyncMiddleware(adaptMethod),
    // 'eth_coinbase': createAsyncMiddleware(adaptMethod),
    // 'eth_sign': createAsyncMiddleware(adaptMethod),
    // 'eth_signTransaction': createAsyncMiddleware(adaptMethod),
  });

  // async function adaptMethod(req, res, next) {
  //   req.method = defaultMethodAdaptor(req.method);
  //   await next();
  // }

  async function getNetworkId() {
    networkId = (networkId || (await cfx.getStatus()).networkId)
    return networkId
  }

  async function getMaxPriorityFeePerGas(req, res, next) {
    res.result = '0x3b9aca00'; // 1G
  }

  async function getUncleCount(req, res, next) {
    res.result = '0x0';
  }

  async function sendRawTransaction(req, res, next) {
    await next();
    // adapt error message
    if (res._error) {
      res.error = {
        code: -32000,
        message: adaptErrorMsg(req._error.message)
      }
      delete res._error;
    }
  }

  async function getAccounts(req, res, next) {
    await next();
    if (!res.result) return;
    res.result = await Promise.all(res.result.map(formatAddress));
  }

  async function getBlockNumber(req, res, next) {
    req.params = ['latest_state'];
    await next();
  }

  async function call(req, res, next) {
    await formatEpochOfParams(req.params, 1);
    format.formatCommonInput(req.params, await getNetworkId());
    // set epochHeight of call tx
    if (req.params[1] !== undefined && isHex(req.params[1])) {
      req.params[0].epochHeight = req.params[1];
    }
    await next();
  }

  async function estimateGas(req, res, next) {
    await formatEpochOfParams(req.params, 1);
    format.formatCommonInput(req.params, await getNetworkId());
    await next();
    if (!res.result) return;
    res.result = res.result.gasUsed;
  }

  async function getChainId(req, res, next) {
    await next();
    if (!res.result) return;
    res.result = res.result.chainId;
  }

  async function getBlockByHash(req, res, next) {
    await next();
    if (!res.result) return;
    let epochNumber = res.result.epochNumber;
    let pivotBlock = await _getEpochAsBlock(epochNumber, req.params[1]);
    res.result.transactions = pivotBlock.transactions;
    format.formatBlock(res.result, await getNetworkId(), respAddressBeHex, respTxBeEip155);
  }

  async function getBlockByNumber(req, res, next) {
    format.formatEpochOfParams(req.params, 0);
    await next();
    if (!res.result) return;
    let epochNumber = res.result.epochNumber;
    let pivotBlock = await _getEpochAsBlock(epochNumber, req.params[1]);
    res.result.transactions = pivotBlock.transactions;
    format.formatBlock(res.result, await getNetworkId(), respAddressBeHex, respTxBeEip155);
  }

  async function getBlockTransactionCountByHash(req, res, next) {
    req.params[1] = false;
    await next();
    if (!res.result) return;
    let epochNumber = res.result.epochNumber;
    let pivotBlock = await _getEpochAsBlock(epochNumber);
    res.result = pivotBlock;
    res.result = numToHex(res.result.transactions.length);
  }

  async function getBlockTransactionCountByNumber(req, res, next) {
    req.params[1] = false;
    await next();
    if (!res.result) return;
    let epochNumber = res.result.epochNumber;
    let pivotBlock = await _getEpochAsBlock(epochNumber);
    res.result = pivotBlock;
    res.result = numToHex(res.result.transactions.length);
  }

  async function getCode(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    await formatEpochOfParams(req.params, 1);
    // console.log("getcode formated params:", req.params)
    await next();
    // console.log("getcode next response:", res)
    if (res && res.error) {
      const { code, message } = res.error;
      if (code == -32016 || (code === -32602 && message === 'Invalid parameters: address')) {
        delete res.error;
        res.result = "0x";
      }
    }
  }

  async function getLogs(req, res, next) {
    if (req.params.length > 0) {
      await _formatFilter(req.params[0]);
    }
    await next();
    if (!res.result) return;
    const networkId = await getNetworkId()
    await _updateLogBlockHash(res.result);
    await _updateLogTxIndex(res.result);
    res.result.forEach(l => format.formatLog(l, networkId, respAddressBeHex));
  }

  async function getStorageAt(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    req.params[1] = ethers.utils.hexZeroPad(req.params[1], 32);
    await formatEpochOfParams(req.params, 2);
    await next();
    res.result = res.result || "0x"
  }

  async function getTransactionByBlockHashAndIndex(req, res, next) {
    const index = Number(req.params[1]);
    req.params[1] = true;
    await next();
    if (!res.result) return;
    let epochNumber = res.result.epochNumber;
    let pivotBlock = await _getEpochAsBlock(epochNumber);
    res.result = pivotBlock;
    res.result = res.result.transactions[index];
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionByBlockNumberAndIndex(req, res, next) {
    const index = Number(req.params[1]);
    req.params[1] = true;
    await next();
    if (!res.result) return;
    let epochNumber = res.result.epochNumber;
    let pivotBlock = await _getEpochAsBlock(epochNumber);
    res.result = pivotBlock;
    res.result = res.result.transactions[index];
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionByHash(req, res, next) {
    await next();
    if (!res.result) return;
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionCount(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    const isPending = req.params[1] === 'pending';
    if (isPending) {
      req.method = 'txpool_nextNonce';
      req.params = req.params.slice(0, 1);
    } else {
      await formatEpochOfParams(req.params, 1);
    }
    await next();
  }

  async function getTransactionReceipt(req, res, next) {
    await next();
    if (!res.result) return;
    let txReceipt = res.result;
    let block = await _getEpochAsBlock(txReceipt.epochNumber, false);
    txReceipt.blockHash = block.hash;
    txReceipt.contractCreated = await formatAddress(txReceipt.contractCreated, respAddressBeHex);
    txReceipt.from = await formatAddress(txReceipt.from, respAddressBeHex);
    txReceipt.to = await formatAddress(txReceipt.to, respAddressBeHex);
    txReceipt.gasUsed = txReceipt.gasFee;  // NOTE: use gasFee as gasUsed
    txReceipt.contractAddress = txReceipt.contractCreated;
    txReceipt.blockNumber = txReceipt.epochNumber;
    let txIndex = await getTxBlockIndex(txReceipt.transactionHash, txReceipt.epochNumber);
    txReceipt.transactionIndex = txIndex || txReceipt.index;
    txReceipt.status = Number.parseInt(txReceipt.outcomeStatus)
      ? "0x0"
      : "0x1"; // conflux and eth status code is opposite
    txReceipt.cumulativeGasUsed = txReceipt.gasUsed; // NOTE: this is an fake value
    // feed log info
    let logs = [];
    if (txReceipt.logs) {
      for (let i in txReceipt.logs) {
        let log = txReceipt.logs[i];
        logs.push({
          address: await formatAddress(log.address, respAddressBeHex),
          data: log.data,
          topics: log.topics,
          logIndex: numToHex(Number(i)),  // NOTE: this is the index in receipt log array, it should be index in the block
          blockNumber: txReceipt.blockNumber,
          blockHash: txReceipt.blockHash,
          transactionHash: txReceipt.transactionHash,
          transactionIndex: txReceipt.transactionIndex,
          removed: false,
        });
      }
    }
    txReceipt.logs = logs;
    delKeys(txReceipt, [
      "contractCreated",
      "epochNumber",
      "index",
      "outcomeStatus",
      "stateRoot",
      'txExecErrorMsg',
      'gasCoveredBySponsor',
      'storageCollateralized',
      'storageReleased',
      'storageCoveredBySponsor'
    ]);
    return res;
  }

  async function sendTransaction(req, res, next) {
    if (req.params.length === 0) throw new Error('The first parameter should be an transaction');
    req.method = await _mapSendTxMethod(req.method, req.params);
    // console.log("networkId:", await getNetworkId())
    req.params[0] = await format.formatTxParams(cfx, req.params[0], await getNetworkId());
    if (cfx.wallet.has(req.params[0].from)) {
      let tx = new Transaction(req.params[0]);
      // tx.nonce = await cfx.getNextNonce(req.params[0].from);
      // let status = await cfx.getStatus();
      // let estimateValues = await cfx.estimateGasAndCollateral(tx);
      // let gasPrice = await cfx.getGasPrice();
      // tx.chainId = status.chainId;
      // tx.gas = Number(estimateValues.gasLimit);
      // tx.gasPrice = Number(gasPrice);
      // tx.storageLimit = Number(estimateValues.storageCollateralized);
      let account = cfx.wallet.get(req.params[0].from);
      tx.sign(account.privateKey, await getNetworkId());
      req.params[0] = tx.serialize();
    }
    await next();
  }

  async function getNetVersion(req, res, next) {
    await next();
    if (!res.result) return;
    res.result = res.result.networkId;
  }

  async function getBalance(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    await formatEpochOfParams(req.params, 1);
    await next();
  }

  async function webSha3(req, res) {
    const data = req.params[0];
    // eslint-disable-next-line no-undef
    const toSign = Buffer.from(data.slice(2), 'hex');
    res.result = format.hex(sign.keccak256(toSign));
    return;
  }

  // TODO: notification should be adapt in websocket event handler
  async function subscribe(req, res, next) {
    const topic = req.params[0];
    if (topic === 'logs' && req.params[1]) {
      await _formatFilter(req.params[1]);
    }
    await next();
    /* if (topic === 'logs') {

    } else if(topic === 'newHeads') {

    } */
  }

  async function _mapSendTxMethod(method, params) {
    let address = await formatAddress(params[0].from);
    return cfx.wallet.has(address) ? 'cfx_sendRawTransaction' : method;
  }

  async function _formatTxAndFeedBlockNumber(tx) {
    if (!tx) return;
    format.formatTransaction(tx, await getNetworkId(), respAddressBeHex, respTxBeEip155);
    if (!tx.blockHash) return;
    const block = await cfx.getBlockByHash(tx.blockHash);
    const epoch = await cfx.getBlockByEpochNumber(block.epochNumber);
    tx.blockNumber = numToHex(block.epochNumber);
    tx.blockHash = epoch.hash;
  }

  async function _formatFilter(filter) {
    let { fromBlock, toBlock, blockHash, blockHashes, address } = filter

    filter.fromEpoch = format.formatEpoch(fromBlock); // TODO support eip1898
    filter.toEpoch = format.formatEpoch(toBlock); // TODO support eip1898

    if (blockHash) {
      if (_.isArray(blockHashes)) {
        filter.blockHashes.push(blockHash);
      } else {
        filter.blockHashes = [blockHash];
      }
    }
    if (address) {
      if (_.isArray(address)) {
        filter.address = await Promise.all(address.map(async addr => await formatAddress(addr)));
      } else {
        filter.address = await formatAddress(address);
      }
    }

    delKeys(filter, ["fromBlock", "toBlock", "blockHash"])
    return filter;
  }

  async function formatAddress(address, toHex) {
    return format.formatAddress(address, await getNetworkId(), toHex)
  }

  async function formatEpochOfParams(params, index) {
    /*
      process EIP-1898 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1898.md
      { "blockNumber": "0x0" }
      { "blockHash": "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3" }
    */
    if (params[index] && typeof params[index] === 'object') {
      if (params[index].blockHash) {
        const block = await cfx.getBlockByHash(params[index].blockHash);
        if (!block) throw new Error('block not found');
        params[index] = block.epochNumber;
      }
      if (params[index].blockNumber) {
        params[index] = params[index].blockNumber;
      }
    }
    
    format.formatEpochOfParams(params, index);
  }

  // NOTE: gasLimit, gasUsed, size, transactionsRoot and other fields is not adapted, direct use the pivot block
  async function _getEpochAsBlock(epochNumber, includeTx = false) {
    let blockHashes = await cfx.cfx.getBlocksByEpoch(epochNumber);
    if (blockHashes.length === 0) return null;
    let blocks = await _batchGetBlocks(blockHashes);
    let txes = [];
    for(let block of blocks) {
      if (!block.transactions) continue;
      txes = txes.concat(block.transactions);
    }
    let pivotBlock = blocks[blocks.length - 1];
    txes = txes.filter(tx => tx.status === 0);
    // update tx epochHeight and blockHash to pivot block
    for(let i in txes) {
      let tx = txes[i];
      tx.epochHeight = pivotBlock.epochNumber;
      tx.blockHash = pivotBlock.hash;
      tx.transactionIndex = `0x${i.toString(16)}`;

      // UPDATE tx index cache
      TransactionIndexCache[tx.hash] = tx.transactionIndex;
    }
    pivotBlock.transactions = txes;
    if (!includeTx) {
      pivotBlock.transactions = pivotBlock.transactions.map(tx => tx.hash);
    }
    return pivotBlock;
  }

  async function _batchGetBlocks(blockHashes) {
    const batcher = cfx.BatchRequest();
    for(let hash of blockHashes) {
      batcher.add(cfx.cfx.getBlockByHash.request(hash, true));
    }
    const blocks = await batcher.execute();
    return blocks;
  }

  // update log's blockHash to pivot block hash
  async function _updateLogBlockHash(logs) {
    const epochNumbers = _.uniq(logs.map(log => log.epochNumber));
    const batcher = cfx.BatchRequest();
    for(let number of epochNumbers) {
      batcher.add(cfx.cfx.getBlockByEpochNumber.request(number, false));
    }
    const blocks = await batcher.execute();
    let epochNumberMap = {};
    for(let block of blocks) {
      // NOTE: if not found block.epochNumber use 0
      epochNumberMap[numToHex(block.epochNumber || 0)] = block.hash;
    }
    for(let i in logs) {
      logs[i].blockHash = epochNumberMap[logs[i].epochNumber];
    }
  }

  async function _updateLogTxIndex(logs) {
    for(let i in logs) {
      const log = logs[i];
      if (log.transactionHash) {
        log.transactionIndex = await getTxBlockIndex(log.transactionHash, log.epochNumber);
      }
    }
  }

  // NOTE: blockNum is the block that include the tx
  async function getTxBlockIndex(txHash, blockNum) {
    if (TransactionIndexCache[txHash]) return TransactionIndexCache[txHash];
    const block = await _getEpochAsBlock(blockNum);
    const txes = block.transactions;
    for(let i in txes) {
      TransactionIndexCache[txes[i].hash] = txes[i].transactionIndex;
    }
    return TransactionIndexCache[txHash];
  }

}



module.exports = cfx2Eth;

/* function isCfxTransaction(rawTransaction) {
  let [utx] = RLP.decode(rawTransaction)
  return utx.length == 9
} */