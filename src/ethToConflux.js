
const tagMapper = {
    "earliest": "earliest",
    "latest": "latest_mined",
    "pending": "latest_state",
};

// latest_checkpoint

function emptyFn(data) {
    return data;
}

const bridge = {
    'eth_blockNumber': {
        method: "cfx_epochNumber",
        input: emptyFn,
        output: emptyFn
    },
    "eth_call": {
        method: "cfx_call",
        input: function (params) {
            // 1. add nonce parameter to tx object
            // TODO
            // 2. block number tag map
            if (Array.isArray(params)) {
                if (params.length == 2) {
                    let toMap = tagMapper[params[1]];
                    if (toMap) {
                        params[1] = toMap;
                    }
                }
            }
            return params;
        },
        output: emptyFn
    }
};

function ethToConflux(payload) {
    const handler = bridge[payload.method];
    if(!handler) {
        return emptyFn;
    }
    payload.method = handler.method;
    payload.params = handler.input(payload.params);
    return handler.output;
}

module.exports = ethToConflux;