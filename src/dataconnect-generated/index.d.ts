import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddNewPoiData {
  pOI_insert: POI_Key;
}

export interface AddNewPoiVariables {
  address: string;
  createdAt: TimestampString;
  description?: string | null;
  imageUrl?: string | null;
  latitude: number;
  longitude: number;
  name: string;
  openingHours?: string | null;
  phone?: string | null;
  website?: string | null;
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface GetPoiData {
  pOI?: {
    id: UUIDString;
    address: string;
    createdAt: TimestampString;
    description?: string | null;
    imageUrl?: string | null;
    latitude: number;
    longitude: number;
    name: string;
    openingHours?: string | null;
    phone?: string | null;
    website?: string | null;
  } & POI_Key;
}

export interface GetPoiVariables {
  id: UUIDString;
}

export interface ListPoIsData {
  pOIS: ({
    id: UUIDString;
    name: string;
    latitude: number;
    longitude: number;
  } & POI_Key)[];
}

export interface POICategory_Key {
  poiId: UUIDString;
  categoryId: UUIDString;
  __typename?: 'POICategory_Key';
}

export interface POI_Key {
  id: UUIDString;
  __typename?: 'POI_Key';
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface UpdatePoiData {
  pOI_update?: POI_Key | null;
}

export interface UpdatePoiVariables {
  id: UUIDString;
  address?: string | null;
  createdAt?: TimestampString | null;
  description?: string | null;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
  openingHours?: string | null;
  phone?: string | null;
  website?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface AddNewPoiRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddNewPoiVariables): MutationRef<AddNewPoiData, AddNewPoiVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddNewPoiVariables): MutationRef<AddNewPoiData, AddNewPoiVariables>;
  operationName: string;
}
export const addNewPoiRef: AddNewPoiRef;

export function addNewPoi(vars: AddNewPoiVariables): MutationPromise<AddNewPoiData, AddNewPoiVariables>;
export function addNewPoi(dc: DataConnect, vars: AddNewPoiVariables): MutationPromise<AddNewPoiData, AddNewPoiVariables>;

interface GetPoiRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPoiVariables): QueryRef<GetPoiData, GetPoiVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPoiVariables): QueryRef<GetPoiData, GetPoiVariables>;
  operationName: string;
}
export const getPoiRef: GetPoiRef;

export function getPoi(vars: GetPoiVariables): QueryPromise<GetPoiData, GetPoiVariables>;
export function getPoi(dc: DataConnect, vars: GetPoiVariables): QueryPromise<GetPoiData, GetPoiVariables>;

interface UpdatePoiRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePoiVariables): MutationRef<UpdatePoiData, UpdatePoiVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePoiVariables): MutationRef<UpdatePoiData, UpdatePoiVariables>;
  operationName: string;
}
export const updatePoiRef: UpdatePoiRef;

export function updatePoi(vars: UpdatePoiVariables): MutationPromise<UpdatePoiData, UpdatePoiVariables>;
export function updatePoi(dc: DataConnect, vars: UpdatePoiVariables): MutationPromise<UpdatePoiData, UpdatePoiVariables>;

interface ListPoIsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPoIsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPoIsData, undefined>;
  operationName: string;
}
export const listPoIsRef: ListPoIsRef;

export function listPoIs(): QueryPromise<ListPoIsData, undefined>;
export function listPoIs(dc: DataConnect): QueryPromise<ListPoIsData, undefined>;

