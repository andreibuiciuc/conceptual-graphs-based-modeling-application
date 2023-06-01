<template>
  <div
    v-if="graphMetadata.keyspace.conceptName"
    class="tf-tree conceptual-graph" :id="`${graphKey}_conceptualGraph`"
    :class="{ 'conceptual-graph-inverted': inverted, 'conceptual-graph-with-border': applyBorder }"
  >
    <ul class="conceptual-graph-root">
      <!-- Keyspace level-->
      <li>
        <div class="tf-nc keyspace-concept" :id="`${graphKey}_keyspaceConcept`" v-if="graphMetadata?.keyspace">
          <span class="concept-type">{{ graphMetadata.keyspace.conceptType }}:</span>
          <span class="concept-name">{{ graphMetadata.keyspace.conceptName }}</span>
        </div>
        <span class="tf-nc conceptual-graph-relation" :id="`${graphKey}_keyspaceRelationConcept`" v-if="graphMetadata?.keyspace">
          {{ constants.relationTypes.hasMore }}
        </span>
        <ul>
          <!-- Table level -->
          <li
            v-for="(tableConcept, tableIndex) in graphMetadata?.tables"
            :key="tableConcept.conceptName"
          >
            <div 
              :id="`${graphKey}_tableConcept_${tableIndex}`"
              class="tf-nc"
              :class="{ 'table-first': noKeyspace, 'table-first-no-col': doesGraphHaveOnlyTableConcept(tableConcept) }"
              >
              <span class="concept-type">{{ tableConcept.conceptType }}:</span>
              <span class="concept-name">{{ tableConcept.conceptName }}</span>
            </div>
            <ul>
              <!-- Column level -->
              <li
                :class="{ 'column-concept-hoverable': areColumnsSelectable }" v-if="graphMetadata.columns.size"
                v-for="(columnConcept, columnIndex) in graphMetadata.columns.get(tableConcept.conceptName)" :key="columnConcept.conceptName"
              >
                <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_${tableConcept.conceptName}_columnConceptRelation_${columnIndex}`">
                  <span class="concept-name">{{ columnConcept.relation }}</span>
                </div>
                <div :id="`${graphKey}_${tableConcept.conceptName}_columnConcept_${columnIndex}`"
                  class="tf-nc" :class="{ 'column-concept--selectable': areColumnsSelectable }"
                  @click.prevent="selectColumn(columnConcept)"
                  @mouseover="hoverColumn(columnConcept)"
                  @mouseout="hoverOffColumn(columnConcept)"
                  >
                  <span class="concept-type">{{ columnConcept.conceptType }}:</span>
                  <span class="concept-name">{{ columnConcept.conceptName }}</span>
                  <i 
                    v-if="areColumnConceptsDeletable" 
                    class="pi pi-times" 
                    style="font-size: 1.5rem;" 
                    @click="removeColumnConcept(tableConcept, columnConcept)">
                  </i>
                </div>
                <ul v-if="graphMetadata.dataTypes.size">
                  <!-- Type level -->
                  <li>
                    <div class="tf-nc conceptual-graph-relation" 
                      :id="`${graphKey}_${tableConcept.conceptName}_typeConceptRelation_${columnIndex}`">
                      <span class="concept-name">hasType</span>
                    </div>
                    <div class="tf-nc last" :id="`${graphKey}_${tableConcept.conceptName}_typeConcept_${columnIndex}`">
                      <span class="concept-type">{{ graphMetadata.dataTypes.get(columnConcept.conceptName)?.conceptType }}:</span>
                      <span class="concept-name">{{ graphMetadata.dataTypes.get(columnConcept.conceptName)?.conceptName }}</span>
                    </div>
                  </li>
                </ul>
                <ul v-if="columnIndex === 0 && isQueryGraph && queryConcepts" class="query-concepts">
                  <li v-if="queryConcepts[QueryClause.WHERE].columns.length">
                    <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_filterConcept`">
                      <span class="concept-name">{{ queryConcepts[QueryClause.WHERE].conceptRelation }}</span>
                    </div>
                    <div class="tf-nc" :id="`${graphKey}_filterReferentConcept`">
                      <span class="concept-type">{{ constants.conceptTypes.column }}:</span>
                      <span class="concept-name">{{ queryConcepts[QueryClause.WHERE].conceptReferent }}</span>
                    </div>
                  </li>
                  <li v-if="queryConcepts[QueryClause.ORDER_BY].columns.length">
                    <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_orderByConcept`">
                      <span class="concept-name">{{ queryConcepts[QueryClause.ORDER_BY].conceptRelation }}</span>
                    </div>
                    <div class="tf-nc" :id="`${graphKey}_orderByReferentConcept`">
                      <span class="concept-name">{{ queryConcepts[QueryClause.ORDER_BY].conceptReferent }}</span>
                    </div>
                  </li>
                  <li v-if="queryConcepts[QueryClause.GROUP_BY].columns.length">
                    <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_groupIdConcept`">
                      <span class="concept-name">groupId</span>
                    </div>
                  </li>
                </ul>
              </li>
              <template v-if="isQueryGraph && queryConcepts && queryConcepts[QueryClause.GET]">
                <template v-for="aggregationFunctionName of ['count', 'min', 'max', 'avg', 'sum']">
                  <li class="aggregation-function-item" v-if="queryConcepts[QueryClause.GET][aggregationFunctionName].conceptReferent">
                    <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_${aggregationFunctionName}Concept`">
                      <span class="concept-name">get</span>
                    </div>
                    <div class="tf-nc" :id="`${graphKey}_${aggregationFunctionName}ReferentConcept`">
                      <span class="concept-type">F:</span>
                      <span class="concept-name">{{ queryConcepts[QueryClause.GET][aggregationFunctionName].conceptReferent }}</span>
                    </div>
                  </li>
                </template>
              </template>
              <template v-if="isQueryGraph && queryConcepts && queryConcepts[QueryClause.GROUP_BY]">
                <li class="group-by-item" v-if="queryConcepts.groupBy.conceptReferent">
                  <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_groupByConcept`">
                    <span class="concept-name">groupBy</span>
                  </div>
                  <div class="tf-nc" :id="`${graphKey}_groupByReferentConcept`">
                    <span class="concept-type">CL:</span>
                    <span class="concept-name">{{ queryConcepts[QueryClause.GROUP_BY].conceptReferent }}</span>
                  </div>
                </li>
              </template>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import constants from '../../../constants/constants';
