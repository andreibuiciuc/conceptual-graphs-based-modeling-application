<template>
    <v-dialog persistent transition="dialog-bottom-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="outlined" @click.prevent="toggleAuthModal(true)">Create an account</v-btn>
      </template>
      <template v-slot:default="{ isActive }">
          <v-card width="500">
            <v-card-title>
              <div class="d-flex justify-space-between align-center">
                <span>Your account</span>
                <v-btn icon flat rounded="0">
                  <v-icon @click.prevent="toggleAuthModal(false), isActive.value = false">mdi-close</v-icon>
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
                    <RegisterForm key="register-form" v-if="isRegisterModalActive" />
                    <LoginForm key="login-form" v-else />
                  </Transition>
              </div>
          </v-card-text>
            <v-card-actions class="pl-6 pr-6">
              <v-btn variant="outlined" 
                     class="action-button submit-button"
                     @click.prevent="authenticate();isActive.value=false">Submit</v-btn>
            </v-card-actions>
          </v-card>
      </template>
    </v-dialog>
</template>

<script>
import { mapWritableState } from 'pinia';
import useAuthModalStore from '@/stores/authModal';
import useUserStore from '@/stores/user';

import RegisterForm from '@/components/authentication/RegisterForm.vue';
import LoginForm from '@/components/authentication/LoginForm.vue';

export default {
    name: "AuthenticationModal",
    components: {
      RegisterForm,
      LoginForm
    },
    computed: {
      ...mapWritableState(useAuthModalStore, ['isModalOpened', 'isRegisterModalActive']),
      ...mapWritableState(useUserStore, ['isUserLoggedIn'])
    },
    methods: {
      toggleAuthModal: function (isAuthModalOpened) {
        this.isRegisterModalActive = true;
        this.isModalOpened = isAuthModalOpened;
      },
      switchAuthModal: function (isRegisterModalActive = false) {
        this.isRegisterModalActive = isRegisterModalActive;
      },
      authenticate: function (isActive) {
        switch (this.isRegisterModalActive) {
          case true:
            this.register();
            break;
          case false:
            this.login();
            break;
          default:
            this.toggleAuthModal(false);    
        }
      },
      register: function () {
        this.login();
      },
      login: function () {
        this.isUserLoggedIn = true;
        this.toggleAuthModal(false);
      }
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

  .account-link 
    color: variables.$cassandra-blue
    cursor: pointer

    &:hover
      color: variables.$cassandra-black

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
