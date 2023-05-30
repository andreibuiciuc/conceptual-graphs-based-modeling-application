<template>
  <div class="dashboard">

    <div v-if="forceGraph"
      class="dashboard-column-container"
    >
      <CgaLookupCard 
        v-if="forceGraph && graphMetadata.keyspace" 
        :concept-for-lookup="conceptForLookup"
      />
      <CgaForceConfigCard 
        v-if="forceGraph && cassandraServerCredentials.isCassandraServerConnected" 
        :force-simulation="forceSimulation" 
      />
    </div>

    <div class="dashboard-column-container conceptual-graph-wrapper">
      <PlaceholderGraph 
        v-if="isKeyspaceRetrieveInProgress"
        :placeholder-text="isKeyspaceRetrieveInProgress ? 'retrieving keyspace metadata ...' : 'please connect and select a keyspace'"
        :is-circular-placeholder="forceGraph ? true : false"
      />

      <ConceptualGraph 
        v-if="!isKeyspaceRetrieveInProgress && !forceGraph"
        graph-key="keyspaceGraph" 
        :graph-metadata="graphMetadata"
        ref="keyspaceGraph"
      />
        
      <svg 
        v-if="!isKeyspaceRetrieveInProgress && forceGraph"
        class="svg-container"
      >
      </svg>
    </div>
      
    </div>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import ConceptualGraph from '../graphic/graph/ConceptualGraph.vue';
import PlaceholderGraph from '@/components/graphic/graph/PlaceholderGraph.vue';
import CgaLookupCard from '../graphic/cards/CgaLookupCard.vue';
import CgaForceConfigCard from '../graphic/cards/CgaForceConfigCard.vue';
import * as d3 from 'd3';

import { AstraApiResponse, AstraColumnDefinition, AstraTableMetadata, AstraClusteringExpression } from '@/types/astra/types';
import { ConfigurableConcept, GraphMetadata, D3Link, D3Node, Concept } from '../../types/types';
import { storeToRefs } from 'pinia';
import { Ref, ref, watch, nextTick } from 'vue';
import { useAstra } from '@/composables/requests/astra';
import { useConnectionStore } from "../../stores/connection";
import { useForceGraph } from '../../composables/forcegraph';
import { useMetadata } from '@/composables/metadata/metadata';
import { useUtilsStore } from "../../stores/utils";
import { useUtils } from '../../composables/utils';

const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, ConfigurableConcept[]>(),
  dataTypes: new Map<string, ConfigurableConcept>()
};

const graphMetadata: Ref<GraphMetadata> = ref({ ... defaultGraphMetadata });
const keyspaceMetadata: Ref<any> = ref(null);

// Pinia store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace, cassandraServerCredentials, isKeyspaceRetrieveInProgress, keyspaceGraph } = storeToRefs(connectionStore);

const utilsStore = useUtilsStore();
const { forceGraph } = storeToRefs(utilsStore);

// Composables
const { createForceGraphRepresentation } = useForceGraph();
const { openNotificationToast } = useUtils();
const { getRelationTypeForColumnConcept } = useMetadata();
const { retrieveAllTables } = useAstra();
const { delayExecution } = useUtils();

// Functionalities related to the Force Graph representation of the keyspace metadata
const conceptForLookup: Ref<Concept | any | null> = ref(null);
const forceSimulation: Ref<any> = ref(null);
const forceSimulationNodes: Ref<D3Node[]> = ref([]);
const forceSimulationLinks: Ref<D3Link[]> = ref([]);

// Functionalities related to the parsing of the keyspace metadata
const getColumnKindFromColumnDefinition = (columnConcept: Concept, tableMetadata: AstraTableMetadata): string => {
  
  if (tableMetadata.primaryKey.partitionKey.includes(columnConcept.conceptName)) {
    return 'partition_key';
  }

  if (tableMetadata.primaryKey.clusteringKey.includes(columnConcept.conceptName)) {
    return constants.columnKinds.clustering;
  }

  return constants.columnKinds.regular;
};

const getColumnClusteringOption = (columnConcept, tableMetadata: AstraTableMetadata): string => {

  const columnOption = tableMetadata.tableOptions.clusteringExpression.find((clusterExpression: AstraClusteringExpression) => {
    clusterExpression.column === columnConcept.conceptName
  });

  return columnOption ? columnOption.order : constants.inputValues.empty;
};

