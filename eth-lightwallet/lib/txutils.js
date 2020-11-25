const Transaction = require('ethereumjs-tx');
const Util = require('ethereumjs-util');
const Coder = require('web3-eth-abi');
const Web3Utils = require('web3-utils');
const Rlp = require('rlp');

function createTx(txObject) {
  return new Transaction({
    ...txObject.from && { from: Util.addHexPrefix(txObject.from) },
    ...txObject.to && { to: Util.addHexPrefix(txObject.to) },
    ...txObject.gasPrice && { gasPrice: Util.addHexPrefix(txObject.gasPrice) },
    ...txObject.gasLimit && { gasLimit: Util.addHexPrefix(txObject.gasLimit) },
    ...txObject.nonce && { nonce: Util.addHexPrefix(txObject.nonce) },
    ...txObject.value && { value: Util.addHexPrefix(txObject.value) },
    ...txObject.data && { data: Util.addHexPrefix(txObject.data) },
  });
}

function txToHexString(tx) {
  return Util.addHexPrefix(tx.serialize().toString('hex'));
}

function _getTypesFromAbi(abi, functionName) {
  const funcJson = abi.filter(json => json.type === 'function' && json.name === functionName)[0];

  return (funcJson.inputs).map(json => json.type);
}

function _encodeFunctionTxData(functionName, types, args) {
  const fullName = `${functionName}(${types.join()})`;
  const signature = Coder.encodeFunctionSignature(fullName).slice(2,10);
  const encodeParams = Coder.encodeParameters(types, args).slice(2);
  const dataHex = Util.addHexPrefix(`${signature}${encodeParams}`);

  return dataHex;
}

function functionTx(abi, functionName, args, txObject) {
  const types = _getTypesFromAbi(abi, functionName);
  const txData = _encodeFunctionTxData(functionName, types, args);
  const tx = createTx({
    ...txObject,
    data: txData,
  });

  return txToHexString(tx);
}

function valueTx(txObject) {
  const tx = createTx(txObject);

  return txToHexString(tx);
}

function createdContractAddress(fromAddress, nonce) {
  return `0x${Web3Utils.sha3(Rlp.encode([fromAddress, Web3Utils.toHex(nonce)])).substring(26)}`
}

function createContractTx(fromAddress, txObject) {
  const tx = createTx(txObject);
  const contractAddress = createdContractAddress(fromAddress, txObject.nonce);

  return {
    tx: txToHexString(tx),
    addr: contractAddress,
  };
}

module.exports = {
  _encodeFunctionTxData,
  _getTypesFromAbi,
  createTx,
  txToHexString,
  functionTx,
  createdContractAddress,
  createContractTx,
  valueTx,
};
