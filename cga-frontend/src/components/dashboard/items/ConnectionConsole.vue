<template>
  <div class="connection-console">
    <v-expansion-panels variant="popout" v-model="currentActivePanels" multiple>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <template #default="{ expanded }">
            <v-row no-gutters>
              <v-col cols="4" class="d-flex justify-start"> Connection </v-col>
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
          <v-text-field
            v-model="cassandraServerCredentials.ipAddress"
            placeholder="IP Address"
            persistent-hint
            hint="Enter the exposed IP address of your running cassandra network (server). Example: 127.0.0.1, localhost, etc."
            variant="outlined"
            maxlength="15"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected"
          >
          </v-text-field>
          <v-text-field
            v-model="cassandraServerCredentials.port"
            placeholder="Port"
            persistent-hint
            hint="Enter the exposed port number of your running cassandra network (server). Example: 9042 (default cassandra port), etc."
            variant="outlined"
            maxlength="4"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected"
          >
          </v-text-field>
          <v-btn
            variant="outlined"
            class="action-button"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            @click.prevent="prefillServerCredentials"
          >
            Prefill with default network
          </v-btn>
          <v-btn
            variant="outlined"
            :class="{
              'action-button':
                !cassandraServerCredentials.isCassandraServerConnected,
              'action-button--discard':
                cassandraServerCredentials.isCassandraServerConnected,
            }"
            :disabled="
              !isConnectionButtonEnabled || isConnectionButtonTriggered
            "
            :loading="isConnectionButtonTriggered"
            @click.prevent="manageServerConnection"
          >
            {{
              cassandraServerCredentials.isCassandraServerConnected
                ? "Disconnect"
                : "Connect"
            }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <template #default="{ expanded }">
            <v-row no-gutters>
              <v-col cols="4" class="d-flex justify-start"> Keyspace </v-col>
              <v-col cols="8">
                <v-fade-transition leave-absolute>
                  <span v-if="expanded" key="2"> Select a keyspace </span>
                  <span v-else key="3">
                    {{ currentKeyspace }}
                  </span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="panel-container">
          <v-select
            v-model="currentKeyspace"
            hide-details
            flat
            variant="outlined"
            label="Keyspace"
            :disabled="!cassandraServerCredentials.isCassandraServerConnected"
            :items="availableKeyspaces"
            @update:modelValue="changeKeyspace"
          >
          </v-select>
          <v-btn
            variant="outlined"
            class="action-button"
            :disabled="!cassandraServerCredentials.isCassandraServerConnected"
            @click.prevent="rerenderGraph"
          >
            Re-render conceptual graph
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="js">
import constants from '@/constants/constants';
import { mapActions, mapWritableState } from "pinia";
import useConnectionStore from "@/stores/connection";

export default {
  name: "ConnectionConsole",
  data: () => ({
    currentActivePanels: [0],
    isConnectionButtonTriggered: false,
  }),
  computed: {
    ...mapWritableState(useConnectionStore, ["cassandraServerCredentials", "currentKeyspace", "availableKeyspaces"]),
    connectionPanelExpandedTitle: function () {
      if (!this.cassandraServerCredentials.isCassandraServerConnected) return constants.inputValues.empty;
      return this.cassandraServerCredentials.ipAddress + " : " + this.cassandraServerCredentials.port;
    },
    isConnectionButtonEnabled: function () {
      return !!this.cassandraServerCredentials.ipAddress && !!this.cassandraServerCredentials.port;
    }
  },
  methods: {
    // These methods are mapped from the connection store.
    ...mapActions(useConnectionStore, ["connect", "disconnect"]),
    // These methods handle the connection to the database server.
    manageServerConnection: function () {
      if (this.cassandraServerCredentials.isCassandraServerConnected) {
        this.disconnect();
        this.$emit("changekeyspace", null);
        this.currentActivePanels.pop();
      } else {
        this.connect();
        if (this.cassandraServerCredentials.isCassandraServerConnected) {
          this.currentActivePanels.push(1);
        }
      }
    },
    prefillServerCredentials: function () {
      this.cassandraServerCredentials = Object.assign({}, constants.defaultCassandraNetwork);
    },
    changeKeyspace: function (selectedKeyspace) {
      this.currentKeyspace = selectedKeyspace ? this.currentKeyspace : null;
      this.$emit("changekeyspace", this.currentKeyspace);
    },
    rerenderGraph: function () {
      if (this.currentKeyspace) {
        this.$emit("changekeyspace", this.currentKeyspace);
      }
    }
  },
  created: function () {
    if (!this.cassandraServerCredentials) {
      this.cassandraServerCredentials = { ... constants.emptyCassandraNetwork };
    }
  },
  beforeMount: function () {
    if (this.cassandraServerCredentials.isCassandraServerConnected) {
      this.currentActivePanels.push(1);
    }
  }
}
</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"

.connection-console
  width: 40vw
  margin-right: 2em

  .panel-container
    margin-top: 16px

    .v-text-field
      margin-bottom: 16px

    .v-btn
      width: 100%

      &:last-of-type
        margin-top: 16px
</style>
