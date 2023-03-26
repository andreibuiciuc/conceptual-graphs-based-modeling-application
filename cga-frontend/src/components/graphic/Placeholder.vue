<template>
    <div class="placeholder-wrapper">
        <div class="placeholder">
            <div class="placeholder-overlay"></div>
            <div class="placeholder-text">
                {{ props.text }}
                <div v-for="index in loadingDotsCount" :key="index" class="dot"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

interface PlaceholderProps {
    text?: string
    inLoadingState: boolean | null
}

const loadingDotsCount = 3;
const props = defineProps<PlaceholderProps>();

</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.placeholder-wrapper
    position: sticky
    width: 100%
    height: 100%
    padding: 40px 0 40px 40px

.placeholder
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
    position: relative
    width: 100%
    height: 100%
    border-radius: 10px
    overflow: hidden

    .placeholder-text
        @include containers.flex-container($align-items: center)
        font-size: variables.$cga-font-size-medium

        %dot
            width: 10px
            height: 10px
            margin-right: 5px
            border-radius: 50%
            animation: dot-loading-animation 1.5s ease-in-out infinite

        .dot:nth-child(1)
            @extend %dot
            margin-left: 10px
            background-color: variables.$cassandra-black
        
        .dot:nth-child(2)
            @extend %dot
            background-color: variables.$cassandra-blue
            animation-delay: 0.2s

        .dot:nth-child(3)
            @extend %dot
            margin-right: 0
            background-color: variables.$cassandra-light-blue
            animation-delay: 0.4s

.placeholder::before
    content: ''
    position: absolute
    width: 200%
    height: 200%
    background-image: conic-gradient(transparent, transparent, transparent, variables.$cassandra-blue)
    animation: border-animation 3s linear infinite

.placeholder-overlay
    position: absolute
    inset: 2px
    background: variables.$cassandra-light-gray
    border-radius: 10px

@keyframes border-animation 
    0%
        transform: rotate(0deg)
    100%
        transform: rotate(360deg)   

@keyframes dot-loading-animation
    50%
        opacity: 0
        transform: translateY(5px) scale(0.5)

</style>