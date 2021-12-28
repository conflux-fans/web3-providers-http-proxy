const { createScaffoldMiddleware } = require('json-rpc-engine');
const { Conflux, Transaction, sign } = require('js-conflux-sdk');
const _ = require('lodash');
const { ethers } = require('ethers');
const format = require('../utils/format');
const { numToHex, delKeys, createAsyncMiddleware } = require('../utils');
const adaptErrorMsg = require('../utils/adaptErrorMsg')
const ethRawTxConverter = require('../utils/ethRawTxConverter');
const { RLP } = require("ethers/lib/utils");

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

  // async function adaptMethod(req, res, next) {
  //   req.method = defaultMethodAdaptor(req.method);
  //   await next();
  // }

  async function getNetworkId() {
    networkId = networkId || (await cfx.getStatus()).networkId
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
    await next();
    res.result = res.result.blockNumber;
  }

  async function call(req, res, next) {
    format.formatCommonInput(req.params, await getNetworkId());
    await next();
  }

  async function estimateGas(req, res, next) {

    req.params = format.formatCommonInput(req.params, await getNetworkId());
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
    req.params[0] = await adaptBlockNumberTag(req.params[0]);
    await next();
    if (!res.result) return;
    format.formatBlock(res.result, await getNetworkId(), respAddressBeHex);
  }

  async function getBlockTransactionCountByHash(req, res, next) {
    await next();
    if (!res.result) return;
    res.result = numToHex(res.result.transactions.length);
  }

  async function getBlockTransactionCountByNumber(req, res, next) {
    req.params[0] = await adaptBlockNumberTag(req.params[0]);
    await next();
    if (!res.result) return;
    res.result = numToHex(res.result.transactions.length);
  }

  async function getCode(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    format.formatEpochOfParams(req.params, 1);
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
      _formatFilter(req.params[0]);
    }
    await next();
    if (!res.result) return;
    const networkId = await getNetworkId()
    res.result.forEach(l => format.formatLog(l, networkId, respAddressBeHex));
  }

  async function getStorageAt(req, res, next) {
    req.params[0] = await formatAddress(req.params[0]);
    req.params[1] = ethers.utils.hexZeroPad(req.params[1], 32);
    format.formatEpochOfParams(req.params, 2);
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
    req.params[0] = await formatAddress(req.params[0], respAddressBeHex);
    const isPending = req.params[1] === 'pending';
    if (isPending) {
      req.method = 'cfx_getAccountPendingInfo';
      req.params = req.params.slice(0, 1);
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
    txReceipt.contractCreated = await formatAddress(txReceipt.contractCreated, respAddressBeHex);
    txReceipt.from = await formatAddress(txReceipt.from, respAddressBeHex);
    txReceipt.to = await formatAddress(txReceipt.to, respAddressBeHex);
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
    format.formatEpochOfParams(req.params, 1);
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
    tx.blockNumber = numToHex(block.epochNumber);
  }

  async function _formatFilter(filter) {
    let { fromBlock, toBlock, blockHash, blockHashes, address } = filter

    filter.fromEpoch = format.formatEpoch(fromBlock);
    filter.toEpoch = format.formatEpoch(toBlock);

    if (blockHash) {
      if (_.isArray(blockHashes)) {
        filter.blockHashes.push(blockHash);
      } else {
        filter.blockHashes = [blockHash];
      }
    }
    if (address) {
      if (_.isArray(address)) {
        filter.address = await Promise.all(address.map(formatAddress));
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

  async function adaptBlockNumberTag (tag) {
    if (tag === 'latest') {
      const {blockNumber} = await cfx.provider.call('cfx_getStatus');
      return blockNumber;
    }
    if (tag === 'pending') {
      throw new Error('pending tag is not supported');
    }
    if (tag === 'earliest') {
      return '0x0';
    }
    return tag;
  }

  function isCfxTransaction(rawTransaction) {
    let [utx] = RLP.decode(rawTransaction)
    return utx.length == 9
  }

}

module.exports = cfx2Eth;