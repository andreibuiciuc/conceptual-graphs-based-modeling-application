<template>
  <v-dialog
    v-model="isModalOpened"
    v-if="isModalOpened"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card width="500">
      <v-card-title>
        <div class="d-flex justify-space-between align-center">
          <span>Your account</span>
          <v-btn icon flat rounded="0">
            <v-icon @click.prevent="closeAuthModal">mdi-close</v-icon>
          </v-btn>
        </div>
        <div>
          <v-btn
            variant="outlined"
            class="action-button register-button"
            :class="{ 'action-button-active': isRegisterModalActive }"
            @click.prevent="switchAuthModal"
          >
            Register
          </v-btn>
          <v-btn
            variant="outlined"
            class="action-button login-button"
            :class="{ 'action-button-active': !isRegisterModalActive }"
            @click.prevent="switchAuthModal(false)"
          >
            Login
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="form-container">
          <transition name="slide" mode="out-in">
            <register-form
              key="register-form"
              v-if="isRegisterModalActive"
            />
            <login-form key="login-form" v-else />
          </transition>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import useAuthModalStore from '../../stores/authModal';
import { storeToRefs } from "pinia";

import RegisterForm from './RegisterForm.vue';
import LoginForm from "./LoginForm.vue";


// Store state mappings
const authModalStore = useAuthModalStore();
const { isModalOpened, isRegisterModalActive } = storeToRefs(authModalStore);

// Functions related to the Authentication Modal
const closeAuthModal = (): void => {
  isRegisterModalActive.value = true;
  isModalOpened.value = false;
};

const switchAuthModal = (isRegister: boolean = false): void => {
  isRegisterModalActive.value = isRegister;
};

</script>

<style lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.v-overlay__content
  align-items: center
  overflow: visible

.v-card-title
  padding: 0.5rem 24px

  .action-button
    width: 50%

  .register-button
    border-top-right-radius: 0
    border-bottom-right-radius: 0

  .login-button
    border-top-left-radius: 0
    border-bottom-left-radius: 0

.submit-button
  width: 100%

.form-container
  @include containers.flex-container($flex-direction: column, $align-items: center)

  form
    width: 100%

.slide-enter-from
  opacity: 0

.slide-enter-active, .slide-leave-active
  transition: transform 0.5s, opacity 0.3s linear

.slide-enter, .slide-leave-to
  opacity: 1
  transform: translateX(-150%)

.slide-enter-from
  opacity: 1
  transform: translateX(150%)
</style>
