from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from configuration.queries import *

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/connection/on")
def connect(host: str, port: str):
    result = connect_to_cassandra_server(host, port)
    return result


@app.post("/connection/off")
def disconnect():
    result = disconnect_from_cassandra_server()
    return result


@app.get("/keyspaces")
def get_keyspaces():
    result = retrieve_all_keyspaces()
    return result


@app.get("/keyspace")
def get_keyspace_metadata(keyspace_name: str):
    result = retrieve_keyspace_metadata(keyspace_name)
    return result


@app.get("/table")
def check_if_table_exists(table_name: str, keyspace_name):
    result = does_table_exists(table_name, keyspace_name)
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, log_level="info", reload=True)
