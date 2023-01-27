<template>
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
</template>

<script lang="js">
import constants from '@/constants/constants';
import { manageRequest } from "@/includes/requests";
import { mapActions } from "pinia";
import useNotificationStore from "@/stores/notification";

export default {
  name: "ConnectionConsole",
  data: () => ({
    // This data is related to the Connection Credentials panel
    serverConnectionCredentials: null,
    isConnectionButtonTriggered: false,
    // This data is related to the Keyspaces panel
    selectedKeyspace: constants.inputValues.empty,
    keyspaces: [],
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
    // These methods handle change events of components
    changeKeyspace: function (selectedKeyspace) {
      this.selectedKeyspace = selectedKeyspace;
      this.$emit("changekeyspace", this.selectedKeyspace);
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
  },
  created: function () {
    this.serverConnectionCredentials = Object.assign({}, constants.defaultServerConnectionCredentials);
  }
}

</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"

.connection-console
  width: 40vw

  .panel-container 
    margin-top: 16px
    .v-text-field
      margin-bottom: 16px
    
    .v-btn
      width: 100%
</style>