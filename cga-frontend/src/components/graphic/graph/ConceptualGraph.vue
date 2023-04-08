<template>
  <div
    class="tf-tree conceptual-graph" id="conceptualGraph"
    :class="{ 'conceptual-graph-inverted': inverted, 'conceptual-graph-with-border': applyBorder }"
  >
    <ul class="conceptual-graph-root">
      <!-- Keyspace level-->
      <li>
        <div class="tf-nc keyspace-concept" id="keyspaceConcept" v-if="graphMetadata?.keyspace">
          <span class="concept-type">{{ graphMetadata.keyspace.conceptType }}:</span>
          <span class="concept-name">{{ graphMetadata.keyspace.conceptName }}</span>
        </div>
        <span class="tf-nc conceptual-graph-relation" id="keyspaceRelationConcept" v-if="graphMetadata?.keyspace">
          {{ constants.relationTypes.hasMore }}
        </span>
        <ul>
          <!-- Table level -->
          <li
            v-for="(tableConcept, tableIndex) in graphMetadata?.tables"
            :key="tableConcept.conceptName"
          >
            <div :id="`tableConcept_${tableIndex}`"
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
              <li :class="{ 'column-concept-hoverable': areColumnsSelectable }" v-if="graphMetadata.columns.size"
                v-for="(columnConcept, columnIndex) in graphMetadata.columns.get(tableConcept.conceptName)" :key="columnConcept.conceptName"
              >
                <div class="tf-nc conceptual-graph-relation" :id="`${tableConcept.conceptName}_columnConceptRelation_${columnIndex}`">
                  <span class="concept-name">{{ columnConcept.relation }}</span>
                </div>
                <div :id="`${tableConcept.conceptName}_columnConcept_${columnIndex}`"
                  class="tf-nc" :class="{ 'column-concept--selectable': areColumnsSelectable }"
                  @click.prevent="selectColumn(columnConcept)"
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
                <ul v-if="graphMetadata.dataTypes.size">
                  <!-- Type level -->
                  <li>
                    <div class="tf-nc conceptual-graph-relation" 
                      :ref="`${tableConcept.conceptName}_typeConceptRelation_${columnIndex}`"
                      :id="`${tableConcept.conceptName}_typeConceptRelation_${columnIndex}`">
                      <span class="concept-name">hasType</span>
                    </div>
                    <div class="tf-nc last" :id="`${tableConcept.conceptName}_typeConcept_${columnIndex}`">
                      <span class="concept-type">{{ graphMetadata.dataTypes.get(columnConcept.conceptName)?.conceptType }}:</span>
                      <span class="concept-name">{{ graphMetadata.dataTypes.get(columnConcept.conceptName)?.conceptName }}</span>
                    </div>
                  </li>
                </ul>
                <ul v-show="columnIndex === 0 && isQueryGraph && queryConcepts && queryConcepts[QueryClause.WHERE].columns.length">
                  <li>
                    <div class="tf-nc conceptual-graph-relation" ref="filter">
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.WHERE].conceptRelation }}</span>
                    </div>
                    <div class="tf-nc" ref="filterReferent">
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.WHERE].conceptReferent }}</span>
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

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue';
import constants from '../../../constants/constants';
import { QueryClause, Concept, GraphMetadata } from "../../../types/types";

import arrowCreate from 'arrows-svg';

interface Props {
  graphMetadata: GraphMetadata
  inverted?: boolean,
  applyBorder?: boolean,
  noKeyspace?: boolean,
  isQueryGraph?: boolean,
  queryConcepts?: Object,
  areColumnConceptsDeletable?: boolean,
  areColumnsSelectable?: boolean
};

const props = defineProps<Props>();
const emit = defineEmits(['select', 'remove']);

const arrows: Ref<any> = ref([]);

const createArrow = (sourceNode: any, targetNode: any, relatedNode: any = null) => {
  if (!sourceNode || !targetNode) {
    return;
  }
  const arrow = arrowCreate({
    from: {
      node: sourceNode,
      direction: 'bottom'
    },
    to: {
      node: targetNode,
      direction: 'top'
    }
  });
  arrow.relatedNode = relatedNode;
  arrows.value.push(arrow);
  const elementRef = document.getElementById("conceptualGraph");
  if (elementRef) {
    elementRef.append(arrow.node);
  }
};

const doesGraphHaveOnlyTableConcept = (tableConcept: Concept) => {
  return tableConcept && props.graphMetadata.tables.length && props.graphMetadata.columns && props.graphMetadata.columns.size;
}

