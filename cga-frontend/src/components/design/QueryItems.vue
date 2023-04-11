<template>
    <Card class="query-panel shadow-2">
        <template #title>
            <div class="query-panel-title">
                <span>{{ clause }}</span>
            </div>
        </template>
        <template #subtitle>
            <div class="query-panel-subtitle">
                <i class="pi pi-info-circle" style="font-size: 1.25rem;"></i>
                <p>{{ informationMessages[clause] }}</p>
            </div>
        </template>
        <template #content>
            <div v-for="(item, index) in props.items" class="query-panel-item-clause" :id="`${clause}_item_${index}`" >
                <i class="pi pi-times" style="color: red; font-size: 1.25rem" @click="removeItem(clause, item)"></i>
                <span v-if="clause === QueryClause.WHERE" class="item-clause-label">
                    {{ index === 0 ? 'where' : 'and' }}
                </span>
                <span v-else-if="clause === QueryClause.ORDER_BY">
                    order
                </span>
                <Dropdown 
                    v-model="item.column" 
                    :options="props.columns" 
                    optionLabel="conceptName" 
                    optionValue="conceptName" 
                    placeholder="column"
                    :class="{ 'p-invalid': !item.isColumnValid }"
                    @change="changeColumn(clause, item)">
                </Dropdown>
                <template v-if="clause === QueryClause.WHERE">
                    <Dropdown 
                        v-model="item.relation"
                        :options="item.operators"
                        placeholder="operator"
                        :class="{ 'p-invalid': !item.isOperatorValid }"
                        @change="changeRelation(item)">
                    </Dropdown>
                    <template v-if="[constants.cqlOperators.IN, constants.cqlOperators.NOT_IN].includes(item.relation!)">
                        <div class="card p-fluid">
                            <Chips v-model="item.chipValues" />
                        </div>
                    </template>
                    <InputText v-else
                        v-model="item.value"
                        placeholder="value"
                        :class="{ 'p-invalid': !item.isValueValid }"
                        @change="changeValue(item)">
                    </InputText>
                </template>
                <Dropdown v-else-if="clause === QueryClause.ORDER_BY"
                    v-model="item.valueSelect"
                    :options="orderByOptions">
                </Dropdown>
                <i class="pi pi-check" style="font-size: 1.25rem" @click="addToQuery(clause, item)"></i>
                <i class="pi pi-question" style="font-size: 1.25rem" v-tooltip="item.tooltip"></i>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import { useMetadata } from '../../composables/metadata';
import { QueryClause, QueryItem, Concept } from '../../types/types';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Chips from 'primevue/chips';

interface Props {
    clause: QueryClause
    columns?: Concept[]
    items: QueryItem[],
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
const { getCQLWhereOperatorsByColumnKind } = useMetadata();

// Functions related to the item actions
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
    const currentColumn = props.columns?.find(x => x.conceptName === item.column);
    if (currentColumn) {
        item.operators = getCQLWhereOperatorsByColumnKind(currentColumn.columnKind);
        item.tooltip = tooltips[clause][currentColumn.columnKind];
        item.isColumnValid = true;
    } else {
        item.operators = [];
        item.tooltip = constants.inputValues.empty;
        item.isColumnValid = false;
    }
};

const changeRelation = (item: QueryItem): void => {
    item.isOperatorValid = !!item.relation;
};

const changeValue = (item: QueryItem): void => {
    item.isValueValid = !!item.value;
};

const removeItem = (clause: QueryClause, item: QueryItem): void => {
    emit('remove', { clause, item });
};

const validateItem = (clause: QueryClause, item: QueryItem): boolean => {
    if (clause === QueryClause.WHERE) {
        item.isColumnValid = !!item.column;
        item.isOperatorValid = !!item.relation;
        item.isValueValid = !!item.value;
        return item.isColumnValid && item.isOperatorValid && item.isValueValid;
    }
    return true;
};

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.query-panel
    @include containers.flex-container($flex-direction: column)
    border-radius: 2px
    border: 1px solid variables.$cassandra-light-gray
    border-left: 4px solid variables.$cassandra-gradient-blue
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
        @include containers.flex-container($align-items: center)
        padding: 8px 0
        
        .pi:hover
            cursor: pointer


        .item-clause-label
            text-align: end
            width: 80px

        .p-inputtext, .p-dropdown
            width: 240px

        .p-chips
            min-width: 400px
            max-width: 480px

            ul > li
                margin-bottom: 8px !important

        & > *
            margin-right: 20px

</style>