<template>
  <div class="design-section">
    <div class="header-container elevation-1">
      <div>
        <span>cassandra data structure design</span>
      </div>
      <div class="header-actions">
        <Button
          outlined
          severity="primary"
          label="command" 
        />
        <Button
          outlined
          severity="primary"
          label="save" 
        />
        <Divider layout="vertical" />
        <Button
          outlined
          severity="primary"
          label="run">
        </Button>
      </div>
    </div>
    <div class="design-container">
      <div class="design-container-item">
        <DesignToolbox
          @openTerminal="openTerminal"
          @render="renderConceptualGraph">
        </DesignToolbox>
      </div>
    <Transition name="fade" mode="out-in">
        <ConceptualGraph
          v-if="isGraphRendered"
          :graph-metadata="tableMetadata"
          ref="tableGraph"
          graph-key="tableGraph"
          :are-column-concepts-deletable="true"
          :are-tables-collapsable="false"
          :apply-border="false"
          @remove="removeColumnConcept">
        </ConceptualGraph>
    </Transition>
  </div>
  </div>
  <Dialog v-model:visible="isCassandraTerminalOpened" :show-header="false" modal>
    <CassandraTerminal
      :is-terminal-opened="isCassandraTerminalOpened"
      :is-terminal-readonly="false"
      :commands="cassandraTerminalCommands"
      @close="closeTerminal" 
    />
  </Dialog>
</template>

<script setup lang="ts">
import designToolboxConstants from '../components/design/designToolboxConstants';
import { useConnectionStore } from "../stores/connection";
import DesignToolbox from "../components/design/DesignToolbox.vue";
import ConceptualGraph from "../components/graphic/graph/ConceptualGraph.vue";
import CassandraTerminal from "../components/graphic/terminal/CassandraTerminal.vue";
import { useUtils } from '../composables/utils';
import { storeToRefs } from "pinia"
import { useQuery } from '../composables/query';
import { Ref, nextTick, onMounted, ref } from 'vue';
import { Command, Concept, GraphMetadata } from '../types/types';
import constants from '../constants/constants';

// Functions mapped from composables
const { generateQueryAsString } = useQuery();
const { copyToClipboard, openNotificationToast } = useUtils();

// Local constants
// TODO: Move this to the constants file
const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace } = storeToRefs(connectionStore);

// Reactive data related to the cassandra terminal
const cassandraTerminalCommands: Ref<Command[]> = ref([]);

// Reactive data related to the conceptual graph
const tableGraph = ref();
const tableMetadata: Ref<GraphMetadata> = ref({ ... defaultGraphMetadata });
const isGraphRendered: Ref<boolean> = ref(false);

// Functions related to the cassandra terminal
const isCassandraTerminalOpened: Ref<boolean> = ref(false);

const openTerminal = (commads: Command[]): void => {
  cassandraTerminalCommands.value = JSON.parse(JSON.stringify(commads));
  isCassandraTerminalOpened.value = true;
};

const closeTerminal = (): void => {
  isCassandraTerminalOpened.value = false;
  const cqlQuery = generateQueryAsString(cassandraTerminalCommands.value);
  copyToClipboard(cqlQuery);
  openNotificationToast(designToolboxConstants.COPY_QUERY_CLIPBOARD_MESSAGE, 'info');
};

// Functions related to the conceptual graph

const renderConceptualGraph = async (metadata: GraphMetadata): Promise<void> => {
  isGraphRendered.value = true;
  tableMetadata.value = { ... metadata };
  await nextTick();
  tableGraph.value.removeArrows();
  tableGraph.value.drawInitialArrows();
  tableGraph.value.drawArrowsForConcepts();
};

const removeColumnConcept = (tableAndColumnConcepts: any): void => {
  if (tableAndColumnConcepts) {
    const tableConceptIndex = tableMetadata.value.tables.findIndex((x: Concept) => x.conceptName === tableAndColumnConcepts.tableConcept.conceptName);
    if (tableConceptIndex > -1) {
      const tableConceptName = tableMetadata.value.tables[tableConceptIndex].conceptName;
      const columnConceptIndex = tableMetadata.value.columns[tableConceptName].findIndex((x: Concept) => x.conceptName === tableAndColumnConcepts.columnConcept.conceptName);
      if (columnConceptIndex > -1) {
        tableMetadata.value.columns.get(tableConceptName)?.splice(columnConceptIndex, 1);
      }
    }
  }
};

onMounted(() => {
  if (!currentKeyspace.value) {
    openNotificationToast('no keyspace selected', 'warn');
  }
});

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
