<template>
  <div class="query-page">
    <div class="query-section">
      <div class="header-container">
        <div class="header-container-title">
          <InputSwitch
            v-model="isScreenInViewMode"
            :disabled="!currentKeyspace"
            @update:modelValue="changeScreenMode"
          />
        <span>cassandra query {{ isScreenInViewMode ? 'view' : 'design' }}</span>
      </div>
      <div class="header-actions">
       <template v-if="!isScreenInViewMode">
          <Dropdown 
            v-model="selectedTable"
            placeholder="table"
            :disabled="!currentKeyspace"
            :options="availableTables"
            @change="changeTable">
          </Dropdown>
          <Button 
            severity="primary" 
            label="save" 
            icon="pi pi-save" 
            outlined 
            :disabled="true"
          />
        </template>
        <template v-else>
          <Dropdown
            v-model="queryInViewMode"
            placeholder="query"
            :options="availableQueries"
            @change="retrieveSavedQuery"
          >
          </Dropdown>
          <Button
            outlined
            severity="danger"
            icon="pi pi-times"
            label="delete query"
            @click="openConfirmationPopup($event, true)"
          >
          </Button>
        </template>
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
        <PlaceholderGraph 
          v-else-if="isTableRetrieveInProgress"
          placeholder-text="retrieving table metadata ..." 
        />
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
            severity="primary" 
            icon="pi pi-credit-card"
            outlined 
            :disabled="!areQueryActionsEnabled" 
            @click="openQueryTerminal" />
          <Button 
            label="run" 
            severity="primary" 
            icon="pi pi-server"
            outlined 
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
              :columns="selectedColumnConcepts" 
              :state="whereClauseItemsState"
              @add="addQueryConcept"
              @remove="removeClause"
            />
          </Transition>
          <Transition name="pop-in" mode="out-in">
            <query-items
              v-if="orderByClauseItems.length"
              :table-metadata="tableMetadata"
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
              :table-metadata="tableMetadata"
              :clause="QueryClause.GROUP_BY"
              :columns="primaryKeyColumns"
              :state="groupByClauseItemsState"
              @add="addQueryConcept"
              @remove="removeClause"
            />
          </Transition>
          <Transition name="pop-in" mode="out-in">
            <query-items
              v-if="aggregateFunctionsItems.length"
              :table-metadata="tableMetadata"
              :clause="QueryClause.GET"
              :columns="conceptsForAggregateFunctions"
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
import constants from '@/constants/constants';
import CassandraTerminal from '@/components/graphic/terminal/CassandraTerminal.vue';
import CgaTable from '@/components/utilities/CgaTable.vue';
import ConceptualGraph from '@/components/graphic/graph/ConceptualGraph.vue';
import PlaceholderGraph from '@/components/graphic/graph/PlaceholderGraph.vue';
import QueryItems from '@/components/design/QueryItems.vue';
import { 
  Concept, QueryClause, GraphMetadata, ConfigurableConcept, 
  Command, DataTableColumn, QueryItemColumnType, QueryItem, AggregateFunction 
} from '../types/types';
import { computed } from '@vue/reactivity';
import { ComputedRef, Ref, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfirm } from "primevue/useconfirm";
import { useConnectionStore } from '../stores/connection';
import { useMetadata } from '@/composables/metadata/metadata';
import { useQuery } from '@/composables/metadata/query';
import { useQueryStore } from '../stores/query';
import { useUtils } from '../composables/utils';
import { useAstra } from '@/composables/requests/astra';
import { AstraApiQueryResponse, AstraApiResponse, AstraColumnDefinition, AstraTableMetadata } from '@/types/astra/types';


const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

const tableGraph = ref();
const queryGraph = ref();
const tableMetadata: Ref<GraphMetadata> = ref(structuredClone(defaultGraphMetadata));
const queryMetadata: Ref<GraphMetadata> = ref(structuredClone(defaultGraphMetadata));
const isTableGraphReady: Ref<boolean> = ref(false);
const selectedClauseType: Ref<QueryClause | null> = ref(null);


