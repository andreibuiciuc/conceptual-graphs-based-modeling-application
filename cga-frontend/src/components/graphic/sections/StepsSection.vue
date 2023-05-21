<template>
    <HomepageSection>
        <template #section-content>
            <div class="timeline-wrapper">
                <Timeline :value="steps" class="w-full md:w-20rem" align="alternate">
                    <template #content="slotProps">
                        <Card>
                            <template #title>
                                <span :style="{ color: slotProps.item.color }">
                                    {{ slotProps.item.title }}
                                </span>
                            </template>
                            <template #subtitle>
                                <b>{{ slotProps.item.subtitle }}</b> application
                            </template>
                            <template #content>
                                {{ slotProps.item.content }}
                            </template>
                        </Card>
                    </template>
                </Timeline>
            </div>
        </template>
    </HomepageSection>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import HomepageSection from './HomepageSection.vue';

const steps: Ref<any> = ref([
    { title: 'connection', subtitle: 'cga', content: 'register a cga account and sign into the app', color: '#3b82f6' },
    { title: 'credentials', subtitle: 'datastax astra', content: 'make sure you have an active astra account and configure your credentials', color: '#ffcc00'  },
    { title: 'explore', subtitle: 'cga', content: 'establish connection and start explore your database', color: '#3b82f6' },

]);

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.timeline-wrapper
    width: 40rem

    .p-card
        box-shadow: none
        border: 1px solid variables.$cassandra-light-gray
    
    .p-timeline-event:nth-of-type(odd) .p-card
        border-left: 0.25rem solid variables.$cassandra-app-blue !important

    .p-timeline-event:nth-of-type(even) .p-card
        border-right: 0.25rem solid variables.$cassandra-yellow !important

</style>