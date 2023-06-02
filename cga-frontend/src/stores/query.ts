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

    // Force Graph
    const conceptNodeSize: Ref<number> = ref(8);
    const conceptNodeColor: Ref<string> = ref('3B82F6');
    const link: Ref<any> = ref(null);
    const node: Ref<any> = ref(null);

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
        conceptNodeSize,
        conceptNodeColor,
        queryConcepts,
        link,
        node,
        resetQueryClauseItems,
        resetQueryConcepts,
    };
    
});