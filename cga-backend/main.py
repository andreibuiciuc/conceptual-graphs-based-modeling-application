from typing import Tuple
from cassandra.cluster import Cluster, Session, ResultSet
from cassandra.cluster import NoHostAvailable

HOSTS = ['127.0.0.1']
DOCKER_EXPOSED_PORT = 9042


def log_exception_message(exception_object: Exception, message: str) -> None:
    """
    Logs an exception to the standard output, together with a custom message.
    :parameter exception_object: A given exception
    :parameter message: A given custom message
    """
    print(f"Exception: {exception_object} \n {message}")


def connect_to_cassandra_server() -> Tuple[Cluster, Session]:
    """
    Connects to a Cassandra server instance.
    :return: A tuple containing the created Cassandra cluster and session
    """
    cluster = Cluster(HOSTS, DOCKER_EXPOSED_PORT)
    session = cluster.connect()
    return cluster, session


def get_available_keyspaces(session: Session) -> ResultSet:
    """
    Retrieves the available keyspaces from the Cassandra server.
    :param session: The current Cassandra Session
    :return: A ResultSet containing the available keyspaces from the current Cassandra server.
    """
    result_set = session.execute('describe keyspaces')
    return result_set


if __name__ == '__main__':
    
    try:
        cassandra_cluster, cassandra_session = connect_to_cassandra_server()

        keyspaces_result_set = get_available_keyspaces(cassandra_session)
        for keyspace_row in keyspaces_result_set:
            print(keyspace_row)
    
    except NoHostAvailable as exception:
        log_exception_message(type(exception), "Unable to connect to the Cassandra Server.")

