<template>
  <div class="query-page">
    <div class="query-section">
    <div class="header-container elevation-1">
      <div>
        <span>cassandra query design</span>
      </div>
      <div class="header-actions">
        <Dropdown 
          v-model="selectedTable"
          placeholder="table"
          :disabled="!currentKeyspace"
          :options="availableTables"
          @change="changeTable">
        </Dropdown>
        <Button 
          label="save"  
          outlined 
          severity="primary" 
          :disabled="true"
        />
      </div>
    </div>
    <Splitter class="query-canvas-wrapper">
      <SplitterPanel>
        <ConceptualGraph
          v-if="selectedTable && !isTableRetrieveInProgress" 
          ref="tableGraph"
          graph-key="tableGraph"
          :graph-metadata="tableMetadata"
          :are-columns-selectable="true"
          :are-tables-collapsable="false"
          @select="addColumnToQuery" 
        />
        <ProgressSpinner v-else-if="isTableRetrieveInProgress" />
      </SplitterPanel>
      <SplitterPanel>
        <ConceptualGraph 
          v-if="queryMetadata && queryMetadata.columns && queryMetadata.columns.size" 
          ref="queryGraph"
          graph-key="queryGraph"
          :graph-metadata="queryMetadata"
          :are-tables-collapsable="false"
          :are-columns-selectable="false"
          :are-column-concepts-deletable="true"
          :query-concepts="queryConcepts"
          :is-query-graph="true"
          @remove="removeColumnFromQuery"
        />
      </SplitterPanel>
    </Splitter>
    </div>
    <div class="query-toolbox">
      <div class="query-panel-header">
        <div class="query-panel-header-info">
          <div class="info-block">
            <span>keyspace:</span>
            <span v-if="currentKeyspace">{{ currentKeyspace }}</span>
            <template v-else>
              <i class="pi pi-exclamation-circle" style="color: red; font-size: 1rem;"></i>
              <span>no keyspace selected</span>
            </template>
          </div>
          <div class="info-block">
            <span>table:</span>
            <span v-if="isTableGraphReady">{{ tableMetadata.tables[0]?.conceptName }}</span>
            <template v-else>
              <i class="pi pi-exclamation-circle" style="color: red; font-size: 1rem;"></i>
              <span>no table concept selected</span>
            </template>
          </div>
        </div>
        <div class="query-panel-header-actions">
          <Dropdown v-model="selectedClauseType"
            placeholder="add to query" 
            :disabled="!areQueryActionsEnabled"
            :options="[QueryClause.WHERE, QueryClause.GROUP_BY, QueryClause.ORDER_BY, QueryClause.GET]"
            @change="addClauseToQuery(selectedClauseType)"
          />
          <ConfirmPopup group="clear">
            <template #message="slotProps">
              <div class="flex align-content-center p-4">
                <i :class="slotProps.message.icon" style="font-size: 1.25rem;"></i>
                <p class="pl-2">{{ slotProps.message.message }}</p>
              </div>
            </template>
          </ConfirmPopup>
          <Button 
            label="clear" 
            text 
            severity="secondary" 
            :disabled="!areQueryActionsEnabled" 
            @click="openConfirmationPopup($event)" 
          />
          <Divider layout="vertical" />
          <Button 
            label="command" 
            outlined 
            severity="primary" 
            :disabled="!areQueryActionsEnabled" 
            @click="openQueryTerminal" />
          <Button 
            label="run" 
            outlined 
            severity="primary" 
            :disabled="!areQueryActionsEnabled" 
            @click="runQuery" 
          />
        </div>
      </div>
      <v-divider></v-divider>
      <div class="query-panel-container">
        <div class="query-panel-item">
          <Transition name="pop-in" mode="out-in">
            <query-items
              v-if="whereClauseItems.length" 
              :table-metadata="tableMetadata"
              :clause="QueryClause.WHERE" 
              :columns="columnConcepts" 
              :state="whereClauseItemsState"
              @add="addQueryConcept"
              @remove="removeClause"
            />
          </Transition>
          <Transition name="pop-in" mode="out-in">
            <query-items
              v-if="orderByClauseItems.length"
              :clause="QueryClause.ORDER_BY"
              :columns="clusteringColumns"
              :state="orderByClauseItemsState"
              @add="addQueryConcept"
              @remove="removeClause"
            />
          </Transition>
          <Transition name="pop-in" mode="out-in">
            <query-items
              v-if="groupByClauseItems.length"
              :clause="QueryClause.GROUP_BY"
              :columns="columnConcepts"
              :state="groupByClauseItemsState"
              @add="addQueryConcept"
              @remove="removeClause"
            />
          </Transition>
          <Transition name="pop-in" mode="out-in">
            <query-items
              v-if="aggregateFunctionsItems.length"
              :clause="QueryClause.GET"
              :columns="columnConcepts"
              :state="aggregateFunctionsItemsState"
              @add="addQueryConcept"
              @remove="removeClause"
            />
          </Transition>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="isQueryTerminalOpened" :show-header="false" modal>
    <CassandraTerminal
      :is-terminal-opened="isQueryTerminalOpened"
      :is-terminal-readonly="false"
      :commands="cqlQueryCommands"
      @close="closeCassandraTerminal" 
    />
  </Dialog>
  <Dialog v-model:visible="isQueryResultsModalOpened" header="query results" :style="{ width: '50vw'}" modal maximizable>
    <CgaTable :columns="queryResultsTableHeaders" :items="queryResults" />
  </Dialog>
