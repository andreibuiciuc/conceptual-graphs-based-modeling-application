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
    <v-btn variant="outlined" type="submit" class="action-button submit-button">Submit</v-btn>
</vee-form>
</template>

<script>
import constants from '@/constants/constants'

import { mapActions } from 'pinia';
import useUserStore from '@/stores/user';

export default {
    name: "LoginForm",
    data: () => ({
        loginValidationSchema: { 
            email: 'required|min:3|max:50|email',
            password: 'required|min:6|max:50'
        },
        loginCredentials: null,
        showPassword: false
    }),
    methods: {
        // These methods are mapped from the user store.
        ...mapActions(useUserStore, { authenticate: "login" }),
        // These methods handle the authentication process.~
        login: async function () {
            this.isRegistrationInSubmission = true;
            try {
                await this.authenticate(this.registerCredentials);
            } catch (error) {
                this.handleRegistrationError(error);
                return;
            }
            this.isModalOpened = false;
            this.handleRegistrationSuccess();
        }
    },
    created: function () {
        this.loginCredentials = Object.assign({}, constants.defaultLoginCredentials);
    }
}
</script>