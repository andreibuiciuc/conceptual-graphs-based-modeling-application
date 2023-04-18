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
          :disabled="!isGraphRendered"
          @click="generateCQLQuery"
        />
        <Button
          outlined
          severity="primary"
          label="save"
          :disabled="!isGraphRendered"
          @click="saveTableMetadata"
        />
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
import { ClusteringOption, Command, Concept, GraphMetadata } from '../types/types';
import constants from '../constants/constants';
import { useMetadata } from '../composables/metadata';
import { useConfetti } from '../composables/confetti';
import { conceptualGraphsCollection } from '../includes/firebase';

// Functions mapped from composables
const { generateQueryAsString, generateQueryAsCommands } = useQuery();
const { copyToClipboard, openNotificationToast } = useUtils();
const { getPartitionAndClusteringColumnsCount } = useMetadata();
const { createConfetti } = useConfetti();

// Local constants
// TODO: Move this to the constants file
const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

const defaultClusteringOption: ClusteringOption = {
  clusteringColumn: constants.inputValues.empty,
  clusteringOrder: constants.inputValues.empty
};

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace } = storeToRefs(connectionStore);

// Reactive data related to the conceptual graph
const tableGraph = ref();
const tableMetadata: Ref<GraphMetadata> = ref({ ... defaultGraphMetadata });
const clusteringColumnOption: Ref<ClusteringOption> = ref({ ... defaultClusteringOption });
const isGraphRendered: Ref<boolean> = ref(false);

// Functions related to the cassandra terminal
const isCassandraTerminalOpened: Ref<boolean> = ref(false);
const cassandraTerminalCommands: Ref<Command[]> = ref([]);

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
const renderConceptualGraph = async (metadata: GraphMetadata, clusteringOption: ClusteringOption): Promise<void> => {
  if (!metadata && !clusteringOption) {
    tableMetadata.value = { ... defaultGraphMetadata };
    clusteringColumnOption.value = { ... defaultClusteringOption };
    isGraphRendered.value = false;
  } else {
    isGraphRendered.value = true;
    tableMetadata.value = { ... metadata };
    clusteringColumnOption.value = { ... clusteringOption };
    await nextTick();
    tableGraph.value.removeArrows();
    tableGraph.value.drawInitialArrows();
    tableGraph.value.drawArrowsForConcepts();
  }
};

const removeColumnConcept = (tableAndColumnConcepts: any): void => {
  if (tableAndColumnConcepts) {
    const tableConceptIndex = tableMetadata.value.tables.findIndex((x: Concept) => x.conceptName === tableAndColumnConcepts.tableConcept.conceptName);
    if (tableConceptIndex > -1) {
      const tableConceptName = tableMetadata.value.tables[tableConceptIndex].conceptName;
      const columnConceptIndex = tableMetadata.value.columns.get(tableConceptName)?.findIndex((x: Concept) => x.conceptName === tableAndColumnConcepts.columnConcept.conceptName);
      if (columnConceptIndex !== undefined && columnConceptIndex > -1) {
        tableMetadata.value.columns.get(tableConceptName)?.splice(columnConceptIndex, 1);
      }
    }
  }
};

// Functions related to the main screen actions
const isSaveInProgress: Ref<boolean> = ref(false);

const saveTableMetadata = async (): Promise<void> => {
  isSaveInProgress.value = true;
  
  const [isConceptualGraphValid, errorMessage] = validateConceptualGraph();
  if (!isConceptualGraphValid) {
    openNotificationToast(errorMessage, 'error');
    isSaveInProgress.value = false;
    return;
  }

  try {
    const currentTableConcept: Concept = tableMetadata.value.tables.at(0)!;
    await conceptualGraphsCollection.add({
      tableName: currentTableConcept.conceptName,
      tableConcepts: tableMetadata.value.tables,
      columnConcepts: Object.fromEntries(tableMetadata.value.columns),
      dataTypeConcepts: Object.fromEntries(tableMetadata.value.dataTypes)
    });
    isSaveInProgress.value = false;
    openNotificationToast(designToolboxConstants.SUCCESSFUL_TABLE_GRAPH_SAVE, 'success');
    createConfetti();
  } catch (error) {
    isSaveInProgress.value = false;
    openNotificationToast(error.message, 'error');
  }
};

const validateConceptualGraph = (): [boolean, string] => {
  const { partitionColumnsCount, _ } = getPartitionAndClusteringColumnsCount(tableMetadata.value);
  const errorMessage = partitionColumnsCount > 0 ? constants.inputValues.empty : "Cannot create primary key without any partition keys";
  return [partitionColumnsCount > 0, errorMessage];
};

const generateCQLQuery = (): void => {
  const [isConceptualGraphValid, errorMessage] = validateConceptualGraph();
    if (isConceptualGraphValid) {
      const commads = generateQueryAsCommands(tableMetadata.value, clusteringColumnOption.value);
      openTerminal(commads);
    } else {
      openNotificationToast(errorMessage, 'error');
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
  // margin-top: variables.$cga-topbar-height
  // height: calc(100vh - variables.$cga-topbar-height)

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
