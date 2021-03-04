const defaultMethodAdaptor = require('./defaultMethodAdaptor');
const util = require('./util');

class JsonRPCAdapter {
    constructor(inputAdaptor = util.asyncEmptyFn, outputAdaptor = util.asyncEmptyFn, methodAdaptor = defaultMethodAdaptor) {
        this.inputAdaptor = inputAdaptor;
        this.outputAdaptor = outputAdaptor;
        this.methodAdaptor = methodAdaptor;
    }

    async adaptInput(payload) {
        payload.method = this.methodAdaptor(payload.method);
        payload.input = await this.inputAdaptor(payload.input);
    }

    async adaptOutput(data) {
        if (data.result) {
            await this.outputAdaptor(data.result);
        }
    }
}

module.exports = JsonRPCAdapter;