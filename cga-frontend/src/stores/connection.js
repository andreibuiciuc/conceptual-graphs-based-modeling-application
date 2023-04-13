import { defineStore } from "pinia";
import constants from "@/constants/constants";
import { manageRequest } from "@/includes/requests";
import { useUtils } from "../composables/utils";

export default defineStore("connection", {
  state: () => ({
    cassandraServerCredentials: {
      ipAddress: constants.inputValues.empty,
      port: constants.inputValues.empty,
      isCassandraServerConnected: false,
    },
    currentKeyspace: null,
    availableKeyspaces: [],
  }),
  actions: {
    connect: function () {
      // const { openNotificationToast } = useUtils();
      this.isConnectionButtonTriggered = true;
      manageRequest(constants.requestTypes.GET, "connection/on", {
        host: this.cassandraServerCredentials.ipAddress,
        port: this.cassandraServerCredentials.port,
      })
        .then((response) => {
          if (response) {
            if (response.data) {
              const status =
                response.data.status === constants.requestStatus.SUCCESS
                  ? 'success'
                  : "error";
              let message = response.data.message;
              if (status) {
                this.cassandraServerCredentials.isCassandraServerConnected = true;
                message = `Connection to Cassandra server ${this.cassandraServerCredentials.ipAddress}:${this.cassandraServerCredentials.port} established.`;
                this.retrieveKeyspaces();
              }
              // openNotificationToast(message, status);
            }
          }
        })
        .catch((error) => {
          openNotificationToast(error.message, 'error');
        })
        .finally(() => {
          this.isConnectionButtonTriggered = false;
        });
    },
    disconnect: function () {
      // const { openNotificationToast } = useUtils();
      this.isConnectionButtonTriggered = true;
      manageRequest(constants.requestTypes.POST, "connection/off")
        .then((response) => {
          if (response) {
            const status =
              response.data.status === constants.requestStatus.SUCCESS
                ? 'success'
                : 'error';
            let message = response.data.message;
            if (status) {
              this.cassandraServerCredentials = Object.assign(
                {},
                constants.defaultServerConnectionCredentials
              );
              this.currentKeyspace = null;
              message = `Connection to Cassandra server ${this.cassandraServerCredentials.ipAddress}:${this.cassandraServerCredentials.port} discarded.`;
            }
            // openNotificationToast(status, message);
          }
        })
        .catch((error) => {
          // openNotificationToast(error.message, 'error');
        })
        .finally(() => {
          this.isConnectionButtonTriggered = false;
        });
    },
    retrieveKeyspaces: function () {
      // const { openNotificationToast } = useUtils();
      manageRequest(constants.requestTypes.GET, "keyspaces").then(
        (response) => {
          if (response) {
            const status =
              response.data.status === constants.requestStatus.SUCCESS
                ? true
                : false;
            if (status) {
              this.availableKeyspaces = response.data.keyspaces;
            } else {
              // openNotificationToast(response.data.message, 'error');
            }
          }
        }
      );
    },
  },
});
