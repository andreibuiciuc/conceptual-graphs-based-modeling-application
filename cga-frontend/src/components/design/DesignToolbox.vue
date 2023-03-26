<template>
  <div>
    <v-card
      variant="outlined"
      class="toolbox"
      :class="{ 'toolbox-warning': !keyspace }"
    >
      <v-card-title>
        <div class="d-flex justify-center align-center">
          Conceptual Graph Design Toolbox
          <v-icon v-if="!keyspace">mdi-alert-box-outline</v-icon>
        </div>
      </v-card-title>
     
      <v-card-text>

        <div class="d-flex">
          <v-text-field v-model="currentTableConcept.conceptName"
            variant="outlined"
            label="Table name"
            :clearable="true"
            :readonly="isGraphRendered"
            :hide-details="true"
            :disabled="!keyspace"
            @click:clear="setupToolboxData"
          >
          </v-text-field>
          <v-btn
            variant="text"
            class="icon-button"
            :class="{ 'icon-button--disabled': isGraphRendered }"
            :disabled="!isAddTableConceptButtonEnabled"
            @click.prevent="validateTableName"
          >
            <v-icon v-if="isGraphRendered">mdi-check</v-icon>
            <v-icon v-else>mdi-plus</v-icon>
          </v-btn>
        </div>
        
        <v-divider></v-divider>

        <div class="column-concept-container">
          <div class="column-concept-config">
            <v-text-field v-model="currentColumnConcept.conceptName"
              variant="outlined"
              label="New column name"
              :hide-details="true"
              :error="doesColumnConceptAlreadyExists"
              :disabled="!currentTableConcept.conceptName || !isGraphRendered"
            >
            </v-text-field>
            <span class="error-message">{{ getErrorMessage }}</span>
            <div class="column-selects">
              <v-select v-model="currentColumnConcept.kind"
                variant="outlined"
                class="data-type-select"
                label="Column Option"
                :hide-details="true"
                :disabled="
                  !currentColumnConcept.conceptName ||
                  doesColumnConceptAlreadyExists
                "
                :items="columnOptionsItems"
              >
              </v-select>
              <v-select v-model="currentDataTypeConcept.conceptName"
                variant="outlined"
                class="data-type-select"
                label="Data Type"
                :hide-details="true"
                :disabled="
                  !currentColumnConcept.conceptName ||
                  doesColumnConceptAlreadyExists
                "
                :items="columnDataTypeItems"
              >
              </v-select>
            </div>
          </div>
          <v-btn
            variant="text"
            class="icon-button--double"
            :disabled="!isAddColumnConceptButtonEnabled"
            @click.prevent="addColumnConceptToGraph"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
       
        <v-divider></v-divider>
        
        <div class="clustering-options-container">
          <v-select v-model="currentClusteringOrderOptions.clusteringColumn"
            variant="outlined"
            style="margin-right: 1rem;"
            label="Clustering Column"
            :clearable="true"
            :hide-details="true"
            :items="clusteringColumnItems"
            :disabled="!isClusteringSectionEnabled"
            @click:clear="clearClusteringColumn">
          </v-select>
          <v-select v-model="currentClusteringOrderOptions.clusteringOrder"
            variant="outlined"
            label="Order"
            :hide-details="true"
            :items="clusteringOrderItems"
            :disabled="!isClusteringSectionEnabled"
            :loading="isSaveTriggered">
          </v-select>
        </div>
      
      </v-card-text>
    </v-card>

    <v-card
      variant="outlined"
      class="toolbox"
      style="margin-top: 40px;"
      :class="{ 'toolbox-warning': !keyspace }"
    >
      <v-card-title class="d-flex justify-center">Design Toolbox Actions</v-card-title>
      <v-card-text class="action-row">
        <v-btn
          class="action-button"
          variant="outlined"
          :disabled="!isQueryGeneratorButtonEnabled || isSaveTriggered"
          @click.prevent="generateQuery(false)"
        >
          COMMAND
        </v-btn>
        <v-btn
          class="action-button"
          variant="outlined"
          :disabled="!isQueryGeneratorButtonEnabled || isSaveTriggered"
          :loading="isSaveTriggered"
          @click.prevent="saveTableConceptualGraph"
        >
          SAVE
        </v-btn>
        <v-btn
          class="action-button"
          variant="outlined"
          :disabled="!isQueryGeneratorButtonEnabled || isSaveTriggered || true"
          :loading="isProcessTriggered"
          @click.prevent="generateTable">
          COMING SOON
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="js">
import constants from "@/constants/constants";
import designToolboxConstants from "../design/designToolboxConstants";
import useNotificationStore from "../../stores/notification";
import useConnectionStore from '../../stores/connection';
import { manageRequest } from "@/includes/requests";
import { conceptualGraphsCollection } from "../../includes/firebase";
import { mapActions, mapWritableState } from "pinia";
import { useQuery } from "../../composables/query";
import { useConfetti } from '../../composables/confetti';

