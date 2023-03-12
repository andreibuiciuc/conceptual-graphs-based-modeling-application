<template>
    <div class="placeholder-wrapper">
        <div class="placeholder">
            <div class="placeholder-overlay"></div>
            <span>Waiting for the Conceptual Graph to be rendered ...</span>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.placeholder-wrapper
    transform: translateX(-25%)
    width: 100%
    height: 100%
    padding: 40px

.placeholder
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
    position: relative
    width: 100%
    height: 100%
    border-radius: 10px
    overflow: hidden

    span
        font-size: variables.$cga-font-size-medium

.placeholder::before
    content: ''
    position: absolute
    width: 150%
    height: 150%
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

</style>