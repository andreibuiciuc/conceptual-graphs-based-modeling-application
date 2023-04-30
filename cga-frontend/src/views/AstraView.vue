<template>
    <div class="demo-page">

    </div>
    <Dialog 
        v-model:visible="isLoginInModal" 
        :show-header="false" 
        modal
    >
        <AuthenticationCard :is-auth-inside-modal="true" />
    </Dialog>
</template>

<script setup lang="ts">
import { useUtilsStore } from '@/stores/utils';
import { storeToRefs } from 'pinia';

import AuthenticationCard from '@/components/authentication/AuthenticationCard.vue';

// Store mapppings
const utilsStore = useUtilsStore();
const { isLoginInModal } = storeToRefs(utilsStore);

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.demo-page
    margin-top: variables.$cga-header-height
    height: calc(100vh - variables.$cga-header-height)
    padding: 0

.p-dialog .p-dialog-content:last-of-type
    border-bottom-right-radius: 1.5rem !important
    border-bottom-left-radius: 1.5rem !important

</style>