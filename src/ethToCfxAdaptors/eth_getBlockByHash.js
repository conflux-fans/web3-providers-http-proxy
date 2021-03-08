const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getBlockByHash
 * cfx method: cfx_getBlockByHash
 * 
 * inputs example:
 * 
 * outputs example:
 Object - A block object, or null when no block was found:
 
number: QUANTITY - the block number. null when its pending block.
hash: DATA, 32 Bytes - hash of the block. null when its pending block.
parentHash: DATA, 32 Bytes - hash of the parent block.
nonce: DATA, 8 Bytes - hash of the generated proof-of-work. null when its pending block.
sha3Uncles: DATA, 32 Bytes - SHA3 of the uncles data in the block.
logsBloom: DATA, 256 Bytes - the bloom filter for the logs of the block. null when its pending block.
transactionsRoot: DATA, 32 Bytes - the root of the transaction trie of the block.
stateRoot: DATA, 32 Bytes - the root of the final state trie of the block.
receiptsRoot: DATA, 32 Bytes - the root of the receipts trie of the block.
miner: DATA, 20 Bytes - the address of the beneficiary to whom the mining rewards were given.
difficulty: QUANTITY - integer of the difficulty for this block.
totalDifficulty: QUANTITY - integer of the total difficulty of the chain until this block.
extraData: DATA - the “extra data” field of this block.
size: QUANTITY - integer the size of this block in bytes.
gasLimit: QUANTITY - the maximum gas allowed in this block.
gasUsed: QUANTITY - the total used gas by all transactions in this block.
timestamp: QUANTITY - the unix timestamp for when the block was collated.
transactions: Array - Array of transaction objects, or 32 Bytes transaction hashes depending on the last given parameter.
uncles: Array - Array of uncle hashes.
 */
async function outputAdaptor(response) {
  if (!response || !response.result) return;
  format.formatBlock(response.result);
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);
