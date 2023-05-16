import { AxiosResponse } from "axios";
import { useAxios } from "./axios";
import { useConnectionStore } from "@/stores/connection";
import { storeToRefs } from "pinia";
import { GraphMetadata } from "@/types/types";
import { useMetadata } from "../metadata/metadata";
import { useQueryStore } from "@/stores/query";

export function useAstra() {
    // Composable responsible for communication with a cloud Astra DB server

    const { manageRequest } = useAxios();
    const { createAstraQueryPayload } = useMetadata();

    // #region Endpoints
    const getBaseUrl = (): string => {
        const connectionStore = useConnectionStore();
        const { userAstraDatabaseId, userAstraDatabaseRegion} = storeToRefs(connectionStore);
        return `https://${userAstraDatabaseId.value}-${userAstraDatabaseRegion.value}.apps.astra.datastax.com/api/rest`;
    };

    const createAstraApiUrlForKeyspaces = (): string => {
        const baseUrl = getBaseUrl();
        return `${baseUrl}/v2/schemas/keyspaces`;
    };
    
    const createAstraApiUrlForTables = (keyspace: string): string => {
        const baseUrl = getBaseUrl();
        return `${baseUrl}/v2/schemas/keyspaces/${keyspace}/tables`;
    };
    
    const createAstraApiUrlForTable = (keyspace: string, table: string): string => {
        const baseUrl = getBaseUrl();
        return `${baseUrl}/v2/schemas/keyspaces/${keyspace}/tables/${table}`;
    };
    // #endregion

    const createAstraApiUrlForQuery = (keyspace: string, table: string): string => {
        const baseUrl = getBaseUrl();
        return `${baseUrl}/v1/keyspaces/${keyspace}/tables/${table}/rows/query`;
    }

    // #region Headers
    const configureHeaders = (): { [key: string]: string } => {
        const connectionStore = useConnectionStore();
        const { userAstraToken} = storeToRefs(connectionStore);
        return {
          'X-Cassandra-Token': userAstraToken.value,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin' : '*'
        };
      };
    // #endregion

    // #region GET Methods
    const retrieveAllKeyspaces = (): Promise<AxiosResponse<any, any>> => {
        const requestUrl = createAstraApiUrlForKeyspaces();
        const headers = configureHeaders();
        return manageRequest('get', requestUrl, null, requestUrl, headers);
    };
      
    const retrieveAllTables = (keyspace: string): Promise<AxiosResponse<any, any>> => {
        const requestUrl = createAstraApiUrlForTables(keyspace);
        const headers = configureHeaders();
        return manageRequest('get', requestUrl, null, requestUrl, headers);
    };
      
    const retrieveTable = (keyspace: string, table: string): Promise<AxiosResponse<any, any>> => {
        const requestUrl = createAstraApiUrlForTable(keyspace, table);
        const headers = configureHeaders();
        return manageRequest('get', requestUrl, null, requestUrl, headers);
    };

    const retrieveQueryResults = async (keyspace: string, table: string, queryMetadata: GraphMetadata) => {
        const queryStore = useQueryStore();
        const { whereClauseItems, queryConcepts } = storeToRefs(queryStore);

        const requestUrl = createAstraApiUrlForQuery(keyspace, table);
        const headers = configureHeaders();
        const payload = createAstraQueryPayload(queryMetadata, whereClauseItems.value, queryConcepts.value);
        
        return manageRequest('post', requestUrl, payload, requestUrl, headers);
    };
    // #endregion

    // #region POST methods
    const saveTable = (keyspace: string, data: any): Promise<AxiosResponse<any, any>> => {
        const requestUrl = createAstraApiUrlForTables(keyspace);
        const headers = configureHeaders();
        return manageRequest('post', requestUrl, data, requestUrl, headers);
    };
    // #endregion

    return {
        retrieveAllKeyspaces,
        retrieveAllTables,
        retrieveTable,
        retrieveQueryResults,
        saveTable
    }
};