const parseKeyspaceMetadata = (keyspaceMetadata: AstraTableMetadata[] ): void => {
  resetKeyspaceMetadata();

  const keyspaceConcept = {
    conceptType: constants.conceptTypes.keyspace,
    conceptName: currentKeyspace.value
  };
  graphMetadata.value.keyspace = Object.assign({}, keyspaceConcept);
  
  keyspaceMetadata.forEach((table: AstraTableMetadata) => {
    const tableConcept: ConfigurableConcept = {
      conceptType: constants.conceptTypes.table,
      conceptName: table.name,
      isTableExpanded: true
    };
    graphMetadata.value.tables.push(tableConcept);
    graphMetadata.value.columns.set(tableConcept.conceptName, []);

    table.columnDefinitions.forEach((columnDefinition: AstraColumnDefinition) => {
      const columnConcept = { conceptType: constants.conceptTypes.column, conceptName: columnDefinition.name };

      const columnKind = getColumnKindFromColumnDefinition(columnConcept, table);
      const columnClusteringOption = getColumnClusteringOption(columnConcept, table);

      const relationType = getRelationTypeForColumnConcept(columnKind, columnClusteringOption);

      graphMetadata.value.columns.get(tableConcept.conceptName)?.push({ ... columnConcept, relation: relationType });

      const typeConcept = { conceptType: constants.conceptTypes.dataType, conceptName: columnDefinition.typeDefinition };
      graphMetadata.value.dataTypes.set(columnConcept.conceptName, { ... typeConcept, relation: constants.relationTypes.hasType });
    });
  });
};

const parseKeyspaceMetadataAsForceGraph = (keyspaceMetadata: AstraTableMetadata[]): { [key: string]: any } => {
  let nodes: D3Node[] = [];
  let links: D3Link[] = [];
  let currentNodeIndex = 0;

  nodes.push({ conceptName: currentKeyspace.value, conceptType: constants.conceptTypes.keyspace });
  currentNodeIndex = currentNodeIndex + 1;

  let tableIndex = 0;
  let columnIndex = 0;

  keyspaceMetadata.forEach((table: AstraTableMetadata) => {
    tableIndex = currentNodeIndex;
    links.push({ source: 0, target: tableIndex });

    nodes.push({ conceptName: table.name, conceptType: constants.conceptTypes.table });
    currentNodeIndex = currentNodeIndex + 1;

    table.columnDefinitions.forEach((columnDefinition: AstraColumnDefinition) => {
      columnIndex = currentNodeIndex;

      nodes.push({ conceptName: columnDefinition.name, conceptType: constants.conceptTypes.column });
      currentNodeIndex = currentNodeIndex + 1;
      links.push({ source: tableIndex, target: columnIndex });

      nodes.push({ conceptName: columnDefinition.name, conceptType: constants.conceptTypes.dataType });
      links.push({ source: columnIndex, target: currentNodeIndex });
      currentNodeIndex = currentNodeIndex + 1;
    });
  });

  return { nodes, links };
};

const parseKeyspaceMetadataWrapper = (keyspaceMetadata: any): void => {
  if (forceGraph.value) {
    const { nodes, links} = parseKeyspaceMetadataAsForceGraph(keyspaceMetadata);
    forceSimulationNodes.value = JSON.parse(JSON.stringify(nodes));
    forceSimulationLinks.value = JSON.parse(JSON.stringify(links));
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
  forceSimulation.value = null;
};

// Functionalities related to the retrieval of the keyspace metadata
const retrieveKeyspaceMetadata = async (): Promise<void> => {
  if (currentKeyspace.value) {
    isKeyspaceRetrieveInProgress.value = true;

    await delayExecution(3000);

    const response = await retrieveAllTables(currentKeyspace.value);

    if (response && response.data) {
    
      const responseData = response.data as AstraApiResponse;

      if (responseData.data) {
        keyspaceMetadata.value = { ...responseData.data };
        parseKeyspaceMetadataWrapper(responseData.data);
      } else {
        openNotificationToast(responseData.description, 'error');
        isKeyspaceRetrieveInProgress.value = false;
        return;
      }

    } else {
      openNotificationToast('Unexpected error occured', 'error');
      isKeyspaceRetrieveInProgress.value = false;
      return;
    }

    isKeyspaceRetrieveInProgress.value = false;
    await nextTick();

    if (forceGraph.value) {
      forceSimulation.value = createForceGraphRepresentation(forceSimulationNodes.value, forceSimulationLinks.value, conceptForLookup);
    } else {
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