const { getRelationTypeForColumnConcept, 
        computeConceptReferentValue,
        computeConceptReferentValueForAggregateFunction,
        computeConceptReferentValueForGroupByItems,
        computeConceptReferentValueForOrderByItems,
        getColumnInputType, 
        getCQLWhereOperatorsByColumnKind,
        getHeadersForQueryResults,
        validateQuery 
      } = useMetadata();
const { openNotificationToast, copyToClipboard, delayExecution } = useUtils();
const { generateSelectQueryAsCommands, generateQueryAsString } = useQuery();
const { retrieveAllTables, retrieveTable, retrieveQueryResults } = useAstra();

// Store state and action mappings
const connectionStore = useConnectionStore();
const queryStore = useQueryStore();
const { currentKeyspace } = storeToRefs(connectionStore); 
const { whereClauseItems, orderByClauseItems, groupByClauseItems, aggregateFunctionsItems, queryConcepts } = storeToRefs(queryStore);
    

// Retrieve and parsing of the metadata
const availableTables: Ref<string[]> = ref([]);
const selectedTable: Ref<string> = ref(constants.inputValues.empty);
const isTableRetrieveInProgress: Ref<boolean> = ref(false);


// Functions related to the retrieval and parsing of entities
const changeTable = (newTable: any): void => {
  selectedTable.value = newTable.value;
  retrieveTableMetadata();
};

const getColumnsMetadataForTableGraph = (metadata: AstraTableMetadata) => {
  let columns: Map<string, Concept[]> = new Map();
  let dataTypes: Map<string, Concept> = new Map();
  columns.set(selectedTable.value, []);
  
  const tableColumnConcepts = columns.get(selectedTable.value);
  metadata.columnDefinitions.forEach((columnDefinition: AstraColumnDefinition) => {
    let columnKind = constants.columnKinds.regular;
    if (metadata.primaryKey.partitionKey.includes(columnDefinition.name)) {
      columnKind = "partition_key";
    } else if (metadata.primaryKey.clusteringKey.includes(columnDefinition.name)) {
      columnKind = constants.columnKinds.clustering;
    }
    
    const relation = getRelationTypeForColumnConcept(columnKind)
    const columnConcept = { conceptName: columnDefinition.name, conceptType: constants.conceptTypes.column, relation, columnKind };
    tableColumnConcepts.push(columnConcept);

    const dataTypeConcept = { conceptName: columnDefinition.typeDefinition, conceptType: constants.conceptTypes.dataType };
    dataTypes.set(columnDefinition.name, dataTypeConcept);
  });

  return { columns, dataTypes };
}
  
const parseTableMetadata = (metadata: AstraTableMetadata) => {
  const tables = [{ conceptName: selectedTable.value, conceptType: constants.conceptTypes.table }];
  const {columns, dataTypes } = getColumnsMetadataForTableGraph(metadata);

  setConceptualGraphMetadata(tableMetadata, tables, columns, dataTypes);
  setConceptualGraphMetadata(queryMetadata, tables);
  
  isTableGraphReady.value = true;
};

const retrieveAvailableTables = async (): Promise<void> => {
  const response = await retrieveAllTables(currentKeyspace.value);
  if (response && response.data) {
    const responseData = response.data as AstraApiResponse;
    if (responseData.data) {
      const mappedTables = responseData.data.map((table: any) => table.name);
      availableTables.value = JSON.parse(JSON.stringify(mappedTables));
    } else {
      openNotificationToast(response.data.message, 'error')
    }
  } else {
    openNotificationToast('Unexpected error occured', 'error');
  }
};

