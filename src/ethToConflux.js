const {emptyFn, numToHex} = require('./util');
const debug = require('debug')('ethToConflux');

// TO MAP latest_checkpoint
const TAG_MAP = {
    "earliest": "earliest",
    "latest": "latest_state",
    "pending": "latest_state",
};

function formatInput(params) {
    // 1. add nonce parameter to tx object
    // TODO
    // 2. block number tag map
    if (params[0]) {
        if (params[0].gas && Number.isInteger(params[0].gas)) {
            params[0].gas = numToHex(params[0].gas);
        }
        if (params[0].gasPrice && Number.isInteger(params[0].gasPrice)) {
            params[0].gasPrice = numToHex(params[0].gasPrice);
        }
    }
    mapParamsTagAtIndex(params, 1);
    return params;
}

const bridge = {
    "eth_blockNumber": {
        method: "cfx_epochNumber",
        input: function(params) {
            mapParamsTagAtIndex(params, 0);
        }
    },
    "eth_sendRawTransaction": {
        method: "cfx_sendRawTransaction"
    },
    "eth_getBalance": {
        method: "cfx_getBalance",
        input: function(params) {
            mapParamsTagAtIndex(params, 1);
        }
    },
    "eth_getCode": {
        method: "cfx_getCode",
        input: function(params) {
            mapParamsTagAtIndex(params, 1);
        }
    },
    "eth_getTransactionCount": {
        method: "cfx_getNextNonce",
        input: function(params) {
            mapParamsTagAtIndex(params, 1);
        }
    },
    "eth_gasPrice": {
        method: "cfx_gasPrice"
    },
    "eth_accounts": {
        method: "accounts"
    },
    "eth_call": {
        method: "cfx_call",
        input: formatInput,
        output: emptyFn
    },
    "eth_estimateGas": {
        method: "cfx_estimateGasAndCollateral",
        input: formatInput,
        output: function (result) {
            if (result && result.gasUsed) {
                return result.gasUsed
            }
            return result;
        }
    }
};

function ethToConflux(payload) {
    const oldMethod = payload.method;
    const handler = bridge[payload.method];
    if (!handler) {
        return emptyFn;
    }
    debug(`Mapping "${oldMethod}" to "${handler.method}"`);
    payload.method = handler.method;
    if (handler.input) {
        payload.params = handler.input(payload.params);
    }
    return handler.output || emptyFn;
}

function mapTag(tag) {
    return TAG_MAP[tag] || tag;
}

function mapParamsTagAtIndex(params, index) {
    if (params[index]) {
        params[index] = mapTag(params[index]);
    }
}

module.exports = ethToConflux;