const { JsonRpcEngine }= require('json-rpc-engine');
const { util } = require('../src/');
const pify = require('pify');

const engine = new JsonRpcEngine();

const { HttpProvider, ethToConflux, util: {buildJsonRpcRequest}} = require('../src');
const createProxyMiddleware = require('../src/jsonRpcEngine/Adaptor');
const createSendMiddleware = require('../src/jsonRpcEngine/send');

const URL = 'https://testnet-rpc.conflux-chain.org.cn/v2';
const wsURL = 'ws://testnet-rpc.conflux-chain.org.cn/ws/v2';

const provider = new HttpProvider(URL, {
    chainAdaptor: ethToConflux,
    networkId: 1,
    privateKeys: [
      '0x3f841bf589fdf83a521e55d51afddc34fa65351161eead24f064855fc29c9580',
    ]
});

const address0 = 'cfxtest:aanu79h2zdyhamsfc5jaea5r0b2pdh5jky362gbbhn';
const address0_Hex = '0x170efcf8a8e87029c516d002036db070c19f684d';

async function testEngine() {
    /*
    let payload = {
        jsonrpc: '2.0',
        id: '1616062397449',
        method: 'cfx_getBalance',
        params: [ 'cfxtest:aanu79h2zdyhamsfc5jaea5r0b2pdh5jky362gbbhn' ]
    }
    let res = await axios.post(URL, payload);
    console.log(res.data); 
    */

    engine.push(createProxyMiddleware(wsURL, 1));
    engine.push(createSendMiddleware(wsURL));
    let payload_0 = buildJsonRpcRequest('eth_getBalance', address0_Hex);
    let res_0 = await pify(engine.handle).call(engine, payload_0);
    console.log(res_0);
    //return;
    let data = {
        from: '0x13d2ba4ed43542e7c54fbb6c5fccb9f269c1f94c',
        to: '0x1386b4185a223ef49592233b69291bbe5a80c527',
        value: util.numToHex(100)
      };
    let payload_1 = buildJsonRpcRequest('eth_estimateGas', data);
    let res_1 = await pify(engine.handle).call(engine, payload_1);
    console.log(res_1);

    let payload_2 = buildJsonRpcRequest('net_version');
    let res_2 = await pify(engine.handle).call(engine, payload_2);
    console.log(res_2);
}

testEngine();