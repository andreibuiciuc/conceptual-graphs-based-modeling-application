<template>
  <vee-form :validation-schema="registerValidationSchema" @submit="register">
    <vee-field name="firstname" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.firstname"
        variant="outlined"
        label="Firstname"
        maxlength="50"
        :value="registerCredentials.firstname"
        :error-messages="errors"
      />
    </vee-field>
    <vee-field name="lastname" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.lastname"
        variant="outlined"
        label="Lastname"
        maxlength="50"
        :value="registerCredentials.lastname"
        :error-messages="errors"
      />
    </vee-field>
    <vee-field name="email" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.email"
        variant="outlined"
        label="Email"
        maxlength="50"
        suffix="@gmail.com"
        :value="registerCredentials.email"
        :error-messages="errors"
      />
    </vee-field>
    <vee-field name="password" v-slot="{ field, errors }">
      <v-text-field
        v-bind="field"
        v-model="registerCredentials.password"
        variant="outlined"
        label="Password"
        maxlength="50"
        :type="showPassword ? 'text' : 'password'"
        :value="registerCredentials.password"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :error-messages="errors"
        @click:append-inner="showPassword = !showPassword"
      />
    </vee-field>
    <Button outlined label="register" :disabled="isRegistrationInSubmission" :loading="isRegistrationInSubmission" @click="register" />
  </vee-form>
</template>

<script setup lang="ts">
import constants from "../../constants/constants";
import { RegisterCredentials } from "../../types/types";

import { useUserStore } from "../../stores/user";
import { Ref, ref } from "vue";
import { useUtils } from "../../composables/utils";

// Data
const registerValidationSchema = {
  firstname: "required|min:3|max:50|alpha_spaces",
  lastname: "required|min:3|max:50|alpha_spaces",
  email: "required|min:3|max:50|email",
  password: "required|min:6|max:50",
};

const registerCredentials: Ref<RegisterCredentials> = ref({ ... constants.defaultRegisterCredentials });
const showPassword: Ref<boolean> = ref(false);
const isRegistrationInSubmission: Ref<boolean> = ref(false);

// Composables
const { openNotificationToast } = useUtils();

// Store state and actions mappings
const userStore = useUserStore();

// Functions related to the Register flow
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
