const debug = require("debug")("web3-providers-http-proxy:format");
const { numToHex, setNull, delKeys } = require("./");
const { format } = require("js-conflux-sdk");

const EPOCH_MAP = {
  earliest: "earliest",
  latest: "latest_state",
  pending: "latest_state"  // TODO there is no correct 'pending' tag in conflux
};

function formatEpoch(tag) {
  return EPOCH_MAP[tag] || tag;
}
  
function formatEpochOfParams(params, index) {
  if (params[index]) {
    params[index] = formatEpoch(params[index]);
  }
}

// format from, to, gas, gasPrice
function formatCommonInput(params, networkId, txIndex = 0, epochIndex = 1) {
  let ti = txIndex;
  if (params[ti]) {
    // format tx gas and gasPrice
    if (params[ti].gas && Number.isInteger(params[ti].gas)) {
      params[ti].gas = numToHex(params[ti].gas);
    }
    if (params[ti].gasPrice && Number.isInteger(params[ti].gasPrice)) {
      params[ti].gasPrice = numToHex(params[ti].gasPrice);
    }
    if (params[ti].from) {
      params[ti].from = format.address(params[ti].from, networkId);
    }  
    if (params[ti].to) {
      params[ti].to = format.address(params[ti].to, networkId);
    }  
  }
  formatEpochOfParams(params, epochIndex);
  return params;
}

function formatBlock(block) {
  block.number = block.epochNumber;
  block.stateRoot = block.deferredStateRoot;
  block.receiptsRoot = block.deferredReceiptsRoot;
  block.logsBloom = block.deferredLogsBloomHash;  // logsBloom?
  block.uncles = []; // No uncles in conflux
  block.miner = format.hexAddress(block.miner);
  block.totalDifficulty = block.difficulty;  // totalDifficulty?
  // format tx object
  if (
    block.tranactions &&
    block.tranactions.length > 0 &&
    typeof block.tranactions[0] === "object"
  ) {
    for (let tx of block.tranactions) {
      formatTransaction(tx);
    }
  }
  delKeys(block, [
    "adaptive",
    "blame",
    "deferredLogsBloomHash",
    "deferredReceiptsRoot",
    "deferredStateRoot",
    "epochNumber",
    "height",
    "powQuality",
    "refereeHashes",
    "custom"
  ]);
  setNull(block, [
    "extraData",  // extraData?
    "mixHash",
    "sha3Uncles",  // sha3Uncles?
  ]);
  return block;
}

function formatTransaction(tx) {
  // blockNumber?  need set blockNumber
  tx.input = tx.data;
  tx.from = format.hexAddress(tx.from);
  if(tx.to) {
    tx.to = format.hexAddress(tx.to);
  }

  delKeys(tx, [
    "data",
    "status"
  ]);
  setNull(tx, ["blockNumber"]);
  return tx;
}

function formatLog(l) {
  l.address = format.hexAddress(l.address);
  l.logIndex = l.transactionLogIndex;
  l.blockNumber = l.epochNumber;
  delKeys(l, [
    'transactionLogIndex',
    'epochNumber'
  ]);
}

async function formatTxParams(cfx, options) {
  if (options.value === undefined) {
    options.value = "0x0";
  }

  if (options.nonce === undefined) {
    options.nonce = await cfx.getNextNonce(options.from);
  }

  if (options.gasPrice === undefined) {
    options.gasPrice = cfx.defaultGasPrice;
  }
  if (options.gasPrice === undefined) {
    const recommendGas = Number.parseInt(await cfx.getGasPrice());
    options.gasPrice = numToHex(recommendGas || 1); // MIN_GAS_PRICE
  }

  if (options.gas === undefined) {
    options.gas = cfx.defaultGas;
  }

  if (options.storageLimit === undefined) {
    options.storageLimit = cfx.defaultStorageLimit;
  }

  if (options.gas === undefined || options.storageLimit === undefined) {
    const {
      gasUsed,
      storageCollateralized
    } = await cfx.estimateGasAndCollateral(options);

    if (options.gas === undefined) {
      options.gas = gasUsed;
    }

    if (options.storageLimit === undefined) {
      options.storageLimit = storageCollateralized;
    }
  }

  if (options.epochHeight === undefined) {
    options.epochHeight = await cfx.getEpochNumber();
  }

  if (options.chainId === undefined) {
    options.chainId = cfx.defaultChainId;
  }

  if (options.chainId === undefined) {
    const status = await cfx.getStatus();
    options.chainId = status.chainId;
  }

  return options;
}

function deepFormatAnyAddress(
  obj,
  networkId,
  tohex = false,
  cache = new Map()
) {
  // from, to, contractAddress, contractConcrete, address, string
  // debug("deepFormatAddress obj", obj, typeof obj);
  if (!obj) return obj;
  if (cache.has(obj)) return cache.get(obj);

  // console.log("pre format obj", obj, typeof obj);

  let result = obj;
  if (typeof obj === "string") {
    result = tohex ? format.hexAddress(obj) : format.address(obj, networkId);
    cache.set(Object(obj), result);
  } else if (Array.isArray(obj)) {
    cache.set(Object(obj), obj);
    // console.log("is array", Array.isArray(obj));
    for (let i in obj) {
      obj[i] = deepFormatAnyAddress(obj[i], networkId, tohex, cache);
    }
    result = obj;
  } else if (typeof obj === "object") {
    cache.set(Object(obj), obj);
    Object.keys(obj).map(k => {
      debug("deepFormatAnyAddress key", k);
      obj[k] = deepFormatAnyAddress(obj[k], networkId, tohex, cache);
    });
    result = obj;
  }

  return result;
}

function formatTxHexAddress(tx) {
  return format.callTxAdvance(0, true)(tx);
}

module.exports = {
  formatCommonInput,
  formatTransaction,
  formatBlock,
  formatTxParams,
  formatEpoch,
  formatEpochOfParams,
  formatAddress: format.address,
  formatHexAddress: format.hexAddress,
  formatTxHexAddress,
  deepFormatAddress: (obj, networkId) => deepFormatAnyAddress(obj, networkId),
  deepFormatHexAddress: obj => deepFormatAnyAddress(obj, 0, true),
  formatLog,
};
