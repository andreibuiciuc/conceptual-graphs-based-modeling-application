<template>
  <vee-form :validation-schema="loginValidationSchema" @submit="login">
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
    <v-btn
      variant="outlined"
      type="submit"
      class="action-button submit-button"
      :loading="isLoginInSubmission"
      :disabled="isLoginInSubmission"
    >
      Submit
    </v-btn>
  </vee-form>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';

import useAuthModalStore from '../../stores/authModal';
import useUserStore from '../../stores/user';
import useNotificationStore from '../../stores/notification';
import { Ref, ref } from 'vue';
import { storeToRefs } from 'pinia';

interface LoginCredentials {
  email: string,
  password: string
};

// Data
const loginValidationSchema = {
  email: 'required|min:3|max:50|email',
  password: 'required|min:3|max:50|'
};
const loginCredentials: Ref<LoginCredentials> = ref({ ... constants.defaultLoginCredentials });
const showPassword: Ref<boolean> = ref(false);
const isLoginInSubmission: Ref<boolean> = ref(false);

// Store state and actions mappings
const notificationStore = useNotificationStore();
const userStore = useUserStore();
const authModalStore = useAuthModalStore();
const { isModalOpened } = storeToRefs(authModalStore);

// Functions related to the Login flow
const login = async (): Promise<void> => {
  isLoginInSubmission.value = true;

  try {
    await userStore.login(loginCredentials.value);
    handleSuccessfulLogin();
  } catch (error: Error) {
    handleUnsuccessfulLogin(error);
  }

};

const handleSuccessfulLogin = (): void => {
  isLoginInSubmission.value = false;
  isModalOpened.value = false;
  notificationStore.setUpSnackbarState(true, constants.snackbarMessages.loginSuccess);
};

const handleUnsuccessfulLogin = (error: Error): void => {
  isLoginInSubmission.value = false;
  notificationStore.setUpSnackbarState(false, error.message);
};

</script>
