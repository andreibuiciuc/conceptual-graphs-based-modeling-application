<template>
<vee-form :validation-schema="registerValidationSchema" @submit="register">
    <vee-field name="firstname" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.firstname" 
                      variant="outlined" 
                      label="Firstname"
                      maxlength="50"
                      :value="registerCredentials.firstname"
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="lastname" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.lastname" 
                      variant="outlined" 
                      label="Lastname"
                      maxlength="50" 
                      :value="registerCredentials.lastname"
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="email" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.email" 
                      variant="outlined" 
                      label="Email"
                      maxlength="50"
                      suffix="@gmail.com"
                      :value="registerCredentials.email" 
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="password" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.password" 
                     variant="outlined" 
                     label="Password"
                     maxlength="50"
                     :type="showPassword ? 'text' : 'password'" 
                     :value="registerCredentials.password"
                     :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" 
                     :error-messages="errors"
                     @click:append-inner="showPassword = !showPassword" />
    </vee-field>
    <v-btn variant="outlined" 
           type="submit" 
           class="action-button submit-button" 
           :loading="isRegistrationInSubmission"
           :disabled="isRegistrationInSubmission">
        Submit
    </v-btn>
</vee-form>
</template>

<script>
import constants from '@/constants/constants';

import { mapWritableState, mapActions } from 'pinia';
import useAuthModalStore from '@/stores/authModal';
import useUserStore from '@/stores/user';
import useNotificationStore from "@/stores/notification";

export default {
    name: 'RegisterForm',
    data: () => ({
        registerValidationSchema: { 
            firstname: 'required|min:3|max:50|alpha_spaces',
            lastname: 'required|min:3|max:50|alpha_spaces',
            email: 'required|min:3|max:50|email',
            password: 'required|min:6|max:50'
        },
        registerCredentials: null,
        showPassword: false,
        isRegistrationInSubmission: false
    }),
    computed: {
        ...mapWritableState(useAuthModalStore, ['isModalOpened']),
    },
    methods: {
        // These methods are mapped from the user store.
        ...mapActions(useUserStore, { authenticate: 'register' }),
        // These methods are mapped from the notification store.
        ...mapActions(useNotificationStore, ["setUpSnackbarState"]),
        // These methods handle the registration process.
        register: async function () {
            this.isRegistrationInSubmission = true;
            try {
                await this.authenticate(this.registerCredentials);
            } catch (error) {
                this.isRegistrationInSubmission = false;
                this.setUpSnackbarState(false, error.message);
                return;
            }
            this.isRegistrationInSubmission = false;
            this.isModalOpened = false;
            this.setUpSnackbarState(true, constants.snackbarMessages.registerSuccess);
        }
    },  
    created: function () {
        this.registerCredentials = Object.assign({}, constants.defaultRegisterCredentials);
    }
}
</script>