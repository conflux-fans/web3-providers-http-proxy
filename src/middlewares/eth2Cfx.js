const { createAsyncMiddleware, createScaffoldMiddleware } = require('json-rpc-engine');
const defaultMethodAdaptor = require('../utils/eth2CfxMethodMapper');
const format = require('../utils/format');
const _ = require('lodash');
const util = require('../utils');
const { Conflux, Transaction } = require('js-conflux-sdk');
const ethRawTxConverter = require('../utils/ethRawTxConverter');

function cfx2Eth(url, networkId) {
  const cfx = new Conflux({
    url: url,
    networkId: networkId,
  });

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
    //eth_ => cfx_ 
    'eth_sendRawTransaction': createAsyncMiddleware(sendRawTransaction),
    'eth_gasPrice': createAsyncMiddleware(adaptMethod),
    'web3_clientVersion': createAsyncMiddleware(adaptMethod),
    'eth_coinbase': createAsyncMiddleware(adaptMethod),
    'eth_sign': createAsyncMiddleware(adaptMethod),
    'eth_signTransaction': createAsyncMiddleware(adaptMethod),
  });

  async function adaptMethod(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
  }

  async function sendRawTransaction(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    req.params[0] = ethRawTxConverter(req.params[0]);
    await next();
  }

  async function getAccounts(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    res.result = res.result.map(format.formatHexAddress);
  }

  async function getBlockNumber(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    // format.formatEpochOfParams(req.params, 0);
    req.params = [];
    await next();
  }

  async function call(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    format.formatCommonInput(req.params, networkId);
    await next();
  }

  async function estimateGas(req, res, next, end) {
    req.method = defaultMethodAdaptor(req.method);
    req.params = format.formatCommonInput(req.params, networkId);
    await next();
    if (!res || !res.result) return;
    res.result = res.result.gasUsed;
  }

  async function getChainId(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    res.result = res.result.chainId;
  }

  async function getBlockByHash(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    format.formatBlock(res.result);
  }

  async function getBlockByNumber(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    format.formatEpochOfParams(req.params, 0);
    await next();
    if (!res || !res.result) return;
    format.formatBlock(res.result);
  }

  async function getBlockTransactionCountByHash(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    res.result = util.numToHex(res.result.transactions.length);
  }

  async function getBlockTransactionCountByNumber(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    res.result = util.numToHex(res.result.transactions.length);
  }

  async function getCode(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    req.params[0] = format.formatAddress(req.params[0], networkId);
    format.formatEpochOfParams(req.params, 1);
    await next();
    if (res && res.error && res.error.code == -32016) {
      res.error = null;
      res.result = "0x";
    }
  }

  async function getLogs(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    if (req.params.length > 0) {
      let fromBlock = req.params[0].fromBlock;
      let toBlock = req.params[0].toBlock;
      req.params[0].fromEpoch = format.formatEpoch(fromBlock);
      req.params[0].toEpoch = format.formatEpoch(toBlock);
      // blockhash
      if (req.params[0].blockhash) {
        if (_.isArray(req.params[0].blockHashes)) {
          req.params[0].blockHashes.push(req.params[0].blockhash);
        } else {
          req.params[0].blockHashes = [req.params[0].blockhash];
        }
      }
      if (req.params[0].address) {
        if (_.isArray(req.params[0].address)) {
          req.params[0].address = req.params[0].address.map(a => format.formatAddress(a, networkId));
        } else {
          req.params[0].address = format.formatAddress(req.params[0].address, networkId);
        }
      }
    }
    await next();
    if (!res || !res.result) return;
    res.result.forEach(format.formatLog);
  }

  async function getStorageAt(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    req.params[0] = format.formatAddress(req.params[0], networkId);
    format.formatEpochOfParams(req.params, 2);
    await next();
  }

  async function getTransactionByBlockHashAndIndex(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    let txIndex = req.params[1];
    req.params[1] = true;
    await next();
    if (!res || !res.result) return;
    let index = Number(txIndex);
    res.result = res.result.transactions[index];
  }

  async function getTransactionByBlockNumberAndIndex(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    let txIndex = req.params[1];
    req.params[1] = true;
    await next();
    if (!res || !res.result) return;
    let index = Number(txIndex);
    res.result = res.result.transactions[index];
  }

  async function getTransactionByHash(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    format.formatTransaction(res.result);
    const block = await cfx.getBlockByHash(res.result.blockHash);
    res.result.blockNumber = util.numToHex(block.epochNumber);
  }

  async function getTransactionCount(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    req.params[0] = format.formatAddress(req.params[0], networkId);
    format.formatEpochOfParams(req.params, 1);
    await next();
  }

  async function getTransactionReceipt(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    let txReceipt = res.result;
    if (txReceipt.contractCreated) {
      txReceipt.contractCreated = format.formatHexAddress(txReceipt.contractCreated);
    }
    txReceipt.from = format.formatHexAddress(txReceipt.from);
    txReceipt.to = format.formatHexAddress(txReceipt.to);
    if (txReceipt.logs) {
      txReceipt.logs.forEach(
        l => (l.address = format.formatHexAddress(l.address))
      );
    }

    txReceipt.contractAddress = txReceipt.contractCreated;
    txReceipt.blockNumber = txReceipt.epochNumber;
    txReceipt.transactionIndex = txReceipt.index;
    txReceipt.status = Number.parseInt(txReceipt.outcomeStatus)
      ? "0x0"
      : "0x1"; // conflux and eth status code is opposite
    txReceipt.cumulativeGasUsed = txReceipt.gasUsed; // NOTE: this is an fake value
    util.delKeys(txReceipt, [
      "contractCreated",
      "epochNumber",
      "index",
      "outcomeStatus",
      "stateRoot"
    ]);
    return res;
  }

  async function sendTransaction(req, res, next) {
    if (params.length === 0) throw new Error('The first parameter should be an transaction');
    req.method = sendTxMethodAdaptor(req.method, req.params);
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
    req.method = defaultMethodAdaptor(req.method);
    await next();
    if (!res || !res.result) return;
    res.result = res.result.networkId;
  }

  async function getBalance(req, res, next) {
    req.method = defaultMethodAdaptor(req.method);
    req.params[0] = format.formatAddress(req.params[0], networkId);
    format.formatEpochOfParams(req.params, 1);
    await next();
  }

  function sendTxMethodAdaptor(method, params) {
    let hexAddress = format.formatHexAddress(params[0].from);
    let address = format.formatAddress(hexAddress, networkId);
    return cfx.wallet.has(address) ? 'cfx_sendRawTransaction' : method;
  }
}

module.exports = cfx2Eth;