<template>
    <Card class="query-panel shadow-2">
        <template #title>
            <div class="query-panel-title">
                <span>{{ queryPanelTitle }}</span>
            </div>
        </template>
        <template #subtitle>
            <div class="query-panel-subtitle">
                <i class="pi pi-info-circle"></i>
                <p>{{ informationMessages[clause] }}</p>
            </div>
        </template>
        <template #content>
            <div 
                v-for="(item, index) in items"
                :key="`${clause}_item_${index}`"
                class="query-panel-item-clause"
            >
                
                <Button 
                    aria-label="Remove" 
                    icon="pi pi-times" 
                    class="remove-icon-button"
                    text 
                    @click="removeItem(clause, item)" 
                />

                <span v-if="clause === QueryClause.WHERE" class="item-clause-label">
                    {{ index === 0 ? 'where' : 'and' }}
                </span>
                <span v-else-if="clause === QueryClause.ORDER_BY">
                    order by
                </span>
                <span v-else-if="clause === QueryClause.GROUP_BY">
                    group by
                </span>

                <Dropdown 
                    v-model="item.column" 
                    :options="props.columns" 
                    optionLabel="conceptName" 
                    optionValue="conceptName" 
                    placeholder="column"
                    :disabled="item.toQuery"
                    @change="changeColumn(clause, item)">
                </Dropdown>

                <template v-if="clause === QueryClause.WHERE">
                    <Dropdown 
                        v-model="item.relation"
                        :options="item.operators"
                        placeholder="operator"
                        :disabled="item.toQuery"
                        @change="changeOperator(item)">
                    </Dropdown>
                    <template v-if="[constants.cqlOperators.IN, constants.cqlOperators.NOT_IN].includes(item.relation!)">
                        <div class="card p-fluid">
                            <Chips v-model="item.chipValues" separator=" " :disabled="item.toQuery" :max="5" />
                        </div>
                    </template>
                    <template v-else>
                        <InputText
                            v-model="item.type"
                            :disabled="true"
                            placeholder="type"
                        />
                        <Dropdown 
                            v-if="item.type === 'boolean'" 
                            v-model="item.value"
                            :options="['false', 'true']"
                            placeholder="value" 
                            :disabled="item.toQuery"
                        />
                        <div
                            v-else-if="item.type !== 'null'"
                            class="flex flex-column gap-2"
                        >
                            <InputText
                                id="value"
                                v-model="item.value"
                                placeholder="value"
                                :class="{ 'p-invalid': !item.isValueValid }"
                                :disabled="item.toQuery"
                                @change="changeValue(item)" />
                            <small class="p-error" v-if="item.valueErrorMessage">{{ item.valueErrorMessage }}</small>
                        </div>
                    </template>
                </template>

                <Dropdown v-else-if="clause === QueryClause.ORDER_BY"
                    v-model="item.valueSelect"
                    :options="orderByOptions">
                </Dropdown>
                
                <Button 
                    aria-label="Add"
                    class="add-icon-button"
                    :disabled="!item.isValueValid || item.toQuery"
                    icon="pi pi-plus"
                    text
                    @click="addToQuery(clause, item)"
                />
                <i 
                    v-if="!item.toQuery"
                    class="pi pi-info" 
                    v-tooltip="item.tooltip">
                </i>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import { useMetadata } from '../../composables/metadata';
import { useQueryStore } from '../../stores/query';
import { QueryClause, QueryItem, Concept, GraphMetadata } from '../../types/types';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Chips from 'primevue/chips';
import { ComputedRef, computed } from 'vue';
import { storeToRefs } from 'pinia';

interface Props {
    clause: QueryClause
    columns?: Concept[],
    tableMetadata?: GraphMetadata
};

const orderByOptions = [ "ASCENDING", "DESCENDING" ];

const informationMessages = {
    [QueryClause.WHERE]: "due to the differences in the role that they are playing, partition key, clustering and normal columns support different sets of restrictions within this clause",
    [QueryClause.ORDER_BY]: "TODO",
    [QueryClause.GROUP_BY]: "TODO"
};

const tooltips = {
    [QueryClause.WHERE]: {
        partition_key: "the partition key columns support only two operators: = and IN (and the negation: != and NOT IN)",
        clustering: "TODO: clustering column tooltip",
        regular: "TODO: regular column tooltip"
    },
};

// Props and emits
const props = defineProps<Props>();
const emit = defineEmits(['remove', 'add']);

