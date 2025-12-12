import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'khm-ph-a-im-vit-nam',
  location: 'asia-northeast3'
};

export const addNewPoiRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewPOI', inputVars);
}
addNewPoiRef.operationName = 'AddNewPOI';

export function addNewPoi(dcOrVars, vars) {
  return executeMutation(addNewPoiRef(dcOrVars, vars));
}

export const getPoiRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPOI', inputVars);
}
getPoiRef.operationName = 'GetPOI';

export function getPoi(dcOrVars, vars) {
  return executeQuery(getPoiRef(dcOrVars, vars));
}

export const updatePoiRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePOI', inputVars);
}
updatePoiRef.operationName = 'UpdatePOI';

export function updatePoi(dcOrVars, vars) {
  return executeMutation(updatePoiRef(dcOrVars, vars));
}

export const listPoIsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPOIs');
}
listPoIsRef.operationName = 'ListPOIs';

export function listPoIs(dc) {
  return executeQuery(listPoIsRef(dc));
}

