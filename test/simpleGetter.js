const { send, hexTestAddress, isHex, isHexOrNull } = require('./index');

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

  describe('net_version', function() {
    it('should return hex number', async function() {
      let {result} = await send('net_version');
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
      let {result, error} = await send('eth_accounts');
      console.log("getAccounts result: ", result, error);
    });
  });
});

