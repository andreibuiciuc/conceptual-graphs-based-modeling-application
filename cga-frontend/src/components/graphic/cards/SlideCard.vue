<template>
    <div class="slide-card" 
         :class="{ 'slide-card-gray': isCardGrayed, 'slide-card-mini': isCardOn }" 
         @mouseover="onCardHover" 
         @mouseleave="onCardLeave"
         @click="onCardSelected"
    >
        <div class="slide-card-info-container">
            <span v-if="isCardSelected && !isCardOn">Press to start modelling Cassandra tables</span>
            <v-icon>{{ props.icon }}</v-icon>
        </div>
    </div>
</template>

<script setup lang="ts">
interface SlideCardProps {
    icon: string;
    isCardGrayed: boolean | null;
    isCardSelected: boolean | null;
    isCardOn: boolean | null;
};   

const props = defineProps<SlideCardProps>();
const emit = defineEmits(['hovered', 'leave', 'selected', 'transition']);

const onCardHover = () => {
    emit('hovered');
};

const onCardLeave = () => {
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
    min-width: 500px
    border-radius: 5px
    border: 1px solid variables.$cassandra-blue
    transition: all .2s ease-in-out

    &:hover
        box-shadow: 0 0 11px rgba(33,33,33,.2) 
        transform: scale(1.025)
        cursor: pointer

    .slide-card-info-container
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
        
.slide-card-mini
    height: 50px
    
</style>