const drawArrowsForConcepts = () => {
  for (let tableIndex in props.graphMetadata?.tables) {
    const currentTableConcept = props.graphMetadata.tables[parseInt(tableIndex, 10)];
    let tableConceptElement: HTMLElement | null = document.getElementById(`tableConcept_${tableIndex}`);

    if (!props.noKeyspace) {
      const keyspaceRelationElement: HTMLElement | null = document.getElementById(`tableConcept_${tableIndex}`);
      createArrow(keyspaceRelationElement, tableConceptElement);
    }

    for (let columnIndex in props.graphMetadata.columns.get(currentTableConcept.conceptName)) {
      const currentColumnConcept: Concept | undefined = props.graphMetadata.columns.get(currentTableConcept.conceptName)?.at(parseInt(columnIndex, 10));

      const columnConceptRelationElement: HTMLElement | null = document.getElementById(`${currentTableConcept.conceptName}_columnConceptRelation_${columnIndex}`);
      const columnConceptElement: HTMLElement | null = document.getElementById(`${currentTableConcept.conceptName}_columnConcept_${columnIndex}`);

      createArrow(tableConceptElement, columnConceptRelationElement, currentColumnConcept);
      createArrow(columnConceptRelationElement, columnConceptElement, currentColumnConcept);

      if (props.graphMetadata.dataTypes.size) {
        const typeConceptRelationElement: HTMLElement | null = document.getElementById(`${currentTableConcept.conceptName}_typeConceptRelation_${columnIndex}`);
        const typeConceptElement: HTMLElement | null = document.getElementById(`${currentTableConcept.conceptName}_typeConcept_${columnIndex}`);

        createArrow(columnConceptElement, typeConceptRelationElement, currentColumnConcept);
        createArrow(typeConceptRelationElement, typeConceptElement, currentColumnConcept);
      }
    }
  }
};

const drawInitialArrows = () => {
  if (!props.noKeyspace && props.graphMetadata?.keyspace) {
    const keyspaceConceptElement: HTMLElement | null = document.getElementById('keyspaceConcept');
    const keyspaceRelationConceptElement: HTMLElement | null = document.getElementById('keyspaceRelationConcept');
    createArrow(keyspaceConceptElement, keyspaceRelationConceptElement);
  } 
  drawArrowsForConcepts();
};

const removeArrows = (relatedConcept: Concept | null = null) => {
  if (!relatedConcept) {
    arrows.value.forEach((arrow: any) => arrow.clear());
  } else {
    arrows.value.forEach((arrow: any) => {
      if (arrow.relatedNode === relatedConcept) {
        arrow.clear();
      }
    });
  }
};

const removeColumnConcept = (tableConcept: Concept, columnConcept: Concept) => {
  if (columnConcept) {
    removeArrows(columnConcept);
    emit('remove', { tableConcept, columnConcept });
  }
};

const selectColumn = (columnConcept: Concept) => {
  emit("select", columnConcept);
};

watch(() => props.graphMetadata.tables, () => {
  removeArrows();
  drawArrowsForConcepts();
});

watch(() => props.graphMetadata.keyspace, () => {
  removeArrows();
});

onMounted(() => {
  drawInitialArrows();
});

onUpdated(() => {
  removeArrows();
  drawInitialArrows();
});

onUnmounted(() => {
  removeArrows();
});

defineExpose({
  removeArrows,
  drawArrowsForConcepts,
});


