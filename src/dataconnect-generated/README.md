# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetPOI*](#getpoi)
  - [*ListPOIs*](#listpois)
- [**Mutations**](#mutations)
  - [*AddNewPOI*](#addnewpoi)
  - [*UpdatePOI*](#updatepoi)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetPOI
You can execute the `GetPOI` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPoi(vars: GetPoiVariables): QueryPromise<GetPoiData, GetPoiVariables>;

interface GetPoiRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPoiVariables): QueryRef<GetPoiData, GetPoiVariables>;
}
export const getPoiRef: GetPoiRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPoi(dc: DataConnect, vars: GetPoiVariables): QueryPromise<GetPoiData, GetPoiVariables>;

interface GetPoiRef {
  ...
  (dc: DataConnect, vars: GetPoiVariables): QueryRef<GetPoiData, GetPoiVariables>;
}
export const getPoiRef: GetPoiRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPoiRef:
```typescript
const name = getPoiRef.operationName;
console.log(name);
```

### Variables
The `GetPOI` query requires an argument of type `GetPoiVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPoiVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetPOI` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPoiData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetPOI`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPoi, GetPoiVariables } from '@dataconnect/generated';

// The `GetPOI` query requires an argument of type `GetPoiVariables`:
const getPoiVars: GetPoiVariables = {
  id: ..., 
};

// Call the `getPoi()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPoi(getPoiVars);
// Variables can be defined inline as well.
const { data } = await getPoi({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPoi(dataConnect, getPoiVars);

console.log(data.pOI);

// Or, you can use the `Promise` API.
getPoi(getPoiVars).then((response) => {
  const data = response.data;
  console.log(data.pOI);
});
```

### Using `GetPOI`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPoiRef, GetPoiVariables } from '@dataconnect/generated';

// The `GetPOI` query requires an argument of type `GetPoiVariables`:
const getPoiVars: GetPoiVariables = {
  id: ..., 
};

// Call the `getPoiRef()` function to get a reference to the query.
const ref = getPoiRef(getPoiVars);
// Variables can be defined inline as well.
const ref = getPoiRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPoiRef(dataConnect, getPoiVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.pOI);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.pOI);
});
```

## ListPOIs
You can execute the `ListPOIs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPoIs(): QueryPromise<ListPoIsData, undefined>;

interface ListPoIsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPoIsData, undefined>;
}
export const listPoIsRef: ListPoIsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPoIs(dc: DataConnect): QueryPromise<ListPoIsData, undefined>;

interface ListPoIsRef {
  ...
  (dc: DataConnect): QueryRef<ListPoIsData, undefined>;
}
export const listPoIsRef: ListPoIsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPoIsRef:
```typescript
const name = listPoIsRef.operationName;
console.log(name);
```

### Variables
The `ListPOIs` query has no variables.
### Return Type
Recall that executing the `ListPOIs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPoIsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPoIsData {
  pOIS: ({
    id: UUIDString;
    name: string;
    latitude: number;
    longitude: number;
  } & POI_Key)[];
}
```
### Using `ListPOIs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPoIs } from '@dataconnect/generated';


// Call the `listPoIs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPoIs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPoIs(dataConnect);

console.log(data.pOIS);

// Or, you can use the `Promise` API.
listPoIs().then((response) => {
  const data = response.data;
  console.log(data.pOIS);
});
```

### Using `ListPOIs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPoIsRef } from '@dataconnect/generated';


// Call the `listPoIsRef()` function to get a reference to the query.
const ref = listPoIsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPoIsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.pOIS);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.pOIS);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AddNewPOI
You can execute the `AddNewPOI` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addNewPoi(vars: AddNewPoiVariables): MutationPromise<AddNewPoiData, AddNewPoiVariables>;

interface AddNewPoiRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddNewPoiVariables): MutationRef<AddNewPoiData, AddNewPoiVariables>;
}
export const addNewPoiRef: AddNewPoiRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addNewPoi(dc: DataConnect, vars: AddNewPoiVariables): MutationPromise<AddNewPoiData, AddNewPoiVariables>;

interface AddNewPoiRef {
  ...
  (dc: DataConnect, vars: AddNewPoiVariables): MutationRef<AddNewPoiData, AddNewPoiVariables>;
}
export const addNewPoiRef: AddNewPoiRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addNewPoiRef:
```typescript
const name = addNewPoiRef.operationName;
console.log(name);
```

### Variables
The `AddNewPOI` mutation requires an argument of type `AddNewPoiVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `AddNewPOI` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddNewPoiData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddNewPoiData {
  pOI_insert: POI_Key;
}
```
### Using `AddNewPOI`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addNewPoi, AddNewPoiVariables } from '@dataconnect/generated';

