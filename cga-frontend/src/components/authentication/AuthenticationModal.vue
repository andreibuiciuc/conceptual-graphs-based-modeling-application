<template>
    <v-dialog v-model="isModalOpened" v-if="isModalOpened" persistent transition="dialog-bottom-transition">
      <v-card width="500">
        <v-card-title>
          <div class="d-flex justify-space-between align-center">
            <span>Your account</span>
            <v-btn icon flat rounded="0">
              <v-icon @click.prevent="closeAuthModal">mdi-close</v-icon>
            </v-btn>
          </div>
          <div>
            <v-btn variant="outlined" 
                  class="action-button register-button" 
                  :class="{ 'action-button-active': isRegisterModalActive }"
                  @click.prevent="switchAuthModal">Register
            </v-btn>
            <v-btn variant="outlined" 
                  class="action-button login-button"
                  :class="{ 'action-button-active': !isRegisterModalActive }" 
                  @click.prevent="switchAuthModal(false)">Login</v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="form-container">
              <Transition name="slide" mode="out-in">
                <RegisterForm key="register-form" v-if="isRegisterModalActive" @snackbar="triggerSnackbar($event)" />
                <LoginForm key="login-form" v-else />
              </Transition>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
import constants from '@/constants/constants';

import { mapWritableState } from 'pinia';
import useAuthModalStore from '@/stores/authModal';
import useUserStore from '@/stores/user';

import RegisterForm from '@/components/authentication/RegisterForm.vue';
import LoginForm from '@/components/authentication/LoginForm.vue';

import CustomSnackbar from '../utilities/CustomSnackbar.vue';

export default {
    name: "AuthenticationModal",
    components: {
      RegisterForm,
      LoginForm,
      CustomSnackbar
    },
    data: () => ({
      snackbar: {
        message: constants.inputValues.empty,
        variant: constants.inputValues.empty
      }
    }),
    computed: {
      ...mapWritableState(useAuthModalStore, ['isModalOpened', 'isRegisterModalActive']),
      ...mapWritableState(useUserStore, ['isUserLoggedIn'])
    },
    methods: {
      closeAuthModal: function () {
        this.isRegisterModalActive = true;
        this.isModalOpened = false;
      },
      switchAuthModal: function (isRegisterModalActive = false) {
        this.isRegisterModalActive = isRegisterModalActive;
      },
    }
}
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
