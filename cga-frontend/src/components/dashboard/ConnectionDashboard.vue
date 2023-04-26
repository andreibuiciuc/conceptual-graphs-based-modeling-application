<template>
  <div class="dashboard">
    <div class="dashboard-tag-container">
      
      <Card
        v-if="forceGraph && graphMetadata.keyspace"
        class="concept-node-lookup-container">
        
        <template #title>
          concept node lookup
        </template>

        <template #content>
          <div class="info">
            <div class="relation-dummy"></div>
            <div class="concept-dummy">
              <span v-if="conceptForLookup">{{ conceptForLookup.conceptType }}</span>
            </div>
            <div class="relation-dummy"></div>
          </div>
          <div class="info">
            <span>concept type:</span>
            <span>{{ conceptForLookup ? conceptTypeInfoText : 'not selected yet' }}</span>
          </div>
          <div class="info">
            <span>concept name:</span> 
            <span>{{ conceptForLookup ? conceptForLookup.conceptName : 'not selected yet' }}</span>
          </div>
          <div class="info">
            <span>children count:</span>
            <span>{{ conceptForLookup ? `${conceptForLookup.childrenCount} child concepts` : 'not selected yet'}}</span>
          </div>
        </template>
      </Card>
      
      <Transition name="pop-in" mode="out-in">
        <Tag v-if="forceGraph && cassandraServerCredentials.isCassandraServerConnected && currentKeyspace"
          icon="pi pi-check"
          severity="success"
          value="force graph is the recommended representation of higher volume keyspaces"
        />
        <Tag 
          v-else-if="cassandraServerCredentials.isCassandraServerConnected && currentKeyspace"
          icon="pi pi-exclamation-circle"
          severity="warning"
          value="it is recommended to use the force graph representation for higher volume keyspaces"
        />
      </Transition>

      <Transition name="pop-in" mode="out-in">
        <Tag
          v-if="forceGraph && currentKeyspace && cassandraServerCredentials.isCassandraServerConnected"
          icon="pi pi-info"
          severity="info"
          value="hover over concept nodes for details"
        />
      </Transition>

      <Transition name="pop-in" mode="out-in">
        <Tag
          v-if="forceGraph && cassandraServerCredentials.isCassandraServerConnected"
          icon="pi pi-info"
          severity="info"
          value="use the slider to increase the size of the nodes"
        /> 
      </Transition>

      <div class="slider-container" v-if="forceGraph && cassandraServerCredentials.isCassandraServerConnected">
        <span>{{ conceptNodeSize }}</span>
        <Slider 
          v-model="conceptNodeSize" 
          class="w-14rem" 
          :min="4"
          :max="16"
          @update:model-value="updateConceptNodeSize($event, forceSimulation);"
        />
      </div>

    </div>
    <div class="conceptual-graph-wrapper">
      <conceptual-graph v-if="!forceGraph && graphMetadata.tables.length" graph-key="keyspaceGraph" ref="keyspaceGraph" :graph-metadata="graphMetadata" />
      <svg class="svg-container" v-else></svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';

import { ConfigurableConcept, GraphMetadata, D3Link, D3Node, Concept } from '../../types/types';
import { manageRequest } from '../../includes/requests';

import ConceptualGraph from '../graphic/graph/ConceptualGraph.vue';

import { useConnectionStore } from "../../stores/connection";
import { useUtilsStore } from "../../stores/utils";

import { useForceGraph } from '../../composables/forcegraph';
import { useMetadata } from '../../composables/metadata';
import { useUtils } from '../../composables/utils';

import { Ref, ref, watch, nextTick, ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';

import * as d3 from 'd3';
import { computed } from '@vue/reactivity';

// Constants
const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, ConfigurableConcept[]>(),
  dataTypes: new Map<string, ConfigurableConcept>()
};

// Reactive data
const keyspaceGraph = ref();
const graphMetadata: Ref<GraphMetadata> = ref({ ... defaultGraphMetadata });
const keyspaceMetadata: Ref<any> = ref(null);
const isKeyspaceRetrieveInProgress: Ref<boolean> = ref(false);

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace, cassandraServerCredentials } = storeToRefs(connectionStore);

