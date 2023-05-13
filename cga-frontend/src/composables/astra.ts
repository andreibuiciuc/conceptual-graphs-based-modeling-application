import { AxiosResponse } from "axios";
import { manageRequest } from "@/includes/requests";

export function useAstra() {
    // Composable responsible for communication with a cloud Astra DB server

    const astraDbId = import.meta.env.VITE_ASTRA_DB_ID;
    const astraDbRegion = import.meta.env.VITE_ASTRA_DB_REGION;
    const baseUrl = `https://${astraDbId}-${astraDbRegion}.apps.astra.datastax.com/api/rest`;

    // #region Endpoints
    const createAstraApiUrlForKeyspaces = (): string => {
        return `${baseUrl}/v2/schemas/keyspaces`;
    };
    
    const createAstraApiUrlForTables = (keyspace: string): string => {
        return `${baseUrl}/v2/schemas/keyspaces/${keyspace}/tables`;
    };
    
    const createAstraApiUrlForTable = (keyspace: string, table: string): string => {
        return `${baseUrl}/v2/schemas/keyspaces/${keyspace}/tables/${table}`;
    };
    // #endregion

    // #region Headers
    const configureHeaders = (): { [key: string]: string } => {
        return {
          'X-Cassandra-Token': import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
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
        saveTable
    }
};