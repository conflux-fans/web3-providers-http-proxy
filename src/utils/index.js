
const { ethers } = require("ethers");
const util = require("util")

require('debug').formatters.u = (v) => {
  return unfold(v)
}

function setNull(object, keys) {
  for (let key of keys) {
    object[key] = null;
  }
}

function delKeys(object, keys) {
  for (let key of keys) {
    delete object[key];
  }
}

function buildJsonRpcPayload(method, ...params) {
  return {
    "jsonrpc": "2.0",
    "id": Date.now().toString(),
    method,
    params,
  }
}

function unfold(obj) {
  return util.inspect(obj, false, 100, true)
}

function createAsyncMiddleware(asyncMiddleware) {
  return async (req, res, next, end) => {
    // nextPromise is the key to the implementation
    // it is resolved by the return handler passed to the
    // "next" function
    let resolveNextPromise;
    const nextPromise = new Promise((resolve) => {
      resolveNextPromise = resolve;
    });
    let returnHandlerCallback = null;
    let nextWasCalled = false;
    // This will be called by the consumer's async middleware.
    const asyncNext = async () => {
      nextWasCalled = true;
      // We pass a return handler to next(). When it is called by the engine,
      // the consumer's async middleware will resume executing.
      next((runReturnHandlersCallback) => {
        // This callback comes from JsonRpcEngine._runReturnHandlers
        returnHandlerCallback = runReturnHandlersCallback;
        resolveNextPromise();
      });
      await nextPromise;
    };
    try {
      await asyncMiddleware(req, res, asyncNext);
      if (nextWasCalled) {
        await nextPromise; // we must wait until the return handler is called
        returnHandlerCallback(null);
      }
      else {
        end(null);
      }
    }
    catch (error) {
      // console.error(error)
      if (error instanceof Error) {
        // eslint-disable-next-line no-ex-assign
        error = {
          message: error.message,
          stack: error.stack
        }
      }
      if (returnHandlerCallback) {
        returnHandlerCallback(error);
      }
      else {
        end(error);
      }
    }
  };
}

module.exports = {
  emptyFN: origin => origin,

  asyncEmptyFN: async origin => origin,

  setNull,

  delKeys,

  buildJsonRpcPayload,

  numToHex: ethers.utils.hexValue,

  isHex: ethers.utils.isHexString,

  isHexOrNull: origin => origin === null || ethers.utils.isHexString(origin),

  unfold,

  createAsyncMiddleware,

  createDebug: require("debug")
};
