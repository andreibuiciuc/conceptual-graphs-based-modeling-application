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
    visibility: hidden
    position: relative
    z-index: 999
    width: 40rem

    .banner-card
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: flex-start)
        background-color: variables.$cassandra-white
        border-radius: 3rem
        box-shadow: 0px 7px 13px rgb(0 0 0 / 13%)
        padding: 2.5rem
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


.banner-card--fade-in
    visibility: visible
    animation: banner-card-fade-in 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both

@keyframes banner-card-fade-in
    0% 
        opacity: 0
        transform: translateY(40px)
    100%
        opacity: 1
        transform: translateY(0)

</style>