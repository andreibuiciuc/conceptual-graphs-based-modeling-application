<template>
  <div class="design-section">
    <div class="header-container">
      <div class="header-container-title">
        <InputSwitch v-model="isScreenInViewMode" :disabled="!currentKeyspace" @update:modelValue="changeScreenMode" />
        <span>cassandra data structure {{ isScreenInViewMode ? 'view' : 'design' }}</span>
      </div>
      <div class="header-actions">
        <template v-if="!isScreenInViewMode">
          <Button
            outlined
            severity="primary"
            icon="pi pi-credit-card"
            label="command"
            :disabled="!isGraphRendered"
            @click="generateCQLQuery"
          />
          <Button
            outlined
            severity="primary"
            icon="pi pi-save"
            label="save"
            :disabled="!isGraphRendered"
            @click="addTableToKeyspace"
          />
        </template>
        <template v-else>
          <Dropdown
            v-model="tableInViewMode"
            placeholder="table"
            :options="availableTables"
            @change="retrieveKeyspaceTable"
          />
        </template>
      </div>
    </div>
    <div class="design-container">
      <div class="design-container-item">
        <DesignToolbox
          :is-table-in-view-mode="isScreenInViewMode"
          :is-table-in-view-mode-ready="isTableInViewModeReady"
          :table-in-view-mode="tableMetadata"
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
          :are-column-concepts-deletable="!isScreenInViewMode"
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
import constants from '../constants/constants';
import CassandraTerminal from "../components/graphic/terminal/CassandraTerminal.vue";
import ConceptualGraph from "../components/graphic/graph/ConceptualGraph.vue";
import designToolboxConstants from '../components/design/designToolboxConstants';
import DesignToolbox from "../components/design/DesignToolbox.vue";
import { AstraApiResponse } from '@/types/astra/types';
import { AstraColumnDefinition, AstraTableMetadata } from '@/types/astra/types';
import { ClusteringOption, Command, Concept, GraphMetadata } from '../types/types';
import { storeToRefs } from "pinia"
import { Ref, nextTick, onMounted, ref } from 'vue';
import { useAstra } from '@/composables/requests/astra';
import { useConfetti } from '../composables/confetti';
import { useConnectionStore } from "../stores/connection";
import { useMetadata } from '@/composables/metadata/metadata';
import { useQuery } from '@/composables/metadata/query';
import { useUtils } from '@/composables/utils';

// Functions mapped from composables
const { generateQueryAsString, generateQueryAsCommands } = useQuery();
const { copyToClipboard, openNotificationToast } = useUtils();
const { getPartitionAndClusteringColumnsCount } = useMetadata();
const { createConfetti } = useConfetti();
const { retrieveAllTables, retrieveTable, saveTable } = useAstra();

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
    tableGraph.value.rerenderArrows();
  }
};

const removeColumnConcept = async (tableAndColumnConcepts: any): Promise<void> => {
  if (tableAndColumnConcepts) {
    const tableConceptIndex = tableMetadata.value.tables.findIndex((x: Concept) => x.conceptName === tableAndColumnConcepts.tableConcept.conceptName);
    if (tableConceptIndex > -1) {
      const tableConceptName = tableMetadata.value.tables[tableConceptIndex].conceptName;
      const columnConceptIndex = tableMetadata.value.columns.get(tableConceptName)?.findIndex((x: Concept) => x.conceptName === tableAndColumnConcepts.columnConcept.conceptName);
      if (columnConceptIndex !== undefined && columnConceptIndex > -1) {
        tableMetadata.value.columns.get(tableConceptName)?.splice(columnConceptIndex, 1);
      }

      await nextTick();
      tableGraph.value.rerenderArrows();
    }
  }
};

// Functions related to the main screen actions
const isSaveInProgress: Ref<boolean> = ref(false);

