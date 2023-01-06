from typing import Union, List

from cassandra.cluster import Cluster, ResultSet
from cassandra.query import Statement, dict_factory

from configuration.constants import SUCCESS, ERROR
from configuration.constants import ALL_KEYSPACES, KEYSPACE_METADATA

global session


def connect_to_cassandra_server(host: str, port: str) -> Union[dict[str], dict[str, str]]:
    """
    Establishes the connection to a running Cassandra server
    :param host: IP Address of the cassandra network
    :param port: The exposed port from the cassandra network
    :return: Object containing the connection status
    """
    global session
    try:
        cluster = Cluster([host], port)
        session = cluster.connect()
        return {"status": SUCCESS}
    except Exception as exception:
        return {"status": ERROR, "message": str(exception)}


def retrieve_all_keyspaces() -> Union[List[str], dict[str, str]]:
    """
    Retrieves all available keyspaces from the Cassandra server
    :return: List containing all the available keyspaces
    """
    global session
    try:
        keyspaces: ResultSet
        keyspaces = session.execute(ALL_KEYSPACES)
        return [keyspace.keyspace_name for keyspace in keyspaces]
    except Exception as exception:
        return {"status": ERROR, "message": str(exception)}


def retrieve_keyspace_metadata(keyspace_name: str):
    """
    Retrieves the metadata of a given keyspace
    """
    global session
    try:
        session.row_factory = dict_factory
        query = session.prepare(KEYSPACE_METADATA)
        query_bound = query.bind([keyspace_name])
        keyspace = session.execute(query_bound)
        return keyspace[0]
    except Exception as exception:
        return {"status": ERROR, "message": str(exception)}