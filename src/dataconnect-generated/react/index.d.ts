import { AddNewPoiData, AddNewPoiVariables, GetPoiData, GetPoiVariables, UpdatePoiData, UpdatePoiVariables, ListPoIsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAddNewPoi(options?: useDataConnectMutationOptions<AddNewPoiData, FirebaseError, AddNewPoiVariables>): UseDataConnectMutationResult<AddNewPoiData, AddNewPoiVariables>;
export function useAddNewPoi(dc: DataConnect, options?: useDataConnectMutationOptions<AddNewPoiData, FirebaseError, AddNewPoiVariables>): UseDataConnectMutationResult<AddNewPoiData, AddNewPoiVariables>;

export function useGetPoi(vars: GetPoiVariables, options?: useDataConnectQueryOptions<GetPoiData>): UseDataConnectQueryResult<GetPoiData, GetPoiVariables>;
export function useGetPoi(dc: DataConnect, vars: GetPoiVariables, options?: useDataConnectQueryOptions<GetPoiData>): UseDataConnectQueryResult<GetPoiData, GetPoiVariables>;

export function useUpdatePoi(options?: useDataConnectMutationOptions<UpdatePoiData, FirebaseError, UpdatePoiVariables>): UseDataConnectMutationResult<UpdatePoiData, UpdatePoiVariables>;
export function useUpdatePoi(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePoiData, FirebaseError, UpdatePoiVariables>): UseDataConnectMutationResult<UpdatePoiData, UpdatePoiVariables>;

export function useListPoIs(options?: useDataConnectQueryOptions<ListPoIsData>): UseDataConnectQueryResult<ListPoIsData, undefined>;
export function useListPoIs(dc: DataConnect, options?: useDataConnectQueryOptions<ListPoIsData>): UseDataConnectQueryResult<ListPoIsData, undefined>;
