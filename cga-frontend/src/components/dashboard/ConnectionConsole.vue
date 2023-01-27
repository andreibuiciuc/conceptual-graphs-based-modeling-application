<template>
  <div class="dashboard">
    <div class="connection-console">
      <v-expansion-panels variant="popout">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <template #default="{ expanded }">
              <v-row no-gutters>
                <v-col cols="4" class="d-flex justify-start">
                  Connection
                </v-col>
                <v-col cols="8">
                  <v-fade-transition leave-absolute>
                    <span v-if="expanded" key="0">
                      Connect to a Cassandra Server
                    </span>
                    <span v-else key="1">
                      {{ connectionPanelExpandedTitle }}
                    </span>
                  </v-fade-transition>
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="panel-container">
              <v-text-field v-model="serverConnectionCredentials.ipAddress" 
                            placeholder="IP Address"
                            persistent-hint
                            hint="Enter the exposed IP address of your running cassandra network (server). Example: 127.0.0.1, localhost, etc."
                            variant="outlined"
                            maxlength="15"
                            :disabled="serverConnectionCredentials.isServerConnected"
                            :readonly="serverConnectionCredentials.isServerConnected">
              </v-text-field>
              <v-text-field v-model="serverConnectionCredentials.port" 
                            placeholder="Port"
                            persistent-hint 
                            hint="Enter the exposed port number of your running cassandra network (server). Example: 9042 (default cassandra port), etc."
                            variant="outlined"
                            maxlength="4"
                            :disabled="serverConnectionCredentials.isServerConnected"
                            :readonly="serverConnectionCredentials.isServerConnected">
              </v-text-field>
              <v-btn variant="outlined" 
                    :class="{ 'action-button': !serverConnectionCredentials.isServerConnected, 'action-button--discard': serverConnectionCredentials.isServerConnected }"
                    :disabled="!isConnectionButtonEnabled || isConnectionButtonTriggered"
                    :loading="isConnectionButtonTriggered"
                    @click.prevent="manageServerConnection">
                {{ serverConnectionCredentials.isServerConnected ? "Disconnect" : "Connect" }}
              </v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <template #default="{ expanded }">
              <v-row no-gutters>
                <v-col cols="4" class="d-flex justify-start">
                  Keyspace
                </v-col>
                <v-col cols="8">
                  <v-fade-transition leave-absolute>
                    <span v-if="expanded" key="2">
                      Select a keyspace
                    </span>
                    <span v-else key="3">
                      {{ selectedKeyspace }}
                    </span>
                  </v-fade-transition>
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="panel-container">
                <v-select v-model="selectedKeyspace"
                          hide-details
                          flat
                          variant="outlined"
                          label="Keyspace"
                          :disabled="!serverConnectionCredentials.isServerConnected"
                          :items="keyspaces"
                          @update:modelValue="changeKeyspace">
                </v-select>
          </v-expansion-panel-text> 
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <conceptual-graph :keyspace-concept="keyspaceConcept" 
                      :table-concepts="tableConcepts" 
                      :column-concepts="columnConcepts"
                      :data-type-concepts="dataTypeConcepts" />
  </div>
</template>

<script>
import constants from '@/constants/constants';
import { manageRequest } from "@/includes/requests";

import { mapActions } from "pinia";
import useNotificationStore from "@/stores/notification";

import ConceptualGraph from '../utilities/ConceptualGraph.vue';

