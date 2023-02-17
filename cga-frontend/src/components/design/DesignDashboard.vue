<template>
  <div class="dashboard">
   <DesignToolbox @openTerminal="openTerminal" @render="renderConceptualGraph" />
   <ConceptualGraph :table-concepts="tableConcepts" 
                    :column-concepts="columnConcepts" 
                    :data-type-concepts="dataTypeConcepts"
                    :no-keyspace="true"
                    :are-column-concepts-deletable="true"
                    @remove="removeColumnConcept" />
  </div>
  <v-dialog v-model="isTerminalOpened" v-if="isTerminalOpened" persistent transition="dialog-bottom-transition">
    <CassandraTerminal :is-terminal-opened="isTerminalOpened" :is-terminal-readonly="false" :commands="getStarterCommand" @close="closeTerminal"/>
 </v-dialog>
</template>

<script lang="js">
import cassandraTerminalConstants from '../graphic/cassandraTerminalConstants';
import CassandraTerminal from '@/components/graphic/CassandraTerminal.vue';
import DesignToolbox from './items/DesignToolbox.vue';
import ConceptualGraph from '../utilities/ConceptualGraph.vue';

export default {
  name: "CGDesignToolbox",
  components: {
    DesignToolbox,
    ConceptualGraph,
    CassandraTerminal
  },
  data: () => ({
    // This data is related to the Cassandra Terminal component
    isTerminalOpened: false,
    // This data is related to the Conceptual Graph component
    tableConcepts: [],
    columnConcepts: {},
    dataTypeConcepts: {}
  }),
  methods: {
    closeTerminal: function () {
      this.isTerminalOpened = false;
    },
    openTerminal: function () {
      this.isTerminalOpened = true;
    },
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
    }
  },
  computed: {
    getStarterCommand: function () {
      return cassandraTerminalConstants.starterCQL;
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