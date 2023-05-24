<template>
    <div class="graph-placeholder-container">
        <div class="graph-placeholder-skeleton">
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
        <div class="graph-placeholder-text">
            <span>{{ placeholderText }} ...</span>
        </div>
    </div>
</template>

<script setup lang="ts">

interface Props {
    placeholderText?: string 
}

const _ = defineProps<Props>();

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"


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
        color: #dee2e6

</style>