export default {
  name: "DesignToolbox",
  props: {
    keyspace: String
  },
  emits: ["openTerminal", "render"],
  setup: () => {
   const { generateQueryAsCommands } = useQuery();
   const { createConfetti } = useConfetti();
   return { generateQueryAsCommands, createConfetti };
  },
  data: () => ({
    // This data is related to the current configuration inside the Toolbox
    currentTableConcept: null,
    currentColumnConcept: null,
    currentDataTypeConcept: null,
    currentClusteringOrderOptions: null,
    isClusteringSectionEnabled: false,
    clusteringColumnItems: [],
    // This data is related to the rendering of the Conceptual Graph
    tableConcepts: [],
    columnConcepts: {},
    dataTypeConcepts: {},
    isGraphRendered: false,
    isTableNameDuplicated: false,
    //
    isSaveTriggered: false,
    isProcessTriggered: false
  }),
  methods: {
    // These methods are actions mapped from the notification store
    ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
    // These methods handle the clear events of components
    setupToolboxData: function () {
      this.currentTableConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.table };
      this.resetColumnConceptFields();
      this.resetCassandraTerminalData();
      this.renderConceptualGraph(true);
      this.isGraphRendered = false;
    },
    resetCassandraTerminalData: function () {
      this.tableConcepts = [];
      this.columnConcepts = {};
      this.dataTypeConcepts = {};
    },
    resetColumnConceptFields: function () {
      this.currentColumnConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.column, kind: constants.columnKinds.optional };
      this.currentDataTypeConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType };
      this.currentClusteringOrderOptions = { clusteringColumn: null, clusteringOrder: null };
    },
    clearClusteringColumn: function () {
      this.currentClusteringOrderOptions = Object.assign({}, { clusteringColumn: null, clusteringOrder: null });
    },
    validateTableName: async function () {
      const doesTableAlreadyExistAsCG = await this.checkIfTableExistsInSavedCGs();
      if (!doesTableAlreadyExistAsCG) {
        this.checkIfTableExistsInTheCurrentKeyspace();
      }
    },
    checkIfTableExistsInTheCurrentKeyspace: async function () {
      const response = await manageRequest(constants.requestTypes.GET, "table", {
        table_name: this.currentTableConcept.conceptName,
        keyspace_name: this.currentKeyspace
      });
      if (response.data.flag) {
        this.setUpSnackbarState(false, `Table ${this.currentTableConcept.conceptName} already exists in the current keyspace`);
        this.isTableNameDuplicated = true;
      } else {
        this.addTableConceptToGraph();
      }
    },
    checkIfTableExistsInSavedCGs: async function () {
      try {
        const snapshot = await conceptualGraphsCollection.where("tableName", "==", this.currentTableConcept.conceptName).get();
        if (!snapshot.empty) {
          this.setUpSnackbarState(false, `Table ${this.currentTableConcept.conceptName} is already saved in your CGs`);
          return true;
        }
      } catch (error) {
        this.setUpSnackbarState(false, error.message);
      }
    },
    // These methods handle the rendering of the graph
    addTableConceptToGraph: function () {
      this.tableConcepts = [this.currentTableConcept];
      this.columnConcepts[this.currentTableConcept.conceptName] = [];
      this.renderConceptualGraph();
    },
    addColumnConceptToGraph: function () {
      if (!this.doesColumnConceptAlreadyExists) {
        this.columnConcepts[this.currentTableConcept.conceptName].push({ ... this.currentColumnConcept, relation: this.getRelationForColumnConcept() });
        this.dataTypeConcepts[this.currentColumnConcept.conceptName] = { ... this.currentDataTypeConcept };
        this.resetColumnConceptFields();
        this.renderConceptualGraph();
      }
    },
    getRelationForColumnConcept: function () {
      switch (this.currentColumnConcept.kind) {
        case constants.columnKinds.regular:
          return constants.relationTypes.isOptional;
        case constants.columnKinds.partitionKey:
          return constants.relationTypes.hasPartitionKey;
        case constants.columnKinds.clustering:
          return constants.relationTypes.hasClusteringKeyASC;
        default:
          return constants.relationTypes.isOptional;
      } 
    },
    renderConceptualGraph: function (onInitialLoad = false) {
      const conceptualGraphData = {
        tableConcepts: this.tableConcepts,
        columnConcepts: this.columnConcepts,
        dataTypeConcepts: this.dataTypeConcepts,
        onInitialLoad
      };
      this.$emit("render", conceptualGraphData);
      this.isGraphRendered = true;
    },
    // These methods handle the query generator
    generateQuery: function () {
      const [isConceptualGraphValid, errorMessage] = this.validateConceptualGraph();
      if (isConceptualGraphValid) {
        const commands = this.generateQueryAsCommands(this.keyspace, this.tableConcepts, this.columnConcepts, this.dataTypeConcepts, this.currentClusteringOrderOptions);
        this.$emit("openTerminal", commands);
      } else {
        this.setUpSnackbarState(false, errorMessage);
      }
    },
    // These methods handle the saving of the conceptual graph
    saveTableConceptualGraph: async function () {
      this.isSaveTriggered = true;
      const [isConceptualGraphValid, errorMessage] = this.validateConceptualGraph();
      if (!isConceptualGraphValid) {
        this.setUpSnackbarState(false, errorMessage);
        this.isSaveTriggered = false;
        return;
      }
      const isInvalid = await this.checkIfTableExistsInSavedCGs();
      if (isInvalid) {
        this.isSaveTriggered = false;
        return;
      }
      try {
        await conceptualGraphsCollection.add({
          tableName: this.currentTableConcept.conceptName,
          tableConcepts: this.tableConcepts,
          columnConcepts: this.columnConcepts,
          dataTypeConcepts: this.dataTypeConcepts
        });
      } catch (error) {
        this.isSaveTriggered = false;
        this.setUpSnackbarState(false, error.message);
        return;
      }
      this.isSaveTriggered = false;
      this.setUpSnackbarState(true, designToolboxConstants.SUCCESSFUL_TABLE_GRAPH_SAVE);
      this.createConfetti();
    },
    generateTable: function () {
      // TODO
      this.isProcessTriggered = true;
      this.isProcessTriggered = false;
    },
    // These methods handle some utilities
    getPartitionAndClusteringColumnsCount: function () {
      const initialCount = { partitionColumnsCount: 0, clusteringColumnCount: 0 };
      return this.columnConcepts[this.currentTableConcept.conceptName].reduce((accumulator, currentValue = {}) => {
        if (currentValue.kind === constants.columnKinds.partitionKey) {
          accumulator.partitionColumnsCount += 1;
        } else if (currentValue.kind === constants.columnKinds.clustering) {
          accumulator.clusteringColumnCount += 1;
        }
        return accumulator;
      }, initialCount);
    },
    validateConceptualGraph: function () {
      // Partition key is mandatory 
      // A primary key in Cassandra consists of one or more partition keys and zero or more clustering key components
      const { partitionColumnsCount, _ } = this.getPartitionAndClusteringColumnsCount();
      const errorMessage = partitionColumnsCount > 0 ? constants.inputValues.empty : "Cannot create primary key without any partition keys";
      return [partitionColumnsCount > 0, errorMessage];
    }
  },
  computed: {
    // These computed properties are mapped from the Connection Store
    ...mapWritableState(useConnectionStore, ['currentKeyspace']),
    // These computed properties are related to the Design Toolbox
    areColumnConceptFieldsCompleted: function () {
      return this.currentColumnConcept && this.currentColumnConcept.conceptName && this.currentColumnConcept.kind &&
             this.currentDataTypeConcept && this.currentDataTypeConcept.conceptName;
    },
    areClusteringOrderFieldsCompleted: function () {
    },
    columnDataTypeItems: function () {
      return designToolboxConstants.CQL_DATA_TYPES;
    },
    columnOptionsItems: function () {
      return designToolboxConstants.CQL_COLUMN_OPTIONS;
    },
    clusteringOrderItems: function () {
      return designToolboxConstants.CQL_CLUSTERING_ORDER_ITEMS;
    },
    doesColumnConceptAlreadyExists: function () {
      return this.columnConcepts[this.currentTableConcept.conceptName] &&
        this.columnConcepts[this.currentTableConcept.conceptName].some(x => x.conceptName === this.currentColumnConcept.conceptName);
    },
    getErrorMessage: function () {
      return this.doesColumnConceptAlreadyExists ? "Column already exists" : constants.inputValues.empty;
    },
    isAddTableConceptButtonEnabled: function () {
      return this.currentTableConcept && this.currentTableConcept.conceptName && !this.isGraphRendered;
    },
    isAddColumnConceptButtonEnabled: function () {
      return this.areColumnConceptFieldsCompleted && !this.doesColumnConceptAlreadyExists;
    },
    isQueryGeneratorButtonEnabled: function () {
      return this.tableConcepts[0] && this.columnConcepts && this.columnConcepts[this.tableConcepts[0].conceptName].length > 0 && !this.doesColumnConceptAlreadyExists;
    }
  },
  watch: {
    columnConcepts: {
      handler: function () {
        if (!this.currentTableConcept || !this.columnConcepts || !this.columnConcepts[this.currentTableConcept.conceptName]) {
          this.isClusteringSectionEnabled = false;
        } else {
          const { partitionColumnsCount, clusteringColumnCount} = this.getPartitionAndClusteringColumnsCount();
          if (partitionColumnsCount > 1 || clusteringColumnCount > 0) {
            this.isClusteringSectionEnabled = true;
          } else {
            this.isClusteringSectionEnabled = false;
          }
          if (clusteringColumnCount > 0) {
            this.clusteringColumnItems = this.columnConcepts[this.currentTableConcept.conceptName]
              .filter(concept => concept.kind === constants.columnKinds.clustering)
              .map(concept => concept.conceptName);
          }
        }
      },
      deep: true
    }
  },
  created() {
    this.setupToolboxData();
  }
}
</script>