// Data and functions mapped from composables
const { getCQLWhereOperatorsByColumnKind, getColumnInputType } = useMetadata();

// Stores
const queryStore = useQueryStore();
const items = computed((): QueryItem[] => {
    switch (props.clause) {
        case QueryClause.WHERE:
            const { whereClauseItems } = storeToRefs(queryStore);
            return whereClauseItems.value;
        case QueryClause.ORDER_BY:
            const { orderByClauseItems } = storeToRefs(queryStore);
            return orderByClauseItems.value;
        case QueryClause.GROUP_BY:
            const { groupByClauseItems } = storeToRefs(queryStore);
            return groupByClauseItems.value; 
        default:
            return [];
    }
});

// Functions related to the item actions
const addToQuery = (clause: QueryClause, item: QueryItem): void => {
    const isQueryItemValid = validateItem(clause, item);
    debugger
    if (isQueryItemValid) {
        if (!item.toQuery) {
            item.toQuery = true;
        }
        emit('add', { clause, item });
    }
};

const changeColumn = (clause: QueryClause, item: QueryItem): void => {
    const currentColumn = props.columns?.find(x => x.conceptName === item.column);
    if (currentColumn) {
        item.operators = getCQLWhereOperatorsByColumnKind(currentColumn.columnKind);
        item.tooltip = tooltips[clause][currentColumn.columnKind];
        item.type = getColumnInputType(currentColumn, props.tableMetadata);
    } else {
        item.operators = [];
        item.tooltip = constants.inputValues.empty;
    }
};

const changeOperator = (item: QueryItem): void => {
    item.value = constants.inputValues.empty;
    item.valueErrorMessage = constants.inputValues.empty
    item.isValueValid = true;
};

const changeValue = (item: QueryItem): void => {
    if (!item.value) {
        item.isValueValid = false;
        return;
    } 

    let isColumnValueValid = true;
   
    if (item.type === 'boolean') {  
        isColumnValueValid = ['true', 'false'].includes(item.value);
        item.valueErrorMessage = isColumnValueValid ? constants.inputValues.empty : 'column value must be a boolean';
    } else if (item.type === 'integer') {
        const parsedValue = parseInt(item.value, 10);
        isColumnValueValid = !isNaN(parsedValue);
        item.valueErrorMessage = isColumnValueValid ? constants.inputValues.empty : 'column value must be an integer';
    }

    item.isValueValid = isColumnValueValid;
};

const removeItem = (clause: QueryClause, item: QueryItem): void => {
    emit('remove', { clause, item });
};

const validateItem = (clause: QueryClause, item: QueryItem): boolean => {
    if (clause === QueryClause.WHERE && item.relation) {
        if (['IN', 'NOT IN'].includes(item.relation)) {
            item.isValueValid = !!item.chipValues.length;
        } else {
            item.isValueValid = !!item.value;
        }
        return item.isValueValid;
    }
    return true;
};

const queryPanelTitle: ComputedRef<string> = computed(() => {
    switch (props.clause) {
        case QueryClause.WHERE:
            return 'where';
        case QueryClause.GROUP_BY:
            return 'group by';
        case QueryClause.ORDER_BY:
            return 'order by';
        default:
            return constants.inputValues.empty;
    }
});

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.query-panel
    @include containers.flex-container($flex-direction: column)
    border-radius: 2px
    border: 1px solid variables.$cassandra-light-gray
    border-left: 4px solid variables.$cassandra-app-blue
    box-shadow: none !important
    padding: 16px
    width: 100%
    margin-bottom: 24px

    .query-panel-title
        color: variables.$cassandra-black
        margin-bottom: 8px

    .query-panel-subtitle
        @include containers.flex-container($align-items: center)

        .pi
            margin-right: 1rem
        
    .query-panel-info
        @include containers.flex-container($flex-direction: row)
        margin-bottom: 16px

    .query-panel-item-clause
        @include containers.flex-container($align-items: baseline)
        flex-wrap: wrap
        padding: 8px 0
        
        .pi.pi-info
            font-size: 1rem !important

            &:hover
                color: variables.$cassandra-yellow

        .item-clause-label
            text-align: end
            width: 80px

        .p-inputtext, .p-dropdown
            width: 12.5rem

        .p-chips
            width: 35rem

            ul > li
                margin-bottom: 8px !important

        & > *
            margin-right: 20px

</style>