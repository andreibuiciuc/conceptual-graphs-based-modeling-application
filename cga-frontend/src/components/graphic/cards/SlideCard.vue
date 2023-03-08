<template>
    <div class="slide-card" 
         :class="{ 'slide-card-gray': isCardGrayed, 'slide-card-mini': isCardOn }" 
         @mouseover="onCardHover" 
         @mouseleave="onCardLeave"
         @click="onCardSelected"
    >
        <div class="card-title">
            <Transition name="card-title-fade" mode="out-in">
                <span v-if="isCardHovered">{{ cardTitle.toUpperCase() }}</span>
            </Transition>
        </div>
        <div class="slide-card-info-container">
            <span v-if="isCardSelected && !isCardOn">Press to start modelling Cassandra tables</span>
            <v-icon>{{ props.icon }}</v-icon>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface SlideCardProps {
    icon: string;
    isCardGrayed: boolean | null;
    isCardSelected: boolean | null;
    isCardOn: boolean | null;
    cardTitle: String
};   

const props = defineProps<SlideCardProps>();
const emit = defineEmits(['hovered', 'leave', 'selected', 'transition']);

const isCardHovered = ref(false);

const onCardHover = () => {
    isCardHovered.value = true;
    emit('hovered');
};

const onCardLeave = () => {
    isCardHovered.value = false;
    emit('leave');
};

const onCardSelected = () => {
    emit('selected');
};

</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.slide-card-gray
    background-color: variables.$cassandra-light-gray
    border: none !important
    opacity: 0.5

.slide-card
    @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
    height: 100%
    border-radius: 10px
    border: 1px solid variables.$cassandra-blue
    transition: all .2s ease-in-out
    position: relative
    overflow: hidden

    .card-title
        @include containers.flex-container($justify-content: center, $align-items: center)
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 30%
        font-size: 2rem

    &:hover
        box-shadow: 0 0 11px rgba(33,33,33,.2) 
        transform: scale(1.025)
        cursor: pointer

        .card-title
            color: variables.$cassandra-blue
    
    &::before
      align-self: flex-end
      content: ""
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      height: 0%
      background-color: variables.$cassandra-light-blue
      z-index: -1
      transition: 0.5s

    &:hover::before
        height: 70%

    .slide-card-info-container
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
        
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
    transition: transform 0.25s, opacity 0.30s linear

.card-title-fade-enter-to, card-title-fade-leave-from
    opacity: 1

.card-tile-fade-leave-to
    opacity: 0

</style>