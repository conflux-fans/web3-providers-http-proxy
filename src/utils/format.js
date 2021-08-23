const debug = require("debug")("web3-providers-http-proxy:format");
const { numToHex, setNull, delKeys } = require("./");
const { format } = require("js-conflux-sdk");

const EPOCH_MAP = {
  earliest: "earliest",
  latest: "latest_state",
  pending: "latest_state"  // TODO there is no correct 'pending' tag in conflux
};

function formatEpoch(tag) {
  return EPOCH_MAP[tag] || numToHex(tag);
}

function formatEpochOfParams(params, index) {
  if (!params[index]) return;
  params[index] = formatEpoch(params[index]);
}

// format commons: from, to, gas, gasPrice
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

function formatBlock(block, networkId, isAddrToHex, isEip155) {
  block.number = block.epochNumber;
  block.stateRoot = block.deferredStateRoot;
  block.receiptsRoot = block.deferredReceiptsRoot;
  block.logsBloom = block.deferredLogsBloomHash;  // logsBloom?
  block.uncles = []; // No uncles in conflux
  block.miner = formatAddress(block.miner, networkId, isAddrToHex);
  block.totalDifficulty = block.difficulty;  // totalDifficulty?
  block.extraData = '0x';
  // format tx object
  if (
    block.tranactions &&
    block.tranactions.length > 0 &&
    typeof block.tranactions[0] === "object"
  ) {
    for (let tx of block.tranactions) {
      formatTransaction(tx, networkId, isAddrToHex, isEip155);
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
    // "extraData",  // extraData?
    "mixHash",
    "sha3Uncles",  // sha3Uncles?
  ]);
  return block;
}

function formatTransaction(tx, networkId, isAddrToHex, isEIP155) {
  // blockNumber?
  tx.input = tx.data;
  tx.from = formatAddress(tx.from, networkId, isAddrToHex);
  tx.to = formatAddress(tx.to, networkId, isAddrToHex);

  if (isEIP155)
    tx.v = numToHex(Number(tx.v) + Number(tx.chainId) * 2 + 35);

  delKeys(tx, [
    "data",
    "status"
  ]);
  setNull(tx, ["blockNumber"]);
  return tx;
}

function formatLog(l, networkId, isAddrToHex) {
  l.address = formatAddress(l.address, networkId, isAddrToHex);
  l.logIndex = l.transactionLogIndex;
  l.blockNumber = l.epochNumber;
  delKeys(l, [
    'transactionLogIndex',
    'epochNumber'
  ]);
}

async function formatTxParams(cfx, options, networkId) {

  options.from = formatAddress(options.from, networkId)
  options.to = formatAddress(options.to, networkId)

  // console.log("options:", options)

  if (options.value === undefined) {
    options.value = "0x0";
  }

  if (options.nonce === undefined) {
    options.nonce = numToHex(await cfx.getNextNonce(options.from));
  }

  if (options.gasPrice === undefined && cfx.defaultGasPrice) {
    options.gasPrice = numToHex(cfx.defaultGasPrice);
  }
  if (options.gasPrice === undefined) {
    const recommendGas = Number.parseInt(await cfx.getGasPrice());
    options.gasPrice = numToHex(recommendGas || 1); // MIN_GAS_PRICE
  }

  if (options.gas === undefined && cfx.defaultGas) {
    options.gas = numToHex(cfx.defaultGas);
  }

  if (options.storageLimit === undefined && cfx.defaultStorageLimit) {
    options.storageLimit = numToHex(cfx.defaultStorageLimit);
  }

  if (options.gas === undefined || options.storageLimit === undefined) {
    const {
      gasUsed,
      storageCollateralized
    } = await cfx.estimateGasAndCollateral(options);

    if (options.gas === undefined) {
      options.gas = numToHex(gasUsed)
    }

    if (options.storageLimit === undefined) {
      options.storageLimit = numToHex(storageCollateralized);
    }
  }

  if (options.epochHeight === undefined) {
    options.epochHeight = numToHex(await cfx.getEpochNumber());
  }

  if (options.chainId === undefined && cfx.defaultChainId) {
    options.chainId = numToHex(cfx.defaultChainId);
  }

  if (options.chainId === undefined) {
    const status = await cfx.getStatus();
    options.chainId = numToHex(status.chainId);
  }

  return options;
}

function deepFormatAnyAddress(
  obj,
  networkId,
  tohex = false,
  cache = new Map()
) {
  // from, to, contractAddress, contractConcreate, address, string
  // debug("deepFormatAddress obj", obj, typeof obj);
  if (!obj) return obj;
  if (cache.has(obj)) return cache.get(obj);

  debug("pre format obj", obj, typeof obj);

  let result = obj;
  if (typeof obj === "string") {
    result = formatAddress(obj, networkId, tohex)
    cache.set(Object(obj), result);
  } else if (Array.isArray(obj)) {
    cache.set(Object(obj), obj);
    debug("is array", Array.isArray(obj));
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

function formatHexAddress(address) {
  return address && format.hexAddress(address)
}

function formatCip37Address(address, networkId) {
  return address && format.address(address, networkId)
}

function formatAddress(address, networkId, isToHex) {
  return isToHex ? formatHexAddress(address) : formatCip37Address(address, networkId)
}


module.exports = {
  formatCommonInput,
  formatTransaction,
  formatBlock,
  formatTxParams,
  formatEpoch,
  formatEpochOfParams,
  formatAddress,
  formatHexAddress,
  formatTxHexAddress,
  deepFormatAddress: (obj, networkId) => deepFormatAnyAddress(obj, networkId),
  deepFormatHexAddress: obj => deepFormatAnyAddress(obj, 0, true),
  formatLog,
};
