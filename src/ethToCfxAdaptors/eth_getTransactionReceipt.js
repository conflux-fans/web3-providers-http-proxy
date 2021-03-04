const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getTransactionReceipt
 * cfx method: cfx_getTransactionReceipt
 * 
 * inputs example:
 * 
 * outputs example:
 * 
 */
async function outputAdaptor(response) {
    if (response && response.result) {
        txReceipt = response.result;
        txReceipt.contractCreated = format.formatHexAddress(
          txReceipt.contractCreated
        );
        txReceipt.from = format.formatHexAddress(txReceipt.from);
        txReceipt.to = format.formatHexAddress(txReceipt.to);
        if (txReceipt.logs) {
          txReceipt.logs.forEach(
            l => (l.address = format.formatHexAddress(l.address))
          );
        }

        txReceipt.contractAddress = txReceipt.contractCreated;
        txReceipt.blockNumber = txReceipt.epochNumber;
        txReceipt.transactionIndex = txReceipt.index;
        // console.log("txReceipt.outcomeStatus",Number.parseInt(txReceipt.outcomeStatus));
        txReceipt.status = Number.parseInt(txReceipt.outcomeStatus)
          ? "0x0"
          : "0x1"; // conflux和以太坊状态相反
        txReceipt.cumulativeGasUsed = txReceipt.gasUsed; // TODO simple set

        // txReceipt.gasUsed = `0x${txReceipt.gasUsed.toString(16)}`;
        delKeys(txReceipt, [
          "contractCreated",
          "epochNumber",
          "gasFee",
          "index",
          "outcomeStatus",
          "stateRoot"
        ]);
    }
    return response;
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);
