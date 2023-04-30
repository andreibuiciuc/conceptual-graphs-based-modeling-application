import axios from "axios";
import constants from "../constants/constants";
import { manageRequest } from "./requests";

const urlPrefix = "https://";

const createAstraApiUrlForRetrieve = (applyWhereClause?: boolean, searchPath?: string): string => {
  
  const astraDbId = import.meta.env.VITE_ASTRA_DB_ID;
  const astraDbRegion = import.meta.env.VITE_ASTRA_DB_REGION;
  const astraDbKeyspace = import.meta.env.VITE_ASTRA_DB_KEYSPACE;
  const astraDbTable = import.meta.env.VITE_ASTRA_DB_TABLE;
  
  let retrieveUrl = `${urlPrefix}${astraDbId}-${astraDbRegion}.apps.astra.datastax.com/api/rest/v2/keyspaces/${astraDbKeyspace}/${astraDbTable}/rows`;

  if (applyWhereClause) {
    retrieveUrl = retrieveUrl.concat(`?where=${searchPath}`);
  }

  return retrieveUrl;
}

const configureHeaders = (): { [key: string]: string } => {
  return {
    'X-Cassandra-Token': import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin' : '*'
  };
};

const retrieveAllEntities = async (): Promise<void> => {
  const requestUrl = createAstraApiUrlForRetrieve();
  const headers = configureHeaders();
  const response = await manageRequest('get', requestUrl, null, requestUrl, headers);

  if (response && response.data) {
    console.log(response.data);
  }

};

const retrieveFilteredEntities = async (): Promise<void> => {
  // TODO:
};

export {
  retrieveAllEntities,
  retrieveFilteredEntities
};