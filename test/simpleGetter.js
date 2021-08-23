const assert = require('chai').assert;
const { asyncSend, hexTestAddress } = require('./client');
const { isHex, isHexOrNull } = require('./assert')
const { describe, it } = require("mocha")

describe('Simple getter', function () {
  describe('blockNumber', function () {
    it('should return hex number', async function () {
      let { result } = await asyncSend('eth_blockNumber');
      isHex(result)
    });
  });

  describe('chainId', function () {
    it('should return hex number', async function () {
      let { result } = await asyncSend('eth_chainId');
      isHex(result)
    });
  });

  describe('net_version', function () {
    it('should return hex number', async function () {
      let { result } = await asyncSend('net_version');
      isHex(result)
    });
  });

  describe('gasPrice', function () {
    it('should return hex number', async function () {
      let { result } = await asyncSend('eth_gasPrice');
      isHex(result)
    });
  });

  describe('gasBalance', function () {
    it('should return hex number', async function () {
      let { result } = await asyncSend('eth_getBalance', hexTestAddress);
      isHex(result)
    });
  });

  describe('getCode', function () {
    it('should return hex number', async function () {
      let { result } = await asyncSend('eth_getCode', hexTestAddress);
      isHex(result)
    });
  });

  describe('getStorageAt', function () {
    it('should return hex number', async function () {
      let index = '0x0000000000000000000000000000000000000000000000000000000000000001';
      let { result } = await asyncSend('eth_getStorageAt', hexTestAddress, index);
      isHexOrNull(result)
    });
  });

  describe('getTransactionCount', function () {
    it('should return hex number', async function () {
      let { result } = await asyncSend('eth_getTransactionCount', hexTestAddress);
      isHex(result)
    });
  });

  describe('getAccounts', function () {
    it('should return address array', async function () {
      let { result, error } = await asyncSend('eth_accounts');
      result
        ? assert.isArray(result)
        : assert.isTrue(error.message == "the method accounts does not exist/is not available"
          || error.message == "Method not found")
    });
  });
});

