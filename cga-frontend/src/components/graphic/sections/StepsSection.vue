<template>
    <HomepageSection>
        <template #section-content>
            <div class="timeline-wrapper">
                <Timeline :value="steps" class="w-full" align="alternate">
                    <template #content="slotProps">
                        <Card>
                            <template #title>
                                <i :class="slotProps.item.iconClass"></i>
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
import HomepageSection from './HomepageSection.vue';

const steps = [
    {
        title: 'sign up', 
        subtitle: 'cga', 
        iconClass: 'pi pi-user',
        content: 'register a cga account and sign into the app', 
        color: '#3b82f6' 
    },
    { 
        title: 'get credentials', 
        subtitle: 'datastax astra',
        iconClass: 'pi pi-cloud-download',
        content: 'make sure you have an active astra account and configure your credentials', 
        color: '#ffcc00'
    },
    { 
        title: 'start exploring', 
        subtitle: 'cga', 
        iconClass: 'pi pi-database',
        content: 'establish connection and start explore your database', 
        color: '#3b82f6' 
    },
];

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.timeline-wrapper
    width: 60rem

    .p-timeline .p-timeline-event

        .p-timeline-event-separator
            margin: 0.25rem

        .p-timeline-event-content > .p-card
            box-shadow: none
            border: 1px solid variables.$cassandra-light-gray

            &:hover
                border-left-width: 0.5rem
                border-color: variables.$cassandra-app-blue
                transition: all 0.2s ease-out

            .p-card-title
                @include containers.flex-container($align-items: baseline)

                .pi
                    margin-right: 1rem
                    color: variables.$cassandra-app-blue

            .p-card-body > .p-card-title > span
                font-size: 2rem

            .p-card-body > .p-card-subtitle b, .p-card-body > .p-card-subtitle span
                font-size: 1.5rem
        
        &:nth-of-type(even) .p-timeline-event-content > .p-card

            &:hover
                border-color: variables.$cassandra-yellow
                border-left-width: 1px
                border-right-width: 0.5rem
                transition: border-width 0.25s ease-out

            .p-card-title 
                justify-content: flex-end

                .pi
                    color: variables.$cassandra-yellow

</style>