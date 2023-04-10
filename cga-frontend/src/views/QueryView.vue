<template>
  <div class="query-page">
    <div class="query-section">
    <div class="header-container elevation-1">
      <div>
        <span>cassandra query design</span>
      </div>
      <div class="header-actions">
        <Dropdown v-model="selectedTable"
          placeholder="table"
          :disabled="!currentKeyspace"
          :options="availableTables"
          @change="changeTable">
        </Dropdown>
        <Button label="save" outlined severity="primary" />
        <Button label="generate query" outlined severity="primary"></Button>
      </div>
    </div>
    <div class="query-canvas-wrapper">
      <div class="query-canvas">
        <conceptual-graph v-if="selectedTable && !isTableRetrieveInProgress" 
          ref="tableGraph"
          graph-key="tableGraph"
          :graph-metadata="tableMetadata"
          :are-columns-selectable="true"
          @select="addColumnToQuery" />
        <v-progress-circular indeterminate v-else-if="isTableRetrieveInProgress"></v-progress-circular>
      </div>
      <div class="query-canvas">
        <conceptual-graph v-if="queryMetadata && queryMetadata.columns" 
          ref="queryGraph"
          graph-key="queryGraph"
          :graph-metadata="queryMetadata"
          :are-columns-selectable="false"
          :areColumnConceptsDeletable="true"
          :query-concepts="queryConcepts"
          :is-query-graph="true"
          @remove="removeColumnFromQuery" />
      </div>
    </div>
    </div>
    <div class="query-toolbox">
      <div class="query-panel-header">
        <div class="query-panel-header-info">
          <div class="info-block">
            <span>keyspace:</span>
            <span v-if="currentKeyspace">{{ currentKeyspace }}</span>
            <template v-else>
              <i class="pi pi-exclamation-circle" style="color: red; font-size: 1.25rem;"></i>
              <span>no keyspace selected</span>
            </template>
          </div>
          <div class="info-block">
            <span>table:</span>
            <span v-if="isTableGraphReady">{{ tableMetadata.tables[0]?.conceptName }}</span>
            <template v-else>
              <i class="pi pi-exclamation-circle" style="color: red; font-size: 1.25rem;"></i>
              <span>no table concept selected</span>
            </template>
          </div>
        </div>
        <div class="query-panel-header-actions">
          <Dropdown v-model="selectedClauseType"
            placeholder="add to query" 
            :disabled="isQueryActionDisabled"
            :options="[QueryClause.WHERE, QueryClause.GROUP_BY, QueryClause.ORDER_BY]"
            @change="addClauseToQuery(selectedClauseType)"
            ></Dropdown>
          <Button label="clear" text severity="secondary" :disabled="isQueryActionDisabled" @click="clearQueryMetadata" />
          <Divider layout="vertical" />
          <Button label="command" outlined severity="primary" :disabled="isQueryActionDisabled" />
          <Button label="run" outlined severity="primary" :disabled="isQueryActionDisabled" />
        </div>
      </div>
      <v-divider></v-divider>
      <div class="query-panel-container">
        <div class="query-panel-item">
          <query-items 
            v-if="whereClauseItems.length" 
            :clause="QueryClause.WHERE" 
            :items="whereClauseItems" 
            :columns="columnConcepts" 
            @add="addQueryConcept"
            @remove="removeClause">
          </query-items>
          <query-items
            v-if="orderByClauseItems.length"
            :clause="QueryClause.ORDER_BY"
            :items="orderByClauseItems"
            :columns="columnConcepts"
            @add="addQueryConcept"
            @remove="removeClause"
          ></query-items>
        </div>
      </div>
  </div>
  </div>
  
</template>

<script setup lang="ts">
import constants from '../constants/constants';
import { Concept, QueryClause, QueryItem, QueryConcepts, ColumnMetadata, GraphMetadata } from '../types/types';

import useConnectionStore from '../stores/connection';
import useNotificationStore from '../stores/notification';
import { useMetadata } from '../composables/metadata';
import { storeToRefs } from 'pinia';
import { manageRequest } from '../includes/requests';
import ConceptualGraph from '../components/graphic/graph/ConceptualGraph.vue';
import QueryItems from '../components/design/QueryItems.vue';
import { Ref, nextTick, ref, watch } from 'vue';
import { computed } from '@vue/reactivity';

