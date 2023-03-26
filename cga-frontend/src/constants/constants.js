export default {
  inputValues: {
    empty: "",
  },
  defaultLoginCredentials: {
    email: "",
    password: "",
  },
  defaultRegisterCredentials: {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  },
  emptyCassandraNetwork: {
    ipAddress: "",
    port: "",
    isCassandraServerConnected: false,
  },
  defaultCassandraNetwork: {
    ipAddress: "127.0.0.1",
    port: "9042",
    isCassandraServerConnected: false,
  },
  snackbarStatuses: {
    error: "error",
    success: "success",
    warning: "warning",
  },
  snackbarVariants: {
    error: "#ff3333",
    success: "#1287b1",
  },
  snackbarMessages: {
    registerSuccess: "Success! Your account has been created.",
    loginSuccess: "Success! You are now logged in.",
  },
  requestTypes: {
    GET: "get",
    POST: "post",
  },
  requestStatus: {
    SUCCESS: "success",
    ERROR: "error",
  },
  conceptTypes: {
    keyspace: "R",
    table: "TB",
    column: "CL",
    dataType: "T",
  },
  defaultConcept: {
    conceptName: null,
    conceptType: null,
    kind: null,
    relation: null,
  },
  relationTypes: {
    has: "has",
    hasMore: "hasMore",
    hasPartitionKey: "hasPartitionKey",
    hasClusteringKeyASC: "hasClusteringKeyASC",
    hasClusteringKeyDESC: "hasClusteringKeyDESC",
    isOptional: "isOptional",
    hasType: "hasType",
  },
  columnKinds: {
    regular: "regular",
    clustering: "clustering",
    partitionKey: "partitionKey",
  },
  clusteringOrders: {
    ascending: "asc",
    descending: "desc",
  },
};
