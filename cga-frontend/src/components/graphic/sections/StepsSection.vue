<template>
    <HomepageSection>
        <template #section-content>
            <div class="timeline-wrapper">
                <Timeline :value="steps" class="w-full" align="alternate">
                    <template #content="slotProps">
                        <Card>
                            <template #title>
                                <span :style="{ color: slotProps.item.color }">
                                    {{ slotProps.item.title }}
                                </span>
                            </template>
                            <template #subtitle>
                                <b>{{ slotProps.item.subtitle }}</b> <span>application</span>
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

const hoverOverTimelineCard = (event: MouseEvent) => {
    const target = <HTMLElement> event.target
    debugger
    if (target.classList.contains('p-card')) {
        target.classList.add('p-card-active');
    }
};

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.timeline-wrapper
    width: 60rem

    .p-timeline .p-timeline-event .p-timeline-event-separator
        margin: 0 2.5rem

    .p-timeline .p-timeline-event

        .p-timeline-event-content > .p-card:hover
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2)
            transform: scale(1.1)
            transition: transform 0.5s ease-out
            border-left: 0.25rem solid variables.$cassandra-app-blue !important

    .p-timeline .p-timeline-event:nth-of-type(even)

        .p-timeline-event-content > .p-card:hover
            border-left: none !important
            border-right: 0.25rem solid variables.$cassandra-yellow !important

    .p-timeline .p-timeline-event

        .p-timeline-event-content > .p-card
            box-shadow: none
            border: 1px solid variables.$cassandra-light-gray

            .p-card-body > .p-card-title > span
                font-size: 2rem

            .p-card-body > .p-card-subtitle b, .p-card-body > .p-card-subtitle span
                font-size: 1.5rem
        
</style>