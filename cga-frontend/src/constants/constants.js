export default {
    inputValues: {
        empty: ""
    },
    defaultLoginCredentials: {
        email: "",
        password: ""
    },
    defaultRegisterCredentials: {
        firstname: "",
        lastname: "",
        email: "",
        password: ""
    },
    defaultServerConnectionCredentials: {
        isServerConnected: false,
        ipAddress: "",
        port: ""
    },
    defaultKeyspaceMetadata: {
        keyspace_name: ""
    },
    snackbarStatuses: {
        error: "error",
        success: "success"
    },
    snackbarVariants: {
        error: "#ff3333",
        success: "#1287b1"
    },
    snackbarMessages: {
        registerSuccess: "Success! Your account has been created.",
        loginSuccess: "Success! You are now logged in."
    },
    requestTypes: {
        GET: "get",
        POST: "post"
    },
    requestStatus: {
        SUCCESS: "success",
        ERROR: "error"
    },
    conceptTypes: {
        keyspace: "R",
        table: "TB",
        column: "CL",
        dataType: "T"
    },
    relationTypes: {
        has: "has",
        hasMore: "hasMore",
        hasPartitionKey: "hasPartitionKey",
        hasClusteringKeyASC: "hasClusteringKeyASC",
        hasClusteringKeyDESC: "hasClusteringKeyDESC",
        isOptional: "isOptional",
        hasType: "hasType"
    },
    columnKinds: {
        regular: "regular",
        clustering: "clustering",
        partitionKey: "partitionKey"
    },
    clusteringOrders: {
        ascending: "asc",
        descending: "desc"
    }
}; 