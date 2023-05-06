import { defineStore } from "pinia";
import { Ref, ref } from "vue";

import constants from '@/constants/constants';
import { QueryConcepts, QueryItem } from '../types/types';

export const useQueryStore  = defineStore('query', () => {

    // CQL clause items
    const whereClauseItems: Ref<QueryItem[]> = ref([]);
    const orderByClauseItems: Ref<QueryItem[]> = ref([]);
    const groupByClauseItems: Ref<QueryItem[]> = ref([]);
    const aggregateFunctionsItems: Ref<QueryItem[]> = ref([]);

    // Query concepts related to the clause items
    const queryConcepts: Ref<QueryConcepts | null> = ref(null);

    function resetQueryClauseItems (): void {
        whereClauseItems.value = [];
        orderByClauseItems.value = [];
        groupByClauseItems.value = [];
        aggregateFunctionsItems.value = [];
    }

    function resetQueryConcepts (): void {
        queryConcepts.value = JSON.parse(JSON.stringify(constants.defaultQueryConcepts));
    }

    return {
        whereClauseItems,
        orderByClauseItems,
        groupByClauseItems,
        aggregateFunctionsItems,
        queryConcepts,
        resetQueryClauseItems,
        resetQueryConcepts
    };
    
});