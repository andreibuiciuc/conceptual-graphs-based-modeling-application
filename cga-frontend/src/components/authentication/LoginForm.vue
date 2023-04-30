<template>
  <vee-form :validation-schema="loginValidationSchema" @submit="login" class="login-form">
    <vee-field name="email" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        v-model="loginCredentials.email"
        :value="loginCredentials.email"
        variant="outlined"
        label="Email"
        suffix="@gmail.com"
        maxlength="50"
        :error-messages="errors"
      />
    </vee-field>
    <vee-field name="password" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        v-model="loginCredentials.password"
        :value="loginCredentials.password"
        variant="outlined"
        label="Password"
        maxlength="50"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
        :error-messages="errors"
      />
    </vee-field>
    <span @click="resetPassword">forgot your password?</span>
    <Button outlined label="login" severity="primary" :disabled="isLoginInSubmission" :loading="isLoginInSubmission" @click="login" />
  </vee-form>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import { LoginCredentials } from '@/types/auth/types';
import { useUserStore } from '../../stores/user';
import { useUtils } from '../../composables/utils';
import { Ref, ref } from 'vue';

const loginValidationSchema = {
  email: 'required|min:3|max:50|email',
  password: 'required|min:3|max:50|'
};

const loginCredentials: Ref<LoginCredentials> = ref({ ... constants.defaultLoginCredentials });
const showPassword: Ref<boolean> = ref(false);
const isLoginInSubmission: Ref<boolean> = ref(false);

// Store state and actions mappings
const userStore = useUserStore();

// Composables
const { openNotificationToast } = useUtils();

// Functions related to the Login flow
const login = async (): Promise<void> => {
  isLoginInSubmission.value = true;

  try {
    await userStore.login(loginCredentials.value);
    handleSuccessfulLogin();
  } catch (error: Error | any) {
    handleUnsuccessfulLogin(error);
  }

};

const handleSuccessfulLogin = (): void => {
  isLoginInSubmission.value = false;
  openNotificationToast(constants.snackbarMessages.loginSuccess, 'success');
};

const handleUnsuccessfulLogin = (error: Error): void => {
  isLoginInSubmission.value = false;
  openNotificationToast(error.message, 'error');
};

const resetPassword = async (): Promise<void> => {
  try {
    await userStore.resetPasswordViaEmail(loginCredentials.value.email);
  } catch (error: Error | any) {

  }
};

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.login-form
  width: 100%
  @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

  span
    margin-bottom: 1rem

    &:hover
      cursor: pointer
      color: variables.$cassandra-app-blue

  .v-input, .p-button
    width: 100%

</style>