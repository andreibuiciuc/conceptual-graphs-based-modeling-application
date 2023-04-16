export default {
  CQL_COLUMN_OPTIONS: [
    "regular",
    "clustering",
    "partition_key"
  ],
  CQL_DATA_TYPES: [
    "ascii",
    "bigint", 
    "blob", 
    "boolean", 
    "counter", 
    "date", 
    "decimal", 
    "double", 
    "float", 
    "int", 
    "list", 
    "map", 
    "set", 
    "smallint",
    "time", 
    "timestamp",
    "tinyint", 
    "tuple", 
    "uuid", 
  ],
  CQL_CLUSTERING_ORDER_ITEMS: [
    "ascending",
    "descending"
  ],
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
    "cql command copied to clipboard",
  NO_SELECTED_KEYSPACE_MESSAGE:
    "no keyspace selected. please select a keyspace",
  SUCCESSFUL_TABLE_GRAPH_SAVE:
    "conceptual graph successfully saved"
};
