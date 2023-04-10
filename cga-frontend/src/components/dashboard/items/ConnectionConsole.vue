<template>
  <div class="connection-console" ref="connectionConsole">
    <Accordion :multiple="true" :activeIndex="[0]">
      <AccordionTab header="connect to cassandra server">
        <div class="panel-container">
          <!-- hint="Enter the exposed IP address of your running cassandra network (server). Example: 127.0.0.1, localhost, etc." -->
          <InputText 
            v-model="cassandraServerCredentials.ipAddress"
            outlined 
            placeholder="ip address" 
            maxlength="15"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected" 
          />
          <!-- hint="Enter the exposed port number of your running cassandra network (server). Example: 9042 (default cassandra port), etc." -->
          <InputText
            v-model="cassandraServerCredentials.port"
            outlined
            placeholder="port"
            maxlength="4"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected" 
          />
          <Button 
            outlined 
            severity="primary" 
            label="prefill with default network" 
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            @click="prefillServerCredentials" 
          />
          <Button 
            outlined
            severity="primary"
            :label="cassandraServerCredentials.isCassandraServerConnected ? 'disconnect' : 'connect'"
            :disabled="!isConnectionButtonEnabled || isConnectionButtonTriggered"
            :loading="isConnectionButtonTriggered"
            @click="manageServerConnection"
          />
        </div>
      </AccordionTab>
      <AccordionTab header="keyspace">
        <div class="panel-container">
          <Dropdown
            v-model="currentKeyspace"
            outlined
            placeholder="keyspace"
            :disabled="!cassandraServerCredentials.isCassandraServerConnected"
            :options="availableKeyspaces"
            @change="changeKeyspace"          
          />
          <Button 
            outlined
            severity="primary"
            label="re-render conceptual graph"
            :disabled="!cassandraServerCredentials.isCassandraServerConnected"
            @click="rerenderGraph"
          />
        </div>
      </AccordionTab>
    </Accordion>
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
  },
  mounted: function () {
    const conceptualGraphLeftLimit = this.$refs.connectionConsole.getBoundingClientRect().x;
    this.$emit("limit", conceptualGraphLeftLimit);
  }
}
</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"

.connection-console
  width: 40vw
  margin-right: 2em

  .panel-container
    @include containers.flex-container($flex-direction: column, $align-items: center)
    margin-top: 16px

    input, .p-button, .p-dropdown
      width: 100%
      margin-bottom: 1rem

</style>
