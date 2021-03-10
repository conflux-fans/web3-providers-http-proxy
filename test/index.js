const util = require('util');
const _ = require('lodash');
const assert = require('assert');
const {HttpProvider, ethToConflux, util: {buildJsonRpcRequest}} = require('../src');

const URL = 'https://testnet-rpc.conflux-chain.org.cn/v2';
const provider = new HttpProvider(URL, {
  chainAdaptor: ethToConflux,
  networkId: 1,
  privateKeys: [
    '0x3f841bf589fdf83a521e55d51afddc34fa65351161eead24f064855fc29c9580',
  ]
});
const promsieWrapSend = util.promisify(provider.send).bind(provider);
const testAddress = 'cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957';
const hexTestAddress = '0x1386b4185a223ef49592233b69291bbe5a80c527';

async function send(method, ...params) {
  let payload = buildJsonRpcRequest(method, ...params);
  return await promsieWrapSend(payload);
}

function isHex(str) {
  assert(_.isString(str), "required a string");
  assert(str.startsWith('0x') || str.startsWith('0X'));
}

function isHexOrNull(str) {
  if (!str) return;
  isHex(str);
}

module.exports = {
  send,
  testAddress,
  hexTestAddress,
  isHex,
  isHexOrNull,
};