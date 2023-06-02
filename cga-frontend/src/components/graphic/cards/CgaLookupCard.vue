<template>
    <Card class="concept-node-lookup-container">
        <template #title>
          concept node lookup
        </template>
        <template #content>
          <div class="info">
            <div class="relation-dummy"></div>
            <div class="concept-dummy">
              <span v-if="conceptForLookup">{{ conceptForLookup.conceptType }}</span>
            </div>
            <div class="relation-dummy"></div>
          </div>
          <div class="info">
            <span>concept type:</span>
            <span>{{ conceptForLookup ? conceptTypeInfoText : 'not selected yet' }}</span>
          </div>
          <div class="info">
            <span>concept name:</span> 
            <span>{{ conceptForLookup ? conceptForLookup.conceptName : 'not selected yet' }}</span>
          </div>
          <div class="info">
            <span>children count:</span>
            <span>{{ conceptForLookup ? `${conceptForLookup.childrenCount} child concepts` : 'not selected yet'}}</span>
          </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import constants from '../../../constants/constants';
import { Concept } from '../../../types/types';

import { ComputedRef, computed } from 'vue';

interface Props {
    conceptForLookup: Concept | any
};

const props = defineProps<Props>();

const conceptTypeNameForCurrentLookupConcept: ComputedRef<string> = computed(() =>{
    switch (props.conceptForLookup.conceptType) {
        case constants.conceptTypes.keyspace:
            return 'keyspace';
        case constants.conceptTypes.table:
            return 'table';
        case constants.conceptTypes.column:
            return 'column';
        case constants.conceptTypes.dataType:
            return 'data type';
        default:
            return constants.inputValues.empty;
  }
});

const conceptTypeInfoText: ComputedRef<string> = computed(() => {
  const typeText = conceptTypeNameForCurrentLookupConcept.value;
  return typeText ? `${props.conceptForLookup.conceptType} (${typeText})` : constants.inputValues.empty;
});

</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"

.concept-node-lookup-container
    box-shadow: none !important
    border: 1px solid #e9ecef !important
    z-index: 1
    padding: 1.5rem
    width: 21rem

    .p-card-body
      width: 100%
      padding: 0

      .p-card-title
        text-align: center

      .info 
        @include containers.flex-container($flex-direction: column, $align-items: center)
        
        .relation-dummy
          width: 1px
          height: 2rem
          background-color: variables.$cassandra-black

        .concept-dummy
          @include containers.flex-container($justify-content: center, $align-items: center)
          width: 4rem
          height: 2rem
          border: 1px solid variables.$cassandra-black

          span
            margin-right: 0 !important

        span:last-of-type
          color: variables.$cassandra-app-blue

        span:first-of-type
          margin-right: 0.5rem

        &:first-of-type
          margin-bottom: 1.25rem

</style>