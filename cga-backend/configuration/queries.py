from typing import Union, List
from cassandra.cluster import Cluster, ResultSet
from configuration.constants import SUCCESS, ERROR
from configuration.constants import ALL_KEYSPACES, ALL_TABLES_FROM_KEYSPACE, ALL_COLUMNS_FROM_TABLE

global session, cluster


def connect_to_cassandra_server(host: str, port: str) -> Union[dict[str], dict[str, str]]:
    """
    Establishes the connection to a running Cassandra server
    :param host: IP Address of the cassandra network
    :param port: The exposed port from the cassandra network
    :return: Object containing the connection status
    """
    global session, cluster
    try:
        cluster = Cluster([host], port)
        session = cluster.connect()
        return {"status": SUCCESS}
    except Exception as exception:
        return {"status": ERROR, "message": str(exception)}


def disconnect_from_cassandra_server() -> Union[dict[str], dict[str, str]]:
    """
    Removes the connection from a running Cassandra server
    :return: Object containing the connection status
    """
    global cluster
    try:
        cluster.shutdown()
        return {"status": SUCCESS}
    except Exception as exception:
        return {"status": ERROR, "message": str(exception)}


def retrieve_all_keyspaces() -> Union[dict[str, str, List[str]], dict[str, str]]:
    """
    Retrieves all available keyspaces from the Cassandra server
    :return: List containing all the available keyspaces
    """
    global session
    try:
        keyspaces: ResultSet
        keyspaces = session.execute(ALL_KEYSPACES)
        keyspaces_list = [keyspace.keyspace_name for keyspace in keyspaces]
        return {"status": SUCCESS, "message": "", "keyspaces": keyspaces_list}
    except Exception as exception:
        return {"status": ERROR, "message": str(exception)}


def retrieve_keyspace_metadata(keyspace_name: str):
    """
    Retrieves the metadata of a given keyspace
    """
    global session
    try:
        # Get all tables from the keyspace
        query = session.prepare(ALL_TABLES_FROM_KEYSPACE)
        query_bound = query.bind([keyspace_name])
        tables = session.execute(query_bound)

        keyspace_metadata = {"keyspace_name": keyspace_name, "tables": []}

        # Get all columns from every table in the keyspace
        for table_row in tables.current_rows:
            table_metadata = {"table": table_row.table_name}

            query = session.prepare(ALL_COLUMNS_FROM_TABLE)
            query_bound = query.bind([keyspace_name, table_row.table_name])

            columns_metadata: ResultSet
            columns_metadata = session.execute(query_bound)
            columns = []

            for column_data in columns_metadata.current_rows:
                column = {"column_name": column_data.column_name, "column_kind": column_data.kind,
                          "column_type": column_data.type, "clustering_order": column_data.clustering_order}
                columns.append(column)

            table_metadata["columns"] = columns
            keyspace_metadata["tables"].append(table_metadata)

        return {"status": SUCCESS, "message": "", "keyspace_metadata": keyspace_metadata}

    except Exception as exception:
        return {"status": ERROR, "message": str(exception)}
