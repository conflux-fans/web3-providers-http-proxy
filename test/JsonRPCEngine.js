const { JsonRpcEngine, createAsyncMiddleware, createScaffoldMiddleware}= require('json-rpc-engine');

const format = require('../src/format');
const pify = require('pify');

const engine = new JsonRpcEngine();
const { Conflux } = require('js-conflux-sdk');

const URL = 'https://testnet-rpc.conflux-chain.org.cn/v2';
const conflux = new Conflux({
    url: URL,
    networkId: 1,
});

const address0 = 'cfxtest:aanu79h2zdyhamsfc5jaea5r0b2pdh5jky362gbbhn';
const address0_Hex = '0x170efcf8a8e87029c516d002036db070c19f684d';

async function inputAdaptor(params, networkId) {
    params[0] = format.formatAddress(params[0], networkId);
    format.formatEpochOfParams(params, 1);
    return params;
} 

// get address balance
async function getBalance (req, res) {
    console.log(req);
    console.log(req.params[0]);
    //res.result = Number(await conflux.getBalance(req.params)) / 1e18;
    if(req.params) {
        req.params = inputAdaptor(req.params, 1);
    }
    res = req;
    return res; 
}

function createMiddleware() {
    return createScaffoldMiddleware({
        'eth_getBalance': createAsyncMiddleware(getBalance),
    });
}

function buildJsonRpcRequest(method, ...params) {
    return {
      "jsonrpc": "2.0",
      "id": Date.now().toString(),
      method,
      params,
    }
}

async function testEngine() {
    engine.push(createMiddleware());
    let payload = buildJsonRpcRequest('eth_getBalance', address0_Hex);
    let getterResponse = await pify(engine.handle).call(engine, payload);
    console.log(getterResponse);
}

testEngine();