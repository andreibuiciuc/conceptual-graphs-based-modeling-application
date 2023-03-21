# Configuration constants
SUCCESS = "success"
ERROR = "error"
EXCLUDED_KEYSPACES = ["system", "system_auth", "system_distributed", "system_schema", "system_traces", "system_views",
                      "system_virtual_schema"]

# Cassandra query constants
ALL_KEYSPACES = "DESCRIBE KEYSPACES"
ALL_TABLES_FROM_KEYSPACE = "SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?"
ALL_COLUMNS_FROM_TABLE = "SELECT * FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?"
KEYSPACE_METADATA = "SELECT * FROM system_schema.keyspaces WHERE keyspace_name = ?"
TABLE_BY_NAME = "SELECT table_name FROM system_schema.tables WHERE table_name = ? and keyspace_name = ? ALLOW FILTERING"