// The `AddNewPOI` mutation requires an argument of type `AddNewPoiVariables`:
const addNewPoiVars: AddNewPoiVariables = {
  address: ..., 
  createdAt: ..., 
  description: ..., // optional
  imageUrl: ..., // optional
  latitude: ..., 
  longitude: ..., 
  name: ..., 
  openingHours: ..., // optional
  phone: ..., // optional
  website: ..., // optional
};

// Call the `addNewPoi()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addNewPoi(addNewPoiVars);
// Variables can be defined inline as well.
const { data } = await addNewPoi({ address: ..., createdAt: ..., description: ..., imageUrl: ..., latitude: ..., longitude: ..., name: ..., openingHours: ..., phone: ..., website: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addNewPoi(dataConnect, addNewPoiVars);

console.log(data.pOI_insert);

// Or, you can use the `Promise` API.
addNewPoi(addNewPoiVars).then((response) => {
  const data = response.data;
  console.log(data.pOI_insert);
});
```

### Using `AddNewPOI`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addNewPoiRef, AddNewPoiVariables } from '@dataconnect/generated';

// The `AddNewPOI` mutation requires an argument of type `AddNewPoiVariables`:
const addNewPoiVars: AddNewPoiVariables = {
  address: ..., 
  createdAt: ..., 
  description: ..., // optional
  imageUrl: ..., // optional
  latitude: ..., 
  longitude: ..., 
  name: ..., 
  openingHours: ..., // optional
  phone: ..., // optional
  website: ..., // optional
};

// Call the `addNewPoiRef()` function to get a reference to the mutation.
const ref = addNewPoiRef(addNewPoiVars);
// Variables can be defined inline as well.
const ref = addNewPoiRef({ address: ..., createdAt: ..., description: ..., imageUrl: ..., latitude: ..., longitude: ..., name: ..., openingHours: ..., phone: ..., website: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addNewPoiRef(dataConnect, addNewPoiVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pOI_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pOI_insert);
});
```

## UpdatePOI
You can execute the `UpdatePOI` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePoi(vars: UpdatePoiVariables): MutationPromise<UpdatePoiData, UpdatePoiVariables>;

interface UpdatePoiRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePoiVariables): MutationRef<UpdatePoiData, UpdatePoiVariables>;
}
export const updatePoiRef: UpdatePoiRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePoi(dc: DataConnect, vars: UpdatePoiVariables): MutationPromise<UpdatePoiData, UpdatePoiVariables>;

interface UpdatePoiRef {
  ...
  (dc: DataConnect, vars: UpdatePoiVariables): MutationRef<UpdatePoiData, UpdatePoiVariables>;
}
export const updatePoiRef: UpdatePoiRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePoiRef:
```typescript
const name = updatePoiRef.operationName;
console.log(name);
```

### Variables
The `UpdatePOI` mutation requires an argument of type `UpdatePoiVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdatePOI` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePoiData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePoiData {
  pOI_update?: POI_Key | null;
}
```
### Using `UpdatePOI`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePoi, UpdatePoiVariables } from '@dataconnect/generated';

// The `UpdatePOI` mutation requires an argument of type `UpdatePoiVariables`:
const updatePoiVars: UpdatePoiVariables = {
  id: ..., 
  address: ..., // optional
  createdAt: ..., // optional
  description: ..., // optional
  imageUrl: ..., // optional
  latitude: ..., // optional
  longitude: ..., // optional
  name: ..., // optional
  openingHours: ..., // optional
  phone: ..., // optional
  website: ..., // optional
};

// Call the `updatePoi()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePoi(updatePoiVars);
// Variables can be defined inline as well.
const { data } = await updatePoi({ id: ..., address: ..., createdAt: ..., description: ..., imageUrl: ..., latitude: ..., longitude: ..., name: ..., openingHours: ..., phone: ..., website: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePoi(dataConnect, updatePoiVars);

console.log(data.pOI_update);

// Or, you can use the `Promise` API.
updatePoi(updatePoiVars).then((response) => {
  const data = response.data;
  console.log(data.pOI_update);
});
```

### Using `UpdatePOI`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePoiRef, UpdatePoiVariables } from '@dataconnect/generated';

// The `UpdatePOI` mutation requires an argument of type `UpdatePoiVariables`:
const updatePoiVars: UpdatePoiVariables = {
  id: ..., 
  address: ..., // optional
  createdAt: ..., // optional
  description: ..., // optional
  imageUrl: ..., // optional
  latitude: ..., // optional
  longitude: ..., // optional
  name: ..., // optional
  openingHours: ..., // optional
  phone: ..., // optional
  website: ..., // optional
};

// Call the `updatePoiRef()` function to get a reference to the mutation.
const ref = updatePoiRef(updatePoiVars);
// Variables can be defined inline as well.
const ref = updatePoiRef({ id: ..., address: ..., createdAt: ..., description: ..., imageUrl: ..., latitude: ..., longitude: ..., name: ..., openingHours: ..., phone: ..., website: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePoiRef(dataConnect, updatePoiVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pOI_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pOI_update);
});
```

