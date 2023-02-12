<template>
   <v-card width="500" variant="outlined" class="toolbox">
    <v-card-title>
      <div class="d-flex justify-center align-center">
        Conceptual Graph Design Toolbox
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
                        @click:clear="initializeToolboxFields">
          </v-text-field>
          <v-btn variant="text" 
                 class="icon-button"
                 :class="{ 'icon-button--disabled': isGraphRendered }"
                 :disabled="!isAddTableConceptButtonEnabled"
                 @click.prevent="addTableConceptToGraph">
            <v-icon>mdi-plus</v-icon>
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
                          :disabled="!currentTableConcept">
            </v-text-field>
            <div class="column-selects">
              <v-select v-model="currentColumnConcept.relation"
                        variant="outlined"
                        class="data-type-select"
                        label="Column Option"
                        :hide-details="true"
                        :items="columnOptionsItems">
              </v-select>
              <v-select v-model="currentDataTypeConcept.conceptName"
                        variant="outlined"
                        class="data-type-select"
                        label="Data Type"
                        :hide-details="true"
                        :items="columnDataTypeItems">
              </v-select>
          </div>
          </div>
          <v-btn variant="text"
                 class="icon-button--double"
                 :disabled="!isAddColumnConceptButtonEnabled"
                 @click.prevent="addColumnConceptToGraph">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="outlined"
             :disabled="!isQueryGeneratorButtonEnabled"
             @click.prevent="generateQuery">
        Generate CQL Query
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">
import constants from "@/constants/constants";
import designToolboxConstants from "../designToolboxConstants";

export default {
  name: "DesignToolbox",
  data: () => ({
    // This data is related to the current configuration inside the Toolbox
    // TODO: Handle this data with only one object
    currentTableConcept: null,
    currentColumnConcept: null,
    currentDataTypeConcept: null,
    // This data is related to the rendering of the Conceptual Graph
    tableConcepts: {},
    columnConcepts: {},
    dataTypeConcepts: {},
    isGraphRendered: false
  }),
  methods: {
    // These methods handle the clear events of components
    initializeToolboxFields: function () {
      this.currentTableConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.table };
      this.currentColumnConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.column };
      this.currentDataTypeConcept = { ... constants.defaultConcept, conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType };
      this.tableConcepts = [];
      this.columnConcepts = {};
      this.dataTypeConcepts = {};
      this.renderConceptualGraph();
      this.isGraphRendered = false;
    },
    // These methods handle the rendering of the graph
    addTableConceptToGraph: function () {
      this.tableConcepts = [this.currentTableConcept];
      this.columnConcepts[this.currentTableConcept.conceptName] = [];
      this.renderConceptualGraph();
    },
    addColumnConceptToGraph: function () {
      this.columnConcepts[this.currentTableConcept.conceptName].push({ ... this.currentColumnConcept });
      this.dataTypeConcepts[this.currentColumnConcept.conceptName] = { ... this.currentDataTypeConcept };
      this.renderConceptualGraph();
    },
    // These methods handle the triggering of events
    generateQuery: function () {  
      // TODO: Logic for generating a CQL query
      this.$emit("openTerminal");
    },
    renderConceptualGraph: function () {
      const conceptualGraphData = {
        tableConcepts: this.tableConcepts,
        columnConcepts: this.columnConcepts,
        dataTypeConcepts: this.dataTypeConcepts
      };
      this.$emit("render", conceptualGraphData);
      this.isGraphRendered = true;
    }
  },
  computed: {
    columnDataTypeItems: function () {
      return designToolboxConstants.CQL_DATA_TYPES;
    },
    columnOptionsItems: function () {
      return designToolboxConstants.CQL_COLUMN_OPTIONS;
    },
    doesColumnConceptAlreadyExists: function () {
      return Object.values(this.columnConcepts).some(x => x.conceptName === this.currentColumnConcept.conceptName);
    },
    isAddTableConceptButtonEnabled: function () {
      return this.currentTableConcept && this.currentTableConcept.conceptName && !this.isGraphRendered;
    },
    isAddColumnConceptButtonEnabled: function () {
      return this.currentColumnConcept && this.currentColumnConcept.conceptName && this.currentColumnConcept.relation && 
             this.currentDataTypeConcept && this.currentDataTypeConcept.conceptName;
    },
    isQueryGeneratorButtonEnabled: function () {
      return this.currentTableConcept && this.currentTableConcept.conceptName && this.currentColumnConcept && this.currentColumnConcept.conceptName;
    },
  },
  created: function () {
    this.initializeToolboxFields();
  }
}
</script>

<style scoped lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.toolbox
  min-width: 500px

  .v-card-title
    margin-bottom: 1rem

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

    .v-text-field
      margin-bottom: 1rem

  .column-selects > .v-text-field:first-of-type
    margin-right: 1rem

</style>