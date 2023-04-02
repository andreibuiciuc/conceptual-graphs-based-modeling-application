<template>
    <div v-for="(item, index) in props.items" class="query-panel-item-clause">
        <v-icon color="red" @click.prevent="removeItem(props.clause, item)">mdi-close</v-icon>
        <span class="item-clause-label">{{ index === 0 ? 'where' : 'and' }}</span>
        <v-select 
            density="compact"
            :hide-details="true"
            item-value="conceptName"
            item-text="conceptName"
            variant="outlined">
        </v-select>
        <v-select v-model="item.relation"
            density="compact"
            :hide-details="true"
            variant="outlined">
        </v-select>
        <v-text-field 
            density="compact"
            :hide-details="true"
            variant="outlined"> 
        </v-text-field>
    </div>
</template>

<script setup lang="ts">

enum QueryClause {
    WHERE
};

interface QueryItem {
    column: string,
    relation?: string,
    value?: string 
};

interface ColumnConcept {
    conceptName: string,
    conceptType: string,
    relation: string
};

interface Props {
    clause: QueryClause
    columns?: ColumnConcept[]
    items: QueryItem[]
};

const props = defineProps<Props>();
const emit = defineEmits(['remove']);

const removeItem = (clause: QueryClause, item: QueryItem): void => {
    emit('remove', { clause, item });
};

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

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

    & > *:not(.v-icon)
        margin-right: 20px

</style>