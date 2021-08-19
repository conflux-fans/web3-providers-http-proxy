
// Below is ethreum error messages
// ErrAlreadyKnown is returned if the transactions is already contained within the pool.
const ErrAlreadyKnown = "already known";
// ErrInvalidSender is returned if the transaction contains an invalid signature.
const ErrInvalidSender = "invalid sender";
// ErrUnderpriced is returned if a transaction's gas price is below the minimum
// configured for the transaction pool.
const ErrUnderpriced = "transaction underpriced";
// ErrTxPoolOverflow is returned if the transaction pool is full and can't accpet
// another remote transaction.
const ErrTxPoolOverflow = "txpool is full";
// ErrReplaceUnderpriced is returned if a transaction is attempted to be replaced
// with a different one without the required price bump.
const ErrReplaceUnderpriced = "replacement transaction underpriced";
// ErrGasLimit is returned if a transaction's requested gas limit exceeds the
// maximum allowance of the current block.
const ErrGasLimit = "exceeds block gas limit";
// ErrNegativeValue is a sanity error to ensure no one is able to specify a
// transaction with a negative value.
const ErrNegativeValue = "negative value";
// ErrOversizedData is returned if the input data of a transaction is greater
// than some meaningful limit a user might use. This is not a consensus error
// making the transaction invalid, rather a DOS protection.
const ErrOversizedData = "oversized data";
//
const ErrNonceTooLow = "nonce too low";

module.exports = function (cfxError) {
  if (cfxError.match('tx already exist')) return ErrAlreadyKnown;
  if (cfxError.match('full')) return ErrTxPoolOverflow;
  if (cfxError.match('too distant future')) return ErrTxPoolOverflow;
  if (cfxError.match('too stale nonce')) return ErrNonceTooLow;
  if (cfxError.match('Cannot recover public key')) return ErrInvalidSender;
  // Failed imported to deferred pool: Tx with same nonce already inserted. To replace it, you need to specify a gas price > 1
  if (cfxError.match('To replace it, you need to specify a gas price')) return ErrReplaceUnderpriced;
  if (cfxError.match('exceeds the maximum value 15000000')) return ErrGasLimit;
}