<template>
    <div class="syncronize-card">
        <div class="syncronize-card-content">
            <i 
                class="pi pi-sync" 
                :class="areTablesInSync ? 'pi-blue' : 'pi-red pi-rotate'"
                style="font-size: 3rem;"
            >
            </i>
        </div>
        <div class="syncronize-card-footer">
            <i class="pi" :class="areTablesInSync ? 'pi-check pi-blue' : 'pi-times pi-red'"></i>
            <span>tables in sync</span>
        </div>
    </div>
</template>

<script setup lang="ts">

interface Props {
    areTablesInSync: boolean
}

const props = defineProps<Props>();

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"


.syncronize-card
    @include containers.flex-container($flex-direction: column, $justify-content: flex-start, $align-items: center)
    border: 1px solid variables.$cassandra-light-gray 
    width: 100%
    height: 16rem

    .pi-blue
        color: variables.$cassandra-app-blue 

    .pi-red
        color: variables.$cassandra-red

    .pi-rotate
        animation: icon-rotate 2s infinite

    .syncronize-card-content
        @include containers.flex-container($flex-direction: column, $justify-content: center)
        height: 100%


    .syncronize-card-footer
        @include containers.flex-container($justify-content: center, $align-items: center)
        padding-bottom: 1rem

        .pi
            margin-right: 0.5rem


@keyframes icon-rotate
    0%
        transform: rotate(0deg)
    50%
        transform: rotate(180deg)
    100%
        transform: rotate(360deg)

</style>