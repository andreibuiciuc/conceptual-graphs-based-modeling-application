<template>
  <div class="design-section">
    <div class="header-container elevation-1">
      <div>
        <span>Table CG Design</span>
      </div>
      <div class="header-actions">
        <v-btn variant="text">
          Command
        </v-btn>
        <v-btn variant="text">
          Save
        </v-btn>
        <v-divider vertical></v-divider>
        <v-btn variant="text">
          Run
        </v-btn>
      </div>
    </div>
    <div class="design-container">
      <div class="design-container-item">
        <DesignToolbox
          :keyspace="currentKeyspace"
          @openTerminal="openTerminal"
          @render="renderConceptualGraph">
        </DesignToolbox>
      </div>
    <Transition name="fade" mode="out-in">
      <div v-if="!isPlaceholderVisible" class="conceptual-graph-container">
        <ConceptualGraph 
          :table-concepts="tableConcepts"
          :column-concepts="columnConcepts"
          :data-type-concepts="dataTypeConcepts"
          :no-keyspace="true"
          :are-column-concepts-deletable="true"
          :apply-border="false"
          @remove="removeColumnConcept">
        </ConceptualGraph>
      </div>
      <!-- <Placeholder v-else-if="isPlaceholderVisible" :in-loading-state="true" /> -->
    </Transition>
  </div>
  </div>
  <v-dialog v-model="isTerminalOpened"
            v-if="isTerminalOpened"
            persistent
            transition="dialog-bottom-transition">
    <CassandraTerminal :is-terminal-opened="isTerminalOpened"
                     :is-terminal-readonly="false"
                     :commands="commands"
                     @close="closeTerminal">
    </CassandraTerminal>
  </v-dialog>
</template>

<script>
import designToolboxConstants from '../components/design/designToolboxConstants';
import { useUserStore } from "../stores/user";
import useConnectionStore from "../stores/connection";
import DesignToolbox from "../components/design/DesignToolbox.vue";
import ConceptualGraph from "../components/graphic/graph/ConceptualGraph.vue";
import CassandraTerminal from "../components/graphic/terminal/CassandraTerminal.vue";
import Placeholder from '../components/graphic/Placeholder.vue';
import { useUtils } from '../composables/utils';
import { mapState } from "pinia"
import { useQuery } from '../composables/query';

export default {
  name: "DataStructureView",
  components: {
    DesignToolbox,
    ConceptualGraph,
    CassandraTerminal,
    Placeholder
  },
  setup: () => {
    const { generateQueryAsString } = useQuery();
    const { copyToClipboard, openNotificationToast } = useUtils(); 
    return { generateQueryAsString, copyToClipboard, openNotificationToast };
  },
  data: () => ({
    // This data is related to the Slide Card components
    isCardSelected: false,
    hideCardIndex: -1,
    isAnimationFinished: false,
    //
    isTransformTransitionFinished: false,
    // This data is related to the Cassandra Terminal component
    isTerminalOpened: false,
    commands: [],
    // This data is related to the Conceptual Graph component
    tableConcepts: [],
    columnConcepts: {},
    dataTypeConcepts: {},
    isGraphRendered: false
  }),
  computed: {
    // These computed properties are mapped from the Cassandra Connection store
    ...mapState(useConnectionStore, ['currentKeyspace']),
    // These computed properties are related to the usage of constants
    slideContainers: () => { return slideContainers; },
    // These computed properties are related to the animations
    isPlaceholderVisible: function () { return !this.isGraphRendered; },
    isTransitionFinished: function () { return this.isTransformTransitionFinished; }
  },
  methods: {
    // These methods are related to the Slide Card components
    selectDesignCard: function () {
        if (this.isCardSelected) {
          this.isCardSelected = false;
        } else {
          this.isCardSelected = true;
      }
    },
    // These methods handle events of components
    openTerminal: function (commands) {
      this.commands = JSON.parse(JSON.stringify(commands));
      this.isTerminalOpened = true;
    },
    closeTerminal: function () {
      this.isTerminalOpened = false;
      const queryString = this.generateQueryAsString(this.commands);
      this.copyToClipboard(queryString);
      this.openNotificationToast(designToolboxConstants.COPY_QUERY_CLIPBOARD_MESSAGE, 'info');
      
    },
    // These methods handle the rendering og the Conceptual Graph
    renderConceptualGraph: function (conceptualGraphData) {
      this.tableConcepts = JSON.parse(JSON.stringify(conceptualGraphData.tableConcepts));
      this.columnConcepts = { ... conceptualGraphData.columnConcepts };
      this.dataTypeConcepts = { ... conceptualGraphData.dataTypeConcepts };
      if (!conceptualGraphData.onInitialLoad) {
        this.isGraphRendered = true;
      } else {
        this.isGraphRendered = false;
      }
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
  beforeRouteEnter: function (_from, _to, next) {
    const store = useUserStore();
    if (store.isUserLoggedIn) {
      next();
    } else {
      next({ name: "home" });
    }
  }
};
</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_transitions.sass"

$transition-all-time: 0.5s

.design-section
  @include containers.flex-container($flex-direction: column)
  margin-top: variables.$cga-topbar-height
  height: calc(100vh - variables.$cga-topbar-height)

  .design-container
    @include containers.flex-container($flex-direction: row, $justify-content: space-between, $align-items: center)
    width: 100%
    height: 100%

    & > *:first-child
      margin-right: 32px

    .design-container-item
      @include containers.flex-container($flex-direction: column)
      border-right: 1px solid variables.$cassandra-light-gray
      height: 100%
      padding: 32px

.conceptual-graph-container
  height: 100%
  width: 100%
  padding: 40px
  overflow: auto

</style>