import { QueryClause, Concept, GraphMetadata } from "../../../types/types";

import { useQueryStore } from '@/stores/query';

import arrowCreate from 'arrows-svg';
import { computed } from '@vue/reactivity';
import { ComputedRef, Ref, nextTick, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

interface Props {
  graphMetadata: GraphMetadata
  inverted?: boolean
  applyBorder?: boolean
  noKeyspace?: boolean
  isQueryGraph?: boolean
  areColumnConceptsDeletable?: boolean
  areColumnsSelectable?: boolean
  graphKey: string
};

const props = defineProps<Props>();
const emit = defineEmits(['select', 'remove', 'hover', 'hoveroff']);

// Store mappings
const queryStore = useQueryStore();
const { queryConcepts } = storeToRefs(queryStore);

// Functionalities related to the creation and drawing of svg arrows.

const arrows: Ref<any[]> = ref([]);

const createArrow = (sourceNode: HTMLElement, targetNode: HTMLElement, relatedConcept: Concept | null = null) => {
  
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
    },
    updateDelay: 0
  });

  // Attach the related (parent) concept to the current arrow.
  arrow.relatedNode = relatedConcept;
  
  if (relatedConcept) {
    arrow.node.firstElementChild.setAttribute('related-concept', `${relatedConcept.conceptName}`);
  }
  
  const elementRef = document.getElementById(`${props.graphKey}_conceptualGraph`);
  if (elementRef) {
    elementRef.append(arrow.node);
    arrows.value.push(arrow);
  }
  
};

const drawArrowsForConcepts = async (): Promise<void> => {
  await nextTick();
  for (let tableIndex in props.graphMetadata?.tables) {
    const currentTableConcept = props.graphMetadata.tables[parseInt(tableIndex, 10)];
    let tableConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_tableConcept_${tableIndex}`);

    if (!props.noKeyspace) {
      const keyspaceRelationConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_keyspaceRelationConcept`);
      createArrow(keyspaceRelationConceptElement, tableConceptElement);
    }

    for (let columnIndex in props.graphMetadata.columns.get(currentTableConcept.conceptName)) {
      const currentColumnConcept: Concept | undefined = props.graphMetadata.columns.get(currentTableConcept.conceptName)?.at(parseInt(columnIndex, 10));
      const columnConceptRelationElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTableConcept.conceptName}_columnConceptRelation_${columnIndex}`);
      const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTableConcept.conceptName}_columnConcept_${columnIndex}`);

      createArrow(tableConceptElement, columnConceptRelationElement, currentColumnConcept);
      createArrow(columnConceptRelationElement, columnConceptElement, currentColumnConcept);

      if (props.graphMetadata.dataTypes.size) {
        const typeConceptRelationElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTableConcept.conceptName}_typeConceptRelation_${columnIndex}`);
        const typeConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTableConcept.conceptName}_typeConcept_${columnIndex}`);

        createArrow(columnConceptElement, typeConceptRelationElement, currentColumnConcept);
        createArrow(typeConceptRelationElement, typeConceptElement, currentColumnConcept);
      }
    }
  }
};

