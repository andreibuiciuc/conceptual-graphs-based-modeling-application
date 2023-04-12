import { defineStore } from "pinia";
import { Ref, ref } from "vue";

import { QueryItem } from '../types/types';

export const useQueryStore  = defineStore('query', () => {
    const whereClauseItems: Ref<QueryItem[]> = ref([]);
    const orderByClauseItems: Ref<QueryItem[]> = ref([]);
    const groupByClauseItems: Ref<QueryItem[]> = ref([]);

    return {
        whereClauseItems,
        orderByClauseItems,
        groupByClauseItems
    };
});