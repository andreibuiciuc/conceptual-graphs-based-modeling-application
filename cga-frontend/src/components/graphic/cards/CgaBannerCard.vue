<template>
    <div class="banner-card-wrapper">
        <div class="banner-card">
            <div class="banner-card-title">
                {{ props.title }}
            </div>
            <div class="banner-card-content">
                <div class="banner-card-content-text">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

interface Props {
    title?: string
}

const props = defineProps<Props>();


</script>

<style lang="sass" scoped>
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.banner-card-wrapper
    position: relative
    top: -10%
    width: 100%
    padding: 0 15%

    .banner-card
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: flex-start)
        background-color: variables.$cassandra-white
        border-radius: 96px
        box-shadow: 0px 7px 13px rgb(0 0 0 / 13%)
        padding: 40px 80px
        z-index: 4

        .banner-card-title
            font-size: 3rem
            margin-bottom: 10px

        .banner-card-content
            @include containers.flex-container($flex-direction: row, $justify-content: flex-start)

            .banner-card-content-text
                @include containers.flex-container($flex-direction: column, $justify-content: flex-start, $align-items: flex-start)
                font-style: italic
                font-size: 1.25rem

</style>