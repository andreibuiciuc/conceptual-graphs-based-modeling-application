export default {
  inputValues: {
    empty: '',
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
    DELETE: "delete",
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
    conceptName: "",
    conceptType: "",
    kind: "",
    relation: "",
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
  cqlOperators: {
    LESS: '<',
    LESS_EQUAL: '<=',
    GREATER: '>',
    GREATER_EQUAL: ">=",
    EQUAL: "=",
    IN: "IN",
    CONTAINS: "CONTAINS",
  },
  defaultQueryConcepts: {
    where: {
      conceptReferent: '',
      conceptRelation: 'filter',
      columns: []
    },
    orderBy: {
      conceptReferent: '',
      conceptRelation: 'orderby',
      columns: []
    },
    groupBy: {
      conceptReferent: '',
      conceptRelation: 'groupBy',
      columns: []
    },
    groupId: {
      conceptReferent: '',
      conceptRelation: 'groupId',
      columns: []
    },
    out: {
      conceptReferent: 'out',
      conceptRelation: 'return',
      columns: []
    },
    get: {
      count: {
        conceptReferent: '',
        aggregatedColumns: []
      },
      min: {
        conceptReferent: '',
        aggregatedColumns: []
      },
      max: {
        conceptReferent: '',
        aggregatedColumns: []
      },
      avg: {
        conceptReferent: '',
        aggregatedColumns: []
      },
      sum: {
        conceptReferent: '',
        aggregatedColumns: []
      }
    }
  }
};