const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

const tableGraph = ref();
const queryGraph = ref();

const tableMetadata: Ref<GraphMetadata> = ref(Object.assign({}, defaultGraphMetadata));
const queryMetadata: Ref<GraphMetadata> = ref(Object.assign({}, defaultGraphMetadata));
const isTableGraphReady: Ref<boolean> = ref(false);

const selectedClauseType: Ref<QueryClause | null> = ref(null);

const whereClauseItems: Ref<QueryItem[]> = ref([]);
const orderByClauseItems: Ref<QueryItem[]> = ref([]);
const groupByClauseItems: Ref<QueryItem[]> = ref([]);

const queryConcepts: Ref<QueryConcepts> = ref({ ... constants.defaultQueryConcepts });

const { getRelationTypeForColumnConcept, getConceptReferentValue } = useMetadata();

// Store state and action mappings
const connectionStore = useConnectionStore();
const notificationStore = useNotificationStore();
const { currentKeyspace } = storeToRefs(connectionStore); 

// Retrieve and parsing of the metadata
const availableTables: Ref<string[]> = ref([]);
const selectedTable: Ref<string> = ref(constants.inputValues.empty);
const isTableRetrieveInProgress: Ref<boolean> = ref(false);

const changeTable = (newTable: any): void => {
  selectedTable.value = newTable.value;
  retrieveTableMetadata();
};

const getColumnsMetadataForTableGraph = (metadata: ColumnMetadata[]) => {
  let columns: Map<string, Concept[]> = new Map();
  let dataTypes: Map<string, Concept> = new Map();
  columns.set(selectedTable.value, []);
  
  const tableColumnConcepts = columns.get(selectedTable.value);
  metadata.forEach(columnData => {
    const relation = getRelationTypeForColumnConcept(columnData.column_kind, columnData.clustering_order);
    const columnConcept = { conceptName: columnData.column_name, conceptType: constants.conceptTypes.column, relation, columnKind: columnData.column_kind };
    tableColumnConcepts?.push(columnConcept);

    const dataTypeConcept = { conceptName: columnData.column_type, conceptType: constants.conceptTypes.dataType };
    dataTypes.set(columnData.column_name, dataTypeConcept);
  });

  return { columns, dataTypes };
}
  
const parseTableMetadata = (metadata: ColumnMetadata[]) => {
  const tables = [{ conceptName: selectedTable.value, conceptType: constants.conceptTypes.table }];
  const {columns, dataTypes } = getColumnsMetadataForTableGraph(metadata);

  setConceptualGraphMetadata(tableMetadata, tables, columns, dataTypes);
  setConceptualGraphMetadata(queryMetadata, tables);
  
  isTableGraphReady.value = true;
};

const retrieveAvailableTables = async (): Promise<void> => {
  const response = await manageRequest(constants.requestTypes.GET, "tables", { keyspace_name: currentKeyspace.value });
  if (response && response.data) {
    if (response.data.status === constants.requestStatus.SUCCESS) {
      availableTables.value = JSON.parse(JSON.stringify(response.data.tables));
    } else {
      notificationStore.setUpSnackbarState(false, response.data.message);
    }
  } else {
    notificationStore.setUpSnackbarState(false, "Unexpected error occured.");
  }
};

const retrieveTableMetadata = async (): Promise<void> => {
  isTableRetrieveInProgress.value = true;
  const response = await manageRequest(constants.requestTypes.GET, "table_metadata", {
    keyspace_name: currentKeyspace.value,
    table_name: selectedTable.value
  });
  if (response && response.data) {
    if (response.data.status === constants.requestStatus.SUCCESS) {
      parseTableMetadata(response.data.table_metadata);
      isTableRetrieveInProgress.value = false;
    
      // Wait for the graph components to be mounted on the DOM,
      // then draw the arrows between the concepts
      await nextTick();
      tableGraph.value.removeArrows();
      tableGraph.value.drawInitialArrows();
      tableGraph.value.drawArrowsForConcepts();
      queryGraph.value.removeArrows();
      queryGraph.value.drawInitialArrows();
      queryGraph.value.drawArrowsForConcepts();

    } else {
      notificationStore.setUpSnackbarState(false, response.data.message);
    }
  } else {
    notificationStore.setUpSnackbarState(false, "Unexpected error occured.");
  }
  isTableRetrieveInProgress.value = false;
};

