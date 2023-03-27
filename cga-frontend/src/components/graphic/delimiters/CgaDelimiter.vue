<template>
    <div class="delimiter-wrapper">
        <span class="landing-section-pre-symbol" :class="preSymbolGradientClass"></span>
        <span class="landing-section-symbol" :class="symbolGradientClass">{{ props.label }}</span>
        <span class="landing-gradient-text" :class="textGradientClass">{{ props.text }}</span>
    </div>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';

enum GradientType {
    BLUE,
    YELLOW
};

interface Props {
    label: number | string
    gradientType: GradientType
    text?: string
};

const props = defineProps<Props>();

const preSymbolGradientClass = computed(() => {
    return props.gradientType === GradientType.BLUE ? "gradient__white-blue" : "gradient__black-yellow";
});

const symbolGradientClass = computed(() => {
    return props.gradientType === GradientType.BLUE ? "gradient__light-dark-blue--horizontal" : "gradient__light-dark-yellow--horizontal";
});

const textGradientClass = computed(() => {
    return props.gradientType === GradientType.BLUE ? "gradient__light-dark-blue" : "gradient__light-dark-yellow";
});

</script>

<style lang="sass" scoped>
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.gradient__white-blue
    background-image: linear-gradient(variables.$cassandra-white, #0D41E1)

.gradient__light-dark-blue
    background-image: linear-gradient(#0D41E1, #07C8F9)

.gradient__light-dark-blue--horizontal
    background-image: linear-gradient(90deg, #07C8F9, #0D41E1)    

.gradient__black-yellow
    background: linear-gradient(variables.$cassandra-black, variables.$cassandra-yellow)

.gradient__light-dark-yellow
    background: linear-gradient(variables.$cassandra-yellow, variables.$cassandra-red)

.gradient__light-dark-yellow--horizontal
    background: linear-gradient(90deg, variables.$cassandra-yellow, variables.$cassandra-red)

.delimiter-wrapper
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
    margin-bottom: 100px

    .landing-section-pre-symbol
        height: 100px
        width: 1px

    .landing-section-symbol
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
        color: variables.$cassandra-white
        border-radius: 100%
        margin-bottom: 20px
        font-size: 1.5rem
        font-weight: 400
        height: 40px
        width: 40px

    .landing-gradient-text
        font-size: 2rem
        font-weight: 400
        line-height: 2rem
        -webkit-background-clip: text
        -webkit-text-fill-color: transparent

</style>