// const ETHTXDecoder = require('ethereum-tx-decoder');
// const RLP = require('rlp');
const { ethers } = require("ethers");
const { 
  // format, 
  Transaction 
} = require('js-conflux-sdk');
const MAX_UINT64 = '0xffffffffffffffff';
const VALID_ADDRESS_PREFIX = ['0x0', '0x1', '0x8'];
 
/* function decodeWithTxDecoder(rawTx) {
  return ETHTXDecoder.decodeTx(rawTx);
}

function decodeWithRlp(tx) {
  let rlpDecoded = RLP.decode(tx);
  let [nonce, gasPrice, gas, to, value, data, v, r, s] = rlpDecoded;
  return {
    nonce: formatToNumberHex(nonce),
    gasPrice: format.hex(gasPrice),
    gas: format.hex(gas),
    to: format.hex(to),
    value: format.hex(value),
    data: format.hex(data),
    v: format.uInt(v), 
    r: format.hex(r),
    s: format.hex(s),
  };
}

function decodeCFXTXWithRlp(tx) {
  let rlpDecoded = RLP.decode(tx);
  let [[nonce, gasPrice, gas, to, value, storageLimit, epochHeight, chainId, data], v, r, s] = rlpDecoded;
  return {
    nonce: formatToNumberHex(nonce),
    gasPrice: format.hex(gasPrice),
    gas: format.hex(gas),
    to: format.hex(to),
    value: formatToNumberHex(value),
    data: format.hex(data),
    v: format.uInt(v), 
    r: format.hex(r),
    s: format.hex(s),
    storageLimit: format.hex(storageLimit),
    chainId: format.hex(chainId),
    epochHeight: format.hex(epochHeight)
  };
} 

function formatToNumberHex(buf) {
  return buf.lengh ? format.hex(buf) : '0x0'
}

*/

function decodeWithEthers(rawTx) {
  const decoded = ethers.utils.parseTransaction(rawTx);
  return {
    ...decoded,
    gasPrice: decoded.gasPrice.toHexString(),
    gas: decoded.gasLimit.toHexString(),
    value: decoded.value.toHexString(),
    // chainId: decoded.chainId,
    // nonce: decoded.nonce,
    // to: decoded.to,
    // data: decoded.data,
    // v: decoded.v,
    // r: decoded.r,
    // s: decoded.s,
  };
}

function ethRawTxConverter(rawTx) {
  // const txInfo = decodeWithRlp(rawTx);
  const txInfo = decodeWithEthers(rawTx);
  if (!txInfo.chainId || txInfo.v < 35) {
    throw new Error('Only EIP-155 format transaction is supported');
  }
  if (!txInfo.from.startsWith('0x1')) {
    throw new Error("Transaction's 'from' should start with 0x1");
  }
  if (txInfo.to && VALID_ADDRESS_PREFIX.indexOf(txInfo.to.slice(0, 3)) === -1) {
    throw new Error("Transaction's 'to' should start with 0x0, 0x1, 0x8");
  }
  txInfo.epochHeight = MAX_UINT64;
  txInfo.storageLimit = MAX_UINT64;
  txInfo.v -= txInfo.chainId * 2 + 35;
  // txInfo.v -= txInfo.v > 35 ? txInfo.chainId * 2 + 35 : 27;
  const cfxTx = new Transaction(txInfo);
  return {
    info: txInfo,
    rawTx: cfxTx.serialize()
  };
}

module.exports = ethRawTxConverter;
