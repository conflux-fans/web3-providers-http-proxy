const { JsonRpcEngine } = require("json-rpc-engine");
const createAdaptorMiddleware = require('./Adaptor');
const createSendMiddleware = require('./send'); 

class Engine {
    constructor(url, networkId) {
        this.url = url;
        this.networkId = networkId;
        this.engine = new JsonRpcEngine();
    }

    init() {
        this.engine.push(createAdaptorMiddleware(this.url, this.networkId));
        this.engine.push(createSendMiddleware(this.url));
    }

    async send(req) {
        let res = await this.engine.handle(req);
        return res;
    }
}

module.exports = Engine;