<template>
    <div class="slide-card" 
         :class="{ 'slide-card-gray': isCardGrayed, 
                   'slide-card-mini': isCardOn, 
                   'slide-card-disabled': disabled }"
         @mouseover="onCardHover" 
         @mouseleave="onCardLeave"
         @click="onCardSelected"
    >
        <div class="card-title">
            <Transition name="card-title-fade" mode="out-in">
                <span v-if="(isCardHovered || isCardSelected) && !isCardOn">{{ cardTitle.toUpperCase() }}</span>
            </Transition>
        </div>
        <div class="slide-card-info-container">
            <span v-if="disabled">Coming Soon</span>
            <template v-else>
                <v-icon>{{ props.icon }}</v-icon>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface SlideCardProps {
    cardTitle: String,
    icon: string;
    isCardSelected: boolean;
    disabled?: boolean
    isCardGrayed?: boolean;
    isCardOn?: boolean;
};   

const props = defineProps<SlideCardProps>();
const emit = defineEmits(['hovered', 'leave', 'selected', 'transition']);

const isCardHovered = ref(false);

const onCardHover = () => {
    if (!props.disabled) {
        isCardHovered.value = true;
        emit('hovered');
    }
};

const onCardLeave = () => {
    if (!props.disabled) {
        isCardHovered.value = false;
        emit('leave');
    }
};

const onCardSelected = () => {
    if (!props.disabled) {
        emit('selected');
    }
};

</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_functions.sass'

.slide-card-gray, .slide-card-disabled
    background-color: functions.getCassandraColorByState(variables.$cassandra-disabled-state)
    border: none !important
    opacity: 0.5

.slide-card
    @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
    border: 1px solid variables.$cassandra-blue
    position: relative
    overflow: hidden
    height: 100%
    border-radius: 10px
    transition: all .2s ease-in-out

    .card-section
        @include containers.flex-container($flex-direction: row, $justify-content: space-between, $align-items: center)
        height: 100%

    .card-title
        @include containers.flex-container($justify-content: center, $align-items: center)
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 30%
        font-size: 2rem

    .slide-card-info-container
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

        .v-icon
            color: variables.$cassandra-blue
            font-size: variables.$cga-font-size-large
    
    &:hover:not(.slide-card-disabled)
        box-shadow: 0 0 11px rgba(33,33,33,.2) 
        transform: scale(1.025)
        cursor: pointer

        .card-title
            color: variables.$cassandra-blue
    
    &:not(.slide-card-disabled)::before
        background-color: functions.getCassandraColorByState(variables.$cassandra-default-state)
        align-self: flex-end
        content: ""
        position: absolute
        left: 0
        bottom: 0
        width: 100%
        height: 0%
        z-index: -1
        transition: all 0.5s

    &:hover:not(.slide-card-disabled, .slide-card-mini)::before
        height: 70%

.slide-card-mini
    height: 50px

@media (min-width: variables.$cga-ipad-width)
    .slide-card
        min-width: 400px

@media (min-width: variables.$cga-mac-width)
    .slide-card
        min-width: 500px

.card-title-fade-enter-active, .card-title-slide-leave-active
    opacity: 0
    transition: transform 0.25s, opacity 0.5s linear

.card-title-fade-enter-to, .card-title-fade-leave-from
    opacity: 1

.card-tile-fade-leave-to
    opacity: 0

</style>