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
import { DataTableColumn } from '../types/types';

interface Props {
    columns: DataTableColumn[]
    items: any[],
};

const props = defineProps<Props>();

</script>