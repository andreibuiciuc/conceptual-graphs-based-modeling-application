import { defineStore } from "pinia";
import constants from "@/constants/constants";

export default defineStore("notification", {
  state: () => ({
    isNotificationTriggered: false,
    notificationStatus: constants.inputValues.empty,
    notificationMessage: constants.inputValues.empty,
    notificationLocation: constants.inputValues.empty
  }),
  actions: {
    setUpSnackbarState: function (
      success = true,
      message = constants.inputValues.empty,
      location = "bottom right"
    ) {
      this.notificationStatus = success
        ? constants.snackbarStatuses.success
        : constants.snackbarStatuses.error;
      this.notificationMessage = message;
      this.notificationLocation = location;
      this.isNotificationTriggered = true;
    },
  },
});
