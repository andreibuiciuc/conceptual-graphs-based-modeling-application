<template>
  <div class="dashboard">

    <div class="dashboard-column-container" v-if="forceGraph">
      <CgaLookupCard v-if="forceGraph && graphMetadata.keyspace" :concept-for-lookup="conceptForLookup" />
      <CgaForceConfigCard v-if="forceGraph && cassandraServerCredentials.isCassandraServerConnected" :force-simulation="forceSimulation" />
    </div>

    <div class="dashboard-column-container conceptual-graph-wrapper">
        <template v-if="!forceGraph && graphMetadata.tables.length">
            <!-- <svg class="svg-clip-container">
              <defs>
                <clipPath id="clip">
                  <rect x="0" y="0" />
                </clipPath>
              </defs>
            </svg> -->
          <conceptual-graph graph-key="keyspaceGraph" ref="keyspaceGraph" :graph-metadata="graphMetadata" />
        </template>
      <svg class="svg-container" v-else></svg>
    </div>
      
    </div>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';

import { ConfigurableConcept, GraphMetadata, D3Link, D3Node, Concept } from '../../types/types';
import { manageRequest } from '../../includes/requests';

import ConceptualGraph from '../graphic/graph/ConceptualGraph.vue';
import CgaLookupCard from '../graphic/cards/CgaLookupCard.vue';
import CgaForceConfigCard from '../graphic/cards/CgaForceConfigCard.vue';

import { useConnectionStore } from "../../stores/connection";
import { useUtilsStore } from "../../stores/utils";

import { useForceGraph } from '../../composables/forcegraph';
import { useMetadata } from '../../composables/metadata';
import { useUtils } from '../../composables/utils';

import { Ref, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';

import * as d3 from 'd3';

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
const { createForceGraphRepresentation } = useForceGraph();
const { openNotificationToast } = useUtils();
const { getRelationTypeForColumnConcept } = useMetadata();

// Functionalities related to the Force Graph representation of the keyspace metadata
const conceptForLookup: Ref<Concept | any | null> = ref(null);
const forceSimulation: Ref<any> = ref(null);

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
  let currentNodeIndex = 0;

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
  @include containers.flex-container($flex-direction: row)
  padding: 1rem
  height: 100%
  width: 100%

  .dashboard-column-container
    @include containers.flex-container($flex-direction: column)
    height: 100%

    &:not(:last-of-type)
      margin-right: 1rem

    *:not(:last-child)
      margin-bottom: 1rem


  .dashboard-tag-container
    @include containers.flex-container($flex-direction: column, $align-items: flex-end)
    width: 100%

    .p-tag
      margin-bottom: 0.5rem

  .conceptual-graph-wrapper
    @include containers.flex-container($flex-direction: column, $align-items: center, $justify-content: center)
    border: 1px solid #e9ecef
    width: 100%
    height: 100%
    position: relative
    clip-path: url(#clip)

    .svg .circle
      cursor: move

    .svg-clip-container
      position: absolute
      top: 0
      left: 0
      width: calc(100% - 1rem)
      height: 100%

      rect
        position: absolute
        top:0
        left: 0
        width: 100%
        height: 101%

</style>
