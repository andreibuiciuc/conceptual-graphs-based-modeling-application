<template>
    <div class="landing-card">
        <div class="landing-card-title">
            <div class="landing-card-icon-wrapper">
                <v-icon>{{ props.icon }}</v-icon>
            </div>
            <div class="landing-card-title-text">
                {{ props.title }}
            </div>
        </div>
        <div class="landing-card-text">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>

interface Props {
    icon: string,
    title: string
};

const props = defineProps<Props>();

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.landing-card
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: flex-start)
    margin-bottom: 40px

    .landing-card-title
        @include containers.flex-container($flex-direction: row, $justify-content: flex-start, $align-items: center)
        color: variables.$cassandra-blue
        margin-bottom: 10px

        .landing-card-icon-wrapper
            @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
            background-color: variables.$cassandra-light-gray
            border: 1px solid variables.$cassandra-gray
            border-radius: 20%
            margin-right: 10px
            padding: 5px

            .v-icon
                font-size: 24px

        .landing-card-title-text
            font-size: 1.25rem

    .landing-card-text
        @include containers.flex-container($flex-direction: column, $justify-content: flex-start)
</style>