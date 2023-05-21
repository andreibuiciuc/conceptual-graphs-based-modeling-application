<template>
    <HomepageSection>
        <template #section-content>
            <div class="summary-card-wrapper">
                <div class="summary-card" id="summary-card">
                    <div class="summary-card-block summary-card-block-top">
                        <span>{{ summaryTitle }}</span>
                        <span>{{ summarySubtitle }}</span>
                    </div>
                    <div class="summary-card-container">
                        <div class="summary-card-block summary-card-block-bottom">
                            <span>{{ summaryActions[currentActionIndex] }}</span>
                        </div>
                        <div class="summary-card-block summary-card-block-bottom">
                            <div class="summary-link">
                                <span>{{ summaryLabel }}</span>
                                <a :href="summaryLabelLink" target="_blank">
                                    <i class="pi pi-external-link"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </HomepageSection>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import HomepageSection from './HomepageSection.vue';

interface Props {
    summaryTitle: string
    summarySubtitle?: string
    summaryActions: string[]
    summaryLabel: string
    summaryLabelLink?: string
}

const props = defineProps<Props>();
const currentActionIndex: Ref<number> = ref(0);

const computeIndexForNextAction = (): void => {
    setInterval(() => {
        currentActionIndex.value = (currentActionIndex.value + 1) % props.summaryActions.length;
    }, 4000);
};

computeIndexForNextAction();

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.summary-card-wrapper
    @include containers.flex-container($justify-content: center, $align-items: center)
    overflow: hidden
    width: 100%
    height: 100%

    .summary-card
        @include containers.flex-container($flex-direction: column, $align-items: center)
        visibility: hidden
        width: 80%
        height: 70%
        box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)

        .summary-card-block span
            color: variables.$cassandra-white

        .summary-card-block-top
            @include containers.flex-container($flex-direction: column)
            background-color: variables.$cassandra-app-blue
            padding: 4rem
            width: 100%
            height: 80%
            font-size: 3rem

        .summary-card-container
            @include containers.flex-container
            height: 20%
            width: 100%

            .summary-card-block-bottom:first-of-type
                @include containers.flex-container($flex-direction: column, $justify-content: center)
                background-color: variables.$cassandra-yellow
                padding: 2rem 4rem
                width: 70%
                height: 100%
                font-size: 2rem

            .summary-card-block-bottom:last-of-type
                @include containers.flex-container($flex-direction: column, $justify-content: center)
                padding: 2rem 4rem
                width: 30%
                height: 100%
                font-size: 2rem

                .summary-link > span
                    color: variables.$cassandra-app-blue
                    margin-right: 1rem
                
                .summary-link .pi:hover
                    color: variables.$cassandra-app-blue

    .summary-card-fade-in
        visibility: visible
        animation: summary-card-fade-in 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both

@keyframes summary-card-fade-in
    0% 
        opacity: 0
        transform: translateY(40px)
    100%
        opacity: 1
        transform: translateY(0)

</style>