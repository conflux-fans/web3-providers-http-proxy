const { createAsyncMiddleware } = require('json-rpc-engine');
const { Conflux } = require('js-conflux-sdk');

class Agent {
    constructor(url) {
        this.cfx = new Conflux({url: url});
        this.provider = this.cfx.provider;
    }
}

function createSendMiddleware(url) {
    const agent = new Agent(url);

    return createAsyncMiddleware(sendRequest);
    
    async function sendRequest(req, res) {
        let tmp = await agent.provider.request(req);
        res.result = tmp.result;
    }
}

module.exports = createSendMiddleware;