import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateGatewayKeyData {
  gatewayKey_insert: GatewayKey_Key;
}

export interface CreateGatewayKeyVariables {
  keyHash: string;
  projectId: UUIDString;
}

export interface CreateProjectData {
  project_insert: Project_Key;
}

export interface CreateProjectVariables {
  name: string;
  description?: string | null;
}

export interface CreateProviderConfigData {
  providerConfig_insert: ProviderConfig_Key;
}

export interface CreateProviderConfigVariables {
  providerType: string;
  apiKey: string;
  endpoint: string;
  projectId: UUIDString;
}

export interface CreateRequestLogData {
  requestLog_insert: RequestLog_Key;
}

export interface CreateRequestLogVariables {
  latency: number;
  cost: number;
  gatewayKeyId: UUIDString;
  providerId: UUIDString;
}

export interface CreateRoutingRuleData {
  routingRule_insert: RoutingRule_Key;
}

export interface CreateRoutingRuleVariables {
  priority: number;
  projectId: UUIDString;
  providerId: UUIDString;
}

export interface CreateSecurityPolicyData {
  securityPolicy_insert: SecurityPolicy_Key;
}

export interface CreateSecurityPolicyVariables {
  type: string;
  projectId: UUIDString;
}

export interface DeleteGatewayKeyData {
  gatewayKey_delete?: GatewayKey_Key | null;
}

export interface DeleteGatewayKeyVariables {
  id: UUIDString;
}

export interface DeleteProjectData {
  project_delete?: Project_Key | null;
}

export interface DeleteProjectVariables {
  id: UUIDString;
}

export interface DeleteProviderConfigData {
  providerConfig_delete?: ProviderConfig_Key | null;
}

export interface DeleteProviderConfigVariables {
  id: UUIDString;
}

export interface DeleteRequestLogData {
  requestLog_delete?: RequestLog_Key | null;
}

export interface DeleteRequestLogVariables {
  id: UUIDString;
}

export interface DeleteRoutingRuleData {
  routingRule_delete?: RoutingRule_Key | null;
}

export interface DeleteRoutingRuleVariables {
  id: UUIDString;
}

export interface DeleteSecurityPolicyData {
  securityPolicy_delete?: SecurityPolicy_Key | null;
}

export interface DeleteSecurityPolicyVariables {
  id: UUIDString;
}

export interface GatewayKey_Key {
  id: UUIDString;
  __typename?: 'GatewayKey_Key';
}

export interface GetGatewayKeyData {
  gatewayKey?: {
    status: string;
    expiresAt?: TimestampString | null;
  };
}

export interface GetGatewayKeyVariables {
  id: UUIDString;
}

export interface GetProjectData {
  project?: {
    name: string;
    description?: string | null;
    createdAt?: TimestampString | null;
  };
}

export interface GetProjectVariables {
  id: UUIDString;
}

export interface GetProviderConfigData {
  providerConfig?: {
    providerType: string;
    status?: string | null;
  };
}

export interface GetProviderConfigVariables {
  id: UUIDString;
}

export interface GetRequestLogData {
  requestLog?: {
    latencyMs: number;
    cost: number;
    statusCode?: number | null;
  };
}

export interface GetRequestLogVariables {
  id: UUIDString;
}

export interface GetRoutingRuleData {
  routingRule?: {
    priority: number;
    trafficWeight?: number | null;
  };
}

export interface GetRoutingRuleVariables {
  id: UUIDString;
}

export interface GetSecurityPolicyData {
  securityPolicy?: {
    policyType: string;
    configurationJson?: string | null;
  };
}

export interface GetSecurityPolicyVariables {
  id: UUIDString;
}

export interface ListGatewayKeysData {
  gatewayKeys: ({
    keyHash: string;
    status: string;
  })[];
}

export interface ListProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
  } & Project_Key)[];
}

export interface ListProviderConfigsData {
  providerConfigs: ({
    id: UUIDString;
    providerType: string;
  } & ProviderConfig_Key)[];
}

export interface ListRequestLogsData {
  requestLogs: ({
    modelUsed?: string | null;
    errorMessage?: string | null;
  })[];
}

export interface ListRoutingRulesData {
  routingRules: ({
    priority: number;
    modelFilter?: string | null;
  })[];
}

