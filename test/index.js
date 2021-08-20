const JsonRpcProxy = require('../src');
const { buildJsonRpcPayload } = require('../src/utils');
// const assert = require('chai').assert;
const { format } = require('js-conflux-sdk')
// const { isValidCfxAddress } = require("js-conflux-sdk").address

// const URL = 'https://test.confluxrpc.com';
// const URL = 'http://localhost:12537';
const URL = 'http://59.110.70.5:12537'

// const proxy = new JsonRpcProxy(URL, true);
const testAddress = 'cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957';

class client {
  constructor(url, isRespAddressHex = false) {
    this.proxy = new JsonRpcProxy(url, isRespAddressHex);
  }

  async asyncSend(method, ...params) {
    const payload = buildJsonRpcPayload(method, ...params);
    return await this.proxy.asyncSend(payload);
  }
}
// async function asyncSend(method, ...params) {
//   const payload = buildJsonRpcPayload(method, ...params);
//   return await proxy.asyncSend(payload);
// }

const hexAddrClient = new client(URL)
const cfxAddrClient = new client(URL, true)

module.exports = {
  testAddress,
  hexTestAddress: format.hexAddress(testAddress),
  asyncSend: hexAddrClient.asyncSend.bind(hexAddrClient),
  asyncSendWithHexAddrRes: cfxAddrClient.asyncSend.bind(cfxAddrClient),
  // isHex: val => assert(isHex(val), `expect hex, actual ${val}`),
  // isHexOrNull: val => assert(isHexOrNull(val), `expect hex or null, actual ${val}`),
  // isValidCfxAddress: val => assert(isValidCfxAddress(val), `expect cfx address, actual ${val}`),
  // isValidCfxAddressOrNull: val => assert(val === null || isValidCfxAddress(val), `expect cfx address, actual ${val}`),
  // isContainsAllKeys: (val, keys) => assert.containsAllKeys(val, keys, `should contrain all keys, actual ${val}`)
};