const drawArrowsForWhereQueryConcepts = async (): Promise<void> => {
  if (queryConcepts.value && queryConcepts.value[QueryClause.WHERE].columns) {
    await nextTick();
    const currentTableConceptName = props.graphMetadata.tables[0].conceptName;

    for (let columnIndex in queryConcepts.value[QueryClause.WHERE].columns) {
      const columnConcept: Concept = queryConcepts.value[QueryClause.WHERE].columns[parseInt(columnIndex)];
      const index = props.graphMetadata.columns.get(currentTableConceptName)?.findIndex(x => x.conceptName === columnConcept.conceptName);

      const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTableConceptName}_columnConcept_${index}`);
      const filterConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_filterConcept`);
      const filterReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_filterReferentConcept`);

      createArrow(columnConceptElement, filterConceptElement, columnConcept);
      createArrow(filterConceptElement, filterReferentElement, columnConcept);
    }
  }
};

const drawArrowsForOrderByQueryConcepts = async (): Promise<void> => {
  if (queryConcepts.value && queryConcepts.value[QueryClause.ORDER_BY].columns) {
    await nextTick();
    const currentTable: Concept | undefined = props.graphMetadata.tables.at(0);
    if (!currentTable) {
      return ;
    }

    for (let columnIndex in queryConcepts.value[QueryClause.ORDER_BY].columns) {
      const columnConcept: Concept | undefined = queryConcepts.value[QueryClause.ORDER_BY].columns[parseInt(columnIndex)];
      const index = props.graphMetadata.columns.get(currentTable.conceptName)?.findIndex(concept => concept.conceptName === columnConcept?.conceptName);
      if (columnConcept && index > -1) {
        
        const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTable.conceptName}_columnConcept_${index}`);
        const orderByConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_orderByConcept`);
        const orderByReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_orderByReferentConcept`);

        createArrow(columnConceptElement, orderByConceptElement, columnConcept);
        createArrow(orderByConceptElement, orderByReferentElement, columnConcept);
      }
    }
  }
};

const drawArrowsForGroupByQueryConcepts = async (): Promise<void> => {
  if (queryConcepts.value && queryConcepts.value[QueryClause.ORDER_BY].columns) {

    await nextTick();
    
    const currentTable: Concept | undefined = props.graphMetadata.tables.at(0);
    if (!currentTable) {
      return ;
    }

    const tableConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_tableConcept_${0}`);
    const groupByConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_groupByConcept`);
    const groupByReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_groupByReferentConcept`);
    createArrow(tableConceptElement, groupByConceptElement);
    createArrow(groupByConceptElement, groupByReferentElement);

  }
};

const drawArrowsForGroupIdConcept = async (): Promise<void> => {
  if (queryConcepts.value && queryConcepts.value[QueryClause.GROUP_BY].columns) {
    await nextTick();
    const currentTable: Concept | undefined = props.graphMetadata.tables.at(0);
    if (!currentTable) {
      return ;
    }

    for (let columnIndex in queryConcepts.value[QueryClause.GROUP_BY].columns) {
      const columnConcept: Concept | undefined = queryConcepts.value[QueryClause.GROUP_BY].columns[parseInt(columnIndex)];
      const index = props.graphMetadata.columns.get(currentTable.conceptName)?.findIndex(concept => concept.conceptName === columnConcept?.conceptName);
      if (columnConcept && index > -1) {
        
        const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTable.conceptName}_columnConcept_${index}`);
        const groupIdConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_groupIdConcept`);
        const groupByReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_groupByReferentConcept`);

        createArrow(columnConceptElement, groupIdConceptElement, columnConcept);
        createArrow(groupIdConceptElement, groupByReferentElement);
      }
    }
  }
};

