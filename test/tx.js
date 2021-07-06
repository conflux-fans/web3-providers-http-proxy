const assert = require('chai').assert;
const { send } = require('./index');
const txHash = '0x439b6df80114519fd0f201b2da788b07cd8b598a3b38242b0c9e277bd7c99c44';
const blockHash = '';
const blockNumber = '';

const keys = [
  'blockHash',
  'blockNumber',
  'from',
  'gas',
  'gasPrice',
  'hash',
  'input',
  'nonce',
  'to',
  'transactionIndex',
  'value',
  'v',
  'r',
  's'
];

const receiptKeys = [
  'transactionHash',
  'transactionIndex',
  'blockHash',
  'blockNumber',
  'from',
  'to',
  'cumulativeGasUsed',
  'gasUsed',
  'contractAddress',
  'logsBloom',
];

describe('Transaction', function() {
  describe('getTransactionByHash', function() {
    it('should return tx', async function() {
      let {result} = await send('eth_getTransactionByHash', txHash);
      // console.log('TX: ', result);
      assert.containsAllKeys(result, keys);
    });
  });

  /* describe('getTransactionByBlockHashAndIndex', function() {
    it('should return tx', async function() {
      let {result} = await send('eth_getTransactionByBlockHashAndIndex', blockHash, 0);
      // console.log('TX: ', result);
      assert.containsAllKeys(result, keys);
    });
  });

  describe('getTransactionByBlockNumberAndIndex', function() {
    it('should return tx', async function() {
      let {result} = await send('eth_getTransactionByBlockNumberAndIndex', blockNumber, 0);
      // console.log('TX: ', result);
      assert.containsAllKeys(result, keys);
    });
  }); */

  describe('getTransactionReceipt', function () {
    it('should return receipt', async function() {
      let {result} = await send('eth_getTransactionReceipt', txHash);
      // console.log('Receipt: ', result);
      assert.containsAllKeys(result, receiptKeys);
    });
  });

});

