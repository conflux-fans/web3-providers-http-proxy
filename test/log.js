const assert = require('chai').assert;
const { send } = require('./index');

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

describe('eth_getLogs', function() {
  describe('eth_getLogs', function() {
    it('should return hex number', async function() {
      let logFilter = {
        blockHashes: ['0xb41009dd2ad8485703f7a68503cd021bb62e6e6e1f948776ae04445eaaaab533']
      };
      let {result} = await send('eth_getLogs', logFilter);
      assert.isArray(result);
      assert.isAbove(result.length, 0);
      assert.containsAllKeys(result[0], keys);
    });
  });
});

