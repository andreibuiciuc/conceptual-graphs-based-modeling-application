<template>
  <v-progress-circular indeterminate v-if="isKeyspaceRetrieveInProgress" />
  <conceptual-graph graph-key="keyspaceGraph" :graph-metadata="graphMetadata" v-else />
</template>

<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import constants from '../../../constants/constants';
import { manageRequest } from '../../../includes/requests';
import ConceptualGraph from '../../graphic/graph/ConceptualGraph.vue';
import { Concept, GraphMetadata } from '../../../types/types';
import { useMetadata } from '../../../composables/metadata';
import useNotificationStore from '../../../stores/notification';

interface Props {
  selectedKeyspace: string,
};

const props = defineProps<Props>();

const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

const graphMetadata: Ref<GraphMetadata> = ref(defaultGraphMetadata);
const isKeyspaceRetrieveInProgress: Ref<boolean> = ref(false);

const notificationStore = useNotificationStore();
const { getRelationTypeForColumnConcept } = useMetadata();

const parseKeyspaceMetadata = (keyspaceMetadata: any): void => {
  resetKeyspaceMetadata();
  const keyspaceConcept = {
    conceptType: constants.conceptTypes.keyspace,
    conceptName: keyspaceMetadata.keyspace_name
  };
  graphMetadata.value.keyspace = Object.assign({}, keyspaceConcept);
  
  keyspaceMetadata.tables.forEach((table: any) => {
    const tableConcept = {
      conceptType: constants.conceptTypes.table,
      conceptName: table.table,
    };
    graphMetadata.value.tables.push(tableConcept);
    graphMetadata.value.columns.set(tableConcept.conceptName, []);

    table.columns.forEach(column => {
      const columnConcept = { conceptType: constants.conceptTypes.column, conceptName: column.column_name };
      const relationType = getRelationTypeForColumnConcept(column.column_kind, column.clustering_order)

      graphMetadata.value.columns.get(tableConcept.conceptName)?.push({ ... columnConcept, relation: relationType});

      const typeConcept = { conceptType: constants.conceptTypes.dataType, conceptName: column.column_type };
      graphMetadata.value.dataTypes.set(columnConcept.conceptName, { ... typeConcept, relation: constants.relationTypes.hasType });
    });
  });
};

const resetKeyspaceMetadata = (): void => {
  const defaultConcept = { conceptName: props.selectedKeyspace, conceptType: constants.conceptTypes.keyspace };
  graphMetadata.value.keyspace = { ... defaultConcept };
  graphMetadata.value.tables = [];
  graphMetadata.value.columns = new Map<string, Concept[]>();
  graphMetadata.value.dataTypes = new Map<string, Concept>();
};

const retrieveKeyspaceMetadata = async (): Promise<void> => {
  if (props.selectedKeyspace) {
    isKeyspaceRetrieveInProgress.value = true;

    resetKeyspaceMetadata();
    const response = await manageRequest(constants.requestTypes.GET, "keyspace", { keyspace_name: props.selectedKeyspace });
    
    if (response && response.data) {
      if (response.data.status === constants.requestStatus.SUCCESS) {
        parseKeyspaceMetadata(response.data.keyspace_metadata);
      } else {
        notificationStore.setUpSnackbarState(false, response.data.message);
      }
    } else {
      notificationStore.setUpSnackbarState(false, "Unexpected error occured.");
    }

    isKeyspaceRetrieveInProgress.value = false;
  }
};

watch(() => props.selectedKeyspace, () => {
  retrieveKeyspaceMetadata();
});

</script>
