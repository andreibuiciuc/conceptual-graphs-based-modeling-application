<template>
  <v-snackbar
    v-model="isNotificationTriggered"
    :timeout="TIMEOUT"
    :color="statusVariant"
    :variant="VARIANT"
    :location="notificationLocation"
  >
    <div class="snackbar-content">
      <v-icon class="pr-3" large>{{ icon }}</v-icon>
      <div class="snackbar-message">
        <div>
          <strong>{{ title }}</strong>
        </div>
        <div>{{ notificationMessage }}</div>
      </div>
    </div>
  </v-snackbar>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import useNotificationStore from '../../stores/notification';
import { storeToRefs } from 'pinia';
import { computed } from '@vue/reactivity';

type variant = 'flat' | 'outlined' | 'text';

const TIMEOUT = 3500;
const VARIANT: variant = 'flat';

// Store state and action mappings
const notificationStore = useNotificationStore();
const { notificationStatus, notificationMessage, notificationLocation, isNotificationTriggered } = storeToRefs(notificationStore);

// Computed properties
const icon = computed(() => {
  return notificationStatus.value === constants.snackbarStatuses.success ? 'mdi-check-circle' : 'mdi-alert-circle';
});

const statusVariant = computed(() => {
  return notificationStatus.value === constants.snackbarStatuses.success ? constants.snackbarVariants.success : constants.snackbarVariants.error;
});

const title = computed(() => {
  return notificationStatus.value === constants.snackbarStatuses.success ? 'Success' : 'Error';
});

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
