<template>
    <v-snackbar v-model="isNotificationTriggered" :timeout="timeout" :color="statusVariant" :variant="variant" location="bottom right">
        <div class="snackbar-content">
            <v-icon class="pr-3" large>{{ icon }}</v-icon>
            <div class="snackbar-message">
                <div>
                <strong>{{ notificationTitle }}</strong>
                </div>
                <div>{{ notificationMessage }}</div>
            </div>
        </div>
    </v-snackbar>
</template>

<script>
import constants from "@/constants/constants";
import { mapState, mapWritableState } from "pinia";
import useNotificationStore from "@/stores/notification";

export default {
    name: "CustomSnackbar",
    data: () => ({
        timeout: 3500,
        variant: "flat"
    }),
    computed: {
        // These properties are mapped from the notification store.
        ...mapState(useNotificationStore, ["notificationStatus", "notificationMessage"]),
        ...mapWritableState(useNotificationStore, ["isNotificationTriggered"]),
        // These properties are component level based.
        icon: function () {
            return this.notificationStatus === constants.snackbarStatuses.success ? "mdi-check-circle" : 'mdi-alert-circle';
        },
        statusVariant: function () {
            return this.notificationStatus === constants.snackbarStatuses.success ? constants.snackbarVariants.success :
                constants.snackbarVariants.error;
        },
        notificationTitle: function () {
            return this.notificationStatus === constants.snackbarStatuses.success ? "Success" : "Error";
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