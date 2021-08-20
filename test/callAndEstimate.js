const { asyncSend } = require('./index');
const util = require('../src/utils/');
const { describe, it } = require("mocha")
const { isHex } = require('./assert')

describe('call-and-estimate', function () {
  describe('eth_call', function () {
    it('should return hex number', async function () {
      let data = {
        from: '0x13d2ba4ed43542e7c54fbb6c5fccb9f269c1f94c',
        to: '0x1386b4185a223ef49592233b69291bbe5a80c527',
        value: util.numToHex(100)
      };
      let { result } = await asyncSend('eth_call', data);
      isHex(result);
    });
  });

  describe('eth_estimateGas', function () {
    it('should return gasUsed', async function () {
      let data = {
        from: '0x13d2ba4ed43542e7c54fbb6c5fccb9f269c1f94c',
        to: '0x1386b4185a223ef49592233b69291bbe5a80c527',
        value: util.numToHex(100)
      };
      let { result } = await asyncSend('eth_estimateGas', data);
      isHex(result);
    });
  });
});

