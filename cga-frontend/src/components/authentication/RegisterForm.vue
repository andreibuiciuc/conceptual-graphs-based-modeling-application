<template>
<vee-form :validation-schema="registerValidationSchema" @submit.prevent="submit">
    <vee-field name="firstname" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.firstname" 
                      variant="outlined" 
                      label="Firstname"
                      :value="registerCredentials.firstname"
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="lastname" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.lastname" 
                      variant="outlined" 
                      label="Lastname" 
                      :value="registerCredentials.lastname"
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="email" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.email" 
                      variant="outlined" 
                      label="Email"
                      suffix="@gmail.com"
                      :value="registerCredentials.email" 
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="password" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="registerCredentials.password" 
                     variant="outlined" 
                     label="Password"
                     :type="showPassword ? 'text' : 'password'" 
                     :value="registerCredentials.password"
                     :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" 
                     :error-messages="errors"
                     @click:append-inner="showPassword = !showPassword" />
    </vee-field>
    <v-btn variant="outlined" type="submit" class="action-button submit-button">Submit</v-btn>
</vee-form>
</template>

<script>
import constants from '@/constants/constants';
import { mapWritableState } from 'pinia';
import useAuthModalStore from '@/stores/authModal';

export default {
    name: 'RegisterForm',
    data: () => {
        return {
            registerValidationSchema: { 
                firstname: 'required|min:3|max:50|alpha_spaces',
                lastname: 'required|min:3|max:50|alpha_spaces',
                email: 'required|min:3|max:50|email',
                password: 'required|min:3|max:50'
            },
            registerCredentials: null,
            showPassword: false
        };
    },
    computed: {
        ...mapWritableState(useAuthModalStore, ['isModalOpened'])
    },
    methods: {
        submit: function () {
            console.log("Here");
        }
    },  
    created: function () {
        this.registerCredentials = Object.assign({}, constants.defaultRegisterCredentials);
    }
}
</script>