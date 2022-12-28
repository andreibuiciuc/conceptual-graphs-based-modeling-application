<template>
<vee-form :validation-schema="loginValidationSchema" @submit="login">
    <vee-field name="email" v-slot="{ field, errors }">
        <v-text-field v-bind="field" variant="outlined" label="Email" :error-messages="errors" />
    </vee-field>

    <vee-field name="password" v-slot="{ field, errors }">
        <v-text-field v-bind="field" variant="outlined" label="Password" :error-messages="errors" />
    </vee-field>
</vee-form>
</template>

<script>
export default {
    name: "LoginForm",
    data: () => {
        return {
            loginValidationSchema: { }
        }
    },
    methods: {
        login: function () {
            
        }
    }
}
</script>