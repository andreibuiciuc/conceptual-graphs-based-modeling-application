<template>
    <div class="delimiter-wrapper">
        <span class="delimiter-label" >{{ props.label }}</span>
        <div class="delimiter-scroll"></div>
    </div>
</template>

<script lang="ts" setup>
interface Props {
    label: number | string
};

const props = defineProps<Props>();

</script>

<style lang="sass" scoped>
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.delimiter-wrapper
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
    margin-bottom: 100px

    .delimiter-label
        background-image: linear-gradient(90deg, variables.$cassandra-gradient-blue, variables.$cassandra-gradient-blue-darken) 
        -webkit-background-clip: text
        -webkit-text-fill-color: transparent
        font-size: 1rem
        font-weight: 400

    .delimiter-scroll
        transform: translate3d(0px, 39.995%, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)
        transform-style: preserve-3d
        will-change: transform
        
</style>