import { defineStore } from "pinia";
import constants from "@/constants/constants";

export default defineStore("notification", {
    state: () => ({
        isNotificationTriggered: false,
        notificationStatus: constants.inputValues.empty,        
        notificationMessage: constants.inputValues.empty,
    }),
    actions: {
        setUpSnackbarState: function (success = true, message = constants.inputValues.empty) {
            switch (success) {
                case true:
                    this.notificationStatus = constants.snackbarStatuses.success;
                    this.notificationMessage = constants.snackbarMessages.registerSuccess;
                    break;
                case false:
                    this.notificationStatus = constants.snackbarStatuses.error;
                    this.notificationMessage = message;
                    break;
                default:
                    break;
            }
            this.isNotificationTriggered = true;
        }
    }
})