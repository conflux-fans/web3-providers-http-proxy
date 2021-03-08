const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const _ = require('lodash');

/**
 * eth method: eth_getLogs
 * cfx method: cfx_getLogs
 * 
 * inputs example:
 Object - The filter options:
    fromBlock: QUANTITY|TAG - (optional, default: "latest") Integer block number, or "latest" for the last mined block or "pending", "earliest" for not yet mined transactions.
    toBlock: QUANTITY|TAG - (optional, default: "latest") Integer block number, or "latest" for the last mined block or "pending", "earliest" for not yet mined transactions.
    address: DATA|Array, 20 Bytes - (optional) Contract address or a list of addresses from which logs should originate.
    topics: Array of DATA, - (optional) Array of 32 Bytes DATA topics. Topics are order-dependent. Each topic can also be an array of DATA with “or” options.
    blockhash: DATA, 32 Bytes - (optional, future) 
 * outputs example:
    TODO
 */

async function inputAdaptor(params) {
  if (params.length > 0) {
    let fromBlock = params[0].fromBlock;
    let toBlock = params[0].toBlock;
    params[0].fromEpoch = format.formatEpoch(fromBlock);
    params[0].toEpoch = format.formatEpoch(toBlock);
    // blockhash
    if (params[0].blockhash) {
      if (_.isArray(params[0].blockHashes)) {
        params[0].blockHashes.push(params[0].blockhash);
      } else {
        params[0].blockHashes = [params[0].blockhash];
      }
    }
  }
}

async function outputAdaptor(response) {
  if (!response || !response.result) return;
  response.result.forEach(format.formatLog);
}

module.exports = new Adaptor(inputAdaptor, outputAdaptor);

/**
 {
    "logIndex": "0x1", // 1
    "blockNumber":"0x1b4", // 436
    "blockHash": "0x8216c5785ac562ff41e2dcfdf5785ac562ff41e2dcfdf829c5a142f1fccd7d",
    "transactionHash":  "0xdf829c5a142f1fccd7d8216c5785ac562ff41e2dcfdf5785ac562ff41e2dcf",
    "transactionIndex": "0x0", // 0
    "address": "0x16c5785ac562ff41e2dcfdf829c5a142f1fccd7d",
    "data":"0x0000000000000000000000000000000000000000000000000000000000000000",
    "topics": ["0x59ebeb90bc63057b6515673c3ecf9438e5058bca0f92585014eced636878c9a5"]
    }
 */
