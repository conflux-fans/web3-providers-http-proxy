const { createScaffoldMiddleware } = require('json-rpc-engine');
const { Conflux, Transaction, sign } = require('js-conflux-sdk');
const _ = require('lodash');
const { ethers } = require('ethers');
const format = require('../utils/format');
const { numToHex, delKeys, createAsyncMiddleware } = require('../utils');
const adaptErrorMsg = require('../utils/adaptErrorMsg')
const ethRawTxConverter = require('../utils/ethRawTxConverter');
const { RLP, isHexString } = require("ethers/lib/utils");

const defaultOptions = {
  respAddressBeHex: false,
  respTxBeEip155: false,
  url: undefined
}

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
    //eth_ => cfx_ 
    // 'eth_unsubscribe': createAsyncMiddleware(adaptMethod), 
    // 'eth_gasPrice': createAsyncMiddleware(adaptMethod),
    // 'web3_clientVersion': createAsyncMiddleware(adaptMethod),
    // 'eth_coinbase': createAsyncMiddleware(adaptMethod),
    // 'eth_sign': createAsyncMiddleware(adaptMethod),
    // 'eth_signTransaction': createAsyncMiddleware(adaptMethod),
  });

  async function getNetworkId() {
    networkId = networkId || (await cfx.getStatus()).networkId
    if (!cfx.networkId) {
      cfx.networkId = networkId;
      cfx.wallet.setNetworkId(this.networkId);
    }
    return networkId
  }

  async function sendRawTransaction(req, res, next) {
    if (!isCfxTransaction(req.params[0])) {
      const { info: tx, rawTx } = ethRawTxConverter(req.params[0]);
      // check balance
      const gas = ethers.BigNumber.from(tx.gas);
      const gasPrice = ethers.BigNumber.from(tx.gasPrice);
      const value = ethers.BigNumber.from(tx.value);
      const required = gas.mul(gasPrice).add(value);
      await getNetworkId();
      const balance = await cfx.getBalance(tx.from);
      if (ethers.BigNumber.from(balance).lt(required)) {
        throw new Error('insufficient funds for gas * price + value');
      }
      // check target contract exist
      if (tx.to && tx.to.startsWith('0x8')) {
        const code = await cfx.getCode(tx.to);
        if (code === '0x') {
          throw new Error('contract not exist');
        }
      }
      req.params[0] = rawTx;
    }

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
    req.params[0] = 'latest_state';
    await next();
    const block = await cfx.getBlockByEpochNumber(res.result);
    res.result = numToHex(block.blockNumber);
  }

  async function call(req, res, next) {
    format.formatCommonInput(req.params, await getNetworkId());
    req.params[1] = await adaptStateQueryBlockNumber(req.params[1]);
    await next();
  }

  async function estimateGas(req, res, next) {
    req.params = format.formatCommonInput(req.params, await getNetworkId());
    req.params[1] = await adaptStateQueryBlockNumber(req.params[1]);
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
    const requestTxDetail = req.params[1];
    req.params[1] = true;
    await next();
    if (!res.result) return;
    const block = filterBlockTxs(res.result);
    if (!requestTxDetail) {
      block.transactions = block.transactions.map(tx => tx.hash);
    }
    format.formatBlock(block, await getNetworkId(), respAddressBeHex);
    await adaptBlockParentHash(block);
    res.result = block;
  }

  async function getBlockByNumber(req, res, next) {
    req.params[0] = await adaptBlockNumberTag(req.params[0]);
    const requestTxDetail = req.params[1];
    req.params[1] = true;  // to filter transaction
    await next();
    if (!res.result) return;
    const block = filterBlockTxs(res.result);
    if (!requestTxDetail) {
      block.transactions = block.transactions.map(tx => tx.hash);
    }

    format.formatBlock(block, await getNetworkId(), respAddressBeHex);
    await adaptBlockParentHash(block);
    res.result = block;
  }

  async function getBlockTransactionCountByHash(req, res, next) {
    req.params[1] = true;
    await next();
    if (!res.result) return;
    const block = filterBlockTxs(res.result);
    res.result = numToHex(block.transactions.length);
  }

  async function getBlockTransactionCountByNumber(req, res, next) {
    req.params[0] = await adaptBlockNumberTag(req.params[0]);
    req.params[1] = true;
    await next();
    if (!res.result) return;
    const block = filterBlockTxs(res.result);
    res.result = numToHex(block.transactions.length);
  }

  async function getCode(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    req.params[1] = await adaptStateQueryBlockNumber(req.params[1]);
    await next();
  }

  async function getLogs(req, res, next) {
    if (req.params.length > 0) {
      req.params[0] = await _formatFilter(req.params[0]);
    }
    await next();
    if (!res.result) return;
    const networkId = await getNetworkId();
    
    for(let i in res.result) {
      let log = res.result[i];
      format.formatLog(log, networkId, respAddressBeHex);
      const block = await cfx.getBlockByHash(log.blockHash);
      log.blockNumber = numToHex(block.blockNumber);
      res.result[i] = log;
    }
  }

  async function getStorageAt(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    // req.params[1] = ethers.utils.hexZeroPad(req.params[1], 32);
    req.params[2] = await adaptStateQueryBlockNumber(req.params[2]);
    await next();
    res.result = res.result || "0x"
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
    req.params[0] = await adaptBlockNumberTag(req.params[0]);
    const index = Number(req.params[1]);
    req.params[1] = true;
    await next();
    if (!res.result || !res.result.transactions[index]) return;
    res.result = res.result.transactions[index];
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionByHash(req, res, next) {
    await next();
    if (!res.result) return;
    await _formatTxAndFeedBlockNumber(res.result);
  }

  async function getTransactionCount(req, res, next) {
    req.params[0] = await formatAddress(req.params[0], false);
    const isPending = req.params[1] === 'pending';
    if (isPending) {
      req.method = 'txpool_nextNonce';
      req.params = req.params.slice(0, 1);
    } else {
      req.params[1] = await adaptStateQueryBlockNumber(req.params[1]);
    }
    await next();
  }

  async function getTransactionReceipt(req, res, next) {
    await next();
    if (!res.result) return;
    let txReceipt = res.result;
    txReceipt.contractCreated = await formatAddress(txReceipt.contractCreated, respAddressBeHex);
    txReceipt.from = await formatAddress(txReceipt.from, respAddressBeHex);
    txReceipt.to = await formatAddress(txReceipt.to, respAddressBeHex);
    const block = await cfx.getBlockByHash(txReceipt.blockHash);
    txReceipt.blockNumber = numToHex(block.blockNumber);
    txReceipt.gasUsed = txReceipt.gasFee;  // NOTE: use gasFee as gasUsed
    txReceipt.contractAddress = txReceipt.contractCreated;
    txReceipt.transactionIndex = txReceipt.index;
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
          transactionIndex: txReceipt.transactionIndex
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
    req.params[1] = await adaptStateQueryBlockNumber(req.params[1]);
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
      _formatFilter(req.params[1]);
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
    tx.blockNumber = numToHex(block.blockNumber);
  }

  async function _formatFilter(filter) {
    let { blockHash, blockHashes, address } = filter
    filter.fromBlock = await adaptBlockNumberTag(filter.fromBlock);
    filter.toBlock = await adaptBlockNumberTag(filter.toBlock);

    if (blockHash) {
      if (_.isArray(blockHashes)) {
        filter.blockHashes.push(blockHash);
      } else {
        filter.blockHashes = [blockHash];
      }
    }
    if (address) {
      if (_.isArray(address)) {
        filter.address = await Promise.all(address.map(_addr => formatAddress(_addr, false)));
      } else {
        filter.address = await formatAddress(address, false);
      }
    }

    delKeys(filter, ["blockHash"])
    return filter;
  }

  async function formatAddress(address, toHex) {
    return format.formatAddress(address, await getNetworkId(), toHex)
  }

  async function adaptBlockNumberTag (tag) {
    if (tag === 'latest' || tag === 'pending') {
      return await getLatestBlockNumber();
    }
    if (tag === 'earliest') {
      return '0x0';
    }
    return tag;
  }

  async function getLatestBlockNumber() {
    const epochNumber = await cfx.provider.call('cfx_epochNumber');
    const block = await cfx.getBlockByEpochNumber(epochNumber);
    return numToHex(block.blockNumber);
  }

  async function adaptStateQueryBlockNumber(numberOrTag) {
    // map blockNumber to epochNumber
    if (isHexString(numberOrTag)) { 
      const block = await cfx.provider.call('cfx_getBlockByBlockNumber', numberOrTag, false);
      return block.epochNumber;
    }
    return format.formatEpoch(numberOrTag);
  }

  async function adaptBlockParentHash(block) {
    if (block.number === '0x0') {
      block.parentHash = null;
      return;
    }
    const parentBlockNumber = ethers.BigNumber.from(block.number).sub(1).toNumber();
    const parentBlock = await cfx.provider.call('cfx_getBlockByBlockNumber', numToHex(parentBlockNumber), false);
    if (parentBlock) {
      block.parentHash = parentBlock.hash;
    }
  }

  // filter the transactions that are not executed by this block
  function filterBlockTxs(block) {
    if (!block.transactions) return block;
    block.transactions = block.transactions.filter(tx => tx.blockHash === block.hash);
    return block;
  }

  function isCfxTransaction(rawTransaction) {
    let [utx] = RLP.decode(rawTransaction)
    return utx.length == 9
  }

}

module.exports = cfx2Eth;