const ETHTXDecoder = require('ethereum-tx-decoder');
const RLP = require('rlp');
const { ethers } = require("ethers");
const { format, Transaction } = require('js-conflux-sdk');
const MAX_UINT64 = '0xffffffffffffffff';
 
function decodeWithEthers(rawTx) {
  const decoded = ethers.utils.parseTransaction(rawTx);
  return {
    ...decoded,
    gasPrice: decoded.gasPrice.toHexString(),
    gas: decoded.gasLimit.toHexString(),
    value: decoded.value.toHexString(),
    chainId: decoded.chainId,
    // nonce: decoded.nonce,
    // to: decoded.to,
    // data: decoded.data,
    // v: decoded.v,
    // r: decoded.r,
    // s: decoded.s,
  };
}

function decodeWithTxDecoder(rawTx) {
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

function ethRawTxConverter(rawTx) {
  // const txInfo = decodeWithRlp(rawTx);
  const txInfo = decodeWithEthers(rawTx);
  if (!txInfo.chainId || txInfo.v < 35) {
    throw new Error('Unsupported old ethereum raw transaction');
  }
  if (txInfo.to && !(txInfo.to.startsWith('0x1') || txInfo.to.startsWith('0x8') || txInfo.to.startsWith('0x0'))) {
    throw new Error('Transaction\'s should start with 0x0, 0x1, 0x8');
  }
  txInfo.epochHeight = MAX_UINT64;
  txInfo.storageLimit = MAX_UINT64;
  txInfo.v -= txInfo.chainId * 2 + 35;
  // txInfo.v -= txInfo.v > 35 ? txInfo.chainId * 2 + 35 : 27;
  const cfxTx = new Transaction(txInfo);
  return cfxTx.serialize();
}

function formatToNumberHex(buf) {
  return buf.lengh ? format.hex(buf) : '0x0'
}

module.exports = ethRawTxConverter;


// let decoded = decodeCFXTXWithRlp('0xf877f380844190ab00825208940d2418c13e6d48beee26f2cf42d67dfe0b0613de8088ffffffffffffffff88ffffffffffffffff028001a094c274e6fa1dc73ce514c3c82c98890c616ce5386892029a3631dd5d12539aa2a054bf5caeefaa3e0c91a336e55b77f9ddd2e74e5ddaac1751fecc80cb67c0fc27');
// console.log(decoded);