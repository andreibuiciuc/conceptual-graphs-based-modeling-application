<template>
    <v-snackbar :timeout="timeout" :color="statusVariant" :variant="variant" location="bottom right">
        <div class="snackbar-content">
            <v-icon class="pr-3" large>{{ icon }}</v-icon>
            <div class="snackbar-message">
                <div>
                <strong>{{ title }}</strong>
                </div>
                <div>{{ message }}</div>
            </div>
        </div>
    </v-snackbar>
</template>

<script>
import constants from '@/constants/constants';

export default {
    name: "CustomSnackbar",
    data: () => ({
        timeout: 3500,
        variant: "flat"
    }),
    props: {
        message: String,
        status: String,
    },
    computed: {
        icon: function () {
            return this.status === constants.snackbarStatuses.success ? "mdi-check-circle" : 'mdi-alert-circle';
        },
        statusVariant: function () {
            return this.status === constants.snackbarStatuses.success ? constants.snackbarVariants.success :
                constants.snackbarVariants.error;
        },
        title: function () {
            return this.status === constants.snackbarStatuses.success ? "Success" : "Error";
        }
    },
}
</script>

<style lang="sass">
@use '@/assets/styles/_containers.sass'
.v-snackbar
    z-index: 99999999

    .snackbar-content
        @include containers.flex-container($align-items: center)

    .snackbar-message
        @include containers.flex-container($flex-direction: column)

</style>