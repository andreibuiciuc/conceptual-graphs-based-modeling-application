import axios from "axios";
import constants from "../constants/constants";

const urlPrefix = "http://";

const server = {
    // Address and port for the uvicorn server
    HOST: "127.0.0.1",
    PORT: "8001"
};

function createRequestURL(endpoint) {
    return `${urlPrefix}${server.HOST}:${server.PORT}/${endpoint}`;
}

function manageRequest (requestType, endpoint, payload = null) {
    const requestURL = createRequestURL(endpoint);
    switch (requestType) {
        case constants.requestTypes.GET:
            return axios.get(requestURL, {
                params: {
                    ...payload
                }
            });
        case constants.requestTypes.POST:
            return axios.post(requestURL, payload);
        default:
            break;
    }
}

export {
    manageRequest
}