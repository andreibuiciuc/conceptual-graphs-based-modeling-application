import axios from "axios";
import constants from "../constants/constants";

const urlPrefix = "http://";

const server = {
  HOST: import.meta.env.VITE_UVICORN_SERVER_HOST,
  PORT: import.meta.env.VITE_UVICORN_SERVER_PORT
};

function createRequestURL(endpoint: string) {
  return `${urlPrefix}${server.HOST}:${server.PORT}/${endpoint}`;
}

// TODO: Improve types
function manageRequest(requestType: string, endpoint: string, payload: object | null = null) {
  const requestURL = createRequestURL(endpoint);
  switch (requestType) {
    case constants.requestTypes.GET:
      return axios.get(requestURL, {
        params: {
          ...payload,
        },
      });
    case constants.requestTypes.POST:
      return axios.post(requestURL, payload);
    default:
      break;
  }
}

export { manageRequest };
