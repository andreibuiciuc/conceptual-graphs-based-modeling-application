<template>
    <div class="header-container">
        <Tag 
            icon="pi pi-info"
            severity="information"
            value="this is a read-only database hosted by cga"
        />
    </div>
    <div class="demo-page">
        <div class="demo-query-items-container">
            <QueryItems
                :table-metadata="graphMetadata"
                :clause="QueryClause.WHERE" 
                :columns="[]" 
                state="ok"
            />
            <QueryItems
                :table-metadata="graphMetadata"
                :clause="QueryClause.GROUP_BY" 
                :columns="[]" 
                state="ok"
            />
            <QueryItems
                :table-metadata="graphMetadata"
                :clause="QueryClause.ORDER_BY" 
                :columns="[]" 
                state="ok"
            />
            <QueryItems
                :table-metadata="graphMetadata"
                :clause="QueryClause.GET" 
                :columns="[]" 
                state="ok"
            />
        </div>
    </div>
    <Dialog 
        v-model:visible="isLoginInModal" 
        :show-header="false" 
        modal
    >
        <AuthenticationCard 
            :is-auth-inside-modal="true" 
            :is-password-reset-visible="false"
        />
    </Dialog>
</template>

<script setup lang="ts">
import constants from '@/constants/constants';
import { QueryClause } from '@/types/types';
import QueryItems from '@/components/design/QueryItems.vue';
import { useUtilsStore } from '@/stores/utils';
import { storeToRefs } from 'pinia';

import AuthenticationCard from '@/components/authentication/AuthenticationCard.vue';
import { Concept, GraphMetadata } from '@/types/types';
import { Ref, ref } from 'vue';

const defaultGraphMetadata: GraphMetadata = {
  keyspace: { conceptName: import.meta.env.VITE_ASTRA_DB_KEYSPACE, conceptType: constants.conceptTypes.keyspace },
  tables: [{ conceptName: import.meta.env.VITE_ASTRA_DB_TABLE, conceptType: constants.conceptTypes.table }],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

// Store mapppings
const utilsStore = useUtilsStore();
const { isLoginInModal } = storeToRefs(utilsStore);

// Functionalities related to the Conceptual Graph component
const graphMetadata: Ref<GraphMetadata> = ref({ ... defaultGraphMetadata });

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.demo-page
    padding: 0
    height: 100vh
    overflow-y: auto

    .demo-page-query-container
        @include containers.flex-container($flex-direction: column)
        height: 100vh
        

    .demo-page-graph-container
        @include containers.flex-container($justify-content: center)
        width: 100%

        .conceptual-graph
            width: 50% !important

.p-dialog .p-dialog-content:last-of-type
    border-bottom-right-radius: 1.5rem !important
    border-bottom-left-radius: 1.5rem !important

</style>