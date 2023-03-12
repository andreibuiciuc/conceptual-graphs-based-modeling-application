<template>
  
  <div class="slide-cards-container" 
       :class="{ 'flex-start': selectedCardIndex === slideContainers.FIRST && isAnimationFinished, 
                   'flex-end': selectedCardIndex === slideContainers.SECOND && isAnimationFinished }">
   
    <div v-if="selectedCardIndex === slideContainers.SECOND && isGraphRendered" class="conceptual-graph-container">
      <ConceptualGraph
                    :table-concepts="tableConcepts"
                    :column-concepts="columnConcepts"
                    :data-type-concepts="dataTypeConcepts"
                    :no-keyspace="true"
                    :are-column-concepts-deletable="true"
                    :apply-border="isCardOn"
                    @remove="removeColumnConcept">
      </ConceptualGraph>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="selectedCardIndex !== slideContainers.SECOND" class="design-toolbox-container" 
         :class="{ 'design-toolbox-container-slide-left': selectedCardIndex === slideContainers.FIRST }"
         @transitionend="onTransitionEnd">
      <SlideCard :disabled="false"
               class="slide-card"
               icon="mdi-pencil" 
               card-title="Design by form"
               :is-card-grayed="currentActiveCardIndex === slideContainers.SECOND"
               :is-card-selected="selectedCardIndex === slideContainers.FIRST"
               :is-card-on="isCardOn"
               @hovered="currentActiveCardIndex = slideContainers.FIRST"
               @leave="currentActiveCardIndex = slideContainers.NONE"
               @selected="selectDesignCard(slideContainers.FIRST)">
      </SlideCard>
      <Transition name="swipe" mode="out-in">
        <DesignToolbox v-if="selectedCardIndex === slideContainers.FIRST && isCardOn && isAnimationFinished"
                      class="design-toolbox"
                      :keyspace="currentKeyspace"
                      @openTerminal="openTerminal"
                      @render="renderConceptualGraph">
        </DesignToolbox>
      </Transition>
    </div>
    </Transition>

    <Transition name="fade" mode="out-in">
      <div v-if="selectedCardIndex !== slideContainers.FIRST" class="design-toolbox-container"
         :class="{ 'design-toolbox-container-slide-right': selectedCardIndex === slideContainers.SECOND }"
         @transitionend="isAnimationFinished = true">
      <SlideCard :disabled="true"
               class="slide-card"
               icon="mdi-cursor-move"
               card-title="Design by drag and drop" 
               :is-card-grayed="currentActiveCardIndex === slideContainers.FIRST"
               :is-card-selected="selectedCardIndex === slideContainers.SECOND"
               :is-card-on="isCardOn"
               @hovered="currentActiveCardIndex = slideContainers.SECOND"
               @leave="currentActiveCardIndex = slideContainers.NONE"
               @selected="selectDesignCard(slideContainers.SECOND)">
      </SlideCard>
      </div>
    </Transition>

    
    
    <Transition name="fade" mode="out-in">
      <div v-if="selectedCardIndex === slideContainers.FIRST && !isPlaceholderVisible" class="conceptual-graph-container">
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
      <Placeholder v-else-if="isPlaceholderVisible" />
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
import constants from "@/constants/constants";
import designToolboxConstants from '../components/graphic/terminal/cassandraTerminalConstants';
import useUserStore from "../stores/user";
import useConnectionStore from "../stores/connection";
import useNotificationStore from "../stores/notification";
import SlideCard from "../components/graphic/cards/SlideCard.vue";
import DesignToolbox from "../components/design/DesignToolbox.vue";
import ConceptualGraph from "../components/graphic/graph/ConceptualGraph.vue";
import CassandraTerminal from "../components/graphic/terminal/CassandraTerminal.vue";
import Placeholder from '../components/graphic/Placeholder.vue';
import { useClipboard } from '../composables/clipboard';
import { mapState, mapActions } from "pinia"

const slideContainers = {
  NONE: -1,
  FIRST: 0,
  SECOND: 1
};

export default {
  name: "DataStructureView",
  components: {
    SlideCard,
    DesignToolbox,
    ConceptualGraph,
    CassandraTerminal,
    Placeholder
  },
  data: () => ({
    // This data is related to the Slide Card components
    currentActiveCardIndex: -1,
    selectedCardIndex: -1,
    hideCardIndex: -1,
    isCardOn: false,
    isAnimationFinished: false,
    isCardInvisible: false,
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
    // These computed properties are mapped from the Cassandra Connection store
    ...mapState(useConnectionStore, ['currentKeyspace']),
    // These computed properties are related to the usage of constants
    slideContainers: () => { return slideContainers; },
    // These computed properties are related to the animations
    isPlaceholderVisible: function () { return this.selectedCardIndex > -1 && !this.isGraphRendered; }
  },
  methods: {
     // These methods are mapped from the notification store.
     ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
    // These methods are related to the Slide Card components
    selectDesignCard: function (cardIndex) {
      this.isAnimationFinished = false;
      if (this.isCardOn) {
        this.selectedCardIndex = -1;
        this.isCardOn = false;
        this.isCardInvisible = false;
      } else {
        if (this.selectedCardIndex === cardIndex) {
          this.isCardOn = true;
        }
        this.selectedCardIndex = cardIndex;
      }
    },
    onTransitionEnd: function () {
      this.showGraphPlaceholder = true;
      this.isAnimationFinished = true;
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

// Shared Sass vatriables for transitions
$transition-all-time: 0.5s
$translate-percentage: 50%

// Shared Sass classes between media
.slide-cards-container
  @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
  height: 100vh
  padding-top: variables.$cga-topbar-height

.design-toolbox-container
  @include containers.flex-container($flex-direction: column, $justify-content: flex-start, $align-items: center)
  height: 100%
  padding: 40px 0

  .slide-card
    margin-right: 2.5rem

  .design-toolbox
    margin-top: 40px

.conceptual-graph-container
  height: 100%
  width: 100%
  padding: 40px
  overflow: auto
  transform: translate(-25%)

@media (min-width: variables.$cga-ipad-width) and (max-width: variables.$cga-mac-width)
  .slide-cards-container
    height: 100vh
    @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)

@media (min-width: calc(variables.$cga-mac-width))
  .slide-cards-container
    padding: variables.$cga-topbar-height 20% 2.5rem

    .design-toolbox-container
      @include containers.flex-container($flex-direction: column, $justify-content: flex-start, $align-items: center)
      height: 100%

    .design-toolbox-container-slide-left
      transition: all $transition-all-time
      transform: translateX(-$translate-percentage)

      .slide-card
        margin-right: 0
    
    .design-toolbox-container-slide-right
      transition: all $transition-all-time
      transform: translate($translate-percentage)
    
      .slide-card
        max-height: 800px

.swipe-enter-active, .swipe-leave-active
  opacity: 0
  transition: transform 0.25s, opacity 0.10s linear

.swipe-leave-from
  opacity: 1

.swipe-enter-to
  opacity: 1

.swipe-leave-to
  opacity: 0

.fade-enter-active, .fade-leave-active
  opacity: 0
  transition: opacity 0.25s linear

.fade-leave-active
  opacity: 1

.fade-leave-from
  opacity: 1

.fade-leave-to
  opacity: 0

</style>