const drawArrowsForAggregateFunctions = async (): Promise<void> => {
  if (queryConcepts.value && queryConcepts.value[QueryClause.GET].count) {
    
    await nextTick();
    
    const currentTable: Concept | undefined = props.graphMetadata.tables.at(0);
    if (!currentTable) {
      return ;
    }

    const tableConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_tableConcept_${0}`);

    for (let aggregateFunctionName of ['count', 'min', 'max', 'avg', 'sum']) {
      const countConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${aggregateFunctionName}Concept`);
      const countReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${aggregateFunctionName}ReferentConcept`);
      createArrow(tableConceptElement, countConceptElement);
      createArrow(countConceptElement, countReferentElement);
    }
    
  }
};

const drawArrowsForOutConcept = async (): Promise<void> => {
  if (isOutConceptVisible.value) {
    await nextTick();
    const currentTable: Concept | undefined = props.graphMetadata.tables.at(0);
    if (!currentTable) {
      return ;
    }

    const currentColumns: Concept[] | undefined = props.graphMetadata.columns.get(currentTable.conceptName);
    if (!currentColumns) {
      return ;
    }

    for (let columnIndex in currentColumns) {
      const columnConcept: Concept | undefined = currentColumns[parseInt(columnIndex)];
      if (columnConcept) {
        
        const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTable.conceptName}_columnConcept_${columnIndex}`);
        const outConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_outConcept`);
        const outReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_outReferentConcept`);

        createArrow(columnConceptElement, outConceptElement, columnConcept);
        createArrow(outConceptElement, outReferentElement, columnConcept);
      }
    }
  }
};

const drawArrowsForQueryConcepts = (): void => {
  if (props.isQueryGraph) {
    drawArrowsForWhereQueryConcepts();
    drawArrowsForOrderByQueryConcepts();
    drawArrowsForGroupByQueryConcepts();
    drawArrowsForGroupIdConcept();
    drawArrowsForAggregateFunctions();
    drawArrowsForOutConcept();
  }
};

const drawInitialArrows = async (): Promise<void> => {
  await nextTick();
  if (!props.noKeyspace && props.graphMetadata?.keyspace) {
    const keyspaceConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_keyspaceConcept`);
    const keyspaceRelationConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_keyspaceRelationConcept`);
    createArrow(keyspaceConceptElement, keyspaceRelationConceptElement);
  } 
  drawArrowsForConcepts();
};

// Functionalities related to the removal of columns and svg arrows
const removeArrows = () => {
  arrows.value.forEach((arrow: any) => arrow.clear());
};

const removeColumnConcept = async (tableConcept: Concept, columnConcept: Concept) => {
  emit('remove', { tableConcept, columnConcept });
};


// Functionalities related to events
const selectColumn = (columnConcept: Concept) => {
  emit("select", columnConcept);
};

const isOutConceptVisible: ComputedRef<boolean> = computed(() => {
  return !!queryConcepts.value && (!!queryConcepts.value[QueryClause.WHERE].columns.length || !!queryConcepts.value[QueryClause.ORDER_BY].columns.length);
});

const doesGraphHaveOnlyTableConcept = (tableConcept: Concept) => {
  return tableConcept && props.graphMetadata.tables.length && props.graphMetadata.columns && props.graphMetadata.columns.size;
}

const getTypeConceptForColumnConcept = (columnConcept: Concept): Concept => {
  return props.graphMetadata.dataTypes.get(columnConcept.conceptName);
}

const hoverColumn = (columnConcept: Concept) => {
  const dataTypeConcept = getTypeConceptForColumnConcept(columnConcept);
  emit('hover', {
    columnConcept,
    dataTypeConcept
  });
};

const hoverOffColumn = (columnConcept: Concept) => {
  emit('hoveroff', columnConcept);
}

const rerenderArrows = (): void => {
  removeArrows();
  drawInitialArrows();
  drawArrowsForConcepts();
  if (queryConcepts.value) {
    drawArrowsForQueryConcepts();
  }
};

onUnmounted(() => {
  removeArrows();
  queryStore.resetQueryClauseItems();
  queryStore.resetQueryConcepts();
});

defineExpose({
  drawArrowsForConcepts,
  drawArrowsForQueryConcepts,
  drawInitialArrows,
  removeArrows,
  rerenderArrows
});

</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.tf-nc
  margin-bottom: 1.5em
  position: relative

  &:hover .tf-nc
    cursor: pointer
    border-color: 1px solid variables.$cassandra-app-blue
  
  .pi
    position: absolute
    top: 0
    right: 0
    font-size: 1rem !important

  .pi:hover
    cursor: pointer
    color: variables.$cassandra-red

li.column-concept-hoverable:hover 
  
  .tf-nc
    border-color: variables.$cassandra-app-blue

li.aggregation-function-item
  margin-top: 10rem !important

li.group-by-item
  margin-top: 15rem !important

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
  color: variables.$cassandra-app-blue
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
  border: 1px dashed variables.$cassandra-app-blue
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

.query-concepts
  margin-top: 2rem !important

</style>
