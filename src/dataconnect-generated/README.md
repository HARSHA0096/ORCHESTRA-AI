# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetProject*](#getproject)
  - [*ListProjects*](#listprojects)
  - [*GetProviderConfig*](#getproviderconfig)
  - [*ListProviderConfigs*](#listproviderconfigs)
  - [*GetGatewayKey*](#getgatewaykey)
  - [*ListGatewayKeys*](#listgatewaykeys)
  - [*GetRoutingRule*](#getroutingrule)
  - [*ListRoutingRules*](#listroutingrules)
  - [*GetRequestLog*](#getrequestlog)
  - [*ListRequestLogs*](#listrequestlogs)
  - [*GetSecurityPolicy*](#getsecuritypolicy)
  - [*ListSecurityPolicies*](#listsecuritypolicies)
- [**Mutations**](#mutations)
  - [*CreateProject*](#createproject)
  - [*UpdateProject*](#updateproject)
  - [*DeleteProject*](#deleteproject)
  - [*CreateProviderConfig*](#createproviderconfig)
  - [*UpdateProviderConfig*](#updateproviderconfig)
  - [*DeleteProviderConfig*](#deleteproviderconfig)
  - [*CreateGatewayKey*](#creategatewaykey)
  - [*UpdateGatewayKey*](#updategatewaykey)
  - [*DeleteGatewayKey*](#deletegatewaykey)
  - [*CreateRoutingRule*](#createroutingrule)
  - [*UpdateRoutingRule*](#updateroutingrule)
  - [*DeleteRoutingRule*](#deleteroutingrule)
  - [*CreateRequestLog*](#createrequestlog)
  - [*UpdateRequestLog*](#updaterequestlog)
  - [*DeleteRequestLog*](#deleterequestlog)
  - [*CreateSecurityPolicy*](#createsecuritypolicy)
  - [*UpdateSecurityPolicy*](#updatesecuritypolicy)
  - [*DeleteSecurityPolicy*](#deletesecuritypolicy)

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

## GetProject
You can execute the `GetProject` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProject(vars: GetProjectVariables, options?: ExecuteQueryOptions): QueryPromise<GetProjectData, GetProjectVariables>;

interface GetProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectVariables): QueryRef<GetProjectData, GetProjectVariables>;
}
export const getProjectRef: GetProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProject(dc: DataConnect, vars: GetProjectVariables, options?: ExecuteQueryOptions): QueryPromise<GetProjectData, GetProjectVariables>;

interface GetProjectRef {
  ...
  (dc: DataConnect, vars: GetProjectVariables): QueryRef<GetProjectData, GetProjectVariables>;
}
export const getProjectRef: GetProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProjectRef:
```typescript
const name = getProjectRef.operationName;
console.log(name);
```

### Variables
The `GetProject` query requires an argument of type `GetProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProjectVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetProject` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProjectData {
  project?: {
    name: string;
    description?: string | null;
    createdAt?: TimestampString | null;
  };
}
```
### Using `GetProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProject, GetProjectVariables } from '@dataconnect/generated';

// The `GetProject` query requires an argument of type `GetProjectVariables`:
const getProjectVars: GetProjectVariables = {
  id: ..., 
};

// Call the `getProject()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProject(getProjectVars);
// Variables can be defined inline as well.
const { data } = await getProject({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProject(dataConnect, getProjectVars);

console.log(data.project);

// Or, you can use the `Promise` API.
getProject(getProjectVars).then((response) => {
  const data = response.data;
  console.log(data.project);
});
```

### Using `GetProject`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProjectRef, GetProjectVariables } from '@dataconnect/generated';

// The `GetProject` query requires an argument of type `GetProjectVariables`:
const getProjectVars: GetProjectVariables = {
  id: ..., 
};

// Call the `getProjectRef()` function to get a reference to the query.
const ref = getProjectRef(getProjectVars);
// Variables can be defined inline as well.
const ref = getProjectRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProjectRef(dataConnect, getProjectVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.project);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.project);
});
```

## ListProjects
You can execute the `ListProjects` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProjects(options?: ExecuteQueryOptions): QueryPromise<ListProjectsData, undefined>;

interface ListProjectsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProjectsData, undefined>;
}
export const listProjectsRef: ListProjectsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProjectsData, undefined>;

interface ListProjectsRef {
  ...
  (dc: DataConnect): QueryRef<ListProjectsData, undefined>;
}
export const listProjectsRef: ListProjectsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProjectsRef:
```typescript
const name = listProjectsRef.operationName;
console.log(name);
```

### Variables
The `ListProjects` query has no variables.
### Return Type
Recall that executing the `ListProjects` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProjectsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
  } & Project_Key)[];
}
```
### Using `ListProjects`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProjects } from '@dataconnect/generated';


// Call the `listProjects()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProjects();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProjects(dataConnect);

console.log(data.projects);

// Or, you can use the `Promise` API.
listProjects().then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

### Using `ListProjects`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProjectsRef } from '@dataconnect/generated';


// Call the `listProjectsRef()` function to get a reference to the query.
const ref = listProjectsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProjectsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.projects);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

## GetProviderConfig
You can execute the `GetProviderConfig` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProviderConfig(vars: GetProviderConfigVariables, options?: ExecuteQueryOptions): QueryPromise<GetProviderConfigData, GetProviderConfigVariables>;

interface GetProviderConfigRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProviderConfigVariables): QueryRef<GetProviderConfigData, GetProviderConfigVariables>;
}
export const getProviderConfigRef: GetProviderConfigRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProviderConfig(dc: DataConnect, vars: GetProviderConfigVariables, options?: ExecuteQueryOptions): QueryPromise<GetProviderConfigData, GetProviderConfigVariables>;

interface GetProviderConfigRef {
  ...
  (dc: DataConnect, vars: GetProviderConfigVariables): QueryRef<GetProviderConfigData, GetProviderConfigVariables>;
}
export const getProviderConfigRef: GetProviderConfigRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProviderConfigRef:
```typescript
const name = getProviderConfigRef.operationName;
console.log(name);
```

### Variables
The `GetProviderConfig` query requires an argument of type `GetProviderConfigVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProviderConfigVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetProviderConfig` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProviderConfigData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProviderConfigData {
  providerConfig?: {
    providerType: string;
    status?: string | null;
  };
}
```
### Using `GetProviderConfig`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProviderConfig, GetProviderConfigVariables } from '@dataconnect/generated';

// The `GetProviderConfig` query requires an argument of type `GetProviderConfigVariables`:
const getProviderConfigVars: GetProviderConfigVariables = {
  id: ..., 
};

// Call the `getProviderConfig()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProviderConfig(getProviderConfigVars);
// Variables can be defined inline as well.
const { data } = await getProviderConfig({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProviderConfig(dataConnect, getProviderConfigVars);

console.log(data.providerConfig);

// Or, you can use the `Promise` API.
getProviderConfig(getProviderConfigVars).then((response) => {
  const data = response.data;
  console.log(data.providerConfig);
});
```

### Using `GetProviderConfig`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProviderConfigRef, GetProviderConfigVariables } from '@dataconnect/generated';

// The `GetProviderConfig` query requires an argument of type `GetProviderConfigVariables`:
const getProviderConfigVars: GetProviderConfigVariables = {
  id: ..., 
};

// Call the `getProviderConfigRef()` function to get a reference to the query.
const ref = getProviderConfigRef(getProviderConfigVars);
// Variables can be defined inline as well.
const ref = getProviderConfigRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProviderConfigRef(dataConnect, getProviderConfigVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.providerConfig);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.providerConfig);
});
```

## ListProviderConfigs
You can execute the `ListProviderConfigs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProviderConfigs(options?: ExecuteQueryOptions): QueryPromise<ListProviderConfigsData, undefined>;

interface ListProviderConfigsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProviderConfigsData, undefined>;
}
export const listProviderConfigsRef: ListProviderConfigsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProviderConfigs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProviderConfigsData, undefined>;

interface ListProviderConfigsRef {
  ...
  (dc: DataConnect): QueryRef<ListProviderConfigsData, undefined>;
}
export const listProviderConfigsRef: ListProviderConfigsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProviderConfigsRef:
```typescript
const name = listProviderConfigsRef.operationName;
console.log(name);
```

### Variables
The `ListProviderConfigs` query has no variables.
### Return Type
Recall that executing the `ListProviderConfigs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProviderConfigsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProviderConfigsData {
  providerConfigs: ({
    id: UUIDString;
    providerType: string;
  } & ProviderConfig_Key)[];
}
```
### Using `ListProviderConfigs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProviderConfigs } from '@dataconnect/generated';


// Call the `listProviderConfigs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProviderConfigs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProviderConfigs(dataConnect);

console.log(data.providerConfigs);

// Or, you can use the `Promise` API.
listProviderConfigs().then((response) => {
  const data = response.data;
  console.log(data.providerConfigs);
});
```

### Using `ListProviderConfigs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProviderConfigsRef } from '@dataconnect/generated';


// Call the `listProviderConfigsRef()` function to get a reference to the query.
const ref = listProviderConfigsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProviderConfigsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.providerConfigs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.providerConfigs);
});
```

## GetGatewayKey
You can execute the `GetGatewayKey` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getGatewayKey(vars: GetGatewayKeyVariables, options?: ExecuteQueryOptions): QueryPromise<GetGatewayKeyData, GetGatewayKeyVariables>;

interface GetGatewayKeyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetGatewayKeyVariables): QueryRef<GetGatewayKeyData, GetGatewayKeyVariables>;
}
export const getGatewayKeyRef: GetGatewayKeyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getGatewayKey(dc: DataConnect, vars: GetGatewayKeyVariables, options?: ExecuteQueryOptions): QueryPromise<GetGatewayKeyData, GetGatewayKeyVariables>;

interface GetGatewayKeyRef {
  ...
  (dc: DataConnect, vars: GetGatewayKeyVariables): QueryRef<GetGatewayKeyData, GetGatewayKeyVariables>;
}
export const getGatewayKeyRef: GetGatewayKeyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getGatewayKeyRef:
```typescript
const name = getGatewayKeyRef.operationName;
console.log(name);
```

### Variables
The `GetGatewayKey` query requires an argument of type `GetGatewayKeyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetGatewayKeyVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetGatewayKey` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetGatewayKeyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetGatewayKeyData {
  gatewayKey?: {
    status: string;
    expiresAt?: TimestampString | null;
  };
}
```
### Using `GetGatewayKey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getGatewayKey, GetGatewayKeyVariables } from '@dataconnect/generated';

// The `GetGatewayKey` query requires an argument of type `GetGatewayKeyVariables`:
const getGatewayKeyVars: GetGatewayKeyVariables = {
  id: ..., 
};

// Call the `getGatewayKey()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getGatewayKey(getGatewayKeyVars);
// Variables can be defined inline as well.
const { data } = await getGatewayKey({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getGatewayKey(dataConnect, getGatewayKeyVars);

console.log(data.gatewayKey);

// Or, you can use the `Promise` API.
getGatewayKey(getGatewayKeyVars).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey);
});
```

### Using `GetGatewayKey`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getGatewayKeyRef, GetGatewayKeyVariables } from '@dataconnect/generated';

// The `GetGatewayKey` query requires an argument of type `GetGatewayKeyVariables`:
const getGatewayKeyVars: GetGatewayKeyVariables = {
  id: ..., 
};

// Call the `getGatewayKeyRef()` function to get a reference to the query.
const ref = getGatewayKeyRef(getGatewayKeyVars);
// Variables can be defined inline as well.
const ref = getGatewayKeyRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getGatewayKeyRef(dataConnect, getGatewayKeyVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.gatewayKey);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey);
});
```

## ListGatewayKeys
You can execute the `ListGatewayKeys` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listGatewayKeys(options?: ExecuteQueryOptions): QueryPromise<ListGatewayKeysData, undefined>;

interface ListGatewayKeysRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListGatewayKeysData, undefined>;
}
export const listGatewayKeysRef: ListGatewayKeysRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listGatewayKeys(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListGatewayKeysData, undefined>;

interface ListGatewayKeysRef {
  ...
  (dc: DataConnect): QueryRef<ListGatewayKeysData, undefined>;
}
export const listGatewayKeysRef: ListGatewayKeysRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listGatewayKeysRef:
```typescript
const name = listGatewayKeysRef.operationName;
console.log(name);
```

### Variables
The `ListGatewayKeys` query has no variables.
### Return Type
Recall that executing the `ListGatewayKeys` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListGatewayKeysData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListGatewayKeysData {
  gatewayKeys: ({
    keyHash: string;
    status: string;
  })[];
}
```
### Using `ListGatewayKeys`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listGatewayKeys } from '@dataconnect/generated';


// Call the `listGatewayKeys()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listGatewayKeys();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listGatewayKeys(dataConnect);

console.log(data.gatewayKeys);

// Or, you can use the `Promise` API.
listGatewayKeys().then((response) => {
  const data = response.data;
  console.log(data.gatewayKeys);
});
```

### Using `ListGatewayKeys`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listGatewayKeysRef } from '@dataconnect/generated';


// Call the `listGatewayKeysRef()` function to get a reference to the query.
const ref = listGatewayKeysRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listGatewayKeysRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.gatewayKeys);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.gatewayKeys);
});
```

## GetRoutingRule
You can execute the `GetRoutingRule` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRoutingRule(vars: GetRoutingRuleVariables, options?: ExecuteQueryOptions): QueryPromise<GetRoutingRuleData, GetRoutingRuleVariables>;

interface GetRoutingRuleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoutingRuleVariables): QueryRef<GetRoutingRuleData, GetRoutingRuleVariables>;
}
export const getRoutingRuleRef: GetRoutingRuleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRoutingRule(dc: DataConnect, vars: GetRoutingRuleVariables, options?: ExecuteQueryOptions): QueryPromise<GetRoutingRuleData, GetRoutingRuleVariables>;

interface GetRoutingRuleRef {
  ...
  (dc: DataConnect, vars: GetRoutingRuleVariables): QueryRef<GetRoutingRuleData, GetRoutingRuleVariables>;
}
export const getRoutingRuleRef: GetRoutingRuleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRoutingRuleRef:
```typescript
const name = getRoutingRuleRef.operationName;
console.log(name);
```

### Variables
The `GetRoutingRule` query requires an argument of type `GetRoutingRuleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRoutingRuleVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetRoutingRule` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRoutingRuleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRoutingRuleData {
  routingRule?: {
    priority: number;
    trafficWeight?: number | null;
  };
}
```
### Using `GetRoutingRule`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRoutingRule, GetRoutingRuleVariables } from '@dataconnect/generated';

// The `GetRoutingRule` query requires an argument of type `GetRoutingRuleVariables`:
const getRoutingRuleVars: GetRoutingRuleVariables = {
  id: ..., 
};

// Call the `getRoutingRule()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRoutingRule(getRoutingRuleVars);
// Variables can be defined inline as well.
const { data } = await getRoutingRule({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRoutingRule(dataConnect, getRoutingRuleVars);

console.log(data.routingRule);

// Or, you can use the `Promise` API.
getRoutingRule(getRoutingRuleVars).then((response) => {
  const data = response.data;
  console.log(data.routingRule);
});
```

### Using `GetRoutingRule`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRoutingRuleRef, GetRoutingRuleVariables } from '@dataconnect/generated';

// The `GetRoutingRule` query requires an argument of type `GetRoutingRuleVariables`:
const getRoutingRuleVars: GetRoutingRuleVariables = {
  id: ..., 
};

// Call the `getRoutingRuleRef()` function to get a reference to the query.
const ref = getRoutingRuleRef(getRoutingRuleVars);
// Variables can be defined inline as well.
const ref = getRoutingRuleRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRoutingRuleRef(dataConnect, getRoutingRuleVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.routingRule);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.routingRule);
});
```

## ListRoutingRules
You can execute the `ListRoutingRules` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRoutingRules(options?: ExecuteQueryOptions): QueryPromise<ListRoutingRulesData, undefined>;

interface ListRoutingRulesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRoutingRulesData, undefined>;
}
export const listRoutingRulesRef: ListRoutingRulesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRoutingRules(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRoutingRulesData, undefined>;

interface ListRoutingRulesRef {
  ...
  (dc: DataConnect): QueryRef<ListRoutingRulesData, undefined>;
}
export const listRoutingRulesRef: ListRoutingRulesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRoutingRulesRef:
```typescript
const name = listRoutingRulesRef.operationName;
console.log(name);
```

### Variables
The `ListRoutingRules` query has no variables.
### Return Type
Recall that executing the `ListRoutingRules` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRoutingRulesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListRoutingRulesData {
  routingRules: ({
    priority: number;
    modelFilter?: string | null;
  })[];
}
```
### Using `ListRoutingRules`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRoutingRules } from '@dataconnect/generated';


// Call the `listRoutingRules()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRoutingRules();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRoutingRules(dataConnect);

console.log(data.routingRules);

// Or, you can use the `Promise` API.
listRoutingRules().then((response) => {
  const data = response.data;
  console.log(data.routingRules);
});
```

### Using `ListRoutingRules`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRoutingRulesRef } from '@dataconnect/generated';


// Call the `listRoutingRulesRef()` function to get a reference to the query.
const ref = listRoutingRulesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRoutingRulesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.routingRules);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.routingRules);
});
```

## GetRequestLog
You can execute the `GetRequestLog` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRequestLog(vars: GetRequestLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetRequestLogData, GetRequestLogVariables>;

interface GetRequestLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRequestLogVariables): QueryRef<GetRequestLogData, GetRequestLogVariables>;
}
export const getRequestLogRef: GetRequestLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRequestLog(dc: DataConnect, vars: GetRequestLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetRequestLogData, GetRequestLogVariables>;

interface GetRequestLogRef {
  ...
  (dc: DataConnect, vars: GetRequestLogVariables): QueryRef<GetRequestLogData, GetRequestLogVariables>;
}
export const getRequestLogRef: GetRequestLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRequestLogRef:
```typescript
const name = getRequestLogRef.operationName;
console.log(name);
```

### Variables
The `GetRequestLog` query requires an argument of type `GetRequestLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRequestLogVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetRequestLog` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRequestLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRequestLogData {
  requestLog?: {
    latencyMs: number;
    cost: number;
    statusCode?: number | null;
  };
}
```
### Using `GetRequestLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRequestLog, GetRequestLogVariables } from '@dataconnect/generated';

// The `GetRequestLog` query requires an argument of type `GetRequestLogVariables`:
const getRequestLogVars: GetRequestLogVariables = {
  id: ..., 
};

// Call the `getRequestLog()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRequestLog(getRequestLogVars);
// Variables can be defined inline as well.
const { data } = await getRequestLog({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRequestLog(dataConnect, getRequestLogVars);

console.log(data.requestLog);

// Or, you can use the `Promise` API.
getRequestLog(getRequestLogVars).then((response) => {
  const data = response.data;
  console.log(data.requestLog);
});
```

### Using `GetRequestLog`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRequestLogRef, GetRequestLogVariables } from '@dataconnect/generated';

// The `GetRequestLog` query requires an argument of type `GetRequestLogVariables`:
const getRequestLogVars: GetRequestLogVariables = {
  id: ..., 
};

// Call the `getRequestLogRef()` function to get a reference to the query.
const ref = getRequestLogRef(getRequestLogVars);
// Variables can be defined inline as well.
const ref = getRequestLogRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRequestLogRef(dataConnect, getRequestLogVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.requestLog);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.requestLog);
});
```

## ListRequestLogs
You can execute the `ListRequestLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRequestLogs(options?: ExecuteQueryOptions): QueryPromise<ListRequestLogsData, undefined>;

interface ListRequestLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRequestLogsData, undefined>;
}
export const listRequestLogsRef: ListRequestLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRequestLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRequestLogsData, undefined>;

interface ListRequestLogsRef {
  ...
  (dc: DataConnect): QueryRef<ListRequestLogsData, undefined>;
}
export const listRequestLogsRef: ListRequestLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRequestLogsRef:
```typescript
const name = listRequestLogsRef.operationName;
console.log(name);
```

### Variables
The `ListRequestLogs` query has no variables.
### Return Type
Recall that executing the `ListRequestLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRequestLogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListRequestLogsData {
  requestLogs: ({
    modelUsed?: string | null;
    errorMessage?: string | null;
  })[];
}
```
### Using `ListRequestLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRequestLogs } from '@dataconnect/generated';


// Call the `listRequestLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRequestLogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRequestLogs(dataConnect);

console.log(data.requestLogs);

// Or, you can use the `Promise` API.
listRequestLogs().then((response) => {
  const data = response.data;
  console.log(data.requestLogs);
});
```

### Using `ListRequestLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRequestLogsRef } from '@dataconnect/generated';


// Call the `listRequestLogsRef()` function to get a reference to the query.
const ref = listRequestLogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRequestLogsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.requestLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.requestLogs);
});
```

## GetSecurityPolicy
You can execute the `GetSecurityPolicy` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSecurityPolicy(vars: GetSecurityPolicyVariables, options?: ExecuteQueryOptions): QueryPromise<GetSecurityPolicyData, GetSecurityPolicyVariables>;

interface GetSecurityPolicyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSecurityPolicyVariables): QueryRef<GetSecurityPolicyData, GetSecurityPolicyVariables>;
}
export const getSecurityPolicyRef: GetSecurityPolicyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSecurityPolicy(dc: DataConnect, vars: GetSecurityPolicyVariables, options?: ExecuteQueryOptions): QueryPromise<GetSecurityPolicyData, GetSecurityPolicyVariables>;

interface GetSecurityPolicyRef {
  ...
  (dc: DataConnect, vars: GetSecurityPolicyVariables): QueryRef<GetSecurityPolicyData, GetSecurityPolicyVariables>;
}
export const getSecurityPolicyRef: GetSecurityPolicyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSecurityPolicyRef:
```typescript
const name = getSecurityPolicyRef.operationName;
console.log(name);
```

### Variables
The `GetSecurityPolicy` query requires an argument of type `GetSecurityPolicyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSecurityPolicyVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetSecurityPolicy` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSecurityPolicyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSecurityPolicyData {
  securityPolicy?: {
    policyType: string;
    configurationJson?: string | null;
  };
}
```
### Using `GetSecurityPolicy`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSecurityPolicy, GetSecurityPolicyVariables } from '@dataconnect/generated';

// The `GetSecurityPolicy` query requires an argument of type `GetSecurityPolicyVariables`:
const getSecurityPolicyVars: GetSecurityPolicyVariables = {
  id: ..., 
};

// Call the `getSecurityPolicy()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSecurityPolicy(getSecurityPolicyVars);
// Variables can be defined inline as well.
const { data } = await getSecurityPolicy({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSecurityPolicy(dataConnect, getSecurityPolicyVars);

console.log(data.securityPolicy);

// Or, you can use the `Promise` API.
getSecurityPolicy(getSecurityPolicyVars).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy);
});
```

### Using `GetSecurityPolicy`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSecurityPolicyRef, GetSecurityPolicyVariables } from '@dataconnect/generated';

// The `GetSecurityPolicy` query requires an argument of type `GetSecurityPolicyVariables`:
const getSecurityPolicyVars: GetSecurityPolicyVariables = {
  id: ..., 
};

// Call the `getSecurityPolicyRef()` function to get a reference to the query.
const ref = getSecurityPolicyRef(getSecurityPolicyVars);
// Variables can be defined inline as well.
const ref = getSecurityPolicyRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSecurityPolicyRef(dataConnect, getSecurityPolicyVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.securityPolicy);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy);
});
```

## ListSecurityPolicies
You can execute the `ListSecurityPolicies` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listSecurityPolicies(options?: ExecuteQueryOptions): QueryPromise<ListSecurityPoliciesData, undefined>;

interface ListSecurityPoliciesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSecurityPoliciesData, undefined>;
}
export const listSecurityPoliciesRef: ListSecurityPoliciesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSecurityPolicies(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSecurityPoliciesData, undefined>;

interface ListSecurityPoliciesRef {
  ...
  (dc: DataConnect): QueryRef<ListSecurityPoliciesData, undefined>;
}
export const listSecurityPoliciesRef: ListSecurityPoliciesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSecurityPoliciesRef:
```typescript
const name = listSecurityPoliciesRef.operationName;
console.log(name);
```

### Variables
The `ListSecurityPolicies` query has no variables.
### Return Type
Recall that executing the `ListSecurityPolicies` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSecurityPoliciesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListSecurityPoliciesData {
  securityPolicies: ({
    policyType: string;
  })[];
}
```
### Using `ListSecurityPolicies`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSecurityPolicies } from '@dataconnect/generated';


// Call the `listSecurityPolicies()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSecurityPolicies();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSecurityPolicies(dataConnect);

console.log(data.securityPolicies);

// Or, you can use the `Promise` API.
listSecurityPolicies().then((response) => {
  const data = response.data;
  console.log(data.securityPolicies);
});
```

### Using `ListSecurityPolicies`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSecurityPoliciesRef } from '@dataconnect/generated';


// Call the `listSecurityPoliciesRef()` function to get a reference to the query.
const ref = listSecurityPoliciesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSecurityPoliciesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.securityPolicies);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.securityPolicies);
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

## CreateProject
You can execute the `CreateProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createProject(vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface CreateProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
}
export const createProjectRef: CreateProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProject(dc: DataConnect, vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface CreateProjectRef {
  ...
  (dc: DataConnect, vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
}
export const createProjectRef: CreateProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProjectRef:
```typescript
const name = createProjectRef.operationName;
console.log(name);
```

### Variables
The `CreateProject` mutation requires an argument of type `CreateProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProjectVariables {
  name: string;
  description?: string | null;
}
```
### Return Type
Recall that executing the `CreateProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProjectData {
  project_insert: Project_Key;
}
```
### Using `CreateProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProject, CreateProjectVariables } from '@dataconnect/generated';

// The `CreateProject` mutation requires an argument of type `CreateProjectVariables`:
const createProjectVars: CreateProjectVariables = {
  name: ..., 
  description: ..., // optional
};

// Call the `createProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProject(createProjectVars);
// Variables can be defined inline as well.
const { data } = await createProject({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProject(dataConnect, createProjectVars);

console.log(data.project_insert);

// Or, you can use the `Promise` API.
createProject(createProjectVars).then((response) => {
  const data = response.data;
  console.log(data.project_insert);
});
```

### Using `CreateProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProjectRef, CreateProjectVariables } from '@dataconnect/generated';

// The `CreateProject` mutation requires an argument of type `CreateProjectVariables`:
const createProjectVars: CreateProjectVariables = {
  name: ..., 
  description: ..., // optional
};

// Call the `createProjectRef()` function to get a reference to the mutation.
const ref = createProjectRef(createProjectVars);
// Variables can be defined inline as well.
const ref = createProjectRef({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProjectRef(dataConnect, createProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.project_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.project_insert);
});
```

## UpdateProject
You can execute the `UpdateProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProject(vars: UpdateProjectVariables): MutationPromise<UpdateProjectData, UpdateProjectVariables>;

interface UpdateProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProjectVariables): MutationRef<UpdateProjectData, UpdateProjectVariables>;
}
export const updateProjectRef: UpdateProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProject(dc: DataConnect, vars: UpdateProjectVariables): MutationPromise<UpdateProjectData, UpdateProjectVariables>;

interface UpdateProjectRef {
  ...
  (dc: DataConnect, vars: UpdateProjectVariables): MutationRef<UpdateProjectData, UpdateProjectVariables>;
}
export const updateProjectRef: UpdateProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProjectRef:
```typescript
const name = updateProjectRef.operationName;
console.log(name);
```

### Variables
The `UpdateProject` mutation requires an argument of type `UpdateProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateProjectVariables {
  id: UUIDString;
  name?: string | null;
}
```
### Return Type
Recall that executing the `UpdateProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProjectData {
  project_update?: Project_Key | null;
}
```
### Using `UpdateProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProject, UpdateProjectVariables } from '@dataconnect/generated';

// The `UpdateProject` mutation requires an argument of type `UpdateProjectVariables`:
const updateProjectVars: UpdateProjectVariables = {
  id: ..., 
  name: ..., // optional
};

// Call the `updateProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProject(updateProjectVars);
// Variables can be defined inline as well.
const { data } = await updateProject({ id: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProject(dataConnect, updateProjectVars);

console.log(data.project_update);

// Or, you can use the `Promise` API.
updateProject(updateProjectVars).then((response) => {
  const data = response.data;
  console.log(data.project_update);
});
```

### Using `UpdateProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProjectRef, UpdateProjectVariables } from '@dataconnect/generated';

// The `UpdateProject` mutation requires an argument of type `UpdateProjectVariables`:
const updateProjectVars: UpdateProjectVariables = {
  id: ..., 
  name: ..., // optional
};

// Call the `updateProjectRef()` function to get a reference to the mutation.
const ref = updateProjectRef(updateProjectVars);
// Variables can be defined inline as well.
const ref = updateProjectRef({ id: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProjectRef(dataConnect, updateProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.project_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.project_update);
});
```

## DeleteProject
You can execute the `DeleteProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteProject(vars: DeleteProjectVariables): MutationPromise<DeleteProjectData, DeleteProjectVariables>;

interface DeleteProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProjectVariables): MutationRef<DeleteProjectData, DeleteProjectVariables>;
}
export const deleteProjectRef: DeleteProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteProject(dc: DataConnect, vars: DeleteProjectVariables): MutationPromise<DeleteProjectData, DeleteProjectVariables>;

interface DeleteProjectRef {
  ...
  (dc: DataConnect, vars: DeleteProjectVariables): MutationRef<DeleteProjectData, DeleteProjectVariables>;
}
export const deleteProjectRef: DeleteProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteProjectRef:
```typescript
const name = deleteProjectRef.operationName;
console.log(name);
```

### Variables
The `DeleteProject` mutation requires an argument of type `DeleteProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteProjectVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteProjectData {
  project_delete?: Project_Key | null;
}
```
### Using `DeleteProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteProject, DeleteProjectVariables } from '@dataconnect/generated';

// The `DeleteProject` mutation requires an argument of type `DeleteProjectVariables`:
const deleteProjectVars: DeleteProjectVariables = {
  id: ..., 
};

// Call the `deleteProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteProject(deleteProjectVars);
// Variables can be defined inline as well.
const { data } = await deleteProject({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteProject(dataConnect, deleteProjectVars);

console.log(data.project_delete);

// Or, you can use the `Promise` API.
deleteProject(deleteProjectVars).then((response) => {
  const data = response.data;
  console.log(data.project_delete);
});
```

### Using `DeleteProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteProjectRef, DeleteProjectVariables } from '@dataconnect/generated';

// The `DeleteProject` mutation requires an argument of type `DeleteProjectVariables`:
const deleteProjectVars: DeleteProjectVariables = {
  id: ..., 
};

// Call the `deleteProjectRef()` function to get a reference to the mutation.
const ref = deleteProjectRef(deleteProjectVars);
// Variables can be defined inline as well.
const ref = deleteProjectRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteProjectRef(dataConnect, deleteProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.project_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.project_delete);
});
```

## CreateProviderConfig
You can execute the `CreateProviderConfig` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createProviderConfig(vars: CreateProviderConfigVariables): MutationPromise<CreateProviderConfigData, CreateProviderConfigVariables>;

interface CreateProviderConfigRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProviderConfigVariables): MutationRef<CreateProviderConfigData, CreateProviderConfigVariables>;
}
export const createProviderConfigRef: CreateProviderConfigRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProviderConfig(dc: DataConnect, vars: CreateProviderConfigVariables): MutationPromise<CreateProviderConfigData, CreateProviderConfigVariables>;

interface CreateProviderConfigRef {
  ...
  (dc: DataConnect, vars: CreateProviderConfigVariables): MutationRef<CreateProviderConfigData, CreateProviderConfigVariables>;
}
export const createProviderConfigRef: CreateProviderConfigRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProviderConfigRef:
```typescript
const name = createProviderConfigRef.operationName;
console.log(name);
```

### Variables
The `CreateProviderConfig` mutation requires an argument of type `CreateProviderConfigVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProviderConfigVariables {
  providerType: string;
  apiKey: string;
  endpoint: string;
  projectId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateProviderConfig` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProviderConfigData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProviderConfigData {
  providerConfig_insert: ProviderConfig_Key;
}
```
### Using `CreateProviderConfig`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProviderConfig, CreateProviderConfigVariables } from '@dataconnect/generated';

// The `CreateProviderConfig` mutation requires an argument of type `CreateProviderConfigVariables`:
const createProviderConfigVars: CreateProviderConfigVariables = {
  providerType: ..., 
  apiKey: ..., 
  endpoint: ..., 
  projectId: ..., 
};

// Call the `createProviderConfig()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProviderConfig(createProviderConfigVars);
// Variables can be defined inline as well.
const { data } = await createProviderConfig({ providerType: ..., apiKey: ..., endpoint: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProviderConfig(dataConnect, createProviderConfigVars);

console.log(data.providerConfig_insert);

// Or, you can use the `Promise` API.
createProviderConfig(createProviderConfigVars).then((response) => {
  const data = response.data;
  console.log(data.providerConfig_insert);
});
```

### Using `CreateProviderConfig`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProviderConfigRef, CreateProviderConfigVariables } from '@dataconnect/generated';

// The `CreateProviderConfig` mutation requires an argument of type `CreateProviderConfigVariables`:
const createProviderConfigVars: CreateProviderConfigVariables = {
  providerType: ..., 
  apiKey: ..., 
  endpoint: ..., 
  projectId: ..., 
};

// Call the `createProviderConfigRef()` function to get a reference to the mutation.
const ref = createProviderConfigRef(createProviderConfigVars);
// Variables can be defined inline as well.
const ref = createProviderConfigRef({ providerType: ..., apiKey: ..., endpoint: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProviderConfigRef(dataConnect, createProviderConfigVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.providerConfig_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.providerConfig_insert);
});
```

## UpdateProviderConfig
You can execute the `UpdateProviderConfig` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProviderConfig(vars: UpdateProviderConfigVariables): MutationPromise<UpdateProviderConfigData, UpdateProviderConfigVariables>;

interface UpdateProviderConfigRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProviderConfigVariables): MutationRef<UpdateProviderConfigData, UpdateProviderConfigVariables>;
}
export const updateProviderConfigRef: UpdateProviderConfigRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProviderConfig(dc: DataConnect, vars: UpdateProviderConfigVariables): MutationPromise<UpdateProviderConfigData, UpdateProviderConfigVariables>;

interface UpdateProviderConfigRef {
  ...
  (dc: DataConnect, vars: UpdateProviderConfigVariables): MutationRef<UpdateProviderConfigData, UpdateProviderConfigVariables>;
}
export const updateProviderConfigRef: UpdateProviderConfigRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProviderConfigRef:
```typescript
const name = updateProviderConfigRef.operationName;
console.log(name);
```

### Variables
The `UpdateProviderConfig` mutation requires an argument of type `UpdateProviderConfigVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateProviderConfigVariables {
  id: UUIDString;
  status?: string | null;
}
```
### Return Type
Recall that executing the `UpdateProviderConfig` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProviderConfigData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProviderConfigData {
  providerConfig_update?: ProviderConfig_Key | null;
}
```
### Using `UpdateProviderConfig`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProviderConfig, UpdateProviderConfigVariables } from '@dataconnect/generated';

// The `UpdateProviderConfig` mutation requires an argument of type `UpdateProviderConfigVariables`:
const updateProviderConfigVars: UpdateProviderConfigVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updateProviderConfig()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProviderConfig(updateProviderConfigVars);
// Variables can be defined inline as well.
const { data } = await updateProviderConfig({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProviderConfig(dataConnect, updateProviderConfigVars);

console.log(data.providerConfig_update);

// Or, you can use the `Promise` API.
updateProviderConfig(updateProviderConfigVars).then((response) => {
  const data = response.data;
  console.log(data.providerConfig_update);
});
```

### Using `UpdateProviderConfig`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProviderConfigRef, UpdateProviderConfigVariables } from '@dataconnect/generated';

// The `UpdateProviderConfig` mutation requires an argument of type `UpdateProviderConfigVariables`:
const updateProviderConfigVars: UpdateProviderConfigVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updateProviderConfigRef()` function to get a reference to the mutation.
const ref = updateProviderConfigRef(updateProviderConfigVars);
// Variables can be defined inline as well.
const ref = updateProviderConfigRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProviderConfigRef(dataConnect, updateProviderConfigVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.providerConfig_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.providerConfig_update);
});
```

## DeleteProviderConfig
You can execute the `DeleteProviderConfig` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteProviderConfig(vars: DeleteProviderConfigVariables): MutationPromise<DeleteProviderConfigData, DeleteProviderConfigVariables>;

interface DeleteProviderConfigRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProviderConfigVariables): MutationRef<DeleteProviderConfigData, DeleteProviderConfigVariables>;
}
export const deleteProviderConfigRef: DeleteProviderConfigRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteProviderConfig(dc: DataConnect, vars: DeleteProviderConfigVariables): MutationPromise<DeleteProviderConfigData, DeleteProviderConfigVariables>;

interface DeleteProviderConfigRef {
  ...
  (dc: DataConnect, vars: DeleteProviderConfigVariables): MutationRef<DeleteProviderConfigData, DeleteProviderConfigVariables>;
}
export const deleteProviderConfigRef: DeleteProviderConfigRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteProviderConfigRef:
```typescript
const name = deleteProviderConfigRef.operationName;
console.log(name);
```

### Variables
The `DeleteProviderConfig` mutation requires an argument of type `DeleteProviderConfigVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteProviderConfigVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteProviderConfig` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteProviderConfigData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteProviderConfigData {
  providerConfig_delete?: ProviderConfig_Key | null;
}
```
### Using `DeleteProviderConfig`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteProviderConfig, DeleteProviderConfigVariables } from '@dataconnect/generated';

// The `DeleteProviderConfig` mutation requires an argument of type `DeleteProviderConfigVariables`:
const deleteProviderConfigVars: DeleteProviderConfigVariables = {
  id: ..., 
};

// Call the `deleteProviderConfig()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteProviderConfig(deleteProviderConfigVars);
// Variables can be defined inline as well.
const { data } = await deleteProviderConfig({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteProviderConfig(dataConnect, deleteProviderConfigVars);

console.log(data.providerConfig_delete);

// Or, you can use the `Promise` API.
deleteProviderConfig(deleteProviderConfigVars).then((response) => {
  const data = response.data;
  console.log(data.providerConfig_delete);
});
```

### Using `DeleteProviderConfig`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteProviderConfigRef, DeleteProviderConfigVariables } from '@dataconnect/generated';

// The `DeleteProviderConfig` mutation requires an argument of type `DeleteProviderConfigVariables`:
const deleteProviderConfigVars: DeleteProviderConfigVariables = {
  id: ..., 
};

// Call the `deleteProviderConfigRef()` function to get a reference to the mutation.
const ref = deleteProviderConfigRef(deleteProviderConfigVars);
// Variables can be defined inline as well.
const ref = deleteProviderConfigRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteProviderConfigRef(dataConnect, deleteProviderConfigVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.providerConfig_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.providerConfig_delete);
});
```

## CreateGatewayKey
You can execute the `CreateGatewayKey` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createGatewayKey(vars: CreateGatewayKeyVariables): MutationPromise<CreateGatewayKeyData, CreateGatewayKeyVariables>;

interface CreateGatewayKeyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateGatewayKeyVariables): MutationRef<CreateGatewayKeyData, CreateGatewayKeyVariables>;
}
export const createGatewayKeyRef: CreateGatewayKeyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createGatewayKey(dc: DataConnect, vars: CreateGatewayKeyVariables): MutationPromise<CreateGatewayKeyData, CreateGatewayKeyVariables>;

interface CreateGatewayKeyRef {
  ...
  (dc: DataConnect, vars: CreateGatewayKeyVariables): MutationRef<CreateGatewayKeyData, CreateGatewayKeyVariables>;
}
export const createGatewayKeyRef: CreateGatewayKeyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createGatewayKeyRef:
```typescript
const name = createGatewayKeyRef.operationName;
console.log(name);
```

### Variables
The `CreateGatewayKey` mutation requires an argument of type `CreateGatewayKeyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateGatewayKeyVariables {
  keyHash: string;
  projectId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateGatewayKey` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateGatewayKeyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateGatewayKeyData {
  gatewayKey_insert: GatewayKey_Key;
}
```
### Using `CreateGatewayKey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createGatewayKey, CreateGatewayKeyVariables } from '@dataconnect/generated';

// The `CreateGatewayKey` mutation requires an argument of type `CreateGatewayKeyVariables`:
const createGatewayKeyVars: CreateGatewayKeyVariables = {
  keyHash: ..., 
  projectId: ..., 
};

// Call the `createGatewayKey()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createGatewayKey(createGatewayKeyVars);
// Variables can be defined inline as well.
const { data } = await createGatewayKey({ keyHash: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createGatewayKey(dataConnect, createGatewayKeyVars);

console.log(data.gatewayKey_insert);

// Or, you can use the `Promise` API.
createGatewayKey(createGatewayKeyVars).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey_insert);
});
```

### Using `CreateGatewayKey`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createGatewayKeyRef, CreateGatewayKeyVariables } from '@dataconnect/generated';

// The `CreateGatewayKey` mutation requires an argument of type `CreateGatewayKeyVariables`:
const createGatewayKeyVars: CreateGatewayKeyVariables = {
  keyHash: ..., 
  projectId: ..., 
};

// Call the `createGatewayKeyRef()` function to get a reference to the mutation.
const ref = createGatewayKeyRef(createGatewayKeyVars);
// Variables can be defined inline as well.
const ref = createGatewayKeyRef({ keyHash: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createGatewayKeyRef(dataConnect, createGatewayKeyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.gatewayKey_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey_insert);
});
```

## UpdateGatewayKey
You can execute the `UpdateGatewayKey` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateGatewayKey(vars: UpdateGatewayKeyVariables): MutationPromise<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;

interface UpdateGatewayKeyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateGatewayKeyVariables): MutationRef<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;
}
export const updateGatewayKeyRef: UpdateGatewayKeyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateGatewayKey(dc: DataConnect, vars: UpdateGatewayKeyVariables): MutationPromise<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;

interface UpdateGatewayKeyRef {
  ...
  (dc: DataConnect, vars: UpdateGatewayKeyVariables): MutationRef<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;
}
export const updateGatewayKeyRef: UpdateGatewayKeyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateGatewayKeyRef:
```typescript
const name = updateGatewayKeyRef.operationName;
console.log(name);
```

### Variables
The `UpdateGatewayKey` mutation requires an argument of type `UpdateGatewayKeyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateGatewayKeyVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateGatewayKey` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateGatewayKeyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateGatewayKeyData {
  gatewayKey_update?: GatewayKey_Key | null;
}
```
### Using `UpdateGatewayKey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateGatewayKey, UpdateGatewayKeyVariables } from '@dataconnect/generated';

// The `UpdateGatewayKey` mutation requires an argument of type `UpdateGatewayKeyVariables`:
const updateGatewayKeyVars: UpdateGatewayKeyVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateGatewayKey()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateGatewayKey(updateGatewayKeyVars);
// Variables can be defined inline as well.
const { data } = await updateGatewayKey({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateGatewayKey(dataConnect, updateGatewayKeyVars);

console.log(data.gatewayKey_update);

// Or, you can use the `Promise` API.
updateGatewayKey(updateGatewayKeyVars).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey_update);
});
```

### Using `UpdateGatewayKey`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateGatewayKeyRef, UpdateGatewayKeyVariables } from '@dataconnect/generated';

// The `UpdateGatewayKey` mutation requires an argument of type `UpdateGatewayKeyVariables`:
const updateGatewayKeyVars: UpdateGatewayKeyVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateGatewayKeyRef()` function to get a reference to the mutation.
const ref = updateGatewayKeyRef(updateGatewayKeyVars);
// Variables can be defined inline as well.
const ref = updateGatewayKeyRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateGatewayKeyRef(dataConnect, updateGatewayKeyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.gatewayKey_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey_update);
});
```

## DeleteGatewayKey
You can execute the `DeleteGatewayKey` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteGatewayKey(vars: DeleteGatewayKeyVariables): MutationPromise<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;

interface DeleteGatewayKeyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteGatewayKeyVariables): MutationRef<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;
}
export const deleteGatewayKeyRef: DeleteGatewayKeyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteGatewayKey(dc: DataConnect, vars: DeleteGatewayKeyVariables): MutationPromise<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;

interface DeleteGatewayKeyRef {
  ...
  (dc: DataConnect, vars: DeleteGatewayKeyVariables): MutationRef<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;
}
export const deleteGatewayKeyRef: DeleteGatewayKeyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteGatewayKeyRef:
```typescript
const name = deleteGatewayKeyRef.operationName;
console.log(name);
```

### Variables
The `DeleteGatewayKey` mutation requires an argument of type `DeleteGatewayKeyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteGatewayKeyVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteGatewayKey` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteGatewayKeyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteGatewayKeyData {
  gatewayKey_delete?: GatewayKey_Key | null;
}
```
### Using `DeleteGatewayKey`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteGatewayKey, DeleteGatewayKeyVariables } from '@dataconnect/generated';

// The `DeleteGatewayKey` mutation requires an argument of type `DeleteGatewayKeyVariables`:
const deleteGatewayKeyVars: DeleteGatewayKeyVariables = {
  id: ..., 
};

// Call the `deleteGatewayKey()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteGatewayKey(deleteGatewayKeyVars);
// Variables can be defined inline as well.
const { data } = await deleteGatewayKey({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteGatewayKey(dataConnect, deleteGatewayKeyVars);

console.log(data.gatewayKey_delete);

// Or, you can use the `Promise` API.
deleteGatewayKey(deleteGatewayKeyVars).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey_delete);
});
```

### Using `DeleteGatewayKey`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteGatewayKeyRef, DeleteGatewayKeyVariables } from '@dataconnect/generated';

// The `DeleteGatewayKey` mutation requires an argument of type `DeleteGatewayKeyVariables`:
const deleteGatewayKeyVars: DeleteGatewayKeyVariables = {
  id: ..., 
};

// Call the `deleteGatewayKeyRef()` function to get a reference to the mutation.
const ref = deleteGatewayKeyRef(deleteGatewayKeyVars);
// Variables can be defined inline as well.
const ref = deleteGatewayKeyRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteGatewayKeyRef(dataConnect, deleteGatewayKeyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.gatewayKey_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.gatewayKey_delete);
});
```

## CreateRoutingRule
You can execute the `CreateRoutingRule` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRoutingRule(vars: CreateRoutingRuleVariables): MutationPromise<CreateRoutingRuleData, CreateRoutingRuleVariables>;

interface CreateRoutingRuleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRoutingRuleVariables): MutationRef<CreateRoutingRuleData, CreateRoutingRuleVariables>;
}
export const createRoutingRuleRef: CreateRoutingRuleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRoutingRule(dc: DataConnect, vars: CreateRoutingRuleVariables): MutationPromise<CreateRoutingRuleData, CreateRoutingRuleVariables>;