export interface ListSecurityPoliciesData {
  securityPolicies: ({
    policyType: string;
  })[];
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface ProviderConfig_Key {
  id: UUIDString;
  __typename?: 'ProviderConfig_Key';
}

export interface RequestLog_Key {
  id: UUIDString;
  __typename?: 'RequestLog_Key';
}

export interface RoutingRule_Key {
  id: UUIDString;
  __typename?: 'RoutingRule_Key';
}

export interface SecurityPolicy_Key {
  id: UUIDString;
  __typename?: 'SecurityPolicy_Key';
}

export interface UpdateGatewayKeyData {
  gatewayKey_update?: GatewayKey_Key | null;
}

export interface UpdateGatewayKeyVariables {
  id: UUIDString;
  status: string;
}

export interface UpdateProjectData {
  project_update?: Project_Key | null;
}

export interface UpdateProjectVariables {
  id: UUIDString;
  name?: string | null;
}

export interface UpdateProviderConfigData {
  providerConfig_update?: ProviderConfig_Key | null;
}

export interface UpdateProviderConfigVariables {
  id: UUIDString;
  status?: string | null;
}

export interface UpdateRequestLogData {
  requestLog_update?: RequestLog_Key | null;
}

export interface UpdateRequestLogVariables {
  id: UUIDString;
  statusCode: number;
}

export interface UpdateRoutingRuleData {
  routingRule_update?: RoutingRule_Key | null;
}

export interface UpdateRoutingRuleVariables {
  id: UUIDString;
  priority: number;
}

export interface UpdateSecurityPolicyData {
  securityPolicy_update?: SecurityPolicy_Key | null;
}

export interface UpdateSecurityPolicyVariables {
  id: UUIDString;
  json: string;
}

interface CreateProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  operationName: string;
}
export const createProjectRef: CreateProjectRef;

export function createProject(vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;
export function createProject(dc: DataConnect, vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface UpdateProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProjectVariables): MutationRef<UpdateProjectData, UpdateProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProjectVariables): MutationRef<UpdateProjectData, UpdateProjectVariables>;
  operationName: string;
}
export const updateProjectRef: UpdateProjectRef;

export function updateProject(vars: UpdateProjectVariables): MutationPromise<UpdateProjectData, UpdateProjectVariables>;
export function updateProject(dc: DataConnect, vars: UpdateProjectVariables): MutationPromise<UpdateProjectData, UpdateProjectVariables>;

interface DeleteProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProjectVariables): MutationRef<DeleteProjectData, DeleteProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteProjectVariables): MutationRef<DeleteProjectData, DeleteProjectVariables>;
  operationName: string;
}
export const deleteProjectRef: DeleteProjectRef;

export function deleteProject(vars: DeleteProjectVariables): MutationPromise<DeleteProjectData, DeleteProjectVariables>;
export function deleteProject(dc: DataConnect, vars: DeleteProjectVariables): MutationPromise<DeleteProjectData, DeleteProjectVariables>;

interface GetProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectVariables): QueryRef<GetProjectData, GetProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProjectVariables): QueryRef<GetProjectData, GetProjectVariables>;
  operationName: string;
}
export const getProjectRef: GetProjectRef;

export function getProject(vars: GetProjectVariables, options?: ExecuteQueryOptions): QueryPromise<GetProjectData, GetProjectVariables>;
export function getProject(dc: DataConnect, vars: GetProjectVariables, options?: ExecuteQueryOptions): QueryPromise<GetProjectData, GetProjectVariables>;

interface ListProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProjectsData, undefined>;
  operationName: string;
}
export const listProjectsRef: ListProjectsRef;

export function listProjects(options?: ExecuteQueryOptions): QueryPromise<ListProjectsData, undefined>;
export function listProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProjectsData, undefined>;

interface CreateProviderConfigRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProviderConfigVariables): MutationRef<CreateProviderConfigData, CreateProviderConfigVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProviderConfigVariables): MutationRef<CreateProviderConfigData, CreateProviderConfigVariables>;
  operationName: string;
}
export const createProviderConfigRef: CreateProviderConfigRef;

export function createProviderConfig(vars: CreateProviderConfigVariables): MutationPromise<CreateProviderConfigData, CreateProviderConfigVariables>;
export function createProviderConfig(dc: DataConnect, vars: CreateProviderConfigVariables): MutationPromise<CreateProviderConfigData, CreateProviderConfigVariables>;

