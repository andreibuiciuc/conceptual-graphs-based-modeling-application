<template>
  <div class="query-section">
    <div class="query-header-container elevation-1">
      <div>
        <span>Query Design</span>
      </div>
      <div class="query-header-actions">
        <v-select v-model="selectedTable"
          variant="plain"
          :disabled="!currentKeyspace"
          :hide-details="true"
          :items="availableTables"
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
          :no-keyspace="true"
          :keyspace-concept="queryMetadata.keyspace"
          :table-concepts="tableMetadata.tables"
          :column-concepts="tableMetadata.columns"
          :data-type-concepts="tableMetadata.dataTypes"
          @select="addColumnToQuery" />
        <v-progress-circular indeterminate v-else-if="isTableRetrieveInProgress"></v-progress-circular>
      </div>
      <div class="query-canvas">
        <conceptual-graph
          :are-columns-selectable="false"
          :areColumnConceptsDeletable="true"
          :keyspace-concept="queryMetadata.keyspace"
          :table-concepts="queryMetadata.tables"
          :column-concepts="queryMetadata.columns"
          :data-type-concepts="queryMetadata.dataTypes"
          @remove="removeColumnFromQuery" />
      </div>
    </div>
    <div class="query-toolbox">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel title="Query Console">
          <v-expansion-panel-text>
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
                  <span v-if="isTableGraphReady">{{ tableMetadata.tables[0].conceptName }}</span>
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
                  @click.prevent="setConceptualGraphMetadata('queryMetadata')">
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
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import constants from '../constants/constants';
import useUserStore from "@/stores/user";
import useConnectionStore from '../stores/connection';
import useNotificationStore from '../stores/notification';
import { mapActions, mapState } from 'pinia';
import { manageRequest } from "@/includes/requests";

import ConceptualGraph from '../components/graphic/graph/ConceptualGraph.vue';

export default {
  name: "QueryView",
  data: () => ({
    availableTables: [],
    selectedTable: constants.inputValues.empty,
    //
    tableMetadata: null,
    isTableRetrieveInProgress: false,
    isTableGraphReady: false,
    //
    queryMetadata: null
  }),
  components: {
    ConceptualGraph
  },
  computed: {
    // These computed properties are mapped from the Connection Store
    ...mapState(useConnectionStore, ['currentKeyspace']),
    // These computed properties are related to the Query Panel actions
    isQueryActionDisabled: function () { return !this.currentKeyspace || !this.tableMetadata.tables.length; }
  },
  methods: {
    // These methods are mapped from the Notification Store
    ...mapActions(useNotificationStore, ['setUpSnackbarState']),
    // These methods handle events of components
    addColumnToQuery: function (columnConcept) {
      const isColumnAlreadyAdded = this.checkIfColumnIsAlreadyAdded(columnConcept);
      if (!isColumnAlreadyAdded) {
        this.queryMetadata.columns[this.queryMetadata.tables[0].conceptName].push(columnConcept);
      } else {
        this.setUpSnackbarState(false, "Column already added to the query");
      }
    },
    changeTable: function (newTable) {
      this.selectedTable = newTable;
      this.retrieveTableMetadata();
    },
    removeColumnFromQuery: function (columnMetadata) {
      if (columnMetadata) {
        const tableConceptName = this.queryMetadata.tables[0].conceptName;
        const columnConceptIndex = this.queryMetadata.columns[tableConceptName].findIndex(x => x.conceptName === columnMetadata.columnConcept.conceptName);
        if (columnConceptIndex > -1) {
          this.queryMetadata.columns[tableConceptName].splice(columnConceptIndex, 1);
        }
      }
    },
    // These methods handle the retrieve of entities
    parseTableMetadata: function (metadata) {
      const tables = [{ conceptName: this.selectedTable, conceptType: constants.conceptTypes.table }];
      const {columns, dataTypes } = this.getColumnsMetadataForTableGraph(metadata);

      this.setConceptualGraphMetadata("tableMetadata", tables, columns, dataTypes);
      this.setConceptualGraphMetadata("queryMetadata", tables, {[this.selectedTable]: [] });
      
      this.isTableGraphReady = true;
    },
    retrieveAvailableTables: async function () {
      const response = await manageRequest(constants.requestTypes.GET, "tables", { 
        keyspace_name: this.currentKeyspace
      });
      if (response) {
        if (response.data.status === constants.requestStatus.SUCCESS) {
          this.availableTables = JSON.parse(JSON.stringify(response.data.tables));
        }
      }
    },
    retrieveTableMetadata: async function () {
      this.isTableRetrieveInProgress = true;
      const response = await manageRequest(constants.requestTypes.GET, "table_metadata", {
        keyspace_name: this.currentKeyspace,
        table_name: this.selectedTable
      });
      if (response && response.data && response.data.status === constants.requestStatus.SUCCESS) {
        this.parseTableMetadata(response.data.table_metadata);
      }
      this.isTableRetrieveInProgress = false;
    },
    // These methods handle some utilities
    checkIfColumnIsAlreadyAdded: function (columnConcept) {
      return this.queryMetadata.columns[this.queryMetadata.tables[0].conceptName].some(column => column.conceptName === columnConcept.conceptName);
    },
    getColumnsMetadataForTableGraph: function (metadata) {
      let columns = { [this.selectedTable]: [] };
      let dataTypes = {};
      
      // TODO: Complete this with concept relations
      metadata.forEach(columnData => {
        const columnConcept = { conceptName: columnData.column_name, conceptType: constants.conceptTypes.column };
        columns[this.selectedTable].push(columnConcept);
        dataTypes[columnData.column_name] = { conceptName: columnData.column_type, conceptType: constants.conceptTypes.dataType };        
      });

      return { columns, dataTypes };
    },
    setConceptualGraphMetadata: function (conceptualGraphProperty, tables = [], columns = {}, dataTypes = {}) {
        this[conceptualGraphProperty].keyspace = { conceptName: this.currentKeyspace, conceptType: constants.conceptTypes.keyspace };
        this[conceptualGraphProperty].tables = JSON.parse(JSON.stringify(tables));
        this[conceptualGraphProperty].columns = { ... columns };
        if (conceptualGraphProperty === "tableMetadata") {
          this[conceptualGraphProperty].dataTypes = { ... dataTypes };
        } else {
          this[conceptualGraphProperty].dataTypes = null;
        }
    }
  },
  created: function () {
    this.tableMetadata = { keyspace: {}, tables: [], columns: {}, dataTypes: {} };
    this.queryMetadata = { keyspace: {}, tables: [], columns: {}, dataTypes: {} };
    if (this.currentKeyspace) {
      this.retrieveAvailableTables();
    } else {
      this.setUpSnackbarState(false, "No selected keyspace.");
    }
  },
  watch: {
    currentKeyspace: function (newValue) {
      this.queryMetadata.keyspace = newValue;
    }
  },
  beforeRouteEnter: function (_from, _to, next) {
    const store = useUserStore();
    if (store.isUserLoggedIn) {
      next();
    } else {
      next({ name: "home" });
    }
  },
};
</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.query-section
  @include containers.flex-container($flex-direction: column)
  height: calc(100vh - variables.$cga-topbar-height)
  margin-top: variables.$cga-topbar-height

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
</style>
