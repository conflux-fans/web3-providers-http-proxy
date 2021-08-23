const JsonRpcProxy = require('../src');
const { buildJsonRpcPayload } = require('../src/utils');
const { format } = require('js-conflux-sdk')

const URL = 'https://test.confluxrpc.com';
// const URL = 'http://localhost:12537';
// const URL = 'http://59.110.70.5:12537'

const testAddress = 'cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957';

const defaultOptions = {
  respAddressBeHex: false,
  respTxBeEip155: false
}
class client {
  constructor(url, options = defaultOptions) {
    this.proxy = new JsonRpcProxy(url, options);
  }

  async asyncSend(method, ...params) {
    const payload = buildJsonRpcPayload(method, ...params);
    return await this.proxy.asyncSend(payload);
  }
}

const cfxAddrClient = new client(URL)
const hexAddrClient = new client(URL, { respAddressBeHex: true })
const eip155Client = new client(URL, { respTxBeEip155: true })

module.exports = {
  testAddress,
  hexTestAddress: format.hexAddress(testAddress),
  asyncSend: cfxAddrClient.asyncSend.bind(cfxAddrClient),
  asyncSendWithHexAddrRes: hexAddrClient.asyncSend.bind(hexAddrClient),
  asyncSendWithEip155Res: eip155Client.asyncSend.bind(eip155Client)
};