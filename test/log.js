const assert = require('chai').assert;
const { asyncSend, asyncSendWithHexAddrRes } = require('./client');
const { describe, it } = require("mocha")
const { isHex, isValidCfxAddress } = require('./assert')

const keys = [
  'logIndex',
  'blockNumber',
  'blockHash',
  'transactionHash',
  'transactionIndex',
  'address',
  'data',
  'topics'
];

describe('eth_getLogs', function () {
  describe('eth_getLogs', function () {
    it('should return cfx address', async function () {
      let logFilter = {
        // blockHashes: ['0xc880122fc1e68589087320e1e7e40198c8bb2f95d3730797c3f20f7958efc7cc'],
        // fromBlock: 39782984,
        // toBlock: 39783084,

        fromBlock: '0x2f4f366',
        toBlock: '0x2f4f3dc',
      };
      let { result } = await asyncSend('eth_getLogs', logFilter);
      assert.isArray(result);
      assert.isAbove(result.length, 0);
      assert.containsAllKeys(result[0], keys);
      isValidCfxAddress(result[0].address)
    });

    it('should return hex address', async function () {
      let logFilter = {
        // blockHashes: ['0xc880122fc1e68589087320e1e7e40198c8bb2f95d3730797c3f20f7958efc7cc'],
        // fromBlock: 39782984,
        // toBlock: 39783084,

        fromBlock: '0x2f4f366',
        toBlock: '0x2f4f3dc',
      };
      let { result } = await asyncSendWithHexAddrRes('eth_getLogs', logFilter);
      assert.isArray(result);
      assert.isAbove(result.length, 0);
      assert.containsAllKeys(result[0], keys);
      isHex(result[0].address)
    });
  });
});

