<template>
  <div class="dashboard">
    <DesignToolbox
      :keyspace="currentKeyspace"
      @openTerminal="openTerminal"
      @render="renderConceptualGraph"
    />
    <ConceptualGraph
      :table-concepts="tableConcepts"
      :column-concepts="columnConcepts"
      :data-type-concepts="dataTypeConcepts"
      :no-keyspace="true"
      :are-column-concepts-deletable="true"
      @remove="removeColumnConcept"
    />
  </div>
  <v-dialog
    v-model="isTerminalOpened"
    v-if="isTerminalOpened"
    persistent
    transition="dialog-bottom-transition"
  >
    <CassandraTerminal
      :is-terminal-opened="isTerminalOpened"
      :is-terminal-readonly="false"
      :commands="commands"
      @close="closeTerminal"
    />
  </v-dialog>
</template>

<script lang="js">
import constants from "@/constants/constants";
import designToolboxConstants from './designToolboxConstants';
import CassandraTerminal from '@/components/graphic/CassandraTerminal.vue';
import DesignToolbox from './items/DesignToolbox.vue';
import ConceptualGraph from '../utilities/ConceptualGraph.vue';
import useNotificationStore from "@/stores/notification";
import useConnectionStore from "@/stores/connection";
import { mapActions, mapState } from "pinia";
import { useClipboard } from '@/composables/clipboard';

export default {
  name: "CGDesignToolbox",
  components: {
    DesignToolbox,
    ConceptualGraph,
    CassandraTerminal
  },
  setup() {
    const { copyToClipboard } = useClipboard();
    return { copyToClipboard }
  },
  data: () => ({
    // This data is related to the Cassandra Terminal component
    isTerminalOpened: false,
    commands: [],
    // This data is related to the Conceptual Graph component
    tableConcepts: [],
    columnConcepts: {},
    dataTypeConcepts: {}
  }),
  computed: {
    // These computed properties are mapped from the connection store
    ...mapState(useConnectionStore, ["currentKeyspace"]),
  },
  methods: {
    // These methods are mapped from the notification store.
    ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
    // These methods handle events of components
    openTerminal: function (commands) {
      this.commands = JSON.parse(JSON.stringify(commands));
      this.isTerminalOpened = true;
    },
    closeTerminal: function () {
      this.isTerminalOpened = false;
      const queryString = this.getQueryAsString(this.commands);
      this.copyToClipboard(queryString);
      this.setUpSnackbarState(true, designToolboxConstants.COPY_QUERY_CLIPBOARD_MESSAGE);
    },
    // These methods handle the rendering og the Conceptual Graph
    renderConceptualGraph: function (conceptualGraphData) {
      this.tableConcepts = JSON.parse(JSON.stringify(conceptualGraphData.tableConcepts));
      this.columnConcepts = { ... conceptualGraphData.columnConcepts };
      this.dataTypeConcepts = { ... conceptualGraphData.dataTypeConcepts };
    },
    removeColumnConcept: function (tableAndColumnConcepts) {
      if (tableAndColumnConcepts) {
        const tableConceptIndex = this.tableConcepts.findIndex(x => x.conceptName === tableAndColumnConcepts.tableConcept.conceptName);
        if (tableConceptIndex > -1) {
          const tableConceptName = this.tableConcepts[tableConceptIndex].conceptName;
          const columnConceptIndex = this.columnConcepts[tableConceptName].findIndex(x => x.conceptName === tableAndColumnConcepts.columnConcept.conceptName);
          if (columnConceptIndex > -1) {
            this.columnConcepts[tableConceptName].splice(columnConceptIndex, 1);
          }
        }
      }
    },
    getQueryAsString: function (commands) {
      const queryFromCommands = commands.reduce((accumulator, currentValue) => accumulator.concat(currentValue.lineContent), constants.inputValues.empty);
      return queryFromCommands.replace(designToolboxConstants.CQL_COMMAND_REGEX, constants.inputValues.empty);
    }
  },
  created: function () {
    if (!this.currentKeyspace) {
      this.setUpSnackbarState(false, designToolboxConstants.NO_SELECTED_KEYSPACE_MESSAGE);
    }
  }
}
</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"

.dashboard
  @include containers.flex-container($flex-direction: row)
  height: 100%
  width: 100%
</style>
