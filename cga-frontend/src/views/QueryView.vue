<template>
  <div class="query-page">
    <div class="query-section">
    <div class="header-container elevation-1">
      <div>
        <span>Query Design</span>
      </div>
      <div class="header-actions">
        <v-select v-model="selectedTable"
          variant="plain"
          :disabled="!currentKeyspace"
          :hide-details="true"
          :items="availableTables"
          :loading="isTableRetrieveInProgress"
          @update:modelValue="changeTable"
        >
        </v-select>
        <v-btn variant="text">
          Save
        </v-btn>
        <v-btn variant="text">
          Generate Query
        </v-btn>
      </div>
    </div>
    <div class="query-canvas-wrapper">
      <div class="query-canvas">
        <conceptual-graph v-if="selectedTable && !isTableRetrieveInProgress"
          :are-columns-selectable="true"
          :keyspace-concept="tableMetadata.keyspace"
          :table-concepts="tableMetadata.tables"
          :column-concepts="tableMetadata.columns"
          :data-type-concepts="tableMetadata.dataTypes"
          @select="addColumnToQuery" />
        <v-progress-circular indeterminate v-else-if="isTableRetrieveInProgress"></v-progress-circular>
      </div>
      <div class="query-canvas">
        <conceptual-graph v-if="queryMetadata && queryMetadata.columns"
          :are-columns-selectable="false"
          :areColumnConceptsDeletable="true"
          :keyspace-concept="queryMetadata.keyspace"
          :table-concepts="queryMetadata.tables"
          :column-concepts="queryMetadata.columns"
          :data-type-concepts="queryMetadata.dataTypes"
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
            <span>Keyspace:</span>
            <span v-if="currentKeyspace">{{ currentKeyspace }}</span>
            <template v-else>
              <v-icon color="red">mdi-alert-box</v-icon>
              <span>No keyspace selected</span>
            </template>
          </div>
          <div class="info-block">
            <span>Table:</span>
            <span v-if="isTableGraphReady">{{ tableMetadata.tables[0]?.conceptName }}</span>
            <template v-else>
              <v-icon color="red">mdi-alert-box</v-icon>
              <span>No table concept selected</span>
            </template>
          </div>
        </div>
        <div class="query-panel-header-actions">
          <v-btn
            :disabled="isQueryActionDisabled" 
            variant="outlined">
            Run
          </v-btn>
          <v-btn 
            :disabled="isQueryActionDisabled"
            variant="text"
            @click.prevent="clearQueryMetadata">
            Clear
          </v-btn>
          <v-divider vertical></v-divider>
          <v-btn 
            :disabled="isQueryActionDisabled"
            variant="outlined">
            Command  
          </v-btn>
        </div>
      </div>
      <v-divider></v-divider>
      <div class="query-panel-container">
        <div class="query-panel-item">
          <query-items 
            v-if="queryMetadata.columns" 
            :clause="0" :items="whereClauseItems" 
            :columns="columnConcepts" 
            :operators="constants.cqlOperators"
            @add="addQueryConcept"
            @remove="removeClause">
          </query-items>
        </div>
        <div class="query-panel-item">
          <v-btn 
            :disabled="isQueryActionDisabled"
            variant="text"
            prepend-icon="mdi-plus"
            @click.prevent="isQueryOptionsListOpened = true">
            Add to query
          </v-btn>
          <v-dialog v-model="isQueryOptionsListOpened"
            contained
            absolute
            width="100px"
            class="query-options-list-card"
            elevation="4"
            >
            <v-card>
              <v-list>
                <v-list-item @click.prevent="addWhereClauseToQuery">Where</v-list-item>
                <v-list-item>Group</v-list-item>
                <v-list-item>Order</v-list-item>
                <v-list-item>Count</v-list-item>
              </v-list>
            </v-card>
          </v-dialog>
        </div>
      </div>
  </div>
  </div>
  
</template>

<script setup lang="ts">
import constants from '../constants/constants';
import { Concept } from '../types/types';

import useConnectionStore from '../stores/connection';
import useNotificationStore from '../stores/notification';
import { useMetadata } from '../composables/metadata';
import { storeToRefs } from 'pinia';
import { manageRequest } from '../includes/requests';
import ConceptualGraph from '../components/graphic/graph/ConceptualGraph.vue';
import QueryItems from '../components/design/QueryItems.vue';
import { Ref, ref, watch } from 'vue';
import { computed } from '@vue/reactivity';


interface QueryItem {
    column: string,
    relation?: string,
    value?: string 
    toQuery?: boolean
};

type metadata = { [key: string]: Concept | Concept[] | { [key: string]: Concept[] } | { [key: string]: Concept } | null };

const tableMetadata: Ref<any> = ref({ keyspace: {}, tables: [], columns: {}, dataTypes: {} });
const queryMetadata: Ref<any> = ref({ keyspace: {}, tables: [], columns: null, dataTypes: null });
const isTableGraphReady: Ref<boolean> = ref(false);

const isQueryOptionsListOpened: Ref<boolean> = ref(false);
const whereClauseItems: Ref<QueryItem[]> = ref([]);
const queryConcepts: Ref<any> = ref(null);

const { getRelationTypeForColumnConcept } = useMetadata();

// Store state and action mappings
const connectionStore = useConnectionStore();
const notificationStore = useNotificationStore();
const { currentKeyspace } = storeToRefs(connectionStore); 

// Retrieve and parsing of the metadata
const availableTables: Ref<any[]> = ref([]);
const selectedTable: Ref<string> = ref(constants.inputValues.empty);
const isTableRetrieveInProgress: Ref<boolean> = ref(false);

