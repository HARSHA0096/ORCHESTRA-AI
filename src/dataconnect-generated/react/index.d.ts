import { CreateProjectData, CreateProjectVariables, UpdateProjectData, UpdateProjectVariables, DeleteProjectData, DeleteProjectVariables, GetProjectData, GetProjectVariables, ListProjectsData, CreateProviderConfigData, CreateProviderConfigVariables, UpdateProviderConfigData, UpdateProviderConfigVariables, DeleteProviderConfigData, DeleteProviderConfigVariables, GetProviderConfigData, GetProviderConfigVariables, ListProviderConfigsData, CreateGatewayKeyData, CreateGatewayKeyVariables, UpdateGatewayKeyData, UpdateGatewayKeyVariables, DeleteGatewayKeyData, DeleteGatewayKeyVariables, GetGatewayKeyData, GetGatewayKeyVariables, ListGatewayKeysData, CreateRoutingRuleData, CreateRoutingRuleVariables, UpdateRoutingRuleData, UpdateRoutingRuleVariables, DeleteRoutingRuleData, DeleteRoutingRuleVariables, GetRoutingRuleData, GetRoutingRuleVariables, ListRoutingRulesData, CreateRequestLogData, CreateRequestLogVariables, UpdateRequestLogData, UpdateRequestLogVariables, DeleteRequestLogData, DeleteRequestLogVariables, GetRequestLogData, GetRequestLogVariables, ListRequestLogsData, CreateSecurityPolicyData, CreateSecurityPolicyVariables, UpdateSecurityPolicyData, UpdateSecurityPolicyVariables, DeleteSecurityPolicyData, DeleteSecurityPolicyVariables, GetSecurityPolicyData, GetSecurityPolicyVariables, ListSecurityPoliciesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateProject(options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;
export function useCreateProject(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;

export function useUpdateProject(options?: useDataConnectMutationOptions<UpdateProjectData, FirebaseError, UpdateProjectVariables>): UseDataConnectMutationResult<UpdateProjectData, UpdateProjectVariables>;
export function useUpdateProject(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProjectData, FirebaseError, UpdateProjectVariables>): UseDataConnectMutationResult<UpdateProjectData, UpdateProjectVariables>;

export function useDeleteProject(options?: useDataConnectMutationOptions<DeleteProjectData, FirebaseError, DeleteProjectVariables>): UseDataConnectMutationResult<DeleteProjectData, DeleteProjectVariables>;
export function useDeleteProject(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteProjectData, FirebaseError, DeleteProjectVariables>): UseDataConnectMutationResult<DeleteProjectData, DeleteProjectVariables>;

export function useGetProject(vars: GetProjectVariables, options?: useDataConnectQueryOptions<GetProjectData>): UseDataConnectQueryResult<GetProjectData, GetProjectVariables>;
export function useGetProject(dc: DataConnect, vars: GetProjectVariables, options?: useDataConnectQueryOptions<GetProjectData>): UseDataConnectQueryResult<GetProjectData, GetProjectVariables>;

export function useListProjects(options?: useDataConnectQueryOptions<ListProjectsData>): UseDataConnectQueryResult<ListProjectsData, undefined>;
export function useListProjects(dc: DataConnect, options?: useDataConnectQueryOptions<ListProjectsData>): UseDataConnectQueryResult<ListProjectsData, undefined>;

export function useCreateProviderConfig(options?: useDataConnectMutationOptions<CreateProviderConfigData, FirebaseError, CreateProviderConfigVariables>): UseDataConnectMutationResult<CreateProviderConfigData, CreateProviderConfigVariables>;
export function useCreateProviderConfig(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProviderConfigData, FirebaseError, CreateProviderConfigVariables>): UseDataConnectMutationResult<CreateProviderConfigData, CreateProviderConfigVariables>;

export function useUpdateProviderConfig(options?: useDataConnectMutationOptions<UpdateProviderConfigData, FirebaseError, UpdateProviderConfigVariables>): UseDataConnectMutationResult<UpdateProviderConfigData, UpdateProviderConfigVariables>;
export function useUpdateProviderConfig(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProviderConfigData, FirebaseError, UpdateProviderConfigVariables>): UseDataConnectMutationResult<UpdateProviderConfigData, UpdateProviderConfigVariables>;

export function useDeleteProviderConfig(options?: useDataConnectMutationOptions<DeleteProviderConfigData, FirebaseError, DeleteProviderConfigVariables>): UseDataConnectMutationResult<DeleteProviderConfigData, DeleteProviderConfigVariables>;
export function useDeleteProviderConfig(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteProviderConfigData, FirebaseError, DeleteProviderConfigVariables>): UseDataConnectMutationResult<DeleteProviderConfigData, DeleteProviderConfigVariables>;

export function useGetProviderConfig(vars: GetProviderConfigVariables, options?: useDataConnectQueryOptions<GetProviderConfigData>): UseDataConnectQueryResult<GetProviderConfigData, GetProviderConfigVariables>;
export function useGetProviderConfig(dc: DataConnect, vars: GetProviderConfigVariables, options?: useDataConnectQueryOptions<GetProviderConfigData>): UseDataConnectQueryResult<GetProviderConfigData, GetProviderConfigVariables>;

export function useListProviderConfigs(options?: useDataConnectQueryOptions<ListProviderConfigsData>): UseDataConnectQueryResult<ListProviderConfigsData, undefined>;
export function useListProviderConfigs(dc: DataConnect, options?: useDataConnectQueryOptions<ListProviderConfigsData>): UseDataConnectQueryResult<ListProviderConfigsData, undefined>;

export function useCreateGatewayKey(options?: useDataConnectMutationOptions<CreateGatewayKeyData, FirebaseError, CreateGatewayKeyVariables>): UseDataConnectMutationResult<CreateGatewayKeyData, CreateGatewayKeyVariables>;
export function useCreateGatewayKey(dc: DataConnect, options?: useDataConnectMutationOptions<CreateGatewayKeyData, FirebaseError, CreateGatewayKeyVariables>): UseDataConnectMutationResult<CreateGatewayKeyData, CreateGatewayKeyVariables>;

export function useUpdateGatewayKey(options?: useDataConnectMutationOptions<UpdateGatewayKeyData, FirebaseError, UpdateGatewayKeyVariables>): UseDataConnectMutationResult<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;
export function useUpdateGatewayKey(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateGatewayKeyData, FirebaseError, UpdateGatewayKeyVariables>): UseDataConnectMutationResult<UpdateGatewayKeyData, UpdateGatewayKeyVariables>;

export function useDeleteGatewayKey(options?: useDataConnectMutationOptions<DeleteGatewayKeyData, FirebaseError, DeleteGatewayKeyVariables>): UseDataConnectMutationResult<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;
export function useDeleteGatewayKey(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteGatewayKeyData, FirebaseError, DeleteGatewayKeyVariables>): UseDataConnectMutationResult<DeleteGatewayKeyData, DeleteGatewayKeyVariables>;

export function useGetGatewayKey(vars: GetGatewayKeyVariables, options?: useDataConnectQueryOptions<GetGatewayKeyData>): UseDataConnectQueryResult<GetGatewayKeyData, GetGatewayKeyVariables>;
export function useGetGatewayKey(dc: DataConnect, vars: GetGatewayKeyVariables, options?: useDataConnectQueryOptions<GetGatewayKeyData>): UseDataConnectQueryResult<GetGatewayKeyData, GetGatewayKeyVariables>;

export function useListGatewayKeys(options?: useDataConnectQueryOptions<ListGatewayKeysData>): UseDataConnectQueryResult<ListGatewayKeysData, undefined>;
export function useListGatewayKeys(dc: DataConnect, options?: useDataConnectQueryOptions<ListGatewayKeysData>): UseDataConnectQueryResult<ListGatewayKeysData, undefined>;

export function useCreateRoutingRule(options?: useDataConnectMutationOptions<CreateRoutingRuleData, FirebaseError, CreateRoutingRuleVariables>): UseDataConnectMutationResult<CreateRoutingRuleData, CreateRoutingRuleVariables>;
export function useCreateRoutingRule(dc: DataConnect, options?: useDataConnectMutationOptions<CreateRoutingRuleData, FirebaseError, CreateRoutingRuleVariables>): UseDataConnectMutationResult<CreateRoutingRuleData, CreateRoutingRuleVariables>;

export function useUpdateRoutingRule(options?: useDataConnectMutationOptions<UpdateRoutingRuleData, FirebaseError, UpdateRoutingRuleVariables>): UseDataConnectMutationResult<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;
export function useUpdateRoutingRule(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateRoutingRuleData, FirebaseError, UpdateRoutingRuleVariables>): UseDataConnectMutationResult<UpdateRoutingRuleData, UpdateRoutingRuleVariables>;

export function useDeleteRoutingRule(options?: useDataConnectMutationOptions<DeleteRoutingRuleData, FirebaseError, DeleteRoutingRuleVariables>): UseDataConnectMutationResult<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;
export function useDeleteRoutingRule(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteRoutingRuleData, FirebaseError, DeleteRoutingRuleVariables>): UseDataConnectMutationResult<DeleteRoutingRuleData, DeleteRoutingRuleVariables>;

export function useGetRoutingRule(vars: GetRoutingRuleVariables, options?: useDataConnectQueryOptions<GetRoutingRuleData>): UseDataConnectQueryResult<GetRoutingRuleData, GetRoutingRuleVariables>;
export function useGetRoutingRule(dc: DataConnect, vars: GetRoutingRuleVariables, options?: useDataConnectQueryOptions<GetRoutingRuleData>): UseDataConnectQueryResult<GetRoutingRuleData, GetRoutingRuleVariables>;

export function useListRoutingRules(options?: useDataConnectQueryOptions<ListRoutingRulesData>): UseDataConnectQueryResult<ListRoutingRulesData, undefined>;
export function useListRoutingRules(dc: DataConnect, options?: useDataConnectQueryOptions<ListRoutingRulesData>): UseDataConnectQueryResult<ListRoutingRulesData, undefined>;

export function useCreateRequestLog(options?: useDataConnectMutationOptions<CreateRequestLogData, FirebaseError, CreateRequestLogVariables>): UseDataConnectMutationResult<CreateRequestLogData, CreateRequestLogVariables>;
export function useCreateRequestLog(dc: DataConnect, options?: useDataConnectMutationOptions<CreateRequestLogData, FirebaseError, CreateRequestLogVariables>): UseDataConnectMutationResult<CreateRequestLogData, CreateRequestLogVariables>;

export function useUpdateRequestLog(options?: useDataConnectMutationOptions<UpdateRequestLogData, FirebaseError, UpdateRequestLogVariables>): UseDataConnectMutationResult<UpdateRequestLogData, UpdateRequestLogVariables>;
export function useUpdateRequestLog(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateRequestLogData, FirebaseError, UpdateRequestLogVariables>): UseDataConnectMutationResult<UpdateRequestLogData, UpdateRequestLogVariables>;

export function useDeleteRequestLog(options?: useDataConnectMutationOptions<DeleteRequestLogData, FirebaseError, DeleteRequestLogVariables>): UseDataConnectMutationResult<DeleteRequestLogData, DeleteRequestLogVariables>;
export function useDeleteRequestLog(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteRequestLogData, FirebaseError, DeleteRequestLogVariables>): UseDataConnectMutationResult<DeleteRequestLogData, DeleteRequestLogVariables>;

export function useGetRequestLog(vars: GetRequestLogVariables, options?: useDataConnectQueryOptions<GetRequestLogData>): UseDataConnectQueryResult<GetRequestLogData, GetRequestLogVariables>;
export function useGetRequestLog(dc: DataConnect, vars: GetRequestLogVariables, options?: useDataConnectQueryOptions<GetRequestLogData>): UseDataConnectQueryResult<GetRequestLogData, GetRequestLogVariables>;

export function useListRequestLogs(options?: useDataConnectQueryOptions<ListRequestLogsData>): UseDataConnectQueryResult<ListRequestLogsData, undefined>;
export function useListRequestLogs(dc: DataConnect, options?: useDataConnectQueryOptions<ListRequestLogsData>): UseDataConnectQueryResult<ListRequestLogsData, undefined>;

export function useCreateSecurityPolicy(options?: useDataConnectMutationOptions<CreateSecurityPolicyData, FirebaseError, CreateSecurityPolicyVariables>): UseDataConnectMutationResult<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;
export function useCreateSecurityPolicy(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSecurityPolicyData, FirebaseError, CreateSecurityPolicyVariables>): UseDataConnectMutationResult<CreateSecurityPolicyData, CreateSecurityPolicyVariables>;

export function useUpdateSecurityPolicy(options?: useDataConnectMutationOptions<UpdateSecurityPolicyData, FirebaseError, UpdateSecurityPolicyVariables>): UseDataConnectMutationResult<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;
export function useUpdateSecurityPolicy(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateSecurityPolicyData, FirebaseError, UpdateSecurityPolicyVariables>): UseDataConnectMutationResult<UpdateSecurityPolicyData, UpdateSecurityPolicyVariables>;

export function useDeleteSecurityPolicy(options?: useDataConnectMutationOptions<DeleteSecurityPolicyData, FirebaseError, DeleteSecurityPolicyVariables>): UseDataConnectMutationResult<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;
export function useDeleteSecurityPolicy(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteSecurityPolicyData, FirebaseError, DeleteSecurityPolicyVariables>): UseDataConnectMutationResult<DeleteSecurityPolicyData, DeleteSecurityPolicyVariables>;

export function useGetSecurityPolicy(vars: GetSecurityPolicyVariables, options?: useDataConnectQueryOptions<GetSecurityPolicyData>): UseDataConnectQueryResult<GetSecurityPolicyData, GetSecurityPolicyVariables>;
export function useGetSecurityPolicy(dc: DataConnect, vars: GetSecurityPolicyVariables, options?: useDataConnectQueryOptions<GetSecurityPolicyData>): UseDataConnectQueryResult<GetSecurityPolicyData, GetSecurityPolicyVariables>;

export function useListSecurityPolicies(options?: useDataConnectQueryOptions<ListSecurityPoliciesData>): UseDataConnectQueryResult<ListSecurityPoliciesData, undefined>;
export function useListSecurityPolicies(dc: DataConnect, options?: useDataConnectQueryOptions<ListSecurityPoliciesData>): UseDataConnectQueryResult<ListSecurityPoliciesData, undefined>;