const setConceptualGraphMetadata = (metadata: Ref<GraphMetadata>, tables: Concept[] = [], 
                                    columns: Map<string, Concept[]> = defaultGraphMetadata.columns, 
                                    dataTypes: Map<string, Concept> = defaultGraphMetadata.dataTypes): void => {
  whereClauseItems.value = [];
  metadata.value.keyspace = { conceptName: currentKeyspace.value ? currentKeyspace.value : constants.inputValues.empty, conceptType: constants.conceptTypes.keyspace };
  metadata.value.tables = JSON.parse(JSON.stringify(tables));
  metadata.value.columns = new Map(JSON.parse(JSON.stringify([... columns])));
  if (metadata === tableMetadata) {
    metadata.value.dataTypes = new Map(dataTypes);
  } else {
    metadata.value.dataTypes = defaultGraphMetadata.dataTypes;
  }
}

// Query builder functionalities
const isQueryActionDisabled = computed(() => {
  return !currentKeyspace.value || !tableMetadata.value.tables.length || !tableMetadata.value.columns.size;
})

const columnConcepts = computed(() => {
  return queryMetadata.value.columns.size ? queryMetadata.value.columns.get(queryMetadata.value.tables[0].conceptName): [];
})

const addColumnToQuery = async (columnConcept: Concept): Promise<void> => {
  const isColumnAlreadyAdded = checkIfColumnIsAlreadyAdded(columnConcept);
  if (!isColumnAlreadyAdded) {
    const conceptToAdd = { ... columnConcept, relation: constants.relationTypes.has };
    const columns = queryMetadata.value.columns.get(queryMetadata.value.tables[0].conceptName);
    if (!columns) {
      queryMetadata.value.columns.set(queryMetadata.value.tables[0].conceptName, [conceptToAdd]);
    } else {
      columns?.push({ ... columnConcept, relation: constants.relationTypes.has });
    }
    await nextTick();
    queryGraph.value.removeArrows();
    queryGraph.value.drawArrowsForConcepts();
  } else {
    notificationStore.setUpSnackbarState(false, "Column already added to the query");
  }
};

const addQueryConcept = async (queryClauseData: any): Promise<void> => {
  if (queryClauseData.clause === QueryClause.WHERE) {
    queryConcepts.value[QueryClause.WHERE].columns.push({ conceptName: queryClauseData.item.column, conceptType: constants.conceptTypes.column });
    queryConcepts.value[QueryClause.WHERE].conceptReferent = getConceptReferentValue(whereClauseItems.value);
    await nextTick();
    queryGraph.value.removeArrows();
    queryGraph.value.drawArrowsForConcepts();
    queryGraph.value.drawArrowsForQueryConcepts();
  }
};

const addClauseToQuery = (clause: QueryClause | null): void => {
  selectedClauseType.value = null;
  switch (clause) {
    case QueryClause.WHERE:
      whereClauseItems.value.push({ column: constants.inputValues.empty, relation: "==", value: constants.inputValues.empty, chipValues: null, currentChipValue: '' });
      break;
    case QueryClause.GROUP_BY:
      break;
    case QueryClause.ORDER_BY:
      orderByClauseItems.value.push({ column: constants.inputValues.empty, value: constants.inputValues.empty });
      break;
    default:
      break;
  }
};

const checkIfColumnIsAlreadyAdded = (columnConcept: Concept): boolean => {
  if (queryMetadata.value.columns.size && queryMetadata.value.columns.has(queryMetadata.value.tables[0].conceptName)) {
    return queryMetadata.value.columns.get(queryMetadata.value.tables[0].conceptName)!.some(column => column.conceptName === columnConcept.conceptName);
  }
  return false;
};

