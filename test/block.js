const assert = require('chai').assert;
const { asyncSend } = require('./client');
const util  = require('../src/utils/');
const { describe, it } = require("mocha")

describe('Block related methods', function() {
  describe('getBlockByHash', function() {
    it('should return hex number', async function() {
      let blockHash = '0x67453672333f2378ea2ca072814a771637202ddafaa4cb79873b22ef78041ea3';
      let {result} = await asyncSend('eth_getBlockByHash', blockHash, false);
      assert.containsAllKeys(result, assert.blockKeys);
    });
  });

  describe('getBlockByNumber', function() {
    it('should return hex number', async function() {
      let {result} = await asyncSend('eth_getBlockByNumber', util.numToHex(100), false);
      assert.containsAllKeys(result, assert.blockKeys);
    });
  });
});

