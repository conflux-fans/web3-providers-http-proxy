/* const { JsonRpcProxy } = require('../src');
const { hexTestAddress, isHex, isHexOrNull } = require('./index');
const assert = require('chai').assert;
const expect = require('chai').expect;
const { util: {buildJsonRpcPayload}} = require('../src');
const { util } = require('../src/');

const wssURL = 'ws://testnet-rpc.conflux-chain.org.cn/ws/v2';
const httpURL = 'https://testnet-rpc.conflux-chain.org.cn/v2';
const proxy = new JsonRpcProxy(httpURL, 1);

const txHash = '0x439b6df80114519fd0f201b2da788b07cd8b598a3b38242b0c9e277bd7c99c44';

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

const log_keys = [
    'logIndex',
    'blockNumber',
    'blockHash',
    'transactionHash',
    'transactionIndex',
    'address',
    'data',
    'topics'
  ];

const tx_keys = [
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

async function send(method, ...params) {
    let payload = buildJsonRpcPayload(method, ...params);
    let res = await proxy.send(payload);
    //console.log('res: ', res)
    return res;
}

describe('Json Rpc Proxy', function(){
    describe('Transaction', function() {
        describe('getTransactionByHash', function() {
          it('should return tx', async function() {
            let {result} = await send('eth_getTransactionByHash', txHash);
            assert.containsAllKeys(result, tx_keys);
          });
        });
      
        describe('getTransactionReceipt', function () {
          it('should return receipt', async function() {
            let {result} = await send('eth_getTransactionReceipt', txHash);
            assert.containsAllKeys(result, receiptKeys);
          });
        });
      
      });
    describe('eth_getLogs', function() {
        describe('eth_getLogs', function() {
          it('should return hex number', async function() {
            let logFilter = {
              blockHashes: ['0xb41009dd2ad8485703f7a68503cd021bb62e6e6e1f948776ae04445eaaaab533']
            };
            let {result} = await send('eth_getLogs', logFilter);
            assert.isArray(result);
            assert.isAbove(result.length, 0);
            assert.containsAllKeys(result[0], log_keys);
          });
        });
      });
      
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
    
    describe('call-and-estimate', function() {
        describe('eth_call', function() {
          it('should return hex number', async function() {
            let data = {
              from: '0x13d2ba4ed43542e7c54fbb6c5fccb9f269c1f94c',
              to: '0x1386b4185a223ef49592233b69291bbe5a80c527',
              value: util.numToHex(100)
            };
            let {result} = await send('eth_call', data);
            isHex(result);
          });
        });
      
        describe('eth_estimateGas', function() {
          it('should return gasUsed', async function() {
            let data = {
              from: '0x13d2ba4ed43542e7c54fbb6c5fccb9f269c1f94c',
              to: '0x1386b4185a223ef49592233b69291bbe5a80c527',
              value: util.numToHex(100)
            };
            let {result} = await send('eth_estimateGas', data);
            isHex(result);
          });
        });
      });
      
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

    describe('Simple getter', function() {
        describe('blockNumber', function() {
          it('should return hex number', async function() {
            let {result} = await send('eth_blockNumber');
            isHex(result);
          });
        });
      
        describe('chainId', function() {
          it('should return hex number', async function() {
            let {result} = await send('eth_chainId');
            isHex(result);
          });
        });
      
        describe('gasPrice', function() {
          it('should return hex number', async function() {
            let {result} = await send('eth_gasPrice');
            isHex(result);
          });
        });
      
        describe('gasBalance', function() {
          it('should return hex number', async function() {
            let {result} = await send('eth_getBalance', hexTestAddress);
            isHex(result);
          });
        });
      
        describe('getCode', function() {
          it('should return hex number', async function() {
            let {result} = await send('eth_getCode', hexTestAddress);
            isHex(result);
          });
        });
      
        describe('getStorageAt', function() {
          it('should return hex number', async function() {
            let index = '0x0000000000000000000000000000000000000000000000000000000000000001';
            let {result} = await send('eth_getStorageAt', hexTestAddress, index);
            isHexOrNull(result);
          });
        });
      
        describe('getTransactionCount', function() {
          it('should return hex number', async function() {
            let {result} = await send('eth_getTransactionCount', hexTestAddress);
            isHex(result);
          });
        });
      
        describe('getAccounts', function() {
          it('should return address array', async function() {
            let {result} = await send('eth_accounts');
            console.log("getAccounts result: ", result);
          });
        });
      });  
}); */