import axios, { AxiosResponse } from "axios";
import constants from "@/constants/constants";
import { RequestType } from '@/types/utils/types';

export function useAxios() {

    type ServerCredentials = 'HOST' | 'PORT';
    type ApplicationMode = 'DEV' | 'PROD';

    const urlPrefix = "http://";

    const applicationModes: { [mode in ApplicationMode]: string } = {
        DEV: 'DEV',
        PROD: 'PROD'
      };
      
    const server: { [credential in ServerCredentials]: string } = {
        HOST: import.meta.env.VITE_UVICORN_SERVER_HOST,
        PORT: import.meta.env.VITE_UVICORN_SERVER_PORT,
    };

    /**
     * Helper function for constructing the URL to the endpoint
     * @param endpoint specific endpoint from the server
     * @returns URL to the specific endpoint from the server
     */
    const createRequestURL = (endpoint: string): string => {
        if (import.meta.env.VITE_SERVER_MODE === applicationModes.DEV) {
        return `${urlPrefix}${server.HOST}:${server.PORT}/${endpoint}`;
        }
        return `${import.meta.env.VITE_PROD_SERVER_HOST}/${endpoint}`;
    };
    
    /**
     * Axios wrapper for communication with a RESTful service
     * @param requestType type of the request
     * @param endpoint specific endpoint from the server
     * @param payload custom payload for request
     * @returns Promise with the Axios response received from the server
     */
    const manageRequest = (requestType: RequestType, endpoint: string, payload: object | null = null, customEndpoint?: string, headers?: {[key: string]: string}): Promise<AxiosResponse<any, any>> => {
    
        let requestURL = customEndpoint ? customEndpoint : createRequestURL(endpoint);
        
        switch (requestType) {
        case constants.requestTypes.GET:
            return axios.get(requestURL, {
            params: {
                ...payload,
            },
            headers: {
                ... headers
            }
            });
        case constants.requestTypes.POST:
            return axios.post(requestURL, payload);
        default:
            break;
        }
    
    };

    return {
        manageRequest,
    }
}