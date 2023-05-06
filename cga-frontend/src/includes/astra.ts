import { AxiosResponse } from "axios";
import { manageRequest } from "./requests";

const astraDbId = import.meta.env.VITE_ASTRA_DB_ID;
const astraDbRegion = import.meta.env.VITE_ASTRA_DB_REGION;
const astraDbKeyspace = import.meta.env.VITE_ASTRA_DB_KEYSPACE;
const astraDbTable = import.meta.env.VITE_ASTRA_DB_TABLE;
const baseUrl = `https://${astraDbId}-${astraDbRegion}.apps.astra.datastax.com/api/rest`;


/**
 * Helper function for constructing the URL to the endpoint for Astra DB retrievals
 * @param applyWhereClause flag for applying filtering
 * @param searchPath search path for filtering 
 * @returns enpoint for Astra DB retrieval
 */
const createAstraApiUrlForRetrieve = (applyWhereClause?: boolean, searchPath?: string): string => {
  let retrieveUrl = `${baseUrl}/v2/keyspaces/${astraDbKeyspace}/${astraDbTable}/rows`;

  if (applyWhereClause) {
    retrieveUrl = retrieveUrl.concat(`?where=${searchPath}`);
  }

  return retrieveUrl;
}


/**
 * Helper function for constructing tge URL to the endpoint for Astra DB retrieval of column metadata.
 * @returns endpoint for Astra DB retrieval of column metadata
 */
const createAstraApiUrlForMetadata = (): string => {
  return `${baseUrl}/v2/schemas/keyspaces/${astraDbKeyspace}/tables/${astraDbTable}/columns`;
};


/**
 * Helper function for configuring the required headers for Astra DB communication
 * @returns object consisting of the required headers
 */
const configureHeaders = (): { [key: string]: string } => {
  return {
    'X-Cassandra-Token': import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin' : '*'
  };
};


/**
 * Function for retrieving the column metadata for the supported table from Astra DB.
 * @returns Promise with the Axios reponse received from the Astra DB server
 */
const retrieveColumnsMetadataForTable = (): any => {
  const requestUrl = createAstraApiUrlForMetadata();
  const headers = configureHeaders();
  return manageRequest('get', requestUrl, null, requestUrl, headers);
};


/**
 * Function for retrieving all entities from the supported table from Astra DB.
 * In this version, the application supports and manages only one table in Astra DB for unathenticated users.
 * @returns Promise with the Axios response received from the Astra DB server
 */
const retrieveAllEntities = async (): Promise<AxiosResponse<any, any>> => {
  const requestURL = createAstraApiUrlForRetrieve();
  const headers = configureHeaders();
  return manageRequest('get', requestURL, null, requestURL, headers);
};


export {
  retrieveAllEntities,
  retrieveColumnsMetadataForTable
};