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
                          hide-details 
                          placeholder="IP Address" 
                          variant="outlined"
                          maxlength="15">
            </v-text-field>
            <v-text-field v-model="serverConnectionCredentials.port" 
                          hide-details 
                          placeholder="Port" 
                          variant="outlined"
                          maxlength="4">
            </v-text-field>
            <v-btn variant="outlined" 
                   :class="{ 'action-button': !serverConnectionCredentials.isServerConnected, 'action-button--discard': serverConnectionCredentials.isServerConnected }"
                   :disabled="!isConnectionButtonEnabled"
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
                        :items="mockKeyspaces"
              ></v-select>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import constants from '@/constants/constants';

export default {
  name: "ConnectionConsole",
  data: () => ({
    serverConnectionCredentials: null,
    selectedKeyspace: null,
    mockKeyspaces: ["weather", "university", "bank"]
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
    manageServerConnection: function () {
      if (this.serverConnectionCredentials.isServerConnected) {
        this.disconnect();
      } else {
        this.connect();
      }
    },
    connect: function () {
      // TODO
      this.serverConnectionCredentials.isServerConnected = true;
    },
    disconnect: function () {
      // TODO
      this.selectedKeyspace = null;
      this.serverConnectionCredentials = Object.assign({}, constants.defaultServerConnectionCredentials);
    }
  },
  created: function () {
    this.serverConnectionCredentials = Object.assign({}, constants.defaultServerConnectionCredentials);
  }
}
</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"

.connection-console
  width: 33%

  .panel-container 
    margin-top: 16px
    .v-text-field
      margin-bottom: 16px
    
    .v-btn
      width: 100%
    
</style>