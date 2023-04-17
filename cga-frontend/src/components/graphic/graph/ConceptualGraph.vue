<template>
  <div
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
            :graphKey="tableConcept.conceptName"
          >
            <div 
              :id="`${graphKey}_tableConcept_${tableIndex}`"
              class="tf-nc"
              :class="{ 'table-first': noKeyspace, 'table-first-no-col': doesGraphHaveOnlyTableConcept(tableConcept) }"
              >
              <span class="concept-type">{{ tableConcept.conceptType }}:</span>
              <span class="concept-name">{{ tableConcept.conceptName }}</span>
              <i class="pi" :class="tableConcept.isTableExpanded ? 'pi-minus' : 'pi-plus'" style="font-size: 1.5rem;" @click="expandTable(tableConcept)"></i>
            </div>
            <ul>
              <!-- Column level -->
              <li
                :class="{ 'column-concept-hoverable': areColumnsSelectable }" v-if="graphMetadata.columns.size"
                v-for="(columnConcept, columnIndex) in graphMetadata.columns.get(tableConcept.conceptName)" :graphKey="columnConcept.conceptName"
              >
                <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_${tableConcept.conceptName}_columnConceptRelation_${columnIndex}`">
                  <span class="concept-name">{{ columnConcept.relation }}</span>
                </div>
                <div :id="`${graphKey}_${tableConcept.conceptName}_columnConcept_${columnIndex}`"
                  class="tf-nc" :class="{ 'column-concept--selectable': areColumnsSelectable }"
                  @click.prevent="selectColumn(columnConcept)"
                  >
                  <span class="concept-type">{{ columnConcept.conceptType }}:</span>
                  <span class="concept-name">{{ columnConcept.conceptName }}</span>
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
                      :id="`${graphKey}_${tableConcept.conceptName}_typeConceptRelation_${columnIndex}`">
                      <span class="concept-name">hasType</span>
                    </div>
                    <div class="tf-nc last" :id="`${graphKey}_${tableConcept.conceptName}_typeConcept_${columnIndex}`">
                      <span class="concept-type">{{ graphMetadata.dataTypes.get(columnConcept.conceptName)?.conceptType }}:</span>
                      <span class="concept-name">{{ graphMetadata.dataTypes.get(columnConcept.conceptName)?.conceptName }}</span>
                    </div>
                  </li>
                </ul>
                <ul v-if="columnIndex === 0 && isQueryGraph && queryConcepts">
                  <li v-if="queryConcepts[QueryClause.WHERE].columns.length">
                    <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_filterConcept`">
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.WHERE].conceptRelation }}</span>
                    </div>
                    <div class="tf-nc" :id="`${graphKey}_filterReferentConcept`">
                      <span class="concept-type">{{ constants.conceptTypes.column }}:</span>
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.WHERE].conceptReferent }}</span>
                    </div>
                  </li>
                  <li v-if="queryConcepts[QueryClause.ORDER_BY].columns.length">
                    <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_orderByConcept`">
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.ORDER_BY].conceptRelation }}</span>
                    </div>
                    <div class="tf-nc" :id="`${graphKey}_orderByReferentConcept`">
                      <span class="concept-type">{{ constants.conceptTypes.column }}:</span>
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.ORDER_BY].conceptReferent }}</span>
                    </div>
                  </li>
                </ul>
                <!-- <ul v-show="columnIndex === 0 && isQueryGraph && queryConcepts && queryConcepts[QueryClause.ORDER_BY].columns.length">
                  <li>
                    <div class="tf-nc conceptual-graph-relation" :id="`${graphKey}_orderByConcept`">
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.ORDER_BY].conceptRelation }}</span>
                    </div>
                    <div class="tf-nc" :id="`${graphKey}_orderByReferentConcept`">
                      <span class="concept-type">{{ constants.conceptTypes.column }}:</span>
                      <span class="concept-name" v-if="queryConcepts">{{ queryConcepts[QueryClause.ORDER_BY].conceptReferent }}</span>
                    </div>
                  </li>
                </ul> -->
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Ref, nextTick, onUnmounted, ref } from 'vue';
import constants from '../../../constants/constants';
import { QueryClause, Concept, ConfigurableConcept, GraphMetadata } from "../../../types/types";

import arrowCreate from 'arrows-svg';

interface Props {
  graphMetadata: GraphMetadata
  inverted?: boolean
  applyBorder?: boolean
  noKeyspace?: boolean
  isQueryGraph?: boolean
  queryConcepts?: Object
  areTablesCollapsable?: boolean,
  areColumnConceptsDeletable?: boolean
  areColumnsSelectable?: boolean
  graphKey: string
};

const props = defineProps<Props>();
const emit = defineEmits(['select', 'remove']);

const arrows: Ref<any> = ref([]);

const createArrow = (sourceNode: any, targetNode: any, relatedConcept: Concept | null = null) => {
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
  arrow.relatedNode = relatedConcept;
  
  // Add class for the arrow svg
  if (relatedConcept) {
    arrow.node.firstElementChild.setAttribute('related-concept', `${relatedConcept.conceptName}`);
  }
  
  const elementRef = document.getElementById(`${props.graphKey}_conceptualGraph`);
  if (elementRef) {
    elementRef.append(arrow.node);
  }
  
};

const doesGraphHaveOnlyTableConcept = (tableConcept: Concept) => {
  return tableConcept && props.graphMetadata.tables.length && props.graphMetadata.columns && props.graphMetadata.columns.size;
}

const drawArrowsForConcept = async (tableConcept: Concept): Promise<void> => {
  await nextTick();
  const tableIndex = props.graphMetadata.tables.findIndex(table => table.conceptName === tableConcept.conceptName);
  const tableConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_tableConcept_${tableIndex}`);
  for (let columnIndex in props.graphMetadata.columns.get(tableConcept.conceptName)) {
    const currentColumnConcept: Concept | undefined = props.graphMetadata.columns.get(tableConcept.conceptName)?.at(parseInt(columnIndex, 10));

    const columnConceptRelationElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${tableConcept.conceptName}_columnConceptRelation_${columnIndex}`);
    const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${tableConcept.conceptName}_columnConcept_${columnIndex}`);

    createArrow(tableConceptElement, columnConceptRelationElement, currentColumnConcept);
    createArrow(columnConceptRelationElement, columnConceptElement, currentColumnConcept);

    if (props.graphMetadata.dataTypes.size) {
      const typeConceptRelationElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${tableConcept.conceptName}_typeConceptRelation_${columnIndex}`);
      const typeConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${tableConcept.conceptName}_typeConcept_${columnIndex}`);

      createArrow(columnConceptElement, typeConceptRelationElement, currentColumnConcept);
      createArrow(typeConceptRelationElement, typeConceptElement, currentColumnConcept);
    }
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
  if (props.queryConcepts && props.queryConcepts[QueryClause.WHERE].columns) {
    await nextTick();
    const currentTableConceptName = props.graphMetadata.tables[0].conceptName;

    for (let columnIndex in props.queryConcepts[QueryClause.WHERE].columns) {
      const columnConcept = props.queryConcepts[QueryClause.WHERE].columns[parseInt(columnIndex)];
      const index = props.graphMetadata.columns.get(currentTableConceptName)?.findIndex(x => x.conceptName === columnConcept.conceptName);

      const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTableConceptName}_columnConcept_${index}`);
      const filterConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_filterConcept`);
      const filterReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_filterReferentConcept`);

      createArrow(columnConceptElement, filterConceptElement);
      createArrow(filterConceptElement, filterReferentElement);
    }
  }
};

const drawArrowsForOrderByQueryConcepts = async (): Promise<void> => {
  if (props.queryConcepts && props.queryConcepts[QueryClause.ORDER_BY].columns) {
    await nextTick();
    const currentTable: Concept | undefined = props.graphMetadata.tables.at(0);
    if (!currentTable) {
      return ;
    }

    for (let columnIndex in props.queryConcepts[QueryClause.ORDER_BY].columns) {
      const columnConcept: Concept | undefined = props.queryConcepts[QueryClause.ORDER_BY].columns[parseInt(columnIndex)];
      const index = props.graphMetadata.columns.get(currentTable.conceptName)?.findIndex(concept => concept.conceptName === columnConcept?.conceptName);
      if (columnConcept && index && index > -1) {
        
        const columnConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_${currentTable.conceptName}_columnConcept_${index}`);
        const orderByConceptElement: HTMLElement | null = document.getElementById(`${props.graphKey}_orderByConcept`);
        const orderByReferentElement: HTMLElement | null = document.getElementById(`${props.graphKey}_orderByReferentConcept`);

        createArrow(columnConceptElement, orderByConceptElement);
        createArrow(orderByConceptElement, orderByReferentElement);
      }
    }
  }
};