interface CreateRoutingRuleRef {
  ...
  (dc: DataConnect, vars: CreateRoutingRuleVariables): MutationRef<CreateRoutingRuleData, CreateRoutingRuleVariables>;
}
export const createRoutingRuleRef: CreateRoutingRuleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRoutingRuleRef:
```typescript
const name = createRoutingRuleRef.operationName;
console.log(name);
```

### Variables
The `CreateRoutingRule` mutation requires an argument of type `CreateRoutingRuleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateRoutingRuleVariables {
  priority: number;
  projectId: UUIDString;
  providerId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateRoutingRule` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRoutingRuleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRoutingRuleData {
  routingRule_insert: RoutingRule_Key;
}
```
### Using `CreateRoutingRule`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRoutingRule, CreateRoutingRuleVariables } from '@dataconnect/generated';

// The `CreateRoutingRule` mutation requires an argument of type `CreateRoutingRuleVariables`:
const createRoutingRuleVars: CreateRoutingRuleVariables = {
  priority: ..., 
  projectId: ..., 
  providerId: ..., 
};

// Call the `createRoutingRule()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRoutingRule(createRoutingRuleVars);
// Variables can be defined inline as well.
const { data } = await createRoutingRule({ priority: ..., projectId: ..., providerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRoutingRule(dataConnect, createRoutingRuleVars);

console.log(data.routingRule_insert);

// Or, you can use the `Promise` API.
createRoutingRule(createRoutingRuleVars).then((response) => {
  const data = response.data;
  console.log(data.routingRule_insert);
});
```

### Using `CreateRoutingRule`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRoutingRuleRef, CreateRoutingRuleVariables } from '@dataconnect/generated';

// The `CreateRoutingRule` mutation requires an argument of type `CreateRoutingRuleVariables`:
const createRoutingRuleVars: CreateRoutingRuleVariables = {
  priority: ..., 
  projectId: ..., 
  providerId: ..., 
};

// Call the `createRoutingRuleRef()` function to get a reference to the mutation.
const ref = createRoutingRuleRef(createRoutingRuleVars);
// Variables can be defined inline as well.
const ref = createRoutingRuleRef({ priority: ..., projectId: ..., providerId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRoutingRuleRef(dataConnect, createRoutingRuleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.routingRule_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.routingRule_insert);
});
```

## UpdateRoutingRule
You can execute the `UpdateRoutingRule` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateRoutingRule(vars: UpdateRoutingRuleVariables): MutationPromise<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;

interface UpdateRoutingRuleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRoutingRuleVariables): MutationRef<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;
}
export const updateRoutingRuleRef: UpdateRoutingRuleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRoutingRule(dc: DataConnect, vars: UpdateRoutingRuleVariables): MutationPromise<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;

