<template>
  <conceptual-graph v-if="graphMetadata.tables.length" graph-key="keyspaceGraph" ref="keyspaceGraph" :graph-metadata="graphMetadata" />
</template>

<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import constants from '../../../constants/constants';
import { manageRequest } from '../../../includes/requests';
import ConceptualGraph from '../../graphic/graph/ConceptualGraph.vue';
import { ConfigurableConcept, GraphMetadata } from '../../../types/types';
import { useMetadata } from '../../../composables/metadata';
import { useUtils } from '../../../composables/utils';
import { useConnectionStore } from '../../../stores/connection';
import { nextTick } from 'vue';
import { storeToRefs } from 'pinia';

const keyspaceGraph = ref();
const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, ConfigurableConcept[]>(),
  dataTypes: new Map<string, ConfigurableConcept>()
};

const graphMetadata: Ref<GraphMetadata> = ref(defaultGraphMetadata);
const isKeyspaceRetrieveInProgress: Ref<boolean> = ref(false);

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace } = storeToRefs(connectionStore);

// Composables
const { openNotificationToast } = useUtils();
const { getRelationTypeForColumnConcept } = useMetadata();

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
        parseKeyspaceMetadata(response.data.keyspace_metadata);
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
  keyspaceGraph.value.removeArrows();
  keyspaceGraph.value.drawInitialArrows();
});

</script>

<style scoped lang="sass">

</style>