const drawArrowsForQueryConcepts = async (): Promise<void> => {
  if (props.isQueryGraph) {
    drawArrowsForWhereQueryConcepts();
    drawArrowsForOrderByQueryConcepts();
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

const removeArrows = (relatedConcept: Concept | null = null) => {
  if (!relatedConcept) {
    arrows.value.forEach((arrow: any) => arrow.clear());
  } else {
    removeArrowForChildrenConcepts(relatedConcept);
  }
};

const removeArrowForChildrenConcepts = (parentConcept: Concept): void => {
  arrows.value.forEach((arrow: any) => {
    if (arrow.relatedNode === parentConcept) {
      arrow.clear();
    }
  });
}

const removeColumnConcept = (tableConcept: Concept, columnConcept: Concept) => {
  if (columnConcept) {
    removeArrows(columnConcept);
    emit('remove', { tableConcept, columnConcept });
  }
};

const expandTable = (tableConcept: ConfigurableConcept): void => {
  tableConcept.isTableExpanded = !tableConcept.isTableExpanded;
  hideOrShowArrowsForConcept(tableConcept);
};

const hideOrShowArrowsForConcept = (concept: ConfigurableConcept): void => {
  const arrowSvgs = document.querySelectorAll(`[related-concept=t0]`);
  arrowSvgs.forEach((svg: Element) => {
    const castedSvg = <HTMLElement> svg;
    if (concept.isTableExpanded) {
      castedSvg.style.setProperty('visibility', '0')
    } else {
      castedSvg.style.setProperty('visibility', 'visible')
    }
  });
};

const selectColumn = (columnConcept: Concept) => {
  emit("select", columnConcept);
};

onUnmounted(() => {
  removeArrows();
});

defineExpose({
  drawArrowsForConcepts,
  drawArrowsForQueryConcepts,
  drawInitialArrows,
  removeArrows,
});

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
