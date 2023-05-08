<template>
    <Card class="query-panel shadow-2" :class="{ 'query-panel-warn': state === 'warn' }">
        <template #title>
            <div class="query-panel-title">
                <span>{{ queryPanelTitle }}</span>
            </div>
        </template>
        <template #subtitle>
            <div class="query-panel-subtitle">
                <div class="subtitle-info">
                    <i class="pi pi-info-circle"></i>
                    <p>{{ informationMessages[clause] }}</p>
                </div>
                <div class=subtitle-info v-if="state === 'warn'">
                    <i class="pi pi-info-circle"></i>
                    <p>this query clause was recommended by the cga. you can edit and add it to the query</p>
                </div>
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
                <span v-else-if="clause === QueryClause.GET">
                    aggregate
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

                <i  v-if="clause === QueryClause.GROUP_BY"
                    class="pi pi-info" 
                    v-tooltip="item.tooltip">
                </i>

                <template v-if="clause === QueryClause.WHERE">
                    <Dropdown 
                        v-model="item.relation"
                        :options="item.operators"
                        placeholder="operator"
                        :disabled="item.toQuery"
                        @change="changeOperator(item)">
                    </Dropdown>
                    <i 
                        class="pi pi-info" 
                        v-tooltip="item.tooltip">
                    </i>
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
                                @change="changeValue(item)" 
                            />
                            <small 
                                v-if="item.valueErrorMessage"
                                class="p-error"
                            >
                                {{ item.valueErrorMessage }}
                            </small>
                        </div>
                    </template>
                </template>

                <Dropdown 
                    v-else-if="clause === QueryClause.ORDER_BY "
                    v-model="item.valueSelect"
                    :options="orderByOptions"
                />

                <template v-else-if="clause===QueryClause.GET">
                    <span>using</span>
                    <Dropdown 
                        v-model="item.valueSelect"
                        :options="getAggregationFunctionsForSelectedColumn(item)"
                    />
                </template>
                
                <Chip class="pl-0 pr-3" :class="{ 'p-chip-disabled': item.toQuery }">
                    <div 
                        class="chip-preppend-icon"
                        :class="{ 'chip-preppend-icon-disabled': item.toQuery }" 
                        @click="addToQuery(clause, item)">
                        <i class="pi" :class="item.toQuery ? 'pi-check' : 'pi-plus'" />
                    </div>
                    <span class="ml-2 font-medium">{{ item.toQuery ? 'added' : 'add' }}</span>
                </Chip>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import { useMetadata } from '../../composables/metadata';
import { useQueryStore } from '../../stores/query';
import { QueryClause, QueryItem, Concept, GraphMetadata, AggregateFunction } from '../../types/types';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Chips from 'primevue/chips';
import { ComputedRef, computed } from 'vue';
import { storeToRefs } from 'pinia';

interface Props {
    clause: QueryClause
    columns?: Concept[],
    tableMetadata?: GraphMetadata,
    state: string
};

const orderByOptions = [ "asc", "desc" ];
const aggregateFunctionsOptions: AggregateFunction[] = [ 'max', 'min', 'sum', 'avg', 'count' ];

const informationMessages = {
    [QueryClause.WHERE]: "due to the differences in the role that they are playing, partition key, clustering and normal columns support different sets of restrictions within this clause",
    [QueryClause.ORDER_BY]: "the partition key must be defined in the where clause and the order by clause defines the clustering column to use for ordering",
    [QueryClause.GROUP_BY]: "the group by option can condense all selected rows that share the same values for a set of columns into a single row",
    [QueryClause.GET]: "aggregate functions work on a set of rows matching a select statement to return a single value"
};

const tooltips = {
    [QueryClause.WHERE]: {
        partition_key: "the partition key columns support only two operators: = and IN",
        clustering: "the clustering columns support only the following operators: =, IN, >, >=, <, <=",
        regular: "TODO: regular column tooltip"
    },
    [QueryClause.GROUP_BY]: {
        partition_key: "group by is only supported on primary key columns"
    }
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
        case QueryClause.GET:
            const { aggregateFunctionsItems } = storeToRefs(queryStore);
            return aggregateFunctionsItems.value;
        default:
            return [];
    }
});

// Functions related to the item actions
const getAggregationFunctionsForSelectedColumn = (item: QueryItem): AggregateFunction[] => {
    if (item.column === 'all' || !['integer', 'float'].includes(item.type)) {
        return ['count'];
    }
    return aggregateFunctionsOptions;
};

const addToQuery = (clause: QueryClause, item: QueryItem): void => {
    const isQueryItemValid = validateItem(clause, item);
    if (isQueryItemValid) {
        if (!item.toQuery) {
            item.toQuery = true;
        }
        emit('add', { clause, item });
    }
};

const changeColumn = (clause: QueryClause, item: QueryItem): void => {
    debugger;
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
        case QueryClause.GET:
            return 'aggregate';
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

    &.query-panel-warn
        border-left-color: variables.$cassandra-yellow

    .query-panel-title
        @include containers.flex-container($justify-content: space-between)
        color: variables.$cassandra-black
        margin-bottom: 8px

        .query-panel-title-info
            color: variables.$cassandra-yellow

    .query-panel-subtitle
        @include containers.flex-container($flex-direction: column, $align-items: flex-start)

        .subtitle-info
            @include containers.flex-container($align-items: center)
            margin-top: 1rem

            .pi
                margin-right: 1rem
        
    .query-panel-info
        @include containers.flex-container($flex-direction: row)
        margin-bottom: 16px

    .query-panel-item-clause
        @include containers.flex-container($align-items: center)
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

        .p-chip
            width: 6rem
            hieght: 2rem !important
        
        .p-chip-disabled
            width: 7.25rem
            transition: all 0.4s ease-out

        .chip-preppend-icon
            @include containers.flex-container($align-items: center, $justify-content: center)
            align-self: center
            background-color: variables.$cassandra-app-blue
            color: variables.$cassandra-white
            border-radius: 50%
            width: 2rem
            height: 2rem
            transition: transform 0.4s ease-out

            &:hover
                cursor: pointer
                transform: scale(1.15)

        .chip-preppend-icon.chip-preppend-icon-disabled
            background-color: #dee2e6 !important

            &:hover
                cursor: default
                transform: none

</style>