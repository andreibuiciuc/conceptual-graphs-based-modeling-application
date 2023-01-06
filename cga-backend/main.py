from cassandra.cluster import Cluster, Session, ResultSet
from fastapi import FastAPI
import uvicorn

from configuration.queries import *

HOSTS = ['127.0.0.1']
DOCKER_EXPOSED_PORT = 9042

app = FastAPI()


@app.get("/connection")
def connect(host: str, port: str):
    result = connect_to_cassandra_server(host, port)
    return result


@app.get("/keyspaces")
def get_keyspaces():
    result = retrieve_all_keyspaces()
    return result


@app.get("/keyspace")
def get_keyspace_metadata(keyspace: str):
    result = retrieve_keyspace_metadata(keyspace)
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, log_level="info", reload=True)
