<template>
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
      <!-- Table concept section -->
      <div class="d-flex">
        <v-text-field
          v-model="currentTableConcept.conceptName"
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
          @click.prevent="addTableConceptToGraph"
        >
          <v-icon v-if="isGraphRendered">mdi-check</v-icon>
          <v-icon v-else>mdi-plus</v-icon>
        </v-btn>
      </div>
      
      <v-divider></v-divider>

      <!-- Column concepts section -->
      <div class="column-concept-container">
        <div class="column-concept-config">
          <v-text-field
            v-model="currentColumnConcept.conceptName"
            variant="outlined"
            label="New column name"
            :hide-details="true"
            :error="doesColumnConceptAlreadyExists"
            :disabled="!currentTableConcept.conceptName || !isGraphRendered"
          >
          </v-text-field>
          <span class="error-message">{{ getErrorMessage }}</span>
          <div class="column-selects">
            <v-select
              v-model="currentColumnConcept.kind"
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
            <v-select
              v-model="currentDataTypeConcept.conceptName"
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

      <div class="d-flex">
        <v-select
          variant="outlined"
          style="margin-right: 1rem;"
          label="Clustering Index"
          :hide-details="true"
          :items="[]"
          :disabled="!currentTableConcept.conceptName || !isGraphRendered">
        </v-select>
        <v-select
          variant="outlined"
          label="Order"
          :hide-details="true"
          :items="clusteringOrderItems"
          :disabled="!currentTableConcept.conceptName || !isGraphRendered">
        </v-select>
        <v-btn
          variant="text"
          class="icon-button"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>


    </v-card-text>
    <v-card-actions>
      <v-btn
        variant="outlined"
        :disabled="!isQueryGeneratorButtonEnabled"
        @click.prevent="generateQuery(false)"
      >
        Generate CQL Query
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">
import constants from "@/constants/constants";
import designToolboxConstants from "./designToolboxConstants";

export default {
  name: "DesignToolbox",
  props: {
    keyspace: String
  },
  data: () => ({
    // This data is related to the current configuration inside the Toolbox
    currentTableConcept: null,
    currentColumnConcept: null,
    currentDataTypeConcept: null,
    currentClusteringOrderOptions: null,
    // This data is related to the rendering of the Conceptual Graph
    tableConcepts: [],
    columnConcepts: {},
    dataTypeConcepts: {},
    isGraphRendered: false
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
      this.currentColumnConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.column };
      this.currentDataTypeConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType };
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
      const commands = this.generateQueryAsCommands();
      this.$emit("openTerminal", commands);
    },
    generateQueryAsCommands: function () {
      let commands = [];
      let currentLine = 0;

      // Compute the first line of the CQL command for the Cassandra Terminal component.
      const tableConceptName = this.tableConcepts[0].conceptName;
      const definitionCommandContent = designToolboxConstants.CQL_BASH_COMMAND
        .concat(designToolboxConstants.CQL_CREATE_TABLE_SNIPPET)
        .concat(this.keyspace)
        .concat(designToolboxConstants.CQL_PUNCTUATION.DOT)
        .concat(tableConceptName)
        .concat(" (");
      commands.push({ lineNumber: currentLine, lineContent: definitionCommandContent });
      currentLine = currentLine + 1;

      // For each column definitiom, add the corresponding line in the commands array.
      this.columnConcepts[tableConceptName].forEach(columnConcept => {
        const columnConceptCommandContent = designToolboxConstants.CQL_BASH_BLANK_COMMAND
          .concat(columnConcept.conceptName)
          .concat(designToolboxConstants.CQL_PUNCTUATION.SPACE)
          .concat(this.dataTypeConcepts[columnConcept.conceptName].conceptName.toUpperCase())
          .concat(designToolboxConstants.CQL_PUNCTUATION.COMMA);
        commands.push({ lineNumber: currentLine, lineContent: columnConceptCommandContent });
        currentLine = currentLine + 1;
      });

      // Add primary and partition keys
      let primaryKeyCommandSnippet = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat("PRIMARY KEY ( ");
      let partitionKeySnippet = "( "
      let clusteringColumnsSnippet = "( ";
      let hasExplicitPartitionKeys = false;
      let hasExplicitClusteringColumn = false;

      this.columnConcepts[tableConceptName].forEach(columnConcept => {
        if (columnConcept.kind === constants.columnKinds.partitionKey) {
          partitionKeySnippet = partitionKeySnippet.concat(columnConcept.conceptName).concat(designToolboxConstants.CQL_PUNCTUATION.COMMA);
          hasExplicitPartitionKeys = true;
        } else if (columnConcept.kind === constants.columnKinds.clustering) {
          clusteringColumnsSnippet = clusteringColumnsSnippet.concat(columnConcept.conceptName).concat(designToolboxConstants.CQL_PUNCTUATION.COMMA);
          hasExplicitClusteringColumn = true;
        }
      });
      partitionKeySnippet = partitionKeySnippet.slice(0, partitionKeySnippet.length - 1).concat(" ),");
      clusteringColumnsSnippet = clusteringColumnsSnippet.slice(0, clusteringColumnsSnippet.length - 1).concat(" );");

      primaryKeyCommandSnippet = primaryKeyCommandSnippet
        .concat(hasExplicitPartitionKeys ? partitionKeySnippet + designToolboxConstants.CQL_PUNCTUATION.COMMA : "")
        .concat(hasExplicitClusteringColumn ? clusteringColumnsSnippet + designToolboxConstants.CQL_PUNCTUATION.COMMA : "")

      commands.push({ lineNumber: currentLine, lineContent: primaryKeyCommandSnippet });
      currentLine = currentLine + 1;
      
      // Add clustering indices

      return commands;
    }
  },
  computed: {
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
      return this.tableConcepts[0] && this.columnConcepts && this.columnConcepts[this.tableConcepts[0].conceptName].length > 0;
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

  .v-btn.icon-button, .v-btn.icon-button--double
    height: 56px
    width: 56px
    margin-left: 1rem

  .v-btn.icon-button--double
    height: calc(112px + 1rem)

  .v-btn.icon-button--disabled
    opacity: none

  .v-btn.icon-button:hover
    border: 1px solid variables.$cassandra-blue

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

  .column-selects .v-input
    width: 50% !important

  .error-message
    color: variables.$cassandra-red
    margin-bottom: 1rem
    margin-top: 0.5rem

@media (max-width: variables.$cga-mac-width)
  .toolbox
    min-width: 400px

@media (min-width: variables.$cga-mac-width)
  .toolbox
    min-width: 500px

</style>
