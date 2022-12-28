<template>
    <v-dialog persistent transition="dialog-bottom-transition">

      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="outlined" @click.prevent="toggleAuthModal">Create an account</v-btn>
      </template>
      
      <template v-slot:default="{ isActive }">
        <v-card width="500">
          <v-card-title class="d-flex justify-center">{{ authModalTitle }}</v-card-title>
          <v-card-text>
            <div class="form-container">
              
              <RegisterForm v-if="isRegisterModalActive" />
              
              <LoginForm v-else />

              <span class="account-link" @click.prevent="switchAuthModal">
                {{ isRegisterModalActive ? 'Already have an account?' : "Create a new account." }}
              </span>
          
            </div>
        </v-card-text>
          <v-card-actions class="justify-end pr-6">
            <v-btn variant="text" @click="toggleAuthModal, isActive.value = false">Close</v-btn>
            <v-btn variant="outlined" class="action-button">{{ authModalTitle }}</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    
    </v-dialog>
</template>

<script>
import { mapWritableState } from 'pinia';
import useAuthModalStore from '@/stores/authModal';

import RegisterForm from '@/components/authentication/RegisterForm.vue';
import LoginForm from '@/components/authentication/LoginForm.vue';

export default {
    name: "AuthRegister",
    components: {
      RegisterForm,
      LoginForm
    },
    computed: {
      ...mapWritableState(useAuthModalStore, ['isModalOpened', 'isRegisterModalActive']),
      authModalTitle: function () {
        return this.isRegisterModalActive ? 'Sign up' : 'Sign in';
      }
    },
    methods: {
      toggleAuthModal: function () {
        this.isModalOpened = !this.isModalOpened;
      },
      switchAuthModal: function () {
        this.isRegisterModalActive = !this.isRegisterModalActive;
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

.form-container
  @include containers.flex-container($flex-direction: column, $align-items: center)

  form
    width: 100%

  .account-link 
    color: variables.$cassandra-blue
    cursor: pointer

    &:hover
      color: variables.$cassandra-black

</style>
