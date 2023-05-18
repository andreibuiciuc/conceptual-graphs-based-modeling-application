<template>
    <section 
        class="homepage-section"
        :id="id"
    >
        <slot name="section-content"></slot>
    </section>

</template>

<script setup lang="ts">

interface Props {
    id?: string
}

const _ = defineProps<Props>();

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.homepage-section
    max-width: 100%
    padding: 0 24px
    height: 100vh

    .homepage-section#auth
        height: calc(100vh - (3rem + 68px))

</style>