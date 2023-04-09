<template>
    <div class="query-panel">
        <div class="query-panel-title">{{ clause }} clause</div>
        <div class="query-panel-info">
            <v-icon >mdi-information</v-icon>
            <p>{{ informationMessages[clause] }}</p>
        </div>
        <div v-for="(item, index) in props.items" class="query-panel-item-clause" :id="`${clause}_item_${index}`" >
            <v-icon 
                color="red" 
                @click.prevent="removeItem(props.clause, item)">
                mdi-close
            </v-icon>
            <span v-if="clause === QueryClause.WHERE" class="item-clause-label">
                {{ index === 0 ? 'where' : 'and' }}
            </span>
            <span v-else-if="clause === QueryClause.ORDER_BY">
                order
            </span>
            <v-select
                v-model="item.column"
                density="compact"
                :hide-details="true"
                :items="props.columns"
                item-title="conceptName"
                item-value="conceptName"
                variant="outlined"
                @update:modelValue="changeItem(clause, item)">
            </v-select>
            <template v-if="clause === QueryClause.WHERE">
                <v-select 
                    v-model="item.relation"
                    density="compact"
                    :hide-details="true"
                    :items="props.operators"
                    variant="outlined">
                </v-select>
                <v-text-field 
                    v-model="item.value"
                    density="compact"
                    :hide-details="true"
                    variant="outlined"> 
                </v-text-field>
            </template>
            <v-select v-else-if="clause === QueryClause.ORDER_BY"
                v-model="item.valueSelect"
                density="compact"
                :hide-details="true"
                :items="orderByOptions"
                variant="outlined">
            </v-select>
            <v-icon 
                :color="item.toQuery ? 'gray' : 'green'" 
                @click.prevent="addToQuery(props.clause, item)">
                mdi-check
            </v-icon>
            <v-tooltip 
                :text="item.tooltip" 
                :key="`${item.column}_tooltip`" 
                location="right" 
                attach=".query-panel">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props">mdi-help</v-icon>
                </template>
            </v-tooltip>
        </div>
    </div>
</template>

<script setup lang="ts">
import { QueryClause, QueryItem, Concept } from '../../types/types';
import constants from '../../constants/constants';

interface Props {
    clause: QueryClause
    columns?: Concept[]
    items: QueryItem[],
    operators?: string[]
};

const orderByOptions = [ "ASCENDING", "DESCENDING" ];

const informationMessages = {
    [QueryClause.WHERE]: "due to the differences in the role that they are playing, partition key, clustering and normal columns support different sets of restrictions within the WHERE clause",
    [QueryClause.ORDER_BY]: "TODO",
    [QueryClause.GROUP_BY]: "TODO"
};

const tooltips = {
    [QueryClause.WHERE]: {
        regular: "the partition key columns support only two operators: = and IN"
    },
};

const props = defineProps<Props>();
const emit = defineEmits(['remove', 'add']);

// Functions related to the item actions
const addToQuery = (clause: QueryClause, item: QueryItem): void => {
    if (!item.toQuery) {
        item.toQuery = true;
    }
    emit('add', { clause, item });
};

const changeItem = (clause: QueryClause, item: QueryItem): void => {
    item.tooltip = getTooltip(clause, item);
};

const getTooltip = (clause: QueryClause, item: QueryItem): string => {
    const currentColumn = props.columns?.find(x => x.conceptName === item.column);
    if (currentColumn) {
        return tooltips[clause][currentColumn.columnKind];
    }
    return constants.inputValues.empty;
};

const removeItem = (clause: QueryClause, item: QueryItem): void => {
    emit('remove', { clause, item });
};

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.query-panel
    @include containers.flex-container($flex-direction: column)
    border-radius: 2px
    border: 1px solid variables.$cassandra-light-gray
    border-left: 4px solid variables.$cassandra-blue
    padding: 16px
    width: 100%
    margin-bottom: 24px

    .query-panel-title
        color: variables.$cassandra-black
        margin-bottom: 8px

    .query-panel-info
        @include containers.flex-container($flex-direction: row)
        margin-bottom: 16px

        .v-icon
            color: variables.$cassandra-blue
            margin-right: 16px

    .query-panel-item-clause
        @include containers.flex-container($align-items: center)
        padding: 8px 0

        .v-icon
            cursor: pointer

            &:last-of-type
                color: variables.$cassandra-light-gray  

                &:hover
                    color: variables.$cassandra-yellow

        .item-clause-label
            text-align: end
            width: 80px

        .v-select:first-of-type
            width: 240px

        .v-select:second-of-type
            width: 160px

        .v-text-field
            width: 240px

        & > *
            margin-right: 20px

        .v-tooltip
            top: 0
        

</style>