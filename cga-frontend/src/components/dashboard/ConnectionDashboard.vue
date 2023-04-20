<template>
  <div class="dashboard">
    <div class="dashboard-tag-container">
      <Transition name="pop-in" mode="out-in">
        <Tag 
          v-if="forceGraph"
          icon="pi pi-check"
          severity="success"
          value="Force graph is the recommended representation of higher volume keyspaces"
        />
        <Tag 
          v-else
          icon="pi pi-exclamation-circle"
          severity="warning"
          value="It is recommended to use the force graph representation for higher volume keyspaces"
        />
      </Transition>
    </div>
    <div class="conceptual-graph-wrapper">
      <conceptual-graph v-if="!forceGraph && graphMetadata.tables.length" graph-key="keyspaceGraph" ref="keyspaceGraph" :graph-metadata="graphMetadata" />
      <svg class="svg-container" v-else></svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';

import { ConfigurableConcept, GraphMetadata, D3Link, D3Node } from '../../types/types';
import { manageRequest } from '../../includes/requests';

import ConceptualGraph from '../graphic/graph/ConceptualGraph.vue';

import { useConnectionStore } from "../../stores/connection";
import { useUtilsStore } from "../../stores/utils";

import { useMetadata } from '../../composables/metadata';
import { useUtils } from '../../composables/utils';

import { Ref, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';

import * as d3 from 'd3';

const utilsStore = useUtilsStore();
const { forceGraph } = storeToRefs(utilsStore);

const keyspaceGraph = ref();
const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, ConfigurableConcept[]>(),
  dataTypes: new Map<string, ConfigurableConcept>()
};

const graphMetadata: Ref<GraphMetadata> = ref(defaultGraphMetadata);
const keyspaceMetadata: Ref<any> = ref(null);
const isKeyspaceRetrieveInProgress: Ref<boolean> = ref(false);

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace } = storeToRefs(connectionStore);

// Composables
const { openNotificationToast } = useUtils();
const { getRelationTypeForColumnConcept } = useMetadata();

const createForceGraphRepresentation = (nodes: any[], links: any[]): void => {
  // const width = 1000, height = 1000;
  const width = window.innerWidth / 2;
  const height = window.innerHeight;
  const svg = d3.select('.svg-container').style('width', width).style('height', height);

  const simulation = d3.forceSimulation(nodes)
    // Apply a 'link' force in order to attract the related nodes
    .force('link', d3.forceLink(links).id((d: any) => d.index))
    // Apply a 'charge' force in order to space out the nodes
    .force('charge', d3.forceManyBody().strength(-30))
    // Apply a 'collide' detection force in order to keep the nodes not overlapping
    .force('collision', d3.forceCollide().radius(10))
    // Apply a 'center' force in order to render the nodes around the center of the svg container 
    .force('center', d3.forceCenter(width / 2, height / 2 - 68))

  const link = svg
    .selectAll<SVGLineElement, any> ('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke-width', 3)
    .style('stroke', 'pink');

  const node = svg
    .selectAll<SVGCircleElement, any>('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('fill', 'orage')
    .attr('stroke', 'yellow')
    .call(d3.drag<SVGCircleElement, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

};

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
  let nodes: any[] = [];
  let links: any[] = [];
  let currentNodeIndex =0;

  nodes.push({ name: currentKeyspace.value });
  currentNodeIndex = currentNodeIndex + 1;

  let tableIndex = 0;
  let columnIndex = 0;

  keyspaceMetadata.tables.forEach((table: any) => {
    tableIndex = currentNodeIndex;
    links.push({ source: 0, target: tableIndex });

    nodes.push({ name: table.table  });
    currentNodeIndex = currentNodeIndex + 1;

    table.columns.forEach((column: any) => {
      columnIndex = currentNodeIndex;

      nodes.push({ name: column.column_name });
      currentNodeIndex = currentNodeIndex + 1;
      links.push({ source: tableIndex, target: columnIndex });

      nodes.push({ name: column.column_type });
      links.push({ source: columnIndex, target: currentNodeIndex });
      currentNodeIndex = currentNodeIndex + 1;
    });
  });

  return { nodes, links };
};

const parseKeyspaceMetadataWrapper = (keyspaceMetadata: any): void => {
  if (forceGraph.value) {
    const { nodes, links} = parseKeyspaceMetadataAsForceGraph(keyspaceMetadata);
    createForceGraphRepresentation(nodes, links);
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

    isKeyspaceRetrieveInProgress.value = false;
  }
};

watch(currentKeyspace, async () => {
  await retrieveKeyspaceMetadata();
  await nextTick();
  if (!forceGraph.value) {
    keyspaceGraph.value.removeArrows();
    keyspaceGraph.value.drawInitialArrows();
  }
});

watch(forceGraph, () => {
  if (forceGraph.value) {
    retrieveKeyspaceMetadata();
  }
});

</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_transitions.sass"

.dashboard
  @include containers.flex-container($flex-direction: column, $align-items: flex-start, $justify-content: flex-start)
  padding: 1rem
  height: 100%
  width: 100%

  .dashboard-tag-container
    @include containers.flex-container($justify-content: flex-end)
    width: 100%

  .conceptual-graph-wrapper
    @include containers.flex-container($flex-direction: column, $align-items: center, $justify-content: center)
    flex-grow: 1
    width: 100%

</style>
