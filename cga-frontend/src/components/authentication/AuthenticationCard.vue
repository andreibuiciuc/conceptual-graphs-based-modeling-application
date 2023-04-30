<template>
  <div class="authentication-card-wrapper">
    <div class="authentication-card" :style="{ transform: cardTilt, transition: 'transform 0.3s ease-out' }" ref="target">
      <div class="authentication-card-first-half">
      </div>
      <div class="authentication-card-second-half">
        <div class="authentication-card-header-actions" v-if="isAuthInsideModal">
          <i class="pi pi-times" style="font-size: 1.5rem;" @click="isLoginInModal = false"></i>
        </div>
        <div class="authentication-card-content">
          <div class="authentication-card-title">
            <span>{{ isRegisterFormActive ? 'register' : 'login' }}</span>
            <i class="pi pi-arrow-right" style="font-size: 1.5rem; margin-left: 1.5rem;" @click="isRegisterFormActive = !isRegisterFormActive"></i>
          </div>
          <RegisterForm key="register-form" v-if="isRegisterFormActive" />
          <LoginForm key="login-form" v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core';
import { useUtilsStore } from '@/stores/utils';

import RegisterForm from './RegisterForm.vue';
import LoginForm from "./LoginForm.vue";
import { Ref, ref } from 'vue';
import { computed } from '@vue/reactivity';
import constants from '../../constants/constants';
import { storeToRefs } from 'pinia';

interface Props {
  isAuthInsideModal?: boolean
};

const props = defineProps<Props>();
const isRegisterFormActive: Ref<boolean> = ref(true);

// Store mappings
const utilsStore = useUtilsStore();
const { isLoginInModal } = storeToRefs(utilsStore);

// Tilt functionality
const target = ref(null);
const { elementX, elementY, isOutside, elementHeight, elementWidth } = useMouseInElement();
const MAX_ROTATION = 7;

const cardTilt = computed(() => {
  const rotationX = (MAX_ROTATION / 2 - (elementY.value / elementHeight.value) * MAX_ROTATION).toFixed(2);
  const rotationY = (elementX.value / elementWidth.value * MAX_ROTATION - MAX_ROTATION / 2).toFixed(2);
  return isOutside.value ? constants.inputValues.empty : `perspective(${elementWidth.value}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
});

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.authentication-card-wrapper
  @include containers.flex-container($justify-content: center, $align-items: center)
  overflow: hidden

  .authentication-card
    @include containers.flex-container($flex-direction: row)
    width: 100%
    height: 750px

    .authentication-card-first-half, .authentication-card-second-half
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
      height: 100%
      width: 550px

    .authentication-card-first-half
      background-image: url('/cassandra-background.svg')
      background-size: cover
      border-top-left-radius: 1.5rem
      border-bottom-left-radius: 1.5rem

    .authentication-card-second-half
      background-color: variables.$cassandra-white !important
      border: 1px solid variables.$cassandra-light-gray
      padding: 2.5rem
      border-top-right-radius: 1.5rem
      border-bottom-right-radius: 1.5rem

      .authentication-card-header-actions
        @include containers.flex-container($justify-content: flex-end)
        width: 100%

        .pi:hover
          cursor: pointer

      .authentication-card-content
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
        height: 100%
        width: 100%

        .authentication-card-title
          @include containers.flex-container($flex-direction: row, $align-items: center)
          font-size: 3rem
          margin-bottom: 2.5rem

          .pi
            font-size: 1.5rem
            margin-left: 1rem

            &:hover
              cursor: pointer 

        form
          width: 100%
          padding: 2.5rem

          .p-button
            width: 100% !important

</style>
