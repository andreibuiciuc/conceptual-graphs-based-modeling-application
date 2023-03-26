<template>
  <div class="design-container">
    <div class="design-toolbox-container">
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
      <Placeholder v-else-if="isPlaceholderVisible" :in-loading-state="true" />
    </Transition>
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
import useUserStore from "../stores/user";
import useConnectionStore from "../stores/connection";
import useNotificationStore from "../stores/notification";
import DesignToolbox from "../components/design/DesignToolbox.vue";
import ConceptualGraph from "../components/graphic/graph/ConceptualGraph.vue";
import CassandraTerminal from "../components/graphic/terminal/CassandraTerminal.vue";
import Placeholder from '../components/graphic/Placeholder.vue';
import { useClipboard } from '../composables/clipboard';
import { mapState, mapActions } from "pinia"
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
    const { copyToClipboard } = useClipboard(); 
    return { generateQueryAsString, copyToClipboard };
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
    // These methods are mapped from the notification store.
    ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
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
      this.setUpSnackbarState(true, designToolboxConstants.COPY_QUERY_CLIPBOARD_MESSAGE);
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

// Shared Sass vatriables for transitions
$transition-all-time: 0.5s

// Shared Sass classes between media
.design-container
  @include containers.flex-container($flex-direction: row, $justify-content: space-between, $align-items: center)
  padding: variables.$cga-topbar-height 40px 0
  height: 100vh

.design-toolbox-container
  @include containers.flex-container($flex-direction: column, $justify-content: flex-start, $align-items: center)
  transition: all $transition-all-time
  height: 100%
  padding: 40px 0
  
.conceptual-graph-container
  height: 100%
  width: 100%
  padding: 40px
  overflow: auto

</style>