// export default {
//   name: "ConceptualGraph",
//   props: {
//     keyspaceConcept: Object,
//     tableConcepts: Array,
//     columnConcepts: Object,
//     dataTypeConcepts: Object,
//     inverted: Boolean,
//     applyBorder: Boolean,
//     noKeyspace: Boolean,
//     isQueryGraph: Boolean,
//     queryConcepts: Object,
//     areColumnConceptsDeletable: Boolean,
//     areColumnsSelectable: Boolean
//   },
//   data: () => ({
//     arrows: []
//   }),
//   expose: ['drawArrowsForQueryConcepts'],
//   methods: {
//     createArrow: function (sourceNode, targetNode, relatedNode) {
//       const arrow = arrowCreate({
//         from: {
//           node: sourceNode,
//           direction: DIRECTION.BOTTOM
//         }, 
//         to: {
//           node: targetNode, 
//           direction: DIRECTION.TOP,
//         } 
//       });
//       arrow.relatedNode = relatedNode;
//       this.arrows.push(arrow);
//       const elementRef = document.getElementById("conceptualGraph");
//       elementRef.append(arrow.node);
//     },
//     doesGraphHaveOnlyTableConcept: function (tableConcept) {
//       return tableConcept && this.columnConcepts && this.columnConcepts[tableConcept.conceptName].length === 0;
//     },
//     drawArrowsForConcepts: function () {
//       for (let tableIndex in this.tableConcepts) {
//         const currentTableConcept = this.tableConcepts[parseInt(tableIndex, 10)];
//         if (!this.noKeyspace) {
//           this.createArrow(this.$refs.keyspaceRelationConcept, this.$refs[`tableConcept_${tableIndex}`][0]);
//         }
//         for (let columnIndex in this.columnConcepts[currentTableConcept.conceptName]) {
//           const currentColumnConcept = this.columnConcepts[currentTableConcept.conceptName][parseInt(columnIndex, 10)];
//           this.createArrow(this.$refs[`tableConcept_${tableIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_columnConceptRelation_${columnIndex}`][0], currentColumnConcept);
//           this.createArrow(this.$refs[`${currentTableConcept.conceptName}_columnConceptRelation_${columnIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_columnConcept_${columnIndex}`][0], currentColumnConcept);
//           if (this.dataTypeConcepts) {
//             this.createArrow(this.$refs[`${currentTableConcept.conceptName}_columnConcept_${columnIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_typeConceptRelation_${columnIndex}`][0], currentColumnConcept);
//             this.createArrow(this.$refs[`${currentTableConcept.conceptName}_typeConceptRelation_${columnIndex}`][0], this.$refs[`${currentTableConcept.conceptName}_typeConcept_${columnIndex}`][0], currentColumnConcept);
//           }
//         }
//       }
//     },
//     drawArrowsForQueryConcepts: async function () {
//       await this.$nextTick();
//       if (this.isQueryGraph && this.queryConcepts && this.queryConcepts[QueryClause.WHERE].columns) {
//         const currentTableConcept = this.tableConcepts[0];
//         for (let columnIndex in this.queryConcepts[QueryClause.WHERE].columns) {
//           const columnConcept = this.queryConcepts[QueryClause.WHERE].columns[parseInt(columnIndex)];
//           const index = this.columnConcepts[currentTableConcept.conceptName].findIndex(x => x.conceptName === columnConcept.conceptName);
//           this.createArrow(this.$refs[`${currentTableConcept.conceptName}_columnConcept_${index}`][0], this.$refs.filter[0]);
//           this.createArrow(this.$refs.filter[0], this.$refs.filterReferent[0]);
//         }
//       }
//     },
//     drawInitialArrows: function () {
//       if (!this.noKeyspace && this.keyspaceConcept) {
//         this.createArrow(this.$refs.keyspaceConcept, this.$refs.keyspaceRelationConcept);
//       } 
//       this.drawArrowsForConcepts();
//     },
//     removeArrows: function (relatedNode = null) {
//       if (!relatedNode) {
//         this.arrows.forEach(arrow => arrow.clear());
//       } else {
//         this.arrows.forEach(arrow => {
//           if (arrow.relatedNode === relatedNode) {
//             arrow.clear();
//           }
//         })
//       }
//     },
//     removeColumnConcept: function (tableConcept, columnConcept) {
//       if (columnConcept) {
//         this.$emit('remove', { tableConcept, columnConcept });
//         this.removeArrows(columnConcept);
//       }
//     },
//     selectColumn: function (columnConcept) {
//       this.$emit("select", columnConcept);
//     }
//   },
//   computed: {
//     keyspaceRelation: function () {
//       return this.tableConcepts.length > 1 ? constants.relationTypes.hasMore : constants.relationTypes.has;
//     },
//     columnRelation: function () {
//       return constants.relationTypes.hasType;
//     },
//     whereClause: function () {
//       return QueryClause.WHERE;
//     }
//   },
//   updated: function () {
//     this.removeArrows();
//     this.drawInitialArrows();
//   },
//   mounted: function () {
//     this.drawInitialArrows();
//   },
//   unmounted: function () {
//     this.removeArrows();
//   },
//   watch: {
//     tableConcepts: function () {
//       this.removeArrows();
//       this.drawArrowsForConcepts();
//     },
//     keyspaceConcept: function () {
//       this.removeArrows();
//     },
//     tableConcepts: function () {
//       this.removeArrows();
//     }
//   },
//   created: function () {
//     console.log(this.columnConcepts);
//   }
//}
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

li.column-concept-hoverable:hover .tf-nc
    background-color: variables.$cassandra-light-blue

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
