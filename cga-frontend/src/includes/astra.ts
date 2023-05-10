import { AxiosResponse } from "axios";
import { manageRequest } from "./requests";

const astraDbId = import.meta.env.VITE_ASTRA_DB_ID;
const astraDbRegion = import.meta.env.VITE_ASTRA_DB_REGION;
const baseUrl = `https://${astraDbId}-${astraDbRegion}.apps.astra.datastax.com/api/rest`;

// Helper functions for creating the URL for communicating with Astra API
const createAstraApiUrlForKeyspaces = (): string => {
  return `${baseUrl}/v2/schemas/keyspaces`;
};

const createAstraApiUrlForTables = (keyspace: string): string => {
  return `${baseUrl}/v2/schemas/keyspaces/${keyspace}/tables`;
};

const createAstraApiUrlForTable = (keyspace: string, table: string): string => {
  return `${baseUrl}/v2/schemas/keyspaces/${keyspace}/tables/${table}`;
};

const configureHeaders = (): { [key: string]: string } => {
  return {
    'X-Cassandra-Token': import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin' : '*'
  };
};


// GET: retrieve of metadata
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

const saveTable = (keyspace: string, data: any): Promise<AxiosResponse<any, any>> => {
  const requestUrl = createAstraApiUrlForTables(keyspace);
  const headers = configureHeaders();
  return manageRequest('post', requestUrl, data, requestUrl, headers);
};

export {
  retrieveAllKeyspaces,
  retrieveAllTables,
  retrieveTable,
  saveTable,
};