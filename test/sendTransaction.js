const assert = require('chai').assert;
const { send, hexTestAddress, isHex, isHexOrNull } = require('./index');
const { util } = require('../src/');

describe('sendTransaction', function() {
  describe('eth_sendTransaction', function() {
    it('should return', async function() {
      let data = {
        from: '0x1515db5834d8f110eee96c3036854dbf1d87de2b',
        to: '0x1386b4185a223ef49592233b69291bbe5a80c527',
        value: util.numToHex(100)
      };
      let {result} = await send('eth_sendTransaction', data);
      console.log(result);
    });
  });
});