interface UpdateProviderConfigRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProviderConfigVariables): MutationRef<UpdateProviderConfigData, UpdateProviderConfigVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProviderConfigVariables): MutationRef<UpdateProviderConfigData, UpdateProviderConfigVariables>;
  operationName: string;
}
export const updateProviderConfigRef: UpdateProviderConfigRef;

export function updateProviderConfig(vars: UpdateProviderConfigVariables): MutationPromise<UpdateProviderConfigData, UpdateProviderConfigVariables>;
export function updateProviderConfig(dc: DataConnect, vars: UpdateProviderConfigVariables): MutationPromise<UpdateProviderConfigData, UpdateProviderConfigVariables>;

interface DeleteProviderConfigRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProviderConfigVariables): MutationRef<DeleteProviderConfigData, DeleteProviderConfigVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteProviderConfigVariables): MutationRef<DeleteProviderConfigData, DeleteProviderConfigVariables>;
  operationName: string;
}
export const deleteProviderConfigRef: DeleteProviderConfigRef;

export function deleteProviderConfig(vars: DeleteProviderConfigVariables): MutationPromise<DeleteProviderConfigData, DeleteProviderConfigVariables>;
export function deleteProviderConfig(dc: DataConnect, vars: DeleteProviderConfigVariables): MutationPromise<DeleteProviderConfigData, DeleteProviderConfigVariables>;

interface GetProviderConfigRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProviderConfigVariables): QueryRef<GetProviderConfigData, GetProviderConfigVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProviderConfigVariables): QueryRef<GetProviderConfigData, GetProviderConfigVariables>;
  operationName: string;
}
export const getProviderConfigRef: GetProviderConfigRef;

export function getProviderConfig(vars: GetProviderConfigVariables, options?: ExecuteQueryOptions): QueryPromise<GetProviderConfigData, GetProviderConfigVariables>;
export function getProviderConfig(dc: DataConnect, vars: GetProviderConfigVariables, options?: ExecuteQueryOptions): QueryPromise<GetProviderConfigData, GetProviderConfigVariables>;

interface ListProviderConfigsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProviderConfigsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProviderConfigsData, undefined>;
  operationName: string;
}
export const listProviderConfigsRef: ListProviderConfigsRef;

export function listProviderConfigs(options?: ExecuteQueryOptions): QueryPromise<ListProviderConfigsData, undefined>;
export function listProviderConfigs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProviderConfigsData, undefined>;

interface CreateGatewayKeyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateGatewayKeyVariables): MutationRef<CreateGatewayKeyData, CreateGatewayKeyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateGatewayKeyVariables): MutationRef<CreateGatewayKeyData, CreateGatewayKeyVariables>;
  operationName: string;
}
export const createGatewayKeyRef: CreateGatewayKeyRef;

export function createGatewayKey(vars: CreateGatewayKeyVariables): MutationPromise<CreateGatewayKeyData, CreateGatewayKeyVariables>;
export function createGatewayKey(dc: DataConnect, vars: CreateGatewayKeyVariables): MutationPromise<CreateGatewayKeyData, CreateGatewayKeyVariables>;

interface UpdateGatewayKeyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateGatewayKeyVariables): MutationRef<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateGatewayKeyVariables): MutationRef<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;
  operationName: string;
}
export const updateGatewayKeyRef: UpdateGatewayKeyRef;

export function updateGatewayKey(vars: UpdateGatewayKeyVariables): MutationPromise<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;
export function updateGatewayKey(dc: DataConnect, vars: UpdateGatewayKeyVariables): MutationPromise<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;

interface DeleteGatewayKeyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteGatewayKeyVariables): MutationRef<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteGatewayKeyVariables): MutationRef<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;
  operationName: string;
}
export const deleteGatewayKeyRef: DeleteGatewayKeyRef;

export function deleteGatewayKey(vars: DeleteGatewayKeyVariables): MutationPromise<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;
export function deleteGatewayKey(dc: DataConnect, vars: DeleteGatewayKeyVariables): MutationPromise<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;

interface GetGatewayKeyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetGatewayKeyVariables): QueryRef<GetGatewayKeyData, GetGatewayKeyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetGatewayKeyVariables): QueryRef<GetGatewayKeyData, GetGatewayKeyVariables>;
  operationName: string;
}
export const getGatewayKeyRef: GetGatewayKeyRef;

