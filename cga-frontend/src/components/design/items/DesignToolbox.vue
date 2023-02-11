<template>
   <v-card width="500" variant="outlined" class="toolbox">
    <v-card-title>
      <div class="d-flex justify-center align-center">
        Conceptual Graph Design Toolbox
      </div>
    </v-card-title>
    <v-card-text>
      <div>
        <v-text-field v-model="currentTableConcept.conceptName" 
                      variant="outlined"
                      label="Table name"
                      :clearable="true"
                      @click:clear="initializeToolboxFields"
                      @update:focused="updateTableConcept">
        </v-text-field>
        <v-text-field v-model="currentColumnConcept.conceptName"
                      variant="outlined"
                      label="New column name"
                      :disabled="!currentTableConcept"
                      @update:focused="updateColumnConcept">
        </v-text-field>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="outlined"
             :disabled="!isQueryGeneratorButtonEnabled"
             @click.prevent="renderConceptualGraph">
        Render Conceptual Graph
      </v-btn>
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

export default {
  name: "DesignToolbox",
  data: () => ({
    currentTableConcept: null,
    currentColumnConcept: null,
    columnConcepts: {},
    dataTypeConcepts: {}
  }),
  methods: {
    // These methods handle clear events of components
    initializeToolboxFields: function () {
      this.currentTableConcept = { ... constants.defaultConcept };
      this.currentColumnConcept = { ... constants.defaultConcept };
    },
    // These methods handle update events of components 
    updateTableConcept: function () {
      this.currentTableConcept = { ... this.currentTableConcept, conceptType: constants.conceptTypes.table };
    },
    updateColumnConcept: function () {
      this.currentColumnConcept.conceptType = constants.conceptTypes.column;
      this.columnConcepts[this.currentTableConcept.conceptName] = [
        { ... this.currentColumnConcept, relation: "has" }
      ];
      this.dataTypeConcepts[this.currentColumnConcept.conceptName] = { conceptType: constants.conceptTypes.dataType, conceptName: "test"}
    },
    // These methods handle triggering of events
    generateQuery: function () {  
      // this.$emit("openTerminal");
    },
    renderConceptualGraph: function () {
      const conceptualGraphData = {
        tableConcepts: [this.currentTableConcept],
        columnConcepts: this.columnConcepts,
        dataTypeConcepts: this.dataTypeConcepts
      };
      this.$emit("render", conceptualGraphData);
    }
  },
  computed: {
    isQueryGeneratorButtonEnabled: function () {
      return this.currentTableConcept.conceptName && this.currentColumnConcept.conceptName;
    }
  },
  created: function () {
    this.initializeToolboxFields();
  }
}
</script>

<style scoped lang="sass">
.toolbox
  min-width: 500px

  .v-card-actions
    justify-content: center

</style>