const changeTable = (newTable: string): void => {
  selectedTable.value = newTable;
  retrieveTableMetadata();
};

const getColumnsMetadataForTableGraph = (metadata): any => {
  let columns: { [key: string]: Concept[] } = { [selectedTable.value]: [] };
  let dataTypes = {};
  
  metadata.forEach(columnData => {
    const relation = getRelationTypeForColumnConcept(columnData.column_kind, columnData.clustering_order);
    const columnConcept = { conceptName: columnData.column_name, conceptType: constants.conceptTypes.column, relation };
    columns[selectedTable.value].push(columnConcept);
    dataTypes[columnData.column_name] = { conceptName: columnData.column_type, conceptType: constants.conceptTypes.dataType };        
  });

  return { columns, dataTypes };
}
  
const parseTableMetadata = (metadata) => {
  const tables = [{ conceptName: selectedTable.value, conceptType: constants.conceptTypes.table }];
  const {columns, dataTypes } = getColumnsMetadataForTableGraph(metadata);

  setConceptualGraphMetadata(tableMetadata, tables, columns, dataTypes);
  setConceptualGraphMetadata(queryMetadata, tables, {[selectedTable.value]: [] });
  
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
    } else {
      notificationStore.setUpSnackbarState(false, response.data.message);
    }
  } else {
    notificationStore.setUpSnackbarState(false, "Unexpected error occured.");
  }
  isTableRetrieveInProgress.value = false;
};

const setConceptualGraphMetadata = (metadata: any, tables: Concept[] = [], 
                                    columns: { [key: string]: Concept[] } | null = null, 
                                    dataTypes: {[key: string]: Concept } | null = null): void => {
  whereClauseItems.value = [];
  metadata.value.keyspace = { conceptName: currentKeyspace.value, conceptType: constants.conceptTypes.keyspace };
  metadata.value.tables = JSON.parse(JSON.stringify(tables));
  metadata.value.columns = { ... columns };
  if (metadata === tableMetadata) {
    metadata.value.dataTypes = { ... dataTypes };
  } else {
    metadata.value.dataTypes = null;
  }
}

// Query builder functionalities
const isQueryActionDisabled = computed(() => {
  return !currentKeyspace.value || !tableMetadata.value.tables.length || !tableMetadata.value.columns[tableMetadata.value.tables[0].conceptName].length;
})

const columnConcepts = computed(() => {
  return queryMetadata.value.columns[queryMetadata.value.tables[0].conceptName];
})

const addColumnToQuery = (columnConcept: Concept): void => {
  const isColumnAlreadyAdded = checkIfColumnIsAlreadyAdded(columnConcept);
  if (!isColumnAlreadyAdded) {
    queryMetadata.value.columns[queryMetadata.value.tables[0].conceptName].push({ ... columnConcept, relation: constants.relationTypes.has });
  } else {
    notificationStore.setUpSnackbarState(false, "Column already added to the query");
  }
};

const addQueryConcept = (queryClauseData: any) => {
  if (queryClauseData.clause === 0) {
    const firstColumnConcept = queryMetadata.value.columns[queryMetadata.value.tables[0].conceptName][0];
    if (whereClauseItems.value.length === 0) {
      queryConcepts.value[firstColumnConcept.conceptName].firstColumn = queryClauseData.item.column;
    } else {
      queryConcepts.value[firstColumnConcept.conceptName].otherColumns.push(queryClauseData.item.column);
    }
  }
};

const addWhereClauseToQuery = () => {
  whereClauseItems.value.push({ column: constants.inputValues.empty, relation: "==", value: constants.inputValues.empty });
  const firstColumnConcept = queryMetadata.value.columns[queryMetadata.value.tables[0].conceptName][0];
  queryConcepts[firstColumnConcept.conceptName] = { firstColumn: firstColumnConcept.conceptName, otherColumns: [] };
};

const checkIfColumnIsAlreadyAdded = (columnConcept: Concept): boolean => {
  return queryMetadata.value.columns[queryMetadata.value.tables[0].conceptName].some(column => column.conceptName === columnConcept.conceptName);
};

const clearQueryMetadata = () => {
  queryMetadata.value = { keyspace: {}, tables: [], columns: null, dataTypes: null };
}

const removeClause = (clauseObject: any): void => {
  if (clauseObject.clause === 0) {
    const index = whereClauseItems.value.findIndex(x => x.column === clauseObject.item.column);
    const clause = whereClauseItems.value.find(x => x.column === clauseObject.item.column);
    if (index > -1 && clause) {
      whereClauseItems.value.splice(index, 1);
      if (whereClauseItems.value.length === 0) {
        delete queryConcepts.value[clause.column];
      }
    }
  }
}

const removeColumnFromQuery = (columnMetadata) => {
  if (columnMetadata) {
    const tableConceptName = queryMetadata.value.tables[0].conceptName;
    const columnConceptIndex = queryMetadata.value.columns[tableConceptName].findIndex(x => x.conceptName === columnMetadata.columnConcept.conceptName);
    if (columnConceptIndex > -1) {
      queryMetadata.value.columns[tableConceptName].splice(columnConceptIndex, 1);
      delete queryConcepts.value[columnMetadata.columnConcept.conceptName];
    }
  }
}

// Watches
watch(currentKeyspace, (newKeyspace, _) => {
  queryMetadata.value.keyspace = newKeyspace;
});

// Created
tableMetadata.value = { keyspace: {}, tables: [], columns: {}, dataTypes: {} };
queryMetadata.value = { keyspace: {}, tables: [], columns: null, dataTypes: null };
queryConcepts.value = {};

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

        & > .v-btn, & > .v-divider
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
