<template>
    <vee-form 
        class="password-reset-form"
        :validation-schema="passwordResetValidationSchema" 
        @submit="resetPassword"
    >
        <vee-field 
            v-slot="{ field, errors }"
            name="email" 
        >
            <v-text-field
                v-model="contactEmail"
                v-bind="field"
                variant="outlined"
                label="email"
                maxlength="50"
                :error-messages="errors"
            />
        </vee-field>
        <Button 
            outlined 
            label="send password reset email" 
            :disabled="isPasswordResetEmailSent"
            @click="resetPassword" 
        />
    </vee-form>
  </template>

<script setup lang="ts">
import { Ref, onDeactivated, onUnmounted, ref } from 'vue';

import constants from '@/constants/constants';

import { useUserStore } from '@/stores/user';
import { useUtils } from '@/composables/utils';
import { storeToRefs } from 'pinia';

const passwordResetValidationSchema = {
  email: "required|min:3|max:50|email",
};


// Composable mappings
const { openNotificationToast } = useUtils();

// Store mappings
const userStore = useUserStore();
const { isPasswordResetEmailSent } = storeToRefs(userStore);

// Functionalities related to the password reset
const contactEmail: Ref<string> = ref(constants.inputValues.empty);

const resetPassword = async (): Promise<void> => {
  try {
    await userStore.resetPasswordViaEmail(contactEmail.value);
    isPasswordResetEmailSent.value = true;
  } catch (error: Error | any) {
    openNotificationToast(error.message, 'error');
  }
};

onUnmounted(() => {
    isPasswordResetEmailSent.value = false;
});

</script>

<style lang="sass" scoped>
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.password-reset-form
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
    width: 100%

    .v-input, .p-button
        width: 100%

    .p-button
        margin-top: 2.5rem

</style>