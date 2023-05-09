<template>
    <DataTable :value="items">
        <Column 
            v-for="column of columns"
            :key="column.field"
            :field="column.field"
            :header="column.header">
        </Column>
    </DataTable>
</template>


<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { DataTableColumn } from '@/types/types';

interface Props {
    columns: DataTableColumn[]
    items: any[],
};

const props = defineProps<Props>();

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"

.p-dialog-content
    padding: 1.5rem !important

    .p-datatable .p-datatable-thead > tr > th
        background: variables.$cassandra-white !important

</style>