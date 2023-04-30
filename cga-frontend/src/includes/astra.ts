import axios from "axios";
import constants from "../constants/constants";

const urlPrefix = "https://";

const createAstraApiUrlForRetrieve = (applyWhereClause?: boolean, searchPath?: string): string => {
  const astraDbId = import.meta.env.VITE_ASTRA_DB_ID;
  const astraDbKeyspace = import.meta.env.VITE_ASTRA_DB_KEYSPACE;
  const astraDbTable = import.meta.env.VITE_ASTRA_DB_TABLE;
  
  let retrieveUrl = `${urlPrefix}${astraDbId}.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces/${astraDbKeyspace}/${astraDbTable}`;

  if (applyWhereClause) {
    retrieveUrl = retrieveUrl.concat(`?where=${searchPath}`);
  }

  return retrieveUrl;
}

const retrieveAllEntities = (): any => {
 // TODO:

};

const retrieveFilteredEntities = (): any => {
  // TODO:
};

export {
  retrieveAllEntities,
  retrieveFilteredEntities
};