const utilsStore = useUtilsStore();
const { forceGraph } = storeToRefs(utilsStore);

// Composables
const { createForceGraphRepresentation, updateConceptNodeSize } = useForceGraph();
const { openNotificationToast } = useUtils();
const { getRelationTypeForColumnConcept } = useMetadata();

// Functionalities related to the Force Graph representation of the keyspace metadata
const conceptForLookup: Ref<Concept | any | null> = ref(null);
const conceptNodeSize: Ref<number> = ref(8);
const forceSimulation: Ref<any> = ref(null);

const conceptTypeNameForCurrentLookupConcept: ComputedRef<string> = computed(() =>{
  switch (conceptForLookup.value.conceptType) {
    case constants.conceptTypes.keyspace:
      return 'keyspace';
    case constants.conceptTypes.table:
      return 'table';
    case constants.conceptTypes.column:
      return 'column';
    case constants.conceptTypes.dataType:
      return 'data type';
    default:
      return constants.inputValues.empty;
  }
});

const conceptTypeInfoText: ComputedRef<string> = computed(() => {
  const typeText = conceptTypeNameForCurrentLookupConcept.value;
  return typeText ? `${conceptForLookup.value.conceptType} (${typeText})` : constants.inputValues.empty;
});

    
// Functionalities related to the parsing of the keyspace metadata
const parseKeyspaceMetadata = (keyspaceMetadata: any): void => {
  resetKeyspaceMetadata();
  const keyspaceConcept = {
    conceptType: constants.conceptTypes.keyspace,
    conceptName: keyspaceMetadata.keyspace_name
  };
  graphMetadata.value.keyspace = Object.assign({}, keyspaceConcept);
  
  keyspaceMetadata.tables.forEach((table: any) => {
    const tableConcept: ConfigurableConcept = {
      conceptType: constants.conceptTypes.table,
      conceptName: table.table,
      isTableExpanded: true
    };
    graphMetadata.value.tables.push(tableConcept);
    graphMetadata.value.columns.set(tableConcept.conceptName, []);

    table.columns.forEach(column => {
      const columnConcept = { conceptType: constants.conceptTypes.column, conceptName: column.column_name };
      const relationType = getRelationTypeForColumnConcept(column.column_kind, column.clustering_order)

      graphMetadata.value.columns.get(tableConcept.conceptName)?.push({ ... columnConcept, relation: relationType });

      const typeConcept = { conceptType: constants.conceptTypes.dataType, conceptName: column.column_type };
      graphMetadata.value.dataTypes.set(columnConcept.conceptName, { ... typeConcept, relation: constants.relationTypes.hasType });
    });
  });
};

const parseKeyspaceMetadataAsForceGraph = (keyspaceMetadata: any): { [key: string]: any } => {
  let nodes: D3Node[] = [];
  let links: D3Link[] = [];
  let currentNodeIndex =0;

  nodes.push({ conceptName: currentKeyspace.value, conceptType: constants.conceptTypes.keyspace });
  currentNodeIndex = currentNodeIndex + 1;

  let tableIndex = 0;
  let columnIndex = 0;

  keyspaceMetadata.tables.forEach((table: any) => {
    tableIndex = currentNodeIndex;
    links.push({ source: 0, target: tableIndex });

    nodes.push({ conceptName: table.table, conceptType: constants.conceptTypes.table });
    currentNodeIndex = currentNodeIndex + 1;

    table.columns.forEach((column: any) => {
      columnIndex = currentNodeIndex;

      nodes.push({ conceptName: column.column_name, conceptType: constants.conceptTypes.column });
      currentNodeIndex = currentNodeIndex + 1;
      links.push({ source: tableIndex, target: columnIndex });

      nodes.push({ conceptName: column.column_type, conceptType: constants.conceptTypes.dataType });
      links.push({ source: columnIndex, target: currentNodeIndex });
      currentNodeIndex = currentNodeIndex + 1;
    });
  });

  return { nodes, links };
};