</template>

<script setup lang="ts">
// Constants, types and utility imports
import constants from '../constants/constants';
import { Concept, QueryClause, QueryConcepts, ColumnMetadata, GraphMetadata, ConfigurableConcept, Command, DataTableColumn, QueryItemColumnType, QueryItem } from '../types/types';
import { manageRequest } from '../includes/requests';

// Component imports
import ConceptualGraph from '../components/graphic/graph/ConceptualGraph.vue';
import QueryItems from '../components/design/QueryItems.vue';
import CassandraTerminal from '../components/graphic/terminal/CassandraTerminal.vue';
import CgaTable from '../utilities/CgaTable.vue';

// Store imports
import { useConnectionStore } from '../stores/connection';
import { useQueryStore } from '../stores/query';

// Composable imports
import { useMetadata } from '../composables/metadata';
import { useConfirm } from "primevue/useconfirm";
import { useUtils } from '../composables/utils';
import { useQuery } from '../composables/query';

// Vue imports
import { storeToRefs } from 'pinia';
import { ComputedRef, Ref, nextTick, ref, watch } from 'vue';
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
const queryConcepts: Ref<QueryConcepts> = ref({ ... constants.defaultQueryConcepts });

const { getRelationTypeForColumnConcept, 
        getConceptReferentValue, 
        getColumnInputType, 
        getCQLWhereOperatorsByColumnKind,
        getQuerySelectionConceptNames,
        getHeadersForQueryResults,
        validateQuery 
      } = useMetadata();

const { openNotificationToast, copyToClipboard } = useUtils();
const { generateSelectQueryAsCommands, generateQueryAsString } = useQuery();

// Store state and action mappings
const connectionStore = useConnectionStore();
const queryStore = useQueryStore();
const { currentKeyspace } = storeToRefs(connectionStore); 
const { whereClauseItems, orderByClauseItems, groupByClauseItems, aggregateFunctionsItems } = storeToRefs(queryStore);

// Retrieve and parsing of the metadata
const availableTables: Ref<string[]> = ref([]);
const selectedTable: Ref<string> = ref(constants.inputValues.empty);
const isTableRetrieveInProgress: Ref<boolean> = ref(false);


// Functions related to the retrieval and parsing of entities
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
      openNotificationToast(response.data.message, 'error')
    }
  } else {
    openNotificationToast('Unexpected error occured', 'error');
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
      openNotificationToast(response.data.message, 'error');
    }
  } else {
    openNotificationToast('unexpected error occured', 'error');
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
const isTableMetadataReady: ComputedRef<boolean> = computed(() => {
  return !!currentKeyspace.value && !!tableMetadata.value.tables.length && !!tableMetadata.value.columns.size && !!tableMetadata.value.dataTypes.size;
});

const areQueryActionsEnabled: ComputedRef<boolean> = computed(() => {
  return !!isTableMetadataReady.value && !!queryMetadata.value.tables.length && !!queryMetadata.value.columns.size;
});


// Functions related to the addition of query columns, clauses and data
const whereClauseItemsState: Ref<string> = ref(constants.inputValues.empty);
const orderByClauseItemsState: Ref<string> = ref(constants.inputValues.empty);
const groupByClauseItemsState: Ref<string> = ref(constants.inputValues.empty);
const aggregateFunctionsItemsState: Ref<string> = ref(constants.inputValues.empty);

const columnConcepts = computed(() => {
  return queryMetadata.value.columns.size ? queryMetadata.value.columns.get(queryMetadata.value.tables[0].conceptName): [];
});

const clusteringColumns: ComputedRef<Concept[]> = computed(() => {
  const currentTable: Concept | undefined = tableMetadata.value.tables.at(0);
  if (!currentTable) {
    return [];
  }
  const currentColumns: Concept[] | undefined = tableMetadata.value.columns.get(currentTable.conceptName);
  if (!currentColumns) {
    return [];
  }
  return currentColumns.filter(concept => concept.columnKind === constants.columnKinds.clustering);
});

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
    openNotificationToast(`column ${columnConcept.conceptName} already added to the query`, 'error');
  }
};

