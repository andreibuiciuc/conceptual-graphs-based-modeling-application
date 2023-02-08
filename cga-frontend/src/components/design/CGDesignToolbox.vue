<template>
<v-card width="500" variant="outlined">
  <v-card-title>
    <div class="d-flex justify-center align-center">
      Conceptual Graph Design Toolbox
    </div>
  </v-card-title>
  <v-card-text>
    <div>
       <v-text-field v-model="currentTableConcept" 
                     variant="outlined"
                     label="Table name"
                     :clearable="true"
                     @click:clear="clearTableConcept">
       </v-text-field>
       <v-text-field v-model="currentColumnConcept"
                     variant="outlined"
                     label="New column name"
                     :disabled="!currentTableConcept"
                     :error="isColumnConceptInvalid"
                     @update:focused="changeColumnConcept">
       </v-text-field>
    </div>
  </v-card-text>
  <v-card-actions>
    <v-btn variant="outlined"
           :disabled="isColumnConceptInvalid">
      Generate CQL Query
    </v-btn>
  </v-card-actions>
</v-card>
</template>

<script lang="js">
import constants from '@/constants/constants';

export default {
  name: "CGDesignToolbox",
  data: () => ({
    currentTableConcept: constants.inputValues.empty,
    currentColumnConcept: constants.inputValues.empty,
    columnConcepts: ["test"]
  }),
  methods: {
    clearTableConcept: function () {

    },
    changeColumnConcept: function () {

    },
  },
  computed: {
    isColumnConceptInvalid: function () {
      return this.columnConcepts.some(x => x === this.currentColumnConcept);
    }
  }

}
</script>

<style lang="sass">
.v-card-actions
  justify-content: center
</style>