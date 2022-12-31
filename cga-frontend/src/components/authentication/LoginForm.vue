<template>
<vee-form :validation-schema="loginValidationSchema" @submit="login">
    <vee-field name="email" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="loginCredentials.email"
                      variant="outlined" 
                      label="Email" 
                      suffix="@gmail.com"
                      maxlength="50"
                      :value="loginCredentials.email"
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="password" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="loginCredentials.password"
                      :value="loginCredentials.password"
                      variant="outlined" 
                      label="Password"
                      maxlength="50"
                      :type="showPassword ? 'text' : 'password'"
                      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" 
                      @click:append-inner="showPassword = !showPassword"
                      :error-messages="errors" />
    </vee-field>
    <v-btn variant="outlined" 
           type="submit" 
           class="action-button submit-button"
           :loading="isLoginInSubmission"
           :disabled="isLoginInSubmission">
           Submit
    </v-btn>
</vee-form>
</template>

<script>
import constants from '@/constants/constants'

import { mapActions, mapWritableState } from 'pinia';
import useAuthModalStore from "@/stores/authModal";
import useUserStore from '@/stores/user';
import useNotificationStore from "@/stores/notification";

export default {
    name: "LoginForm",
    data: () => ({
        loginValidationSchema: { 
            email: 'required|min:3|max:50|email',
            password: 'required|min:6|max:50'
        },
        loginCredentials: null,
        showPassword: false,
        isLoginInSubmission: false
    }),
    computed: {
        ...mapWritableState(useAuthModalStore, ["isModalOpened"])
    },
    methods: {
        // These methods are mapped from the user store.
        ...mapActions(useUserStore, { authenticate: "login" }),
        // These methods are mapped from the notification store.
        ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
        // These methods handle the login process.
        login: async function () {
            this.isLoginInSubmission = true;
            try {
                await this.authenticate(this.loginCredentials);
            } catch (error) {
                this.isLoginInSubmission = false;
                this.setUpSnackbarState(false, error.message);
                return;
            }
            this.isLoginInSubmission = false;
            this.isModalOpened = false;
            this.setUpSnackbarState(true, constants.snackbarMessages.loginSuccess);
        }
    },
    created: function () {
        this.loginCredentials = Object.assign({}, constants.defaultLoginCredentials);
    }
}
</script>