const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getTransactionByHash
 * cfx method: cfx_getTransactionByHash
 * 
 * inputs example:
 * 
 * outputs example:
 Object - A transaction object, or null when no transaction was found:

    blockHash: DATA, 32 Bytes - hash of the block where this transaction was in. null when its pending.
    blockNumber: QUANTITY - block number where this transaction was in. null when its pending.
    from: DATA, 20 Bytes - address of the sender.
    gas: QUANTITY - gas provided by the sender.
    gasPrice: QUANTITY - gas price provided by the sender in Wei.
    hash: DATA, 32 Bytes - hash of the transaction.
    input: DATA - the data send along with the transaction.
    nonce: QUANTITY - the number of transactions made by the sender prior to this one.
    to: DATA, 20 Bytes - address of the receiver. null when its a contract creation transaction.
    transactionIndex: QUANTITY - integer of the transactions index position in the block. null when its pending.
    value: QUANTITY - value transferred in Wei.
    v: QUANTITY - ECDSA recovery id
    r: DATA, 32 Bytes - ECDSA signature r
    s: DATA, 32 Bytes - ECDSA signature s
 */
async function outputAdaptor(response) {
  if (!response || !response.result) return;
  format.formatTransaction(response.result);
  const block = await this.cfx.getBlockByHash(response.result.blockHash);
  response.result.blockNumber = util.numToHex(block.epochNumber);
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);

/**
 {
    "blockHash":"0x1d59ff54b1eb26b013ce3cb5fc9dab3705b415a67127a003c3e61eb445bb8df2",
    "blockNumber":"0x5daf3b", // 6139707
    "from":"0xa7d9ddbe1f17865597fbd27ec712455208b6b76d",
    "gas":"0xc350", // 50000
    "gasPrice":"0x4a817c800", // 20000000000
    "hash":"0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
    "input":"0x68656c6c6f21",
    "nonce":"0x15", // 21
    "to":"0xf02c1c8e6114b1dbe8937a39260b5b0a374432bb",
    "transactionIndex":"0x41", // 65
    "value":"0xf3dbb76162000", // 4290000000000000
    "v":"0x25", // 37
    "r":"0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
    "s":"0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
  }
 */