<template>
  <div class="slide-cards-container" :style="{ justifyContent: selectedCardIndex === 0 ? 'flex-start' : 'flex-end' }">
    <ConceptualGraph v-if="selectedCardIndex === 1"
                    :table-concepts="tableConcepts"
                    :column-concepts="columnConcepts"
                    :data-type-concepts="dataTypeConcepts"
                    :no-keyspace="true"
                    :are-column-concepts-deletable="true"
                    @remove="removeColumnConcept">
    </ConceptualGraph>
    <div class="design-toolbox-container">
      <SlideCard v-if="selectedCardIndex !== 1"
               class="slide-card" :class="{ 'slide-card-slide-left': selectedCardIndex === 0 }"
               style="margin-right: 2.5rem"
               icon="mdi-pencil" 
               :is-card-grayed="currentActiveCardIndex === 1"
               :is-card-selected="selectedCardIndex === 0"
               :is-card-on="isCardOn"
               @transitionend="isAnimationFinished = true"
               @hovered="currentActiveCardIndex = 0"
               @leave="currentActiveCardIndex = -1"
               @selected="selectDesignCard(0)">
      </SlideCard>
      <Transition name="swipe" mode="out-in">
        <DesignToolbox v-if="selectedCardIndex === 0 && isCardOn && isAnimationFinished"
                      class="design-toolbox"
                      :keyspace="currentKeyspace"
                      @openTerminal="openTerminal"
                      @render="renderConceptualGraph">
        </DesignToolbox>
      </Transition>
    </div>
    <div class="design-toolbox-container">
      <SlideCard v-if="selectedCardIndex !== 0"
               class="slide-card" :class="{ 'slide-card-slide-right': selectedCardIndex === 1 }"
               icon="mdi-cursor-move" 
               :is-card-grayed="currentActiveCardIndex === 0"
               :is-card-selected="selectedCardIndex === 1"
               :is-card-on="isCardOn"
               @hovered="currentActiveCardIndex = 1"
               @leave="currentActiveCardIndex = -1"
               @selected="selectDesignCard(1)">
      </SlideCard>
    </div>
    <ConceptualGraph v-if="selectedCardIndex === 0"
                    :table-concepts="tableConcepts"
                    :column-concepts="columnConcepts"
                    :data-type-concepts="dataTypeConcepts"
                    :no-keyspace="true"
                    :are-column-concepts-deletable="true"
                    @remove="removeColumnConcept">
    </ConceptualGraph>
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
import constants from "@/constants/constants";
import designToolboxConstants from '../components/graphic/terminal/cassandraTerminalConstants';
import useUserStore from "../stores/user";
import useConnectionStore from "../stores/connection";
import useNotificationStore from "../stores/notification";
import SlideCard from "../components/graphic/cards/SlideCard.vue";
import DesignToolbox from "../components/design/items/DesignToolbox.vue";
import ConceptualGraph from "../components/utilities/ConceptualGraph.vue";
import CassandraTerminal from "../components/graphic/terminal/CassandraTerminal.vue";
import { useClipboard } from '../composables/clipboard';
import { mapState, mapActions } from "pinia"

export default {
  name: "DataStructureView",
  components: {
    SlideCard,
    DesignToolbox,
    ConceptualGraph,
    CassandraTerminal
  },
  data: () => ({
    // This data is related to the Slide Card components
    currentActiveCardIndex: -1,
    selectedCardIndex: -1,
    hideCardIndex: -1,
    isCardOn: false,
    isAnimationFinished: false,
    // This data is related to the Cassandra Terminal component
    isTerminalOpened: false,
    commands: [],
    // This data is related to the Conceptual Graph component
    tableConcepts: [],
    columnConcepts: {},
    dataTypeConcepts: {},
    isGraphRendered: false
  }),
  setup() {
    const { copyToClipboard } = useClipboard();
    return { copyToClipboard }
  },
  computed: {
    ...mapState(useConnectionStore, ['currentKeyspace'])
  },
  methods: {
     // These methods are mapped from the notification store.
     ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
    // These methods are related to the Slide Card components
    selectDesignCard: function (cardIndex) {
      if (this.isCardOn) {
        this.isCardOn = false;
      } else if (this.selectedCardIndex === cardIndex) {
        this.isCardOn = true;
      }
      this.selectedCardIndex = cardIndex;
      this.isAnimationFinished = false;
    },
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
      this.isGraphRendered = true;
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

.slide-cards-container
  height: 100vh
  display: flex
  align-items: center
  justify-content: space-around
  padding: variables.$cga-topbar-height 20% 0

  .design-toolbox-container
    @include containers.flex-container($flex-direction: column, $justify-content: flex-start, $align-items: center)
    height: 100%
    padding-top: 2.5rem

    .slide-card
      max-height: 800px

    .slide-card-slide-left
      transform: translateX(-50%)
      transition: all 0.5s

    .slide-card-slide-right
      transform: translateX(50%)
      transition: all 0.5s

.design-toolbox
  transform: translateX(-50%)
  margin: 2.5rem 2.5rem 0 0

.swipe-enter-active, .swipe-leave-active
  opacity: 0
  transition: transform 0.25s, opacity 0.10s linear

.swipe-leave-from
  opacity: 1

.swipe-enter-to
  opacity: 1

.swipe-leave-to
  opacity: 0

</style>
