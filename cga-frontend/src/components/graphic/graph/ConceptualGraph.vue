<template>
  <div
    class="tf-tree conceptual-graph" ref="conceptualGraph" id="conceptualGraph"
    :class="{ 'conceptual-graph-inverted': inverted, 'conceptual-graph-with-border': applyBorder }"
  >
    <ul class="conceptual-graph-root">
      <!-- Keyspace level-->
      <li>
        <div class="tf-nc keyspace-concept" ref="keyspaceConcept" v-if="keyspaceConcept">
          <span class="concept-type">{{ keyspaceConcept.conceptType }}:</span>
          <span class="concept-name">{{ keyspaceConcept.conceptName }}</span>
        </div>
        <span class="tf-nc conceptual-graph-relation" ref="keyspaceRelationConcept" v-if="keyspaceConcept">
          {{ keyspaceRelation }}
        </span>
        <ul>
          <!-- Table level -->
          <li
            v-for="(tableConcept, tableIndex) in tableConcepts"
            :key="tableConcept.conceptName"
          >
            <div :ref="`tableConcept_${tableIndex}`"
              class="tf-nc"
              :class="{
                'table-first': noKeyspace,
                'table-first-no-col':
                  doesGraphHaveOnlyTableConcept(tableConcept),
              }"
            >
              <span class="concept-type">{{ tableConcept.conceptType }}:</span>
              <span class="concept-name">{{ tableConcept.conceptName }}</span>
            </div>
            <ul>
              <!-- Column level -->
              <li
                v-for="(columnConcept, columnIndex) in columnConcepts[
                  tableConcept.conceptName
                ]"
                :key="columnConcept.conceptName"
              >
                <div class="tf-nc conceptual-graph-relation" :ref="`${tableConcept.conceptName}_columnConceptRelation_${columnIndex}`">
                  <span class="concept-name">{{ columnConcept.relation }}</span>
                </div>
                <div 
                  class="tf-nc" :class="{ 'column-concept--selectable': areColumnsSelectable }"
                  :style="{ backgroundColor: columnConcept.color }" 
                  :ref="`${tableConcept.conceptName}_columnConcept_${columnIndex}`"
                  @click.prevent="selectColumn(tableConcept, columnConcept)"
                  >
                  <span class="concept-type"
                    >{{ columnConcept.conceptType }}:</span
                  >
                  <span class="concept-name">{{
                    columnConcept.conceptName
                  }}</span>
                  <v-btn
                    v-if="areColumnConceptsDeletable"
                    @click="removeColumnConcept(tableConcept, columnConcept)"
                    variant="text"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
                <ul>
                  <!-- Type level -->
                  <li>
                    <div class="tf-nc conceptual-graph-relation" :ref="`${tableConcept.conceptName}_typeConceptRelation_${columnIndex}`">
                      <span class="concept-name">hasType</span>
                    </div>
                    <div class="tf-nc last" :ref="`${tableConcept.conceptName}_typeConcept_${columnIndex}`">
                      <span class="concept-type"
                        >{{
                          dataTypeConcepts[columnConcept.conceptName]
                            .conceptType
                        }}:</span
                      >
                      <span class="concept-name">{{
                        dataTypeConcepts[columnConcept.conceptName].conceptName
                      }}</span>
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
import arrowCreate, { DIRECTION } from 'arrows-svg';

