<template>
<vee-form :validation-schema="registerValidationSchema" @submit="register">
    <vee-field name="firstname" v-slot="{ field, errors }">
        <v-text-field v-bind="field" variant="outlined" label="Firstname" :error-messages="errors" />
    </vee-field>

    <vee-field name="lastname" v-slot="{ field, errors }">
        <v-text-field v-bind="field" variant="outlined" label="Lastname" :error-messages="errors" />
    </vee-field>

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
    name: 'RegisterForm',
    data: () => {
        return {
            registerValidationSchema: { }
        };
    },
    methods: {
        register: function () {

        }
    }
}
</script>