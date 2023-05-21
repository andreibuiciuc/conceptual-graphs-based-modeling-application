<template>
  <vee-form 
    class="register-form"
    :validation-schema="registerValidationSchema" 
    @submit="register">
    <vee-field 
      name="firstname" 
      v-slot="{ field, errors }"
    >
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.firstname"
        variant="outlined"
        label="firstname"
        maxlength="50"
        :value="registerCredentials.firstname"
        :error-messages="errors"
      />
    </vee-field>
    <vee-field 
      name="lastname" 
      v-slot="{ field, errors }"
    >
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.lastname"
        variant="outlined"
        label="lastname"
        maxlength="50"
        :value="registerCredentials.lastname"
        :error-messages="errors"
      />
    </vee-field>
    <vee-field 
      name="email" 
      v-slot="{ field, errors }"
    >
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.email"
        variant="outlined"
        label="email"
        maxlength="50"
        suffix="@gmail.com"
        :value="registerCredentials.email"
        :error-messages="errors"
      />
    </vee-field>
    <vee-field 
      name="password" 
      v-slot="{ field, errors }"
    >
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.password"
        variant="outlined"
        label="password"
        maxlength="50"
        :type="showPassword ? 'text' : 'password'"
        :value="registerCredentials.password"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :error-messages="errors"
        @click:append-inner="showPassword = !showPassword"
      />
    </vee-field>
    <Button 
      outlined 
      label="register" 
      :disabled="isRegistrationInSubmission" 
      :loading="isRegistrationInSubmission" 
      @click="register" 
    />
  </vee-form>
</template>

<script setup lang="ts">
import constants from '@/constants/constants';
import { RegisterCredentials } from '@/types/auth/types';

import { useUserStore } from '@/stores/user';
import { useUtils } from '@/composables/utils';

import { Ref, ref } from "vue";

const registerValidationSchema = {
  firstname: "required|min:3|max:50|alpha_spaces",
  lastname: "required|min:3|max:50|alpha_spaces",
  email: "required|min:3|max:50|email",
  password: "required|min:6|max:50",
};

// Composable mappings
const { openNotificationToast } = useUtils();

// Store mappings
const userStore = useUserStore();

// Functionalities related to the registering of an user
const registerCredentials: Ref<RegisterCredentials> = ref({ ... constants.defaultRegisterCredentials });
const showPassword: Ref<boolean> = ref(false);
const isRegistrationInSubmission: Ref<boolean> = ref(false);

const register = async (): Promise<void> => {
  isRegistrationInSubmission.value = true;

  try {
    await userStore.register(registerCredentials.value);
    handleSuccessfulRegister();
  } catch (error: Error | any) {
    handleUnsuccessfulRegister(error);
  }
};

const handleSuccessfulRegister = (): void => {
  isRegistrationInSubmission.value = false;
  openNotificationToast(constants.snackbarMessages.registerSuccess, 'success');
};

const handleUnsuccessfulRegister = (error: Error | any): void => {
  isRegistrationInSubmission.value = false;
  openNotificationToast(error.message, 'error');
};

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.register-form
  @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
  width: 100%

  .v-input, .p-button
    width: 100%

  .p-button
    margin-top: 2.5rem

</style>