interface UpdateRoutingRuleRef {
  ...
  (dc: DataConnect, vars: UpdateRoutingRuleVariables): MutationRef<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;
}
export const updateRoutingRuleRef: UpdateRoutingRuleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRoutingRuleRef:
```typescript
const name = updateRoutingRuleRef.operationName;
console.log(name);
```

### Variables
The `UpdateRoutingRule` mutation requires an argument of type `UpdateRoutingRuleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateRoutingRuleVariables {
  id: UUIDString;
  priority: number;
}
```
### Return Type
Recall that executing the `UpdateRoutingRule` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRoutingRuleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRoutingRuleData {
  routingRule_update?: RoutingRule_Key | null;
}
```
### Using `UpdateRoutingRule`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRoutingRule, UpdateRoutingRuleVariables } from '@dataconnect/generated';

// The `UpdateRoutingRule` mutation requires an argument of type `UpdateRoutingRuleVariables`:
const updateRoutingRuleVars: UpdateRoutingRuleVariables = {
  id: ..., 
  priority: ..., 
};

// Call the `updateRoutingRule()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRoutingRule(updateRoutingRuleVars);
// Variables can be defined inline as well.
const { data } = await updateRoutingRule({ id: ..., priority: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRoutingRule(dataConnect, updateRoutingRuleVars);

console.log(data.routingRule_update);

// Or, you can use the `Promise` API.
updateRoutingRule(updateRoutingRuleVars).then((response) => {
  const data = response.data;
  console.log(data.routingRule_update);
});
```

### Using `UpdateRoutingRule`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRoutingRuleRef, UpdateRoutingRuleVariables } from '@dataconnect/generated';

// The `UpdateRoutingRule` mutation requires an argument of type `UpdateRoutingRuleVariables`:
const updateRoutingRuleVars: UpdateRoutingRuleVariables = {
  id: ..., 
  priority: ..., 
};

// Call the `updateRoutingRuleRef()` function to get a reference to the mutation.
const ref = updateRoutingRuleRef(updateRoutingRuleVars);
// Variables can be defined inline as well.
const ref = updateRoutingRuleRef({ id: ..., priority: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRoutingRuleRef(dataConnect, updateRoutingRuleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.routingRule_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.routingRule_update);
});
```

## DeleteRoutingRule
You can execute the `DeleteRoutingRule` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteRoutingRule(vars: DeleteRoutingRuleVariables): MutationPromise<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;

interface DeleteRoutingRuleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRoutingRuleVariables): MutationRef<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;
}
export const deleteRoutingRuleRef: DeleteRoutingRuleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteRoutingRule(dc: DataConnect, vars: DeleteRoutingRuleVariables): MutationPromise<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;

