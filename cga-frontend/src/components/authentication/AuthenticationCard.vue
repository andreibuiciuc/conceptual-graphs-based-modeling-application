<template>
  <div class="authentication-card-wrapper">
    <div 
      class="authentication-card" 
      :style="{ transform: cardTilt, transition: 'transform 0.3s ease-out' }" 
      ref="target"
    >
      <div class="authentication-card-first-half"></div>
      <div class="authentication-card-second-half">
        <div 
          v-if="isAuthInsideModal"
          class="authentication-card-header-actions"
        >
          <i 
            class="pi pi-times" 
            style="font-size: 1.5rem;" 
            @click="isLoginInModal = false">
          </i>
        </div>
        <div class="authentication-card-content">
          
          <div class="authentication-card-title">
            <span>{{ authenticationModalTitle }}</span>
            <i 
              class="pi pi-arrow-right" 
              style="font-size: 1.5rem; margin-left: 1.5rem;" 
              @click="changeAuthenticationForm">
            </i>
          </div>

          <div 
            v-if="currentAuthenticationFormType === 'password'"
            class="authentication-card-info"
          >
            <i class="pi pi-inbox" style="font-size: 1.5rem;"></i>
            <span>
              {{ isPasswordResetEmailSent ? 'check your inbox to complete the password reset' : 'send a password reset email' }}
            </span>
          </div>
          
          <RegisterForm 
            v-if="currentAuthenticationFormType === 'register'"
            key="register-form" 
          />
          <LoginForm 
            v-else-if="currentAuthenticationFormType === 'login'"
            key="login-form"
          >
            <template #login-message>
              <span @click="currentAuthenticationFormType = 'password'">forgot your password?</span>
            </template>
          </LoginForm>
          <PasswordResetForm 
            v-else-if="currentAuthenticationFormType === 'password'"
            key="password-form"
          />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import LoginForm from "./LoginForm.vue";
import PasswordResetForm from '@/components/authentication/PasswordResetForm.vue';
import RegisterForm from './RegisterForm.vue';

import { computed } from '@vue/reactivity';
import { ComputedRef, Ref, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMouseInElement } from '@vueuse/core';
import { useUtilsStore } from '@/stores/utils';
import { useUserStore } from '@/stores/user';

interface Props {
  isAuthInsideModal?: boolean
};

type AuthenticationForm = 'login' | 'register' | 'password';

const _ = defineProps<Props>();
const currentAuthenticationFormType: Ref<AuthenticationForm> = ref('login');

// Store mappings
const utilsStore = useUtilsStore();
const { isLoginInModal } = storeToRefs(utilsStore);

const userStore = useUserStore();
const { isPasswordResetEmailSent } = storeToRefs(userStore);

// Functionalities related to the authentication modal configuration
const authenticationModalTitle: ComputedRef<string> = computed(() => {
  return currentAuthenticationFormType.value;
});

const changeAuthenticationForm = () => {
  currentAuthenticationFormType.value = currentAuthenticationFormType.value === 'login' ? 'register' : 'login';
};

// Functionalities related to the tilting effect of the authentication card
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
  height: 100%

  .authentication-card
    @include containers.flex-container($flex-direction: row)
    width: 80%
    height: 40rem

    .authentication-card-first-half, .authentication-card-second-half
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
      height: 100%
      width: 550px

    .authentication-card-first-half
      background-image: url('/cassandra-background.svg')
      background-size: cover

    .authentication-card-second-half
      background-color: variables.$cassandra-white !important
      border: 1px solid variables.$cassandra-light-gray
      padding: 2.5rem

      .authentication-card-header-actions
        @include containers.flex-container($justify-content: flex-end)
        width: 100%

        .pi:hover
          cursor: pointer

      .authentication-card-content
        @include containers.flex-container($flex-direction: column, $justify-content: space-between, $align-items: center)
        height: 100%
        width: 100%

        .authentication-card-title
          @include containers.flex-container($flex-direction: row, $justify-content: space-between, $align-items: center)
          width: 100%
          font-size: 2rem
          margin-bottom: 2.5rem

          .pi
            font-size: 1.5rem
            margin-left: 1rem

            &:hover
              cursor: pointer 
              color: variables.$cassandra-app-blue
          
        .authentication-card-info
          @include containers.flex-container($flex-direction: column, $align-items: center)

          span
            margin-top: 1.5rem

</style>
