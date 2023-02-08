<template>
  <div class="tf-tree conceptual-graph" :class="{ 'conceptual-graph-inverted': inverted }">
    <ul v-if="keyspaceConcept" class="conceptual-graph-root">
      <!-- Keyspace level-->
      <li>
        <div class="tf-nc keyspace-concept" v-if="keyspaceConcept">
          <span class="concept-type">{{ keyspaceConcept.conceptType }}:</span>
          <span class="concept-name">{{ keyspaceConcept.conceptName }}</span>
        </div>
        <span class="tf-nc conceptual-graph-relation"> 
          {{ keyspaceRelation }}
        </span>
        <ul>
          <!-- Table level -->
          <li v-for="tableConcept in tableConcepts" :key="tableConcept.conceptName">
            <div class="tf-nc">
              <span class="concept-type">{{ tableConcept.conceptType }}:</span> 
              <span class="concept-name">{{ tableConcept.conceptName }}</span>
            </div>
            <ul>
              <!-- Column level -->
              <li v-for="columnConcept in columnConcepts[tableConcept.conceptName]">
                <div class="tf-nc conceptual-graph-relation">
                  <span class="concept-name">{{ columnConcept.relation }}</span>
                </div>
                <div class="tf-nc">
                  <span class="concept-type">{{ columnConcept.conceptType }}:</span>
                  <span class="concept-name">{{ columnConcept.conceptName }}</span>
                </div>
                <ul>
                  <!-- Type level -->
                  <li>
                    <div class="tf-nc conceptual-graph-relation">
                      <span class="concept-name">hasType</span>
                    </div>
                    <div class="tf-nc last">
                      <span class="concept-type">{{ dataTypeConcepts[columnConcept.conceptName].conceptType }}:</span>
                      <span class="concept-name">{{ dataTypeConcepts[columnConcept.conceptName].conceptName }}</span>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="js">
import constants from "@/constants/constants";

export default {  
  name: "ConceptualGraph",
  props: {
    keyspaceConcept: Object,
    tableConcepts: Array,
    columnConcepts: Object,
    dataTypeConcepts: Object,
    inverted: Boolean
  },
  computed: {
    keyspaceRelation: function () {
      return this.tableConcepts.length > 1 ? constants.relationTypes.hasMore : constants.relationTypes.has;
    },
    columnRelation: function () {
      return constants.relationTypes.hasType;
    }
  }
}
</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.tf-nc
  margin-bottom: 1.5em

.tf-tree li ul
  margin: 0.5em 0

.last.tf-nc::after
  content: none !important

.keyspace-concept
  margin-bottom: 1em

.concept-type
  color: variables.$cassandra-blue
  font-weight: bold
  margin-right: 0.25em

.conceptual-graph
  @include containers.flex-container($align-items: center, $justify-content: center) 
  width: 100%
  height: 100%
  overflow: auto

  .conceptual-graph-root
    overflow: auto
  
  .conceptual-graph-relation
    border-radius: 1.5em
    font-style: italic

.conceptual-graph-inverted 
  
  & .tf-nc, .concept-type, .tf-nc::before, .tf-nc::after, li::before
    color: variables.$cassandra-white
    border-color: variables.$cassandra-white !important

</style>