const addQueryConcept = async (queryClauseData: any): Promise<void> => {
  switch (queryClauseData.clause) {
    case QueryClause.WHERE:
      queryConcepts.value[QueryClause.WHERE].columns.push({ conceptName: queryClauseData.item.column, conceptType: constants.conceptTypes.column });
      queryConcepts.value[QueryClause.WHERE].conceptReferent = getConceptReferentValue(whereClauseItems.value);
      break;
    case QueryClause.ORDER_BY:
      queryConcepts.value[QueryClause.ORDER_BY].columns.push({ conceptName: queryClauseData.item.column, conceptType: constants.conceptTypes.column });
      queryConcepts.value[QueryClause.ORDER_BY].conceptReferent = getConceptReferentValue(orderByClauseItems.value);
      break;
  }
  await nextTick();
  queryGraph.value.removeArrows();  
  queryGraph.value.drawArrowsForConcepts();
  queryGraph.value.drawArrowsForQueryConcepts();
};

const addClauseToQuery = (clause: QueryClause | null): void => {
  selectedClauseType.value = null;
  switch (clause) {
    case QueryClause.WHERE:
      const tableConcept: Concept | undefined = queryMetadata.value.tables.at(0);
      const firstColumnConcept: ConfigurableConcept | undefined = tableConcept ? queryMetadata.value.columns.get(tableConcept.conceptName)?.at(0) : undefined;
      whereClauseItems.value.push({ 
        column: firstColumnConcept ? firstColumnConcept.conceptName : constants.inputValues.empty, 
        relation: "=", 
        value: constants.inputValues.empty, 
        chipValues: null, 
        currentChipValue: '',
        isValueValid: true,
        operators: firstColumnConcept ? getCQLWhereOperatorsByColumnKind(firstColumnConcept.columnKind) : [],
        type: firstColumnConcept ? getColumnInputType(firstColumnConcept, tableMetadata.value) : 'other'
      });
      break;
    case QueryClause.GROUP_BY:
      groupByClauseItems.value.push({
        column: constants.inputValues.empty,
        value: constants.inputValues.empty,
        isValueValid: true
      });
      break;
    case QueryClause.ORDER_BY:
      orderByClauseItems.value.push({ 
        column: constants.inputValues.empty, 
        value: constants.inputValues.empty,
        isValueValid: true
      });
      break;
    case QueryClause.GET:
      aggregateFunctionsItems.value.push({
        column: constants.inputValues.empty,
        value: constants.inputValues.empty,
        isValueValid: true
      });
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

// Functions related to the removal of query columns, clauses and data
const clearQueryMetadata = () => {
  // Clear query metadata and columns set for query
  queryMetadata.value.columns.set(queryMetadata.value.tables[0].conceptName, []);
  queryConcepts.value[QueryClause.WHERE].columns = [];
  // Clear query clauses
  whereClauseItems.value = [];
  orderByClauseItems.value = [];
  groupByClauseItems.value = [];
  // Re-draw the Query Conceptual Graph without the query concepts
  queryGraph.value.removeArrows();
  queryGraph.value.drawInitialArrows();
  queryGraph.value.drawArrowsForConcepts();
};

const getItemsByClauseType = (clause: QueryClause): QueryItem[] => {
  switch (clause) {
    case QueryClause.WHERE:
      return whereClauseItems.value;
    case QueryClause.ORDER_BY:
      return orderByClauseItems.value;
    case QueryClause.GROUP_BY:
      return groupByClauseItems.value;
    case QueryClause.GET:
      return aggregateFunctionsItems.value;
    default:
      return [];
  }
};

const removeClause = (clauseObject: any): void => {
  const clauseItems = getItemsByClauseType(clauseObject.clause)
  
  const index = clauseItems.findIndex(x => x.column === clauseObject.item.column);
  const clause = clauseItems.find(x => x.column === clauseObject.item.column);
  if (index > -1 && clause) {
    clauseItems.splice(index, 1);
    if (clauseItems.length === 0) {
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

// Functions related to the query actions
const isQueryTerminalOpened: Ref<boolean> = ref(false);
const cqlQueryCommands: Ref<Command[]> = ref([]);

const queryResults: Ref<any[]> = ref([]);
const queryResultsTableHeaders: Ref<DataTableColumn[]> = ref([]);
const isQueryResultsModalOpened: Ref<boolean> = ref(false);

const adjustInvalidOrderByClause = (): void => {
  // Adjustment for an invalid order by clause
  // Case: order by used without restricting all the partition keys
  
  const currentTable: Concept | undefined = tableMetadata.value.tables.at(0);
  if (!currentTable) {
    return ;
  }
  const currentColumns: Concept[] | undefined = tableMetadata.value.columns.get(currentTable.conceptName);
  if (!currentColumns) {
    return ;
  }

  whereClauseItems.value = [];
  currentColumns.forEach((columnConcept: Concept) => {
    if (columnConcept.columnKind === 'partition_key') {
      whereClauseItems.value.push({
        column: columnConcept.conceptName,
        relation: '=',
        value: getDefaultValueForConcept(columnConcept).toString(),
        chipValues: null,
        currentChipValue: '',
        isValueValid: true,
        operators: getCQLWhereOperatorsByColumnKind(columnConcept.columnKind),
        type: getColumnInputType(columnConcept, tableMetadata.value)
      });
      whereClauseItemsState.value = 'warn';
    }
  });

};

const closeCassandraTerminal = (): void => {
  const cqlQuery = generateQueryAsString(cqlQueryCommands.value);
  copyToClipboard(cqlQuery);
  openNotificationToast('cql query was copied to clipboard', 'info');
  isQueryTerminalOpened.value = false;
}

const getDefaultValueForConcept = (concept: Concept): boolean | number | string => {
  const columnType: QueryItemColumnType = getColumnInputType(concept, tableMetadata.value);
  let defaultValue: boolean | number | string;
  switch (columnType) {
    case 'string':
    case 'null':
    case 'other':
      defaultValue = constants.inputValues.empty;
      break;
    case 'integer':
    case 'float':
      defaultValue = 0;
      break;
    case 'boolean':
      defaultValue = true;
      break;
  }
  return defaultValue;
};

const fetchQueryResuls = async (): Promise<void> => {
  const response = await manageRequest(constants.requestTypes.GET, 'query_results', {
    query: generateQueryAsString(cqlQueryCommands.value)
  });
  if (response && response.data) {
    if (response.data.status === constants.requestStatus.SUCCESS) {
      parseQueryResults(response.data.results);
    } else {
      openNotificationToast(response.data.message, 'error');
    }
  }
};

const openQueryTerminal = (): void => {
  cqlQueryCommands.value = generateSelectQueryAsCommands(tableMetadata.value, queryMetadata.value);
  isQueryTerminalOpened.value = true;
};

const parseQueryResults = (results: any[]) => {
  queryResultsTableHeaders.value = [];
  queryResults.value = [];

  const currentColumns = getQuerySelectionConceptNames(queryMetadata.value);
  queryResultsTableHeaders.value = getHeadersForQueryResults(queryMetadata.value);

  results.forEach(resultItem => {
    let resultForTable = {};
    for (let index = 0; index < resultItem.length; index ++) {
      resultForTable[currentColumns[index]] = resultItem[index];
    }
    queryResults.value.push(resultForTable);
  });

  isQueryResultsModalOpened.value = true;
};

const runQuery = (): void => {
  const [error, errorCode] = validateQuery(tableMetadata.value, queryMetadata.value, whereClauseItems.value, orderByClauseItems.value);
  if (error) {
    openNotificationToast(error, 'error');
    if (errorCode == 1) {
      adjustInvalidOrderByClause();
      openNotificationToast('query items have been adjusted', 'warn', 'partition columns have been restricted with a where clause');
    }
  } else {
    fetchQueryResuls();
  }
};

// Functions related to some utilities
const confirm = useConfirm();

const openConfirmationPopup = (event: any): void => {
  confirm.require({
    target: event.currentTarget,
    group: 'clear',
    message: 'are you sure you want to delete the current query?',
    icon: 'pi pi-question-circle',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
    accept: () => {
      clearQueryMetadata();
    }
  });
};

// Watchers
watch(currentKeyspace, (newKeyspace, _) => {
  tableMetadata.value.keyspace.conceptName = newKeyspace
  queryMetadata.value.keyspace.conceptName = newKeyspace;
});

if (currentKeyspace.value) {
  retrieveAvailableTables();
} else {
  openNotificationToast('no selected keyspace', 'warn');
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
      padding: 10px
      height: 100%
      width: 100%

      .p-splitter-panel
        @include containers.flex-container($align-items: center, $justify-content: center)

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
        @include containers.flex-container($align-items: center)
      
        & > .info-block
          @include containers.flex-container($align-items: center)
          margin-right: 1.25rem

          & > span:first-of-type
            margin-right: 0.5rem

          & > span:last-of-type
            color: variables.$cassandra-app-blue

          & > .pi 
            margin-right: 0.5rem
          & > .pi + span
            color: variables.$cassandra-red
      
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

.pop-in-enter-active 
  transition: all 0.3s ease-out

.pop-in-leave-active
  transition: all 0.3s ease-out

.pop-in-enter-from, .pop-in-leave-to
  transform: translateX(3rem)
  opacity: 0

</style>
