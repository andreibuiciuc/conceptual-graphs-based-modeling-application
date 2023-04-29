<template>
    <Card class="force-config-card-container">
        
        <template #title>
            force configuration
        </template>
        
        <template #content>
            <div class="slider-container">
                <span>{{ conceptNodeSize }}</span>
                <Slider 
                    v-model="conceptNodeSize" 
                    class="w-14rem" 
                    :min="4"
                    :max="16"
                    @update:model-value="updateConceptNodeSize($event, forceSimulation)"
                />
            </div>
        </template>

    </Card>
</template>

<script setup lang="ts">
import { useForceGraph } from '../../../composables/forcegraph';

import { Ref, ref } from 'vue';

interface Props {
    forceSimulation: d3.Simulation<d3.SimulationNodeDatum, undefined>
};

const _ = defineProps<Props>();

const conceptNodeSize: Ref<number> = ref(8);

const { updateConceptNodeSize } = useForceGraph();

</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"

.force-config-card-container
    @include containers.flex-container($flex-direction: column)
    border-left: 2px solid variables.$cassandra-app-blue
    padding: 1.5rem
    width: 100%
    
    .slider-container
        @include containers.flex-container($align-items: baseline)
        
        span
            margin-right: 1rem

        .p-slider
            margin-top: 1rem
            width: 12rem

</style>