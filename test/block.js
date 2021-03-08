const assert = require('chai').assert;
const expect = require('chai').expect;
const { send, hexTestAddress, isHex, isHexOrNull } = require('./index');
const { util } = require('../src/');

const keys = [
  'number',
  'hash',
  'parentHash',
  'nonce',
  'sha3Uncles',
  'logsBloom',
  'transactionsRoot',
  'stateRoot',
  'receiptsRoot',
  'miner',
  'difficulty',
  'totalDifficulty',
  'extraData',
  'size',
  'gasLimit',
  'gasUsed',
  'transactions',
  'uncles',
];

describe('Block related methods', function() {
  describe('getBlockByHash', function() {
    it('should return hex number', async function() {
      let blockHash = '0x67453672333f2378ea2ca072814a771637202ddafaa4cb79873b22ef78041ea3';
      let {result} = await send('eth_getBlockByHash', blockHash, false);
      assert.containsAllKeys(result, keys);
    });
  });

  describe('getBlockByNumber', function() {
    it('should return hex number', async function() {
      let {result} = await send('eth_getBlockByNumber', util.numToHex(100), false);
      assert.containsAllKeys(result, keys);
    });
  });
});

