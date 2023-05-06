<template>
    <div class="demo-page">
        <div class="demo-page-graph-container">
            <ConceptualGraph v-if="isConceptualGraphReady" :graph-metadata="graphMetadata" graph-key="demoGraph" ref="demoGraph" />
        </div>
    </div>
    <Dialog 
        v-model:visible="isLoginInModal" 
        :show-header="false" 
        modal
    >
        <AuthenticationCard :is-auth-inside-modal="true" />
    </Dialog>
</template>

<script setup lang="ts">
import constants from '@/constants/constants';
import { retrieveColumnsMetadataForTable } from '@/includes/astra';
import { useForceGraph } from '@/composables/forcegraph';
import { useUtilsStore } from '@/stores/utils';
import { storeToRefs } from 'pinia';

import AuthenticationCard from '@/components/authentication/AuthenticationCard.vue';
import ConceptualGraph from '@/components/graphic/graph/ConceptualGraph.vue';
import { Concept, GraphMetadata } from '@/types/types';
import { Ref, nextTick, ref } from 'vue';

const defaultGraphMetadata: GraphMetadata = {
  keyspace: { conceptName: import.meta.env.VITE_ASTRA_DB_KEYSPACE, conceptType: constants.conceptTypes.keyspace },
  tables: [{ conceptName: import.meta.env.VITE_ASTRA_DB_TABLE, conceptType: constants.conceptTypes.table }],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

// Composables
const { createForceGraphRepresentation } = useForceGraph();

// Store mapppings
const utilsStore = useUtilsStore();
const { isLoginInModal } = storeToRefs(utilsStore);


// Functionalities related to the Conceptual Graph component
const graphMetadata: Ref<GraphMetadata> = ref({ ... defaultGraphMetadata });
const demoGraph = ref();

const isRetrieveInProgress: Ref<boolean> = ref(false);
const isConceptualGraphReady: Ref<boolean> = ref(false);


const parseColumnMetadata = (columns: { [key: string]: string }[]) => {
    const currentTable: Concept = graphMetadata.value.tables.at(0);
    graphMetadata.value.columns.set(currentTable.conceptName, []);
    
    columns.forEach((column: { [key: string]: string }) => {
        const columnConcept = { conceptName: column.name, conceptType: constants.conceptTypes.column, relation: constants.relationTypes.has };

        graphMetadata.value.columns.get(currentTable.conceptName).push(columnConcept);
        graphMetadata.value.dataTypes.set(column.name, { conceptName: column.typeDefinition, conceptType: constants.conceptTypes.dataType });

    });

    isConceptualGraphReady.value = true;
};

const retrieveColumnMetadata = async (): Promise<void> => {
    isRetrieveInProgress.value = true;
    const response = await retrieveColumnsMetadataForTable();
    if (response && response.data) {
        parseColumnMetadata(response.data.data);
        await nextTick();
        demoGraph.value.drawInitialArrows();
    }
    isRetrieveInProgress.value = false;
};

retrieveColumnMetadata();

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.demo-page
    margin-top: variables.$cga-header-height
    height: calc(100vh - variables.$cga-header-height)
    padding: 0

    .demo-page-graph-container
        @include containers.flex-container($justify-content: center)
        width: 100%

        .conceptual-graph
            width: 50% !important

.p-dialog .p-dialog-content:last-of-type
    border-bottom-right-radius: 1.5rem !important
    border-bottom-left-radius: 1.5rem !important

</style>