const JsonRpcProxy = require('../src');
const util = require('../src/utils');

const URL = 'https://test.confluxrpc.com';
const networkId = 1;
const proxy = new JsonRpcProxy(URL, networkId);
const testAddress = 'cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957';
const hexTestAddress = '0x1386b4185a223ef49592233b69291bbe5a80c527';

async function send(method, ...params) {
  const payload = util.buildJsonRpcPayload(method, ...params);
  return await proxy.send(payload);
}

module.exports = {
  send,
  testAddress,
  hexTestAddress,
  isHex: util.isHex, 
  isHexOrNull: util.isHexOrNull,
};