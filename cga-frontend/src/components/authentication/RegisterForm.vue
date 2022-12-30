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
        snackbarState: {
            status: constants.inputValues.empty,
            message: constants.inputValues.empty,
        },
        isRegistrationInSubmission: false
    }),
    computed: {
        ...mapWritableState(useAuthModalStore, ['isModalOpened']),
    },
    methods: {
        // These methods are mapped from the user store.
        ...mapActions(useUserStore, { authenticate: 'register' }),
        // These methods are used for handling component related logic.
        setUpSnackbarState: function (success = true, message = constants.inputValues.empty) {
            switch (success) {
                case true:
                    this.snackbarState.status = constants.snackbarStatuses.success;
                    this.snackbarState.message = constants.snackbarMessages.registerSuccess;
                    break;
                case false:
                    this.snackbarState.status = constants.snackbarStatuses.erorr;
                    this.snackbarState.message = message;
                    break;
                default:
                    break;
            }
        },
        handleRegistrationError: function (error) {
            this.isRegistrationInSubmission = false;
            this.setUpSnackbarState(false, error.message);
            this.$emit('snackbar', this.snackbarState);
        },
        handleRegistrationSuccess: function () {
            this.isRegistrationInSubmission = false;
            this.setUpSnackbarState();
            this.$emit('snackbar', this.snackbarState);
        },
        // These methods handle the authentication process.
        async register () {
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
        this.registerCredentials = Object.assign({}, constants.defaultRegisterCredentials);
    }
}
</script>