const clearQueryMetadata = () => {
  queryMetadata.value.columns.set(queryMetadata.value.tables[0].conceptName, []);
  queryConcepts.value[QueryClause.WHERE].columns = [];
  queryGraph.value.removeArrows();
  queryGraph.value.drawInitialArrows();
  queryGraph.value.drawArrowsForConcepts();
};

const removeClause = (clauseObject: any): void => {
  const clauseArrayReference = clauseObject.clause === QueryClause.WHERE ? whereClauseItems : orderByClauseItems;
  
  const index = clauseArrayReference.value.findIndex(x => x.column === clauseObject.item.column);
  const clause = clauseArrayReference.value.find(x => x.column === clauseObject.item.column);
  if (index > -1 && clause) {
    clauseArrayReference.value.splice(index, 1);
    if (clauseArrayReference.value.length === 0) {
      delete queryConcepts.value[clause.column];
    }
  }
}

const removeColumnFromQuery = (columnMetadata) => {
  if (columnMetadata) {
    const tableConceptName = queryMetadata.value.tables[0].conceptName;
    const columnConceptIndex = queryMetadata.value.columns.get(tableConceptName)!.findIndex(x => x.conceptName === columnMetadata.columnConcept.conceptName);
    if (columnConceptIndex > -1) {
      queryMetadata.value.columns.get(tableConceptName)!.splice(columnConceptIndex, 1);
      delete queryConcepts.value[columnMetadata.columnConcept.conceptName];
    }
  }
}

// Watches
watch(currentKeyspace, (newKeyspace, _) => {
  tableMetadata.value.keyspace = Object.assign({}, newKeyspace)
  queryMetadata.value.keyspace = Object.assign({}, newKeyspace);
});

if (currentKeyspace.value) {
  retrieveAvailableTables();
} else {
  notificationStore.setUpSnackbarState(false, "No selected keyspace.");
}

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.query-page
  overflow-y: auto
  height: calc(100vh - variables.$cga-topbar-height)
  margin: variables.$cga-topbar-height 0 0 0
  padding: 0

  .query-section
    @include containers.flex-container($flex-direction: column)
    height: calc(100vh - variables.$cga-topbar-height)

    .query-header-container
      @include containers.flex-container($flex-direction: row, $justify-content: space-between, $align-items: center)
      height: variables.$cga-header-height
      min-height: variables.$cga-header-height
      width: 100%
      padding: 10px 26px

      .query-header-actions
        @include containers.flex-container($flex-direction: row, $justify-content: flex-end, $align-items: center)

        & > *:not(:last-child)
          margin-right: 10px

    .query-canvas-wrapper
      @include containers.flex-container($flex-direction: row)
      padding: 10px
      height: 100%
      width: 100%

      .query-canvas
        @include containers.flex-container($justify-content: center, $align-items: center)
        border: 1px solid variables.$cassandra-light-gray
        position: relative
        resize: horizontal
        overflow: auto
        height: 100%
        width: 50%

        &:first-of-type
          margin-right: 20px

        .v-progress-circular
          color: variables.$cassandra-blue

  .query-toolbox
    height: calc(100% - variables.$cga-topbar-height)
    width: 100%
    padding: 40px

    .v-exansion-panels
      width: 100%
      padding: 10px

    .query-panel-header
      @include containers.flex-container($justify-content: space-between, $align-items: center)
      padding: 10px 0

      .query-panel-header-info
        @include containers.flex-container
      
        & > .info-block
          @include containers.flex-container
          margin-right: 20px

          & > span:first-of-type
            margin-right: 5px

          & > span:last-of-type
            color: variables.$cassandra-blue

          & > .v-icon + span
            color: variables.$cassandra-black
      
      .query-panel-header-actions
        @include containers.flex-container()

        & > .p-button, & > .v-divider
          margin-left: 10px

    .query-panel-container
      @include containers.flex-container($flex-direction: column, $align-items: flex-start)
      padding: 10px 0

      .query-panel-item
        @include containers.flex-container($flex-direction: column)  
        position: relative
        margin: 10px 0
        width: 100%

        .v-dialog
          position: absolute
          top: -180px
          left: 180px

          .v-overlay__scrim
            display: none !important

</style>
