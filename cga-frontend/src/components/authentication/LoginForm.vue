<template>
<vee-form :validation-schema="loginValidationSchema">
    <vee-field name="email" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="loginCredentials.email"
                      variant="outlined" 
                      label="Email" 
                      suffix="@gmail.com"
                      :value="loginCredentials.email"
                      :error-messages="errors" />
    </vee-field>
    <vee-field name="password" v-slot="{ field, errors }">
        <v-text-field v-bind="field" v-model="loginCredentials.password"
                      :value="loginCredentials.password"
                      variant="outlined" 
                      label="Password"
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

export default {
    name: "LoginForm",
    data: () => {
        return {
            loginValidationSchema: { 
                email: 'required|min:3|max:50|email',
                password: 'required|min:3|max:50'
            },
            loginCredentials: null,
            showPassword: false
        }
    },
    created: function () {
        this.loginCredentials = Object.assign({}, constants.defaultLoginCredentials);
    }
}
</script>