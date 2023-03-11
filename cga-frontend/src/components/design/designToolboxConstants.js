export default {
  CQL_COLUMN_OPTIONS: [
    { value: "regular", title: "regular" },
    { value: "clustering", title: "clustering" },
    { value: "partitionKey", title: "partition key"}
  ],
  CQL_DATA_TYPES: [
    { value: "ascii", title: "ascii" },
    { value: "bigint", title: "bigint" },
    { value: "blob", title: "blob" },
    { value: "boolean", title: "boolean" },
    { value: "counter", title: "counter" },
    { value: "date", title: "date" },
    { value: "decimal", title: "decimal" },
    { value: "double", title: "double" },
    { value: "float", title: "float" },
    { value: "int", title: "int" },
    { value: "list", title: "list" },
    { value: "map", title: "map" },
    { value: "set", title: "set" },
    { value: "smallint", title: "smallint" },
    { value: "time", title: "time" },
    { value: "timestamp", title: "timestamp" },
    { value: "tinyint", title: "tinyint" },
    { value: "tuple", title: "tuple" },
    { value: "uuid", title: "uuid" },
  ],
  CQL_CLUSTERING_ORDER_ITEMS: [
    { value: "asc", title: "ASC" },
    { value: "desc", title: "DESC" }
  ],
  DEFAULT_CLUSTERING_OPTIONS: {
    
  },
  CQL_BASH_COMMAND: "cqlsh >>",
  CQL_BASH_BLANK_COMMAND: "      >> ",
  CQL_CREATE_TABLE_SNIPPET: " CREATE TABLE IF NOT EXISTS ",
  CQL_PUNCTUATION: {
    DOT: ".",
    COMMA: ",",
    SPACE: " ",
  },
  CQL_COMMAND_REGEX: /(cqlsh >> )|( {6}>> )/gi,
  COPY_QUERY_CLIPBOARD_MESSAGE:
    "CQL command was successfully copied to clipboard",
  NO_SELECTED_KEYSPACE_MESSAGE:
    "No keyspace selected. Please select a keyspace"
};