interface DeleteRoutingRuleRef {
  ...
  (dc: DataConnect, vars: DeleteRoutingRuleVariables): MutationRef<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;
}
export const deleteRoutingRuleRef: DeleteRoutingRuleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteRoutingRuleRef:
```typescript
const name = deleteRoutingRuleRef.operationName;
console.log(name);
```

### Variables
The `DeleteRoutingRule` mutation requires an argument of type `DeleteRoutingRuleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteRoutingRuleVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteRoutingRule` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteRoutingRuleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteRoutingRuleData {
  routingRule_delete?: RoutingRule_Key | null;
}
```
### Using `DeleteRoutingRule`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteRoutingRule, DeleteRoutingRuleVariables } from '@dataconnect/generated';

// The `DeleteRoutingRule` mutation requires an argument of type `DeleteRoutingRuleVariables`:
const deleteRoutingRuleVars: DeleteRoutingRuleVariables = {
  id: ..., 
};

// Call the `deleteRoutingRule()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteRoutingRule(deleteRoutingRuleVars);
// Variables can be defined inline as well.
const { data } = await deleteRoutingRule({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteRoutingRule(dataConnect, deleteRoutingRuleVars);

console.log(data.routingRule_delete);

// Or, you can use the `Promise` API.
deleteRoutingRule(deleteRoutingRuleVars).then((response) => {
  const data = response.data;
  console.log(data.routingRule_delete);
});
```

### Using `DeleteRoutingRule`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteRoutingRuleRef, DeleteRoutingRuleVariables } from '@dataconnect/generated';

// The `DeleteRoutingRule` mutation requires an argument of type `DeleteRoutingRuleVariables`:
const deleteRoutingRuleVars: DeleteRoutingRuleVariables = {
  id: ..., 
};

// Call the `deleteRoutingRuleRef()` function to get a reference to the mutation.
const ref = deleteRoutingRuleRef(deleteRoutingRuleVars);
// Variables can be defined inline as well.
const ref = deleteRoutingRuleRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteRoutingRuleRef(dataConnect, deleteRoutingRuleVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.routingRule_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.routingRule_delete);
});
```

## CreateRequestLog
You can execute the `CreateRequestLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRequestLog(vars: CreateRequestLogVariables): MutationPromise<CreateRequestLogData, CreateRequestLogVariables>;

interface CreateRequestLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRequestLogVariables): MutationRef<CreateRequestLogData, CreateRequestLogVariables>;
}
export const createRequestLogRef: CreateRequestLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRequestLog(dc: DataConnect, vars: CreateRequestLogVariables): MutationPromise<CreateRequestLogData, CreateRequestLogVariables>;

interface CreateRequestLogRef {
  ...
  (dc: DataConnect, vars: CreateRequestLogVariables): MutationRef<CreateRequestLogData, CreateRequestLogVariables>;
}
export const createRequestLogRef: CreateRequestLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRequestLogRef:
```typescript
const name = createRequestLogRef.operationName;
console.log(name);
```

### Variables
The `CreateRequestLog` mutation requires an argument of type `CreateRequestLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateRequestLogVariables {
  latency: number;
  cost: number;
  gatewayKeyId: UUIDString;
  providerId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateRequestLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRequestLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRequestLogData {
  requestLog_insert: RequestLog_Key;
}
```
### Using `CreateRequestLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRequestLog, CreateRequestLogVariables } from '@dataconnect/generated';

// The `CreateRequestLog` mutation requires an argument of type `CreateRequestLogVariables`:
const createRequestLogVars: CreateRequestLogVariables = {
  latency: ..., 
  cost: ..., 
  gatewayKeyId: ..., 
  providerId: ..., 
};

// Call the `createRequestLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRequestLog(createRequestLogVars);
// Variables can be defined inline as well.
const { data } = await createRequestLog({ latency: ..., cost: ..., gatewayKeyId: ..., providerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRequestLog(dataConnect, createRequestLogVars);

console.log(data.requestLog_insert);

// Or, you can use the `Promise` API.
createRequestLog(createRequestLogVars).then((response) => {
  const data = response.data;
  console.log(data.requestLog_insert);
});
```

### Using `CreateRequestLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRequestLogRef, CreateRequestLogVariables } from '@dataconnect/generated';

// The `CreateRequestLog` mutation requires an argument of type `CreateRequestLogVariables`:
const createRequestLogVars: CreateRequestLogVariables = {
  latency: ..., 
  cost: ..., 
  gatewayKeyId: ..., 
  providerId: ..., 
};

// Call the `createRequestLogRef()` function to get a reference to the mutation.
const ref = createRequestLogRef(createRequestLogVars);
// Variables can be defined inline as well.
const ref = createRequestLogRef({ latency: ..., cost: ..., gatewayKeyId: ..., providerId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRequestLogRef(dataConnect, createRequestLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.requestLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.requestLog_insert);
});
```

## UpdateRequestLog
You can execute the `UpdateRequestLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateRequestLog(vars: UpdateRequestLogVariables): MutationPromise<UpdateRequestLogData, UpdateRequestLogVariables>;

interface UpdateRequestLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRequestLogVariables): MutationRef<UpdateRequestLogData, UpdateRequestLogVariables>;
}
export const updateRequestLogRef: UpdateRequestLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRequestLog(dc: DataConnect, vars: UpdateRequestLogVariables): MutationPromise<UpdateRequestLogData, UpdateRequestLogVariables>;

interface UpdateRequestLogRef {
  ...
  (dc: DataConnect, vars: UpdateRequestLogVariables): MutationRef<UpdateRequestLogData, UpdateRequestLogVariables>;
}
export const updateRequestLogRef: UpdateRequestLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRequestLogRef:
```typescript
const name = updateRequestLogRef.operationName;
console.log(name);
```

### Variables
The `UpdateRequestLog` mutation requires an argument of type `UpdateRequestLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateRequestLogVariables {
  id: UUIDString;
  statusCode: number;
}
```
### Return Type
Recall that executing the `UpdateRequestLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRequestLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRequestLogData {
  requestLog_update?: RequestLog_Key | null;
}
```
### Using `UpdateRequestLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRequestLog, UpdateRequestLogVariables } from '@dataconnect/generated';

// The `UpdateRequestLog` mutation requires an argument of type `UpdateRequestLogVariables`:
const updateRequestLogVars: UpdateRequestLogVariables = {
  id: ..., 
  statusCode: ..., 
};

// Call the `updateRequestLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRequestLog(updateRequestLogVars);
// Variables can be defined inline as well.
const { data } = await updateRequestLog({ id: ..., statusCode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRequestLog(dataConnect, updateRequestLogVars);

console.log(data.requestLog_update);

// Or, you can use the `Promise` API.
updateRequestLog(updateRequestLogVars).then((response) => {
  const data = response.data;
  console.log(data.requestLog_update);
});
```

### Using `UpdateRequestLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRequestLogRef, UpdateRequestLogVariables } from '@dataconnect/generated';

// The `UpdateRequestLog` mutation requires an argument of type `UpdateRequestLogVariables`:
const updateRequestLogVars: UpdateRequestLogVariables = {
  id: ..., 
  statusCode: ..., 
};

// Call the `updateRequestLogRef()` function to get a reference to the mutation.
const ref = updateRequestLogRef(updateRequestLogVars);
// Variables can be defined inline as well.
const ref = updateRequestLogRef({ id: ..., statusCode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRequestLogRef(dataConnect, updateRequestLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.requestLog_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.requestLog_update);
});
```

## DeleteRequestLog
You can execute the `DeleteRequestLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteRequestLog(vars: DeleteRequestLogVariables): MutationPromise<DeleteRequestLogData, DeleteRequestLogVariables>;

interface DeleteRequestLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRequestLogVariables): MutationRef<DeleteRequestLogData, DeleteRequestLogVariables>;
}
export const deleteRequestLogRef: DeleteRequestLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteRequestLog(dc: DataConnect, vars: DeleteRequestLogVariables): MutationPromise<DeleteRequestLogData, DeleteRequestLogVariables>;

interface DeleteRequestLogRef {
  ...
  (dc: DataConnect, vars: DeleteRequestLogVariables): MutationRef<DeleteRequestLogData, DeleteRequestLogVariables>;
}
export const deleteRequestLogRef: DeleteRequestLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteRequestLogRef:
```typescript
const name = deleteRequestLogRef.operationName;
console.log(name);
```

### Variables
The `DeleteRequestLog` mutation requires an argument of type `DeleteRequestLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteRequestLogVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteRequestLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteRequestLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteRequestLogData {
  requestLog_delete?: RequestLog_Key | null;
}
```
### Using `DeleteRequestLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteRequestLog, DeleteRequestLogVariables } from '@dataconnect/generated';

// The `DeleteRequestLog` mutation requires an argument of type `DeleteRequestLogVariables`:
const deleteRequestLogVars: DeleteRequestLogVariables = {
  id: ..., 
};

// Call the `deleteRequestLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteRequestLog(deleteRequestLogVars);
// Variables can be defined inline as well.
const { data } = await deleteRequestLog({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteRequestLog(dataConnect, deleteRequestLogVars);

console.log(data.requestLog_delete);

// Or, you can use the `Promise` API.
deleteRequestLog(deleteRequestLogVars).then((response) => {
  const data = response.data;
  console.log(data.requestLog_delete);
});
```

### Using `DeleteRequestLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteRequestLogRef, DeleteRequestLogVariables } from '@dataconnect/generated';

// The `DeleteRequestLog` mutation requires an argument of type `DeleteRequestLogVariables`:
const deleteRequestLogVars: DeleteRequestLogVariables = {
  id: ..., 
};

// Call the `deleteRequestLogRef()` function to get a reference to the mutation.
const ref = deleteRequestLogRef(deleteRequestLogVars);
// Variables can be defined inline as well.
const ref = deleteRequestLogRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteRequestLogRef(dataConnect, deleteRequestLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.requestLog_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.requestLog_delete);
});
```

## CreateSecurityPolicy
You can execute the `CreateSecurityPolicy` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createSecurityPolicy(vars: CreateSecurityPolicyVariables): MutationPromise<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;

interface CreateSecurityPolicyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSecurityPolicyVariables): MutationRef<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;
}
export const createSecurityPolicyRef: CreateSecurityPolicyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSecurityPolicy(dc: DataConnect, vars: CreateSecurityPolicyVariables): MutationPromise<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;

interface CreateSecurityPolicyRef {
  ...
  (dc: DataConnect, vars: CreateSecurityPolicyVariables): MutationRef<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;
}
export const createSecurityPolicyRef: CreateSecurityPolicyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSecurityPolicyRef:
```typescript
const name = createSecurityPolicyRef.operationName;
console.log(name);
```

### Variables
The `CreateSecurityPolicy` mutation requires an argument of type `CreateSecurityPolicyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSecurityPolicyVariables {
  type: string;
  projectId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateSecurityPolicy` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSecurityPolicyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSecurityPolicyData {
  securityPolicy_insert: SecurityPolicy_Key;
}
```
### Using `CreateSecurityPolicy`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSecurityPolicy, CreateSecurityPolicyVariables } from '@dataconnect/generated';

// The `CreateSecurityPolicy` mutation requires an argument of type `CreateSecurityPolicyVariables`:
const createSecurityPolicyVars: CreateSecurityPolicyVariables = {
  type: ..., 
  projectId: ..., 
};

// Call the `createSecurityPolicy()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSecurityPolicy(createSecurityPolicyVars);
// Variables can be defined inline as well.
const { data } = await createSecurityPolicy({ type: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSecurityPolicy(dataConnect, createSecurityPolicyVars);

console.log(data.securityPolicy_insert);

// Or, you can use the `Promise` API.
createSecurityPolicy(createSecurityPolicyVars).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy_insert);
});
```

### Using `CreateSecurityPolicy`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSecurityPolicyRef, CreateSecurityPolicyVariables } from '@dataconnect/generated';

// The `CreateSecurityPolicy` mutation requires an argument of type `CreateSecurityPolicyVariables`:
const createSecurityPolicyVars: CreateSecurityPolicyVariables = {
  type: ..., 
  projectId: ..., 
};

// Call the `createSecurityPolicyRef()` function to get a reference to the mutation.
const ref = createSecurityPolicyRef(createSecurityPolicyVars);
// Variables can be defined inline as well.
const ref = createSecurityPolicyRef({ type: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSecurityPolicyRef(dataConnect, createSecurityPolicyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.securityPolicy_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy_insert);
});
```

## UpdateSecurityPolicy
You can execute the `UpdateSecurityPolicy` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateSecurityPolicy(vars: UpdateSecurityPolicyVariables): MutationPromise<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;

interface UpdateSecurityPolicyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSecurityPolicyVariables): MutationRef<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;
}
export const updateSecurityPolicyRef: UpdateSecurityPolicyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSecurityPolicy(dc: DataConnect, vars: UpdateSecurityPolicyVariables): MutationPromise<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;

interface UpdateSecurityPolicyRef {
  ...
  (dc: DataConnect, vars: UpdateSecurityPolicyVariables): MutationRef<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;
}
export const updateSecurityPolicyRef: UpdateSecurityPolicyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSecurityPolicyRef:
```typescript
const name = updateSecurityPolicyRef.operationName;
console.log(name);
```

### Variables
The `UpdateSecurityPolicy` mutation requires an argument of type `UpdateSecurityPolicyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSecurityPolicyVariables {
  id: UUIDString;
  json: string;
}
```
### Return Type
Recall that executing the `UpdateSecurityPolicy` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSecurityPolicyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSecurityPolicyData {
  securityPolicy_update?: SecurityPolicy_Key | null;
}
```
### Using `UpdateSecurityPolicy`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSecurityPolicy, UpdateSecurityPolicyVariables } from '@dataconnect/generated';

// The `UpdateSecurityPolicy` mutation requires an argument of type `UpdateSecurityPolicyVariables`:
const updateSecurityPolicyVars: UpdateSecurityPolicyVariables = {
  id: ..., 
  json: ..., 
};

// Call the `updateSecurityPolicy()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSecurityPolicy(updateSecurityPolicyVars);
// Variables can be defined inline as well.
const { data } = await updateSecurityPolicy({ id: ..., json: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSecurityPolicy(dataConnect, updateSecurityPolicyVars);

console.log(data.securityPolicy_update);

// Or, you can use the `Promise` API.
updateSecurityPolicy(updateSecurityPolicyVars).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy_update);
});
```

### Using `UpdateSecurityPolicy`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSecurityPolicyRef, UpdateSecurityPolicyVariables } from '@dataconnect/generated';

// The `UpdateSecurityPolicy` mutation requires an argument of type `UpdateSecurityPolicyVariables`:
const updateSecurityPolicyVars: UpdateSecurityPolicyVariables = {
  id: ..., 
  json: ..., 
};

// Call the `updateSecurityPolicyRef()` function to get a reference to the mutation.
const ref = updateSecurityPolicyRef(updateSecurityPolicyVars);
// Variables can be defined inline as well.
const ref = updateSecurityPolicyRef({ id: ..., json: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSecurityPolicyRef(dataConnect, updateSecurityPolicyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.securityPolicy_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy_update);
});
```

## DeleteSecurityPolicy
You can execute the `DeleteSecurityPolicy` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteSecurityPolicy(vars: DeleteSecurityPolicyVariables): MutationPromise<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;

interface DeleteSecurityPolicyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSecurityPolicyVariables): MutationRef<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;
}
export const deleteSecurityPolicyRef: DeleteSecurityPolicyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteSecurityPolicy(dc: DataConnect, vars: DeleteSecurityPolicyVariables): MutationPromise<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;

interface DeleteSecurityPolicyRef {
  ...
  (dc: DataConnect, vars: DeleteSecurityPolicyVariables): MutationRef<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;
}
export const deleteSecurityPolicyRef: DeleteSecurityPolicyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteSecurityPolicyRef:
```typescript
const name = deleteSecurityPolicyRef.operationName;
console.log(name);
```

### Variables
The `DeleteSecurityPolicy` mutation requires an argument of type `DeleteSecurityPolicyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteSecurityPolicyVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteSecurityPolicy` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteSecurityPolicyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteSecurityPolicyData {
  securityPolicy_delete?: SecurityPolicy_Key | null;
}
```
### Using `DeleteSecurityPolicy`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteSecurityPolicy, DeleteSecurityPolicyVariables } from '@dataconnect/generated';

// The `DeleteSecurityPolicy` mutation requires an argument of type `DeleteSecurityPolicyVariables`:
const deleteSecurityPolicyVars: DeleteSecurityPolicyVariables = {
  id: ..., 
};

// Call the `deleteSecurityPolicy()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteSecurityPolicy(deleteSecurityPolicyVars);
// Variables can be defined inline as well.
const { data } = await deleteSecurityPolicy({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteSecurityPolicy(dataConnect, deleteSecurityPolicyVars);

console.log(data.securityPolicy_delete);

// Or, you can use the `Promise` API.
deleteSecurityPolicy(deleteSecurityPolicyVars).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy_delete);
});
```

### Using `DeleteSecurityPolicy`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteSecurityPolicyRef, DeleteSecurityPolicyVariables } from '@dataconnect/generated';

// The `DeleteSecurityPolicy` mutation requires an argument of type `DeleteSecurityPolicyVariables`:
const deleteSecurityPolicyVars: DeleteSecurityPolicyVariables = {
  id: ..., 
};

// Call the `deleteSecurityPolicyRef()` function to get a reference to the mutation.
const ref = deleteSecurityPolicyRef(deleteSecurityPolicyVars);
// Variables can be defined inline as well.
const ref = deleteSecurityPolicyRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteSecurityPolicyRef(dataConnect, deleteSecurityPolicyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.securityPolicy_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.securityPolicy_delete);
});
```

