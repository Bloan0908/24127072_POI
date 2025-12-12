const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'khm-ph-a-im-vit-nam',
  location: 'asia-northeast3'
};
exports.connectorConfig = connectorConfig;

const addNewPoiRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewPOI', inputVars);
}
addNewPoiRef.operationName = 'AddNewPOI';
exports.addNewPoiRef = addNewPoiRef;

exports.addNewPoi = function addNewPoi(dcOrVars, vars) {
  return executeMutation(addNewPoiRef(dcOrVars, vars));
};

const getPoiRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPOI', inputVars);
}
getPoiRef.operationName = 'GetPOI';
exports.getPoiRef = getPoiRef;

exports.getPoi = function getPoi(dcOrVars, vars) {
  return executeQuery(getPoiRef(dcOrVars, vars));
};

const updatePoiRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePOI', inputVars);
}
updatePoiRef.operationName = 'UpdatePOI';
exports.updatePoiRef = updatePoiRef;

exports.updatePoi = function updatePoi(dcOrVars, vars) {
  return executeMutation(updatePoiRef(dcOrVars, vars));
};

const listPoIsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPOIs');
}
listPoIsRef.operationName = 'ListPOIs';
exports.listPoIsRef = listPoIsRef;

exports.listPoIs = function listPoIs(dc) {
  return executeQuery(listPoIsRef(dc));
};