const retrieveTableMetadata = async (): Promise<void> => {
  isTableRetrieveInProgress.value = true;

  await delayExecution(3000);

  const response = await retrieveTable(currentKeyspace.value, selectedTable.value);
  if (response && response.data) {
    const responseData = response.data as AstraApiResponse;
    if (responseData.data) {
      parseTableMetadata(responseData.data);
      isTableRetrieveInProgress.value = false;
    
      // Wait for the graph components to be mounted on the DOM,
      // then draw the arrows between the concepts
      await nextTick();
      tableGraph.value.rerenderArrows();

      if (queryGraph.value && typeof queryGraph.value.rerenderArrows === 'function') {
        await nextTick();
        queryGraph.value.rerenderArrows();
      }

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

const areAllColumnsSelected: ComputedRef<boolean> = computed(() => {
  return selectedColumnConcepts.value.length === tableMetadata.value.columns.get(tableMetadata.value.tables[0].conceptName).length;
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

const conceptsForAggregateFunctions: ComputedRef<Concept[]> = computed(() => {
  const aggregationFunctionConcepts = [ ... tableColumnConcepts.value ];
  if (!areAllColumnsSelected.value) {
    aggregationFunctionConcepts.push({ conceptName: 'all', conceptType: constants.conceptTypes.column });
  }
  return aggregationFunctionConcepts;
});

const selectedColumnConcepts: ComputedRef<Concept[]> = computed(() => {
  return queryMetadata.value.columns ? queryMetadata.value.columns.get(queryMetadata.value.tables[0].conceptName): [];
});

const primaryKeyColumns: ComputedRef<Concept[]> = computed(() => {
  return tableMetadata.value.columns 
    ? tableMetadata.value.columns.get(tableMetadata.value.tables[0].conceptName).filter((concept: Concept) => concept.columnKind === 'partition_key' || concept.columnKind === constants.columnKinds.clustering) 
    : [];
});

const tableColumnConcepts: ComputedRef<Concept[]> = computed(() => {
  return tableMetadata.value.columns.size ? tableMetadata.value.columns.get(tableMetadata.value.tables[0].conceptName) : [];
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
    queryGraph.value.rerenderArrows();
  } else {
    openNotificationToast(`column ${columnConcept.conceptName} already added to the query`, 'error');
  }
};

const addQueryConcept = async (queryClauseData: any): Promise<void> => {
  switch (queryClauseData.clause) {
    case QueryClause.WHERE:
      queryConcepts.value[QueryClause.WHERE].columns.push({ conceptName: queryClauseData.item.column, conceptType: constants.conceptTypes.column });
      queryConcepts.value[QueryClause.WHERE].conceptReferent = computeConceptReferentValue(whereClauseItems.value);
      break;
    case QueryClause.GROUP_BY:
      queryConcepts.value[QueryClause.GROUP_BY].columns.push({ conceptName: queryClauseData.item.column, conceptType: constants.conceptTypes.column });
      queryConcepts.value[QueryClause.GROUP_BY].conceptReferent = computeConceptReferentValueForGroupByItems(queryConcepts.value);
      break;
    case QueryClause.ORDER_BY:
      queryConcepts.value[QueryClause.ORDER_BY].columns.push({ conceptName: queryClauseData.item.column, conceptType: constants.conceptTypes.column });
      queryConcepts.value[QueryClause.ORDER_BY].conceptReferent = computeConceptReferentValueForOrderByItems(orderByClauseItems.value);
      break;
    case QueryClause.GET:
      queryConcepts.value[QueryClause.GET][<AggregateFunction>queryClauseData.item.valueSelect].aggregatedColumns.push({ conceptName: queryClauseData.item.column, conceptType: '' });
      queryConcepts.value[QueryClause.GET][<AggregateFunction>queryClauseData.item.valueSelect].conceptReferent = computeConceptReferentValueForAggregateFunction(queryClauseData.item.valueSelect, queryConcepts.value);
      break;
  }
  await nextTick();
  queryGraph.value.rerenderArrows();
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
      const canOrderByClauseBeAdded = checkIfClusteringColumnsAreSelected();
      if (canOrderByClauseBeAdded) {
        orderByClauseItems.value.push({ 
          column: constants.inputValues.empty, 
          valueSelect: constants.clusteringOrders.ascending,
          isValueValid: true
        });
      } else {
        openNotificationToast('please select a clustering column', 'error');
      }
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

const checkIfClusteringColumnsAreSelected = (): boolean => {
  return queryMetadata.value.columns.get(queryMetadata.value.tables.at(0).conceptName).some((columnConcept: Concept) => columnConcept.columnKind === constants.columnKinds.clustering);
};


// Functions related to the removal of query columns, clauses and data
const clearQueryMetadata = () => {
  // Reset the state of the clause items and query concepts
  queryStore.resetQueryClauseItems();
  queryStore.resetQueryConcepts();
  
  // Reset the commands for Cassandra Terminal
  cqlQueryCommands.value = [];

  // Re-draw the Query Conceptual Graph without the query concepts
  if (queryGraph.value && typeof queryGraph.value.rerenderArrows === 'function') {
    queryGraph.value.rerenderArrows();
  }
  
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

const removeColumnFromQuery = async (columnMetadata): Promise<void> => {
  if (columnMetadata) {
    
    const tableConceptName = queryMetadata.value.tables[0].conceptName;
    const columnConceptIndex = queryMetadata.value.columns.get(tableConceptName)!.findIndex(x => x.conceptName === columnMetadata.columnConcept.conceptName);
    
    if (columnConceptIndex > -1) {
      queryMetadata.value.columns.get(tableConceptName)!.splice(columnConceptIndex, 1);

      queryConcepts.value = JSON.parse(JSON.stringify(constants.defaultQueryConcepts));
      
      await nextTick();
      queryGraph.value.rerenderArrows();
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
  const response = await retrieveQueryResults(currentKeyspace.value, queryMetadata.value.tables.at(0).conceptName, queryMetadata.value);
  if (response && response.data) {
    const responseData = response.data as AstraApiQueryResponse;
    if (responseData.count) {
      parseQueryResults(responseData.rows)
    } else {
      openNotificationToast('no records in the database for the current query', 'info');
    }
  }
};

const openQueryTerminal = (): void => {
  cqlQueryCommands.value = generateSelectQueryAsCommands(tableMetadata.value, queryMetadata.value, queryConcepts.value);
  isQueryTerminalOpened.value = true;
};

const parseQueryResults = (results: any[]) => {
  queryResultsTableHeaders.value = [];
  queryResults.value = [];

  queryResultsTableHeaders.value = getHeadersForQueryResults(queryMetadata.value, queryConcepts.value);
  queryResults.value = [...results];

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

const openConfirmationPopup = (event: any, isForDelete: boolean = false): void => {
  if (!isForDelete) {
    confirm.require({
      target: event.currentTarget,
      group: 'clear',
      message: 'are you sure you want to clear the current query?',
      icon: 'pi pi-question-circle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        clearQueryMetadata();
      }
    });
  }
};

// Functionalities related to the Query View mode
const availableQueries: Ref<string[]> = ref([]);
const isScreenInViewMode: Ref<boolean> = ref(false);
const isQueryInViewModeReady: Ref<boolean> = ref(false);
const queryInViewMode: Ref<string> = ref(constants.inputValues.empty);

const changeScreenMode = (isViewMode: boolean): void => {
  if (isViewMode) {
    tableMetadata.value = structuredClone(defaultGraphMetadata);
    queryMetadata.value = structuredClone(defaultGraphMetadata);
    retrieveSavedQueries();
  } else {
    availableQueries.value = [];
    queryInViewMode.value = constants.inputValues.empty;
    isQueryInViewModeReady.value = false;
    tableMetadata.value = structuredClone(defaultGraphMetadata);
    queryMetadata.value = structuredClone(defaultGraphMetadata);
  }
};  

const parseTableForViewMode = async (): Promise<void> => {
  // TODO:
};

const parseQueryForViewMode = async (): Promise<void> => {
  // TODO:
};

const retrieveSavedQuery = async (): Promise<void> => {
  // TODO:
};

const retrieveSavedQueries = async (): Promise<void> => {
  // TODO:
  parseTableForViewMode();
  parseQueryForViewMode();
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
  height: calc(100vh)
  padding: 0

  .query-section
    @include containers.flex-container($flex-direction: column)
    height: calc(100vh - variables.$cga-topbar-height)

    .header-container .header-container-title
      @include containers.flex-container($align-items: center)

      .p-inputswitch
        margin-right: 1rem

    .query-canvas-wrapper
      padding: 10px
      height: 100%
      width: 100%
      border-top: none

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
