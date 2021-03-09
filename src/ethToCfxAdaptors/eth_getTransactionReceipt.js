const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getTransactionReceipt
 * cfx method: cfx_getTransactionReceipt
 * 
 * inputs example:
 * 
 * outputs example:
 Object - A transaction receipt object, or null when no receipt was found:
  transactionHash : DATA, 32 Bytes - hash of the transaction.
  transactionIndex: QUANTITY - integer of the transactions index position in the block.
  blockHash: DATA, 32 Bytes - hash of the block where this transaction was in.
  blockNumber: QUANTITY - block number where this transaction was in.
  from: DATA, 20 Bytes - address of the sender.
  to: DATA, 20 Bytes - address of the receiver. null when its a contract creation transaction.
  cumulativeGasUsed : QUANTITY  - The total amount of gas used when this transaction was executed in the block.
  gasUsed : QUANTITY  - The amount of gas used by this specific transaction alone.
  contractAddress : DATA, 20 Bytes - The contract address created, if the transaction was a contract creation, otherwise null.
  logs: Array - Array of log objects, which this transaction generated.
  logsBloom: DATA, 256 Bytes - Bloom filter for light clients to quickly retrieve related logs.

  {
    transactionHash: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238',
    transactionIndex:  '0x1', // 1
    blockNumber: '0xb', // 11
    blockHash: '0xc6ef2fc5426d6ad6fd9e2a26abeab0aa2411b7ab17f30a99d3cb96aed1d1055b',
    cumulativeGasUsed: '0x33bc', // 13244
    gasUsed: '0x4dc', // 1244
    contractAddress: '0xb60e8dd61c5d32be8058bb8eb970870f07233155', // or null, if none was created
    logs: [{
        // logs as returned by getFilterLogs, etc.
    }, ...],
    logsBloom: "0x00...0", // 256 byte bloom filter
    status: '0x1'
  }
 * 
 */
async function outputAdaptor(response) {
  if (!response || !response.result) return;
  txReceipt = response.result;
  if (txReceipt.contractCreated) {
    txReceipt.contractCreated = format.formatHexAddress(
      txReceipt.contractCreated
    );
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
  return response;
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);
