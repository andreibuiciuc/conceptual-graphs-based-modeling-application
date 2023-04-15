<template>
  <div class="design-toolbox-container">
    <Card
      class="toolbox"
      :class="{ 'toolbox-warning': !keyspace }"
    >
      <template #title>
        data structure config
      </template>
      <template #content>
        
        <!-- Table concept input -->
        <div class="design-toolbox-input-container">
          <div class="design-toolbox-input-group">
              <InputText
                v-model="currentTableConcept.conceptName"
                placeholder="table name"
                :disabled="!keyspace"
                :readonly="isGraphRendered"
              />
          </div>
          <div class="design-toolbox-action-group">
            <Button 
              severity="secondary"
              text
              icon="pi pi-times"
              @click="setupToolboxData"
            />
            <Button 
              severity="primary"
              text
              :icon="isGraphRendered ? 'pi pi-check' : 'pi pi-plus'"
              :disabled="!isAddTableConceptButtonEnabled"
              @click="validateTableName"
            />
          </div>
        </div>

        <Divider />

        <!-- Column and type concepts input -->

        <div class="design-toolbox-input-container">
          <div class="design-toolbox-input-group">
            <div class="flex flex-column gap-2">
              <InputText
                v-model="currentColumnConcept.conceptName"
                :class="{ 'p-invalid': doesColumnConceptAlreadyExists }"
                placeholder="column name"
                :disabled="!currentTableConcept.conceptName"
              />
              <small class="p-error">{{ getErrorMessage }}</small>
            </div>
            <Dropdown 
              v-model="currentColumnConcept.kind"
              placeholder="column kind"
              optionLabel="title"
              :disabled="!currentColumnConcept.conceptName || doesColumnConceptAlreadyExists"
              :options="columnOptionsItems"
            />
            <Dropdown 
              v-model="currentDataTypeConcept.conceptName"
              placeholder="column type"
              optionLabel="title"
              :disabled="!currentColumnConcept.conceptName || doesColumnConceptAlreadyExists"
              :options="columnDataTypeItems"
            />
          </div>
          <Button 
            icon="pi pi-plus"
            text
            :disabled="!isAddColumnConceptButtonEnabled"
            @click.prevent="addColumnConceptToGraph"
          />
        </div>

        <Divider />

        <!-- Clustering column concepts options input -->

        <div class="design-toolbox-input-container">
          <div class="design-toolbox-input-group">
            <Dropdown
              v-model="currentClusteringOrderOptions.clusteringColumn"
              placeholder="clustering column"
              showClear="true"
              :disabled="!isClusteringSectionEnabled"
            />
            <Dropdown 
              v-model="currentClusteringOrderOptions.clusteringOrder"
              placeholder="clustering order"
              :disabled="!isClusteringSectionEnabled"
            />
          </div>
        </div>

      </template>
    </Card>
  </div>
</template>

<script lang="js">
import constants from "@/constants/constants";
import designToolboxConstants from "../design/designToolboxConstants";
import { useConnectionStore } from '../../stores/connection';
import { manageRequest } from "@/includes/requests";
import { conceptualGraphsCollection } from "../../includes/firebase";
import { mapWritableState } from "pinia";
import { useQuery } from "../../composables/query";
import { useConfetti } from '../../composables/confetti';
import { useUtils } from "../../composables/utils";

export default {
  name: "DesignToolbox",
  props: {
    keyspace: String
  },
  emits: ["openTerminal", "render"],
  setup: () => {
   const { generateQueryAsCommands } = useQuery();
   const { createConfetti } = useConfetti();
   const { openNotificationToast } = useUtils();
   return { generateQueryAsCommands, createConfetti, openNotificationToast };
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
        this.openNotificationToast(`Table ${this.currentTableConcept.conceptName} already exists in the current keyspace`, 'error')
        this.isTableNameDuplicated = true;
      } else {
        this.addTableConceptToGraph();
      }
    },
    checkIfTableExistsInSavedCGs: async function () {
      try {
        const snapshot = await conceptualGraphsCollection.where("tableName", "==", this.currentTableConcept.conceptName).get();
        if (!snapshot.empty) {
          this.openNotificationToast(`Table ${this.currentTableConcept.conceptName} is already saved in your CGs`, 'error');
          return true;
        }
      } catch (error) {
        this.openNotificationToast(error.message, 'error');
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
        this.openNotificationToast(errorMessage, 'error');
      }
    },
    // These methods handle the saving of the conceptual graph
    saveTableConceptualGraph: async function () {
      this.isSaveTriggered = true;
      const [isConceptualGraphValid, errorMessage] = this.validateConceptualGraph();
      if (!isConceptualGraphValid) {
        this.openNotificationToast(errorMessage, 'error');
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
        this.openNotificationToast(errorMessage, 'error');
        return;
      }
      this.isSaveTriggered = false;
      this.openNotificationToast(designToolboxConstants.SUCCESSFUL_TABLE_GRAPH_SAVE, 'success');
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

.toolbox
  box-shadow: none

  .design-toolbox-input-container
    @include containers.flex-container($justify-content: space-between, $align-items: flex-end)

    .design-toolbox-input-group
      @include containers.flex-container($flex-direction: column)

      .flex.flex-column
        margin-bottom: 1rem
        
      .p-dropdown
        width: 100%

      .p-dropdown:not(:last-of-type)
        margin-bottom: 1rem

    .design-toolbox-action-group
      @include containers.flex-container


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
