const JsonRpcProxy = require('../src');
const { buildJsonRpcPayload } = require('../src/utils');
const { format } = require('js-conflux-sdk')

const URL = 'https://test.confluxrpc.com';
// const URL = 'http://localhost:12537';
// const URL = 'http://59.110.70.5:12537'

const testAddress = 'cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957';

const PrivateKey = '0x0ecd25d425213b6f3f15988f5f7a55db924027e9772c7b9afc921675bb20409e';
const HexAddress = '0x16b165ea0b142a448e3246d4a21444049692283b';
const Base32Address = 'cfxtest:aannc3tmbpmcyvesgkdrkjuyjuckrevjhpepdf4u7f';

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
  asyncSendWithEip155Res: eip155Client.asyncSend.bind(eip155Client),
  account: {
    PrivateKey,
    HexAddress,
    Base32Address,
  }
};