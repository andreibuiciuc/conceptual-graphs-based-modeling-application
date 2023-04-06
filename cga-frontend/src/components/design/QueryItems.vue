<template>
    <div class="query-panel">
        <div class="query-panel-title">{{ panelTitle }}</div>
        <div v-for="(item, index) in props.items" class="query-panel-item-clause">
        <v-icon color="red" @click.prevent="removeItem(props.clause, item)">mdi-close</v-icon>
        <span class="item-clause-label">{{ index === 0 ? 'where' : 'and' }}</span>
        <v-select v-model="item.column"
            density="compact"
            :hide-details="true"
            :items="props.columns"
            item-title="conceptName"
            item-value="conceptName"
            variant="outlined">
        </v-select>
        <v-select v-model="item.relation"
            density="compact"
            :hide-details="true"
            :items="props.operators"
            variant="outlined">
        </v-select>
        <v-text-field v-model="item.value"
            density="compact"
            :hide-details="true"
            variant="outlined"> 
        </v-text-field>
        <v-icon v-if="!item.toQuery" :color="item.toQuery ? 'gray' : 'green'" @click.prevent="addToQuery(props.clause, item)">mdi-check</v-icon>
    </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';

enum QueryClause {
    WHERE
};

interface QueryItem {
    column: string,
    relation?: string,
    value?: string 
    toQuery?: boolean
};

interface ColumnConcept {
    conceptName: string,
    conceptType: string,
    relation: string
};

interface Props {
    clause: QueryClause
    columns?: ColumnConcept[]
    items: QueryItem[],
    operators?: string[]
};

const props = defineProps<Props>();
const emit = defineEmits(['remove', 'add']);

const panelTitle = computed(() => {
    return (props.clause === QueryClause.WHERE ? 'where' : 'TBA').concat(' clause');
});

const addToQuery = (clause: QueryClause, item: QueryItem): void => {
    console.log(item);
    if (!item.toQuery) {
        item.toQuery = true;
    }
    emit('add', { clause, item });
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

    .query-panel-title
        color: variables.$cassandra-black

    .query-panel-item-clause
        @include containers.flex-container($align-items: center)
        padding: 8px 0

        .v-icon
            cursor: pointer

        .item-clause-label
            text-align: end
            width: 80px

        .v-select:first-of-type
            width: 240px

        .v-select:second-of-type
            width: 160px

        .v-text-field
            width: 240px

        & > *:not(.v-icon)
            margin-right: 20px

</style>