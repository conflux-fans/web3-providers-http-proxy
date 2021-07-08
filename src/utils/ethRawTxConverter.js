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
    nonce: nonce.lengh ? format.hex(nonce) : '0x0',
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

module.exports = ethRawTxConverter;

// let rawTx = '0xf86a8086d55698372431831e8480941292d4955bb47f5153b88ca12c7a9e4048f09839843b9aca008027a0baf5a8a17c7ef8e8b9e375addaa397df367507518ec3c80a1016b44669e3e18ca02f101cf49b158b7134f61610e17541c5b8f22a31e1ce32d489538c3b47aac982';
// console.log(decodeWithEthers(rawTx));
// console.log(decodeTxWithTxDecoder(rawTx));
// console.log(rlpDecodeEthRawTx(rawTx));
// console.log(ethRawTxConverter(rawTx));