const prepareTableForSaving = (): AstraTableMetadata => {
  let table: any = {};
  table.name = tableMetadata.value.tables.at(0).conceptName;
  table.keyspace = tableMetadata.value.keyspace.conceptName;
  
  let columns: AstraColumnDefinition[] = [];
  let partitionKeys: string[] = [];
  let clusteringKeys: string[] = [];
  
  tableMetadata.value.columns.get(table.name).forEach((column: Concept) => {
    columns.push({
      name: column.conceptName,
      static: true,
      typeDefinition: tableMetadata.value.dataTypes.get(column.conceptName).conceptName
    });
    if (column.columnKind === 'partition_key') {
      partitionKeys.push(column.conceptName);
    } else if (column.columnKind === constants.columnKinds.clustering) {
      clusteringKeys.push(column.conceptName);
    }
  });

  table.columnDefinitions = columns;
  
  table.primaryKey = {};
  table.primaryKey.partitionKey = JSON.parse(JSON.stringify(partitionKeys));
  table.primaryKey.clusteringKey = JSON.parse(JSON.stringify(clusteringKeys));

  table.tableOptions = {};
  table.tableOptions.defaultTimeToLive = 0;
  table.tableOptions.clusteringExpression = [ { columns: [clusteringColumnOption.value.clusteringColumn], order: clusteringColumnOption.value.clusteringOrder }];

  return table;
};

const addTableToKeyspace = async (): Promise<void> => {
  isSaveInProgress.value = true;

  const table = prepareTableForSaving();
  const response = await saveTable(currentKeyspace.value, table);
  
  if (response && response.data) {
    const responseData = response.data as AstraApiResponse;
    if (responseData.data) {
      openNotificationToast('table successfully added to the keyspace', 'success');
    } else {
      openNotificationToast(responseData.description, 'error');
    }
  } else {
    openNotificationToast('unexpeced error occured', 'error');
  }

  isSaveInProgress.value = false;
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

// Functions related to the view mode
const availableTables: Ref<string[]> = ref([]);
const isScreenInViewMode: Ref<boolean> = ref(false);
const isTableInViewModeReady: Ref<boolean> = ref(false);
const tableInViewMode: Ref<string> = ref(constants.inputValues.empty);

const changeScreenMode = (isViewMode: boolean): void => {
  if (isViewMode) {
    retrieveKeyspaceTables();
  } else {
    availableTables.value = [];
    tableInViewMode.value = constants.inputValues.empty;
    isTableInViewModeReady.value = false;
    tableMetadata.value = JSON.parse(JSON.stringify(defaultGraphMetadata));
    isGraphRendered.value = false;
  }
};

const parseTableForViewMode = async (metadata: any): Promise<void> => {
  tableMetadata.value = JSON.parse(JSON.stringify(defaultGraphMetadata));
  tableMetadata.value.keyspace = { conceptName: currentKeyspace.value, conceptType: constants.conceptTypes.keyspace };
  tableMetadata.value.tables = JSON.parse(JSON.stringify(metadata.tableConcepts));
  tableMetadata.value.columns = new Map<string, Concept[]>(Object.entries(metadata.columnConcepts));
  tableMetadata.value.dataTypes = new Map<string, Concept>(Object.entries(metadata.dataTypeConcepts));
  isGraphRendered.value = true;
  await nextTick();
  tableGraph.value.rerenderArrows();
};

const retrieveKeyspaceTables = async (): Promise<void> => {
  const response = await retrieveAllTables(currentKeyspace.value);
  if (response && response.data) {
    const responseData = response.data as AstraApiResponse;
    if (responseData.data) {
      availableTables.value = JSON.parse(JSON.stringify(responseData.data.map(metadata => metadata.name)));
    } else {
      openNotificationToast(responseData.description, 'error');
    }
  } else {
    openNotificationToast('error when saving the table', 'error');
  }
}

const retrieveKeyspaceTable = async (): Promise<void> => {
  const response = await retrieveTable(currentKeyspace.value, tableInViewMode.value);
  if (response && response.data) {
    const responseData = response.data as AstraApiResponse;
    if (responseData.data) {
      console.log(responseData.data);
    } else {
      openNotificationToast(responseData.description, 'error');
    }
  } else {
    openNotificationToast('error when retrieving the table', 'error');
  }
};

</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_transitions.sass"

$transition-all-time: 0.5s

.header-container .header-container-title
  @include containers.flex-container($align-items: center)

  .p-inputswitch
    margin-right: 1rem

.design-section
  @include containers.flex-container($flex-direction: column)
  height: 100vh

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
