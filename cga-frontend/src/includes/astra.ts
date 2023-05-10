import { AxiosResponse } from "axios";
import { manageRequest } from "./requests";

const astraDbId = import.meta.env.VITE_ASTRA_DB_ID;
const astraDbRegion = import.meta.env.VITE_ASTRA_DB_REGION;
const astraDbKeyspace = import.meta.env.VITE_ASTRA_DB_KEYSPACE;
const astraDbTable = import.meta.env.VITE_ASTRA_DB_TABLE;
const baseUrl = `https://${astraDbId}-${astraDbRegion}.apps.astra.datastax.com/api/rest`;


const createAstraApiUrlForKeyspaces = (): string => {
  return `${baseUrl}/v2/schemas/keyspaces`;
};

const createAstraApiUrlForTableMetadata = (): string => {
  return `${baseUrl}/v2/keyspaces/${astraDbKeyspace}/tables/${astraDbTable}/columns`;
};

const createAstraApiUrlForTables = (keyspace: string): string => {
  return `${baseUrl}/v2/schemas/keyspaces/${keyspace}/tables`;
};

const configureHeaders = (): { [key: string]: string } => {
  return {
    'X-Cassandra-Token': import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin' : '*'
  };
};


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

const retrieveTableMetadata = (): Promise<AxiosResponse<any, any>> => {
  const requestUrl = createAstraApiUrlForTableMetadata();
  const headers = configureHeaders();
  return manageRequest('get', requestUrl, null, requestUrl, headers);
};

export {
  retrieveAllKeyspaces,
  retrieveAllTables,
  retrieveTableMetadata,
};