const { createAsyncMiddleware, createScaffoldMiddleware } = require('json-rpc-engine');
const { Conflux, Transaction, sign } = require('js-conflux-sdk');
const _ = require('lodash');
const { ethers } = require('ethers');
const format = require('../utils/format');
const util = require('../utils');
const ethRawTxConverter = require('../utils/ethRawTxConverter');


function cfx2Eth(options) {
  const cfx = new Conflux(options);
  const { networkId } = options;

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

  async function sendRawTransaction(req, res, next) {
    const cfxTx = ethRawTxConverter(req.params[0]);
    // TODO: check balance
    if (cfxTx.info.to && cfxTx.info.to.startsWith('0x8')) {
      const code = await cfx.getCode(cfxTx.info.to);
      if (code === '0x') {
        throw new Error('Contract not exist');
      }
    }
    req.params[0] = cfxTx.rawTx;
    await next();
    // TODO adapt error
  }

  async function getAccounts(req, res, next) {
    await next();
    if (!res.result) return;
    res.result = res.result.map(format.formatHexAddress);
  }

  async function getBlockNumber(req, res, next) {
    // format.formatEpochOfParams(req.params, 0);
    req.params = ['latest_state'];
    await next();
  }

  async function call(req, res, next) {
    format.formatCommonInput(req.params, networkId);
    await next();
  }

  async function estimateGas(req, res, next, end) {
    req.params = format.formatCommonInput(req.params, networkId);
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
    format.formatBlock(res.result);
  }

  async function getBlockByNumber(req, res, next) {
    format.formatEpochOfParams(req.params, 0);
    await next();
    if (!res.result) return;
    format.formatBlock(res.result);
  }

  async function getBlockTransactionCountByHash(req, res, next) {
    await next();
    if (!res.result) return;
    res.result = util.numToHex(res.result.transactions.length);
  }

  async function getBlockTransactionCountByNumber(req, res, next) {
    const isPending = req.params[0] === 'pending';
    if (isPending) {
      req.method = 'cfx_getAccountPendingTransactions';
    }
    await next();
    if (!res.result) return;
    if (isPending) {
      res.result = req.result.pendingCount;
    } else {
      res.result = util.numToHex(res.result.transactions.length);
    }
  }

  async function getCode(req, res, next) {
    req.params[0] = format.formatAddress(req.params[0], networkId);
    format.formatEpochOfParams(req.params, 1);
    await next();
    if (res && res.error) {
      const {code, message} = res.error;
      if (code == -32016 || (code === -32602 && message === 'Invalid parameters: address')) {
        delete res.error;
        res.result = "0x";
      }
    }
  }

  async function getLogs(req, res, next) {
    if (req.params.length > 0) {
      _formatFilter(req.params[0]);
    }
    await next();
    if (!res.result) return;
    res.result.forEach(format.formatLog);
  }

  async function getStorageAt(req, res, next) {
    req.params[0] = format.formatAddress(req.params[0], networkId);
    req.params[1] = ethers.utils.hexZeroPad(req.params[1], 32);
    format.formatEpochOfParams(req.params, 2);
    await next();
  }

  async function getTransactionByBlockHashAndIndex(req, res, next) {
    const index = Number(req.params[1]);
    req.params[1] = true;
    await next();
    if (!res.result) return;
    res.result = res.result.transactions[index];
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionByBlockNumberAndIndex(req, res, next) {
    const index = Number(req.params[1]);
    req.params[1] = true;
    await next();
    if (!res.result) return;
    res.result = res.result.transactions[index];
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionByHash(req, res, next) {
    await next();
    if (!res.result) return;
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionCount(req, res, next) {
    req.params[0] = format.formatAddress(req.params[0], networkId);
    const isPending = req.params[1] === 'pending';
    if (isPending) {
      req.method = 'cfx_getAccountPendingInfo';
    } else {
      format.formatEpochOfParams(req.params, 1);
    }
    await next();
    if (isPending) {
      res.result = res.result.localNonce;
    }
  }

  async function getTransactionReceipt(req, res, next) {
    await next();
    if (!res.result) return;
    let txReceipt = res.result;
    txReceipt.contractCreated = format.formatHexAddress(txReceipt.contractCreated);
    txReceipt.from = format.formatHexAddress(txReceipt.from);
    txReceipt.to = format.formatHexAddress(txReceipt.to);
    txReceipt.gasUsed = txReceipt.gasFee;  // NOTE: use gasFee as gasUsed
    txReceipt.contractAddress = txReceipt.contractCreated;
    txReceipt.blockNumber = txReceipt.epochNumber;
    txReceipt.transactionIndex = txReceipt.index;
    txReceipt.status = Number.parseInt(txReceipt.outcomeStatus)
      ? "0x0"
      : "0x1"; // conflux and eth status code is opposite
    txReceipt.cumulativeGasUsed = txReceipt.gasUsed; // NOTE: this is an fake value
    // feed log info
    let logs = [];
    if (txReceipt.logs) {
      for(let i in txReceipt.logs) {
        let log = txReceipt.logs[i];
        logs.push({
          address: format.formatHexAddress(log.address),
          data: log.data,
          topics: log.topics,
          logIndex: util.numToHex(Number(i)),  // NOTE: this is the index in receipt log array, it should be index in the block
          blockNumber: txReceipt.blockNumber,
          blockHash: txReceipt.blockHash,
          transactionHash: txReceipt.transactionHash,
          transactionIndex: txReceipt.transactionIndex
        });
      }
    }
    txReceipt.logs = logs;
    util.delKeys(txReceipt, [
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
    if (params.length === 0) throw new Error('The first parameter should be an transaction');
    req.method = _mapSendTxMethod(req.method, req.params);
    req.params[0] = await format.formatTxParams(cfx, req.params[0]);
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
      tx.sign(account.privateKey, networkId);
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
    req.params[0] = format.formatAddress(req.params[0], networkId);
    format.formatEpochOfParams(req.params, 1);
    await next();
  }

  async function webSha3(req, res, next) {
    const data = req.params[0];
    const toSign = Buffer.from(data.slice(2), 'hex');
    res.result = format.hex(sign.keccak256(toSign));
    return;
  }

  // TODO: notification should be adapt in websocket event handler
  async function subscribe(req, res, next) {
    const topic = req.params[0];
    if (topic === 'logs' && req.params[1]) {
      _formatFilter(req.params[1]);
    }
    await next();
    /* if (topic === 'logs') {

    } else if(topic === 'newHeads') {

    } */
  }

  function _mapSendTxMethod(method, params) {
    let hexAddress = format.formatHexAddress(params[0].from);
    let address = format.formatAddress(hexAddress, networkId);
    return cfx.wallet.has(address) ? 'cfx_sendRawTransaction' : method;
  }

  async function _formatTxAndFeedBlockNumber(tx) {
    if (!tx) return;
    format.formatTransaction(tx);
    if (tx.blockHash) return;
    const block = await cfx.getBlockByHash(tx.blockHash);
    tx.blockNumber = util.numToHex(block.epochNumber);
  }

  function _formatFilter(filter) {
    let fromBlock = filter.fromBlock;
    let toBlock = filter.toBlock;
    filter.fromEpoch = format.formatEpoch(fromBlock);
    filter.toEpoch = format.formatEpoch(toBlock);
    // blockHash
    if (filter.blockHash) {
      if (_.isArray(filter.blockHashes)) {
        filter.blockHashes.push(filter.blockHash);
      } else {
        filter.blockHashes = [filter.blockHash];
      }
      delete filter.blockHash;
    }
    if (filter.address) {
      if (_.isArray(filter.address)) {
        filter.address = filter.address.map(a => format.formatAddress(a, networkId));
      } else {
        filter.address = format.formatAddress(filter.address, networkId);
      }
    }
    return filter;
  }

}

module.exports = cfx2Eth;