export default {
  name: "ConnectionConsole",
  components: {
    ConceptualGraph
  },
  data: () => ({
    serverConnectionCredentials: null,
    selectedKeyspace: null,
    keyspaces: [],
    isConnectionButtonTriggered: false,
    // This data is related to the Keyspace Metadata
    keyspaceConcept: null,
    tableConcepts: [],
    columnConcepts: [],
    dataTypeConcepts: []
  }),
  computed: {
    connectionPanelExpandedTitle: function () {
      if (!this.serverConnectionCredentials.isServerConnected) return constants.inputValues.empty;
      return this.serverConnectionCredentials.ipAddress + " : " + this.serverConnectionCredentials.port;
    },
    isConnectionButtonEnabled: function () {
      return this.serverConnectionCredentials.ipAddress && this.serverConnectionCredentials.port;
    }
  },
  methods: {
    // These methods are mapped from the notification store.
    ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
    // These methods handle the connection to the database server.
    manageServerConnection: function () {
      if (this.serverConnectionCredentials.isServerConnected) {
        this.disconnect();
      } else {
        this.connect();
      }
    },
    connect: function () {
      this.isConnectionButtonTriggered = true;
      manageRequest(constants.requestTypes.GET, "connection/on", {
        host: this.serverConnectionCredentials.ipAddress,
        port: this.serverConnectionCredentials.port
      })
        .then((response) => {
          if (response) {
            if (response.data) {
              const status = response.data.status === constants.requestStatus.SUCCESS ? true : false;
              let message = response.data.message;
              if (status) {
                this.serverConnectionCredentials.isServerConnected = true;
                message = `Connection to Cassandra server ${this.serverConnectionCredentials.ipAddress}:${this.serverConnectionCredentials.port} established.`;
                this.retrieveKeyspaces();
              }
              this.setUpSnackbarState(status, message);
            }
          }
        })
        .catch((error) => {
          this.setUpSnackbarState(false, error);
        })
        .finally(() => {
          this.isConnectionButtonTriggered = false;
        })
    },
    disconnect: function () {
      this.isConnectionButtonTriggered = true;
      manageRequest(constants.requestTypes.POST, "connection/off")
        .then((response) => {
          if (response) {
            const status = response.data.status === constants.requestStatus.SUCCESS ? true : false;
            let message = response.data.message;
            if (status) {
              this.selectedKeyspace = null;
              this.serverConnectionCredentials = Object.assign({}, constants.defaultServerConnectionCredentials);
              message = `Connection to Cassandra server ${this.serverConnectionCredentials.ipAddress}:${this.serverConnectionCredentials.port} discarded.`;
            }
            this.setUpSnackbarState(status, message);
          }
        })
        .catch((error) => {
          this.setUpSnackbarState(false, error);
        })
        .finally(() => {
          this.isConnectionButtonTriggered = false;
        });
    },
    // These methods events of components
    changeKeyspace: function (selectedKeyspace) {
      this.selectedKeyspace = selectedKeyspace;
      this.retrieveKeyspaceMetadata();
    },
    // These methods handle the retrieve of keyspaces
    retrieveKeyspaces: function () {
      manageRequest(constants.requestTypes.GET, "keyspaces")
        .then((response) => {
          if (response) {
            const status = response.data.status === constants.requestStatus.SUCCESS ? true: false;
            if (status) {
              this.keyspaces = response.data.keyspaces;
            } else {
              this.setUpSnackbarState(false, response.data.message);
            }
          }
        });
    },
    // These methods handle the retrieve of keyspace metadata
    // TODO: Move to a wrapper component for the Conceptual Graph.
    parseKeyspaceMetadata: function (keyspaceMetadata) {
      // Create keyspace concept.
      const keyspaceConcept = {
        conceptType: constants.conceptTypes.keyspace,
        conceptName: keyspaceMetadata.keyspace_name
      };
      this.keyspaceConcept = Object.assign({}, keyspaceConcept);

      // Create concept for each table in the keyspace.
      keyspaceMetadata.tables.forEach(table => {
        // Create table concept.
        const tableConcept = { 
          conceptType: constants.conceptTypes.table,
          conceptName: table.table, 
        };
        // Create a relation between the keyspace and the table concepts.
        this.tableConcepts.push({ ...tableConcept });

        this.columnConcepts[tableConcept.conceptName] = [];
        table.columns.forEach(column => {
          // Create column concept.
          const columnConcept = {
            conceptType: constants.conceptTypes.column,
            conceptName: column.column_name
          };
          // Create a relation between the table and column concepts.
          const relationType = this.getRelationTypeForColumnConcept(column.column_kind, column.clustering_order)
          this.columnConcepts[tableConcept.conceptName].push({ ...columnConcept, relation: relationType });
          // Create concept for the column type.
          const typeConcept = {
            conceptType: constants.conceptTypes.dataType,
            conceptName: column.column_type
          };
          // Create relation for the column and data type concepts.
          this.dataTypeConcepts[columnConcept.conceptName] = { ...typeConcept, relation: constants.relationTypes.hasType };
        });
      });
    },
    resetKeyspaceMetadata: function () {
      this.keyspaceConcept = null;
      this.tableConcepts = [];
      this.columnConcepts = {};
      this.dataTypeConcepts = {};
    },
    retrieveKeyspaceMetadata: function () {
      if (this.selectedKeyspace) {
        this.resetKeyspaceMetadata();
        manageRequest(constants.requestTypes.GET, "keyspace", {
          keyspace_name: this.selectedKeyspace
        })
          .then((response) => {
            if (response) {
              this.parseKeyspaceMetadata(response.data.keyspace_metadata);
            }
          });
      } else {
        this.resetKeyspaceMetadata();
      }
    },
    getRelationTypeForColumnConcept: function (columnKind, clusteringOrder) {
      switch (columnKind) {
        case constants.columnKinds.partitionKey:
          return constants.relationTypes.hasPartitionKey;
        case constants.columnKinds.clustering:
          return clusteringOrder === constants.clusteringOrders.ascending 
            ? constants.relationTypes.hasClusteringKeyASC 
            : constants.relationTypes.hasClusteringKeyDESC
        case constants.columnKinds.regular:
        default:
          return constants.relationTypes.isOptional;
      }
    }
  },
  created: function () {
    this.serverConnectionCredentials = Object.assign({}, constants.defaultServerConnectionCredentials);
  }
}
</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"

.dashboard
  @include containers.flex-container($flex-direction: row)
  height: 100%
  width: 100%

.connection-console
  width: 40vw

  .panel-container 
    margin-top: 16px
    .v-text-field
      margin-bottom: 16px
    
    .v-btn
      width: 100%
    
</style>