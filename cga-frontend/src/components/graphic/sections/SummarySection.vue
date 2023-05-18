<template>
    <HomepageSection>
        <template #section-content>
            <div class="summary-card-wrapper">
                <div class="summary-card">
                    <div class="summary-card-block summary-card-block-top">
                        <span>{{ summaryTitle }}</span>
                    </div>
                    <div class="summary-card-container">
                        <div class="summary-card-block summary-card-block-bottom"></div>
                        <div class="summary-card-block summary-card-block-bottom"></div>
                    </div>
                </div>
            </div>
        </template>
    </HomepageSection>
</template>

<script setup lang="ts">
import HomepageSection from './HomepageSection.vue';

interface Props {
    summaryTitle: string
}

const _ = defineProps<Props>();

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.summary-card-wrapper
    @include containers.flex-container($justify-content: center, $align-items: center)
    overflow: hidden
    width: 100%
    height: 80%

    .summary-card
        @include containers.flex-container($flex-direction: column, $align-items: center)
        width: 100%
        height: 100%
        box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)

        .summary-card-block span
            color: variables.$cassandra-white
            font-size: 3rem

        .summary-card-block-top
            @include containers.flex-container($flex-direction: column)
            background-color: variables.$cassandra-app-blue
            padding: 4rem
            width: 80%
            height: 80%

        .summary-card-container
            @include containers.flex-container
            height: 20%
            width: 80%

            .summary-card-block-bottom:first-of-type
                @include containers.flex-container($flex-direction: column)
                background-color: variables.$cassandra-yellow
                width: 70%
                height: 100%

            .summary-card-block-bottom:last-of-type
                @include containers.flex-container($flex-direction: column)
                width: 30%
                height: 100%

</style>