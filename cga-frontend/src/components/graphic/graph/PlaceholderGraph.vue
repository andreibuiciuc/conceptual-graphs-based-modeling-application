<template>
    <div class="graph-placeholder-container">
        <div 
            v-if="isCircularPlaceholder"
            class="graph-placeholder-circular-container"
        >
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
        </div>
        <div 
            v-else
            class="graph-placeholder-skeleton"
        >
            <div class="graph-placeholder-skeleton-row">
                <Skeleton />
            </div>
            <div class="graph-placeholder-skeleton-tree">
                <div class="graph-placeholder-skeleton-column">
                    <div class="graph-placeholder-skeleton-row">
                        <Skeleton />
                    </div>
                    <div class="graph-placeholder-skeleton-row">
                        <Skeleton />
                        <Skeleton />
                    </div>
                </div>
                <div class="graph-placeholder-skeleton-column">
                    <div class="graph-placeholder-skeleton-row">
                        <Skeleton />
                    </div>
                    <div class="graph-placeholder-skeleton-row">
                        <Skeleton />
                        <Skeleton />
                    </div>
                </div>
            </div>    
        </div>
        <div 
            class="graph-placeholder-text" 
            :class="{ 'graph-placeholder-circular-text': isCircularPlaceholder }"
        >
            <span>{{ placeholderText }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">

interface Props {
    placeholderText?: string 
    isCircularPlaceholder?: boolean
}

const _ = defineProps<Props>();

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.graph-placeholder-circular-container
    position: relative
    width: 25rem
    height: 25rem
    border-radius: 50%
    border: 1px solid variables.$cassandra-placeholder-gray

    .p-skeleton
        position: absolute
        left: calc(50% - 1rem)
        top: calc(50% - 1rem)

    .p-skeleton:nth-child(1)
        transform: translateX(12.5rem)

    .p-skeleton:nth-child(2)
        transform: rotate(72deg) translateX(12.5rem)

    .p-skeleton:nth-child(3) 
        transform: rotate(144deg) translateX(12.5rem)

    .p-skeleton:nth-child(4) 
        transform: rotate(216deg) translateX(12.5rem)

    .p-skeleton:nth-child(5) 
        transform: rotate(288deg) translateX(12.5rem)

.graph-placeholder-container
    @include containers.flex-container($flex-direction: column, $align-items: center)

    .graph-placeholder-skeleton
        @include containers.flex-container($flex-direction: column, $align-items: center)

        .graph-placeholder-skeleton-tree
            @include containers.flex-container($justify-content: center)

            .graph-placeholder-skeleton-column
                @include containers.flex-container($flex-direction: column)

                &:first-of-type
                    margin-right: 2.5rem

                &:last-of-type
                    margin-left: 2.5rem

        .graph-placeholder-skeleton-row
            @include containers.flex-container($justify-content: center)
            width: 100%
            margin-bottom: 4rem

            .p-skeleton:first-of-type
                margin-right: 1rem

            .p-skeleton:last-of-type
                margin-left: 1rem

        .p-skeleton
            width: 8rem !important
            height: 3rem !important

    .graph-placeholder-text > span
        color: variables.$cassandra-placeholder-gray

    .graph-placeholder-circular-text
        margin-top: 2rem

</style>