const parseKeyspaceMetadataWrapper = (keyspaceMetadata: any): void => {
  if (forceGraph.value) {
    const { nodes, links} = parseKeyspaceMetadataAsForceGraph(keyspaceMetadata);
    forceSimulation.value = createForceGraphRepresentation(nodes, links, conceptForLookup);
  } else {
    parseKeyspaceMetadata(keyspaceMetadata);
  }
};

const resetKeyspaceMetadata = (): void => {
  const defaultConcept = { conceptName: currentKeyspace.value, conceptType: constants.conceptTypes.keyspace };
  graphMetadata.value.keyspace = { ... defaultConcept };
  graphMetadata.value.tables = [];
  graphMetadata.value.columns = new Map<string, ConfigurableConcept[]>();
  graphMetadata.value.dataTypes = new Map<string, ConfigurableConcept>();
};

// Functionalities related to the retrieval of the keyspace metadata
const retrieveKeyspaceMetadata = async (): Promise<void> => {
  if (currentKeyspace.value) {
    isKeyspaceRetrieveInProgress.value = true;

    resetKeyspaceMetadata();
    const response = await manageRequest(constants.requestTypes.GET, "keyspace", { keyspace_name: currentKeyspace.value });
    
    if (response && response.data) {
      if (response.data.status === constants.requestStatus.SUCCESS) {
        keyspaceMetadata.value = { ... response.data.keyspace_metadata };
        parseKeyspaceMetadataWrapper(response.data.keyspace_metadata);
      } else {
        openNotificationToast(response.data.message, 'error');
      }
    } else {
      openNotificationToast('Unexpected error occured', 'error');
    }

    await nextTick();
    isKeyspaceRetrieveInProgress.value = false;

    if (!forceGraph.value) {
      keyspaceGraph.value.removeArrows();
      keyspaceGraph.value.drawInitialArrows();
    }
  }
};

watch(currentKeyspace, async () => {
  if (currentKeyspace.value) {
    if (forceGraph.value) {
      d3.select('.svg-container').selectAll('*').remove();
    }
    await retrieveKeyspaceMetadata();
  } else {
    graphMetadata.value = { ... defaultGraphMetadata };
    if (forceGraph.value) {
      d3.select('.svg-container').selectAll('*').remove();
    }
    forceGraph.value = false;
  }
});

watch(forceGraph, () => {
  retrieveKeyspaceMetadata();
});

</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_transitions.sass"

.dashboard
  @include containers.flex-container($flex-direction: column, $align-items: flex-start, $justify-content: flex-start)
  position: relative
  padding: 1rem
  height: 100%
  width: 100%

  .concept-node-lookup-container
    position: absolute
    box-shadow: none !important
    border: 1px solid #e9ecef
    z-index: 1
    top: 0
    left: 0
    padding: 1.5rem

    .info 
      @include containers.flex-container($flex-direction: column, $align-items: center)
      
      .relation-dummy
        width: 1px
        height: 2rem
        background-color: variables.$cassandra-black

      .concept-dummy
        @include containers.flex-container($justify-content: center, $align-items: center)
        width: 4rem
        height: 2rem
        border: 1px solid variables.$cassandra-black

        span
          margin-right: 0 !important

      span:last-of-type
        color: variables.$cassandra-app-blue

      span:first-of-type
        margin-right: 0.5rem

      &:first-of-type
        margin-bottom: 1.25rem

  .dashboard-tag-container
    @include containers.flex-container($flex-direction: column, $align-items: flex-end)
    width: 100%

    .p-tag
      margin-bottom: 0.5rem

    .slider-container
      @include containers.flex-container($align-items: baseline)
      
      span
        margin-right: 1rem
      .p-slider
        margin-top: 1rem
        width: 12rem

  .conceptual-graph-wrapper
    @include containers.flex-container($flex-direction: column, $align-items: center, $justify-content: center)
    flex-grow: 1
    width: 100%

    .svg .circle
      cursor: move

</style>