export default {
  name: "ConceptualGraph",
  props: {
    keyspaceConcept: Object,
    tableConcepts: Array,
    columnConcepts: Object,
    dataTypeConcepts: Object,
    inverted: Boolean,
    applyBorder: Boolean,
    noKeyspace: Boolean,
    areColumnConceptsDeletable: Boolean,
    areColumnsSelectable: Boolean
  },
  data: () => ({
    arrows: []
  }),
  methods: {
    createArrow: function (sourceNode, targetNode, relatedNode) {
      const arrow = arrowCreate({
        from: {
          node: sourceNode,
          direction: DIRECTION.BOTTOM
        }, 
        to: {
          node: targetNode, 
          direction: DIRECTION.TOP,
        } 
      });
      arrow.relatedNode = relatedNode;
      this.arrows.push(arrow);
      const elementRef = document.getElementById("conceptualGraph");
      elementRef.append(arrow.node);
    },
    doesGraphHaveOnlyTableConcept: function (tableConcept) {
      return tableConcept && this.columnConcepts && this.columnConcepts[tableConcept.conceptName].length === 0;
    },
    drawArrowsForConcepts: function () {
      for (let tableIndex in this.tableConcepts) {
        const currentTableConcept = this.tableConcepts[parseInt(tableIndex, 10)];
        if (!this.noKeyspace) {
          this.createArrow(this.$refs.keyspaceRelationConcept, this.$refs[`tableConcept_${tableIndex}`][0]);
        }
        for (let columnIndex in this.columnConcepts[currentTableConcept.conceptName]) {
          const currentColumnConcept = this.columnConcepts[currentTableConcept.conceptName][parseInt(columnIndex, 10)];
          this.createArrow(this.$refs[`tableConcept_${tableIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_columnConceptRelation_${columnIndex}`][0], currentColumnConcept);
          this.createArrow(this.$refs[`${currentTableConcept.conceptName}_columnConceptRelation_${columnIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_columnConcept_${columnIndex}`][0], currentColumnConcept);
          this.createArrow(this.$refs[`${currentTableConcept.conceptName}_columnConcept_${columnIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_typeConceptRelation_${columnIndex}`][0], currentColumnConcept);
          this.createArrow(this.$refs[`${currentTableConcept.conceptName}_typeConceptRelation_${columnIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_typeConcept_${columnIndex}`][0], currentColumnConcept);
        }
      }
    },
    removeArrows: function (relatedNode = null) {
      if (!relatedNode) {
        this.arrows.forEach(arrow => arrow.clear());
      } else {
        this.arrows.forEach(arrow => {
          if (arrow.relatedNode === relatedNode) {
            arrow.clear();
          }
        })
      }
    },
    removeColumnConcept: function (tableConcept, columnConcept) {
      if (columnConcept) {
        this.$emit('remove', {
          tableConcept,
          columnConcept
        });
        this.removeArrows(columnConcept);
      }
    },
    selectColumn: function (tableConcept, columnConcept) {
      this.$emit("select", columnConcept);
    }
  },
  computed: {
    keyspaceRelation: function () {
      return this.tableConcepts.length > 1 ? constants.relationTypes.hasMore : constants.relationTypes.has;
    },
    columnRelation: function () {
      return constants.relationTypes.hasType;
    },
  },
  updated: function () {
      if (!this.noKeyspace && this.keyspaceConcept) {
        this.createArrow(this.$refs.keyspaceConcept, this.$refs.keyspaceRelationConcept);
      }
      this.drawArrowsForConcepts();
  },
  unmounted: function () {
    this.removeArrows();
  },
  watch: {
    keyspaceConcept: function () {
      this.removeArrows();
    },
    tableConcepts: function () {
      this.removeArrows();
    }
  }
}
</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.tf-nc
  margin-bottom: 1.5em
  position: relative

  .v-btn
    position: absolute
    top: -45%
    left: 65%
    min-width: 0

    .v-icon
      color: variables.$cassandra-red

    &:hover > .v-btn__overlay
      opacity: 0

.tf-tree li ul
  margin: 0.5em 0

.table-first.tf-nc::before
  content: none !important

.table-first-no-col.tf-nc::after
  content: none !important

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

.conceptual-graph-with-border
  border: 1px dashed variables.$cassandra-blue
  width: 100%

.tf-nc::after, .tf-nc::before, .tf-tree .tf-nc:before, .tf-tree .tf-nc:after
  border-left: none

.tf-tree li li::before
  border-top: none

.arrow 
  position: fixed !important
  overflow: auto

.arrow__path 
  stroke: #000
  fill: transparent
  stroke-dasharray: 4 2

.arrow__head line
  stroke: #000
  stroke-width: 1px

.column-concept--selectable:hover
  border-radius: 10px
  cursor: pointer

</style>