export function getGatewayKey(vars: GetGatewayKeyVariables, options?: ExecuteQueryOptions): QueryPromise<GetGatewayKeyData, GetGatewayKeyVariables>;
export function getGatewayKey(dc: DataConnect, vars: GetGatewayKeyVariables, options?: ExecuteQueryOptions): QueryPromise<GetGatewayKeyData, GetGatewayKeyVariables>;

interface ListGatewayKeysRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListGatewayKeysData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListGatewayKeysData, undefined>;
  operationName: string;
}
export const listGatewayKeysRef: ListGatewayKeysRef;

export function listGatewayKeys(options?: ExecuteQueryOptions): QueryPromise<ListGatewayKeysData, undefined>;
export function listGatewayKeys(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListGatewayKeysData, undefined>;

interface CreateRoutingRuleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRoutingRuleVariables): MutationRef<CreateRoutingRuleData, CreateRoutingRuleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRoutingRuleVariables): MutationRef<CreateRoutingRuleData, CreateRoutingRuleVariables>;
  operationName: string;
}
export const createRoutingRuleRef: CreateRoutingRuleRef;

export function createRoutingRule(vars: CreateRoutingRuleVariables): MutationPromise<CreateRoutingRuleData, CreateRoutingRuleVariables>;
export function createRoutingRule(dc: DataConnect, vars: CreateRoutingRuleVariables): MutationPromise<CreateRoutingRuleData, CreateRoutingRuleVariables>;

interface UpdateRoutingRuleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRoutingRuleVariables): MutationRef<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateRoutingRuleVariables): MutationRef<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;
  operationName: string;
}
export const updateRoutingRuleRef: UpdateRoutingRuleRef;

export function updateRoutingRule(vars: UpdateRoutingRuleVariables): MutationPromise<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;
export function updateRoutingRule(dc: DataConnect, vars: UpdateRoutingRuleVariables): MutationPromise<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;

interface DeleteRoutingRuleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRoutingRuleVariables): MutationRef<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteRoutingRuleVariables): MutationRef<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;
  operationName: string;
}
export const deleteRoutingRuleRef: DeleteRoutingRuleRef;

export function deleteRoutingRule(vars: DeleteRoutingRuleVariables): MutationPromise<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;
export function deleteRoutingRule(dc: DataConnect, vars: DeleteRoutingRuleVariables): MutationPromise<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;

interface GetRoutingRuleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoutingRuleVariables): QueryRef<GetRoutingRuleData, GetRoutingRuleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRoutingRuleVariables): QueryRef<GetRoutingRuleData, GetRoutingRuleVariables>;
  operationName: string;
}
export const getRoutingRuleRef: GetRoutingRuleRef;

export function getRoutingRule(vars: GetRoutingRuleVariables, options?: ExecuteQueryOptions): QueryPromise<GetRoutingRuleData, GetRoutingRuleVariables>;
export function getRoutingRule(dc: DataConnect, vars: GetRoutingRuleVariables, options?: ExecuteQueryOptions): QueryPromise<GetRoutingRuleData, GetRoutingRuleVariables>;

interface ListRoutingRulesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRoutingRulesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRoutingRulesData, undefined>;
  operationName: string;
}
export const listRoutingRulesRef: ListRoutingRulesRef;

export function listRoutingRules(options?: ExecuteQueryOptions): QueryPromise<ListRoutingRulesData, undefined>;
export function listRoutingRules(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRoutingRulesData, undefined>;

interface CreateRequestLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRequestLogVariables): MutationRef<CreateRequestLogData, CreateRequestLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRequestLogVariables): MutationRef<CreateRequestLogData, CreateRequestLogVariables>;
  operationName: string;
}
export const createRequestLogRef: CreateRequestLogRef;

export function createRequestLog(vars: CreateRequestLogVariables): MutationPromise<CreateRequestLogData, CreateRequestLogVariables>;
export function createRequestLog(dc: DataConnect, vars: CreateRequestLogVariables): MutationPromise<CreateRequestLogData, CreateRequestLogVariables>;

interface UpdateRequestLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRequestLogVariables): MutationRef<UpdateRequestLogData, UpdateRequestLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateRequestLogVariables): MutationRef<UpdateRequestLogData, UpdateRequestLogVariables>;
  operationName: string;
}
export const updateRequestLogRef: UpdateRequestLogRef;