<style scoped lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.toolbox-warning
  border-color: variables.$cassandra-yellow

.toolbox
  border-color: variables.$cassandra-blue

  .v-card-title
    margin-bottom: 1rem

    .v-icon
      color: variables.$cassandra-yellow

  .actions-row
    @include containers.flex-container($justify-content: center)
    width: 100%

    &:first-of-type
      margin-bottom: 1rem

    .v-btn
      width: 100%
      height: 56px

  .v-btn.icon-button, .v-btn.icon-button--double
    border: 1px solid variables.$cassandra-black
    height: 56px
    width: 56px
    margin-left: 1rem

  .v-btn.icon-button--double
    height: calc(112px + 1.5rem)

  .v-btn.icon-button--disabled
    opacity: none

  .v-divider
    margin-bottom: 1rem
    margin-top: 1rem

  .v-card-actions
    justify-content: center

  .column-concept-container, .column-selects
    @include containers.flex-container()

  .column-concept-config
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: normal)
    width: 100%

  .column-selects > .v-text-field:first-of-type
    margin-right: 1rem

  .column-selects > .v-input, .clustering-options-container > .v-input
    width: 50% !important

  .clustering-options-container
    @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)

  .error-message
    color: variables.$cassandra-red
    margin-bottom: 1rem
    margin-top: 0.5rem

.action-row > .action-button
  width: 30%
  height: 100px
  margin-right: 1rem

.action-row > .action-button:last-of-type
  margin-right: 0

@media (max-width: variables.$cga-mac-width)
  .toolbox
    min-width: 400px

@media (min-width: variables.$cga-mac-width)
  .toolbox
    min-width: 500px

</style>
