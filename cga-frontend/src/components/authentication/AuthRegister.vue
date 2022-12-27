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
              <vee-form :validation-schema="registerValidationSchema" @submit="onSubmit">
                <vee-field name="firstname" v-slot="{ field, errors }">
                  <v-text-field v-bind="field" variant="outlined" label="Firstname" :error-messages="errors" />
                </vee-field>

                <vee-field name="lastname" v-slot="{ field, errors }">
                  <v-text-field v-bind="field" variant="outlined" label="Lastname" :error-messages="errors" />
                </vee-field>

                <vee-field name="email" v-slot="{ field, errors }">
                  <v-text-field v-bind="field" variant="outlined" label="Email" :error-messages="errors" />
                </vee-field>

                <vee-field name="password" v-slot="{ field, errors }">
                  <v-text-field v-bind="field" variant="outlined" label="Password" :error-messages="errors" />
                </vee-field>
              </vee-form>
              <span class="account-link">Already have an account?</span>
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

export default {
    name: "AuthRegister",
    data: () => {
      return {
        isRegisterModalActive: true,
        registerValidationSchema: {

        }
      }
    },
    computed: {
      ...mapWritableState(useAuthModalStore, ["isModalOpened"]),
      authModalTitle: function () {
        return "Sign up";
      }
    },
    methods: {
      toggleAuthModal: function () {
        this.isModalOpened = !this.isModalOpened;
      },
      onSubmit: function () {

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