export function updateRequestLog(vars: UpdateRequestLogVariables): MutationPromise<UpdateRequestLogData, UpdateRequestLogVariables>;
export function updateRequestLog(dc: DataConnect, vars: UpdateRequestLogVariables): MutationPromise<UpdateRequestLogData, UpdateRequestLogVariables>;

interface DeleteRequestLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRequestLogVariables): MutationRef<DeleteRequestLogData, DeleteRequestLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteRequestLogVariables): MutationRef<DeleteRequestLogData, DeleteRequestLogVariables>;
  operationName: string;
}
export const deleteRequestLogRef: DeleteRequestLogRef;

export function deleteRequestLog(vars: DeleteRequestLogVariables): MutationPromise<DeleteRequestLogData, DeleteRequestLogVariables>;
export function deleteRequestLog(dc: DataConnect, vars: DeleteRequestLogVariables): MutationPromise<DeleteRequestLogData, DeleteRequestLogVariables>;

interface GetRequestLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRequestLogVariables): QueryRef<GetRequestLogData, GetRequestLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRequestLogVariables): QueryRef<GetRequestLogData, GetRequestLogVariables>;
  operationName: string;
}
export const getRequestLogRef: GetRequestLogRef;

export function getRequestLog(vars: GetRequestLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetRequestLogData, GetRequestLogVariables>;
export function getRequestLog(dc: DataConnect, vars: GetRequestLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetRequestLogData, GetRequestLogVariables>;

interface ListRequestLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRequestLogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRequestLogsData, undefined>;
  operationName: string;
}
export const listRequestLogsRef: ListRequestLogsRef;

export function listRequestLogs(options?: ExecuteQueryOptions): QueryPromise<ListRequestLogsData, undefined>;
export function listRequestLogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRequestLogsData, undefined>;

interface CreateSecurityPolicyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSecurityPolicyVariables): MutationRef<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSecurityPolicyVariables): MutationRef<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;
  operationName: string;
}
export const createSecurityPolicyRef: CreateSecurityPolicyRef;

export function createSecurityPolicy(vars: CreateSecurityPolicyVariables): MutationPromise<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;
export function createSecurityPolicy(dc: DataConnect, vars: CreateSecurityPolicyVariables): MutationPromise<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;

interface UpdateSecurityPolicyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSecurityPolicyVariables): MutationRef<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSecurityPolicyVariables): MutationRef<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;
  operationName: string;
}
export const updateSecurityPolicyRef: UpdateSecurityPolicyRef;

export function updateSecurityPolicy(vars: UpdateSecurityPolicyVariables): MutationPromise<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;
export function updateSecurityPolicy(dc: DataConnect, vars: UpdateSecurityPolicyVariables): MutationPromise<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;

interface DeleteSecurityPolicyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSecurityPolicyVariables): MutationRef<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSecurityPolicyVariables): MutationRef<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;
  operationName: string;
}
export const deleteSecurityPolicyRef: DeleteSecurityPolicyRef;

export function deleteSecurityPolicy(vars: DeleteSecurityPolicyVariables): MutationPromise<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;
export function deleteSecurityPolicy(dc: DataConnect, vars: DeleteSecurityPolicyVariables): MutationPromise<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;

interface GetSecurityPolicyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSecurityPolicyVariables): QueryRef<GetSecurityPolicyData, GetSecurityPolicyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSecurityPolicyVariables): QueryRef<GetSecurityPolicyData, GetSecurityPolicyVariables>;
  operationName: string;
}
export const getSecurityPolicyRef: GetSecurityPolicyRef;

export function getSecurityPolicy(vars: GetSecurityPolicyVariables, options?: ExecuteQueryOptions): QueryPromise<GetSecurityPolicyData, GetSecurityPolicyVariables>;
export function getSecurityPolicy(dc: DataConnect, vars: GetSecurityPolicyVariables, options?: ExecuteQueryOptions): QueryPromise<GetSecurityPolicyData, GetSecurityPolicyVariables>;

interface ListSecurityPoliciesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSecurityPoliciesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListSecurityPoliciesData, undefined>;
  operationName: string;
}
export const listSecurityPoliciesRef: ListSecurityPoliciesRef;

export function listSecurityPolicies(options?: ExecuteQueryOptions): QueryPromise<ListSecurityPoliciesData, undefined>;
export function listSecurityPolicies(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSecurityPoliciesData, undefined>;

