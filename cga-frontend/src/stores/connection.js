import { defineStore } from "pinia";
import useNotificationStore from "./notification";
import constants from "@/constants/constants";
import { manageRequest } from "@/includes/requests";

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
      const notificationStore = useNotificationStore();
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
                  ? true
                  : false;
              let message = response.data.message;
              if (status) {
                this.cassandraServerCredentials.isCassandraServerConnected = true;
                message = `Connection to Cassandra server ${this.cassandraServerCredentials.ipAddress}:${this.cassandraServerCredentials.port} established.`;
                this.retrieveKeyspaces();
              }
              notificationStore.setUpSnackbarState(status, message);
            }
          }
        })
        .catch((error) => {
          notificationStore.setUpSnackbarState(false, error);
        })
        .finally(() => {
          this.isConnectionButtonTriggered = false;
        });
    },
    disconnect: function () {
      const notificationStore = useNotificationStore();
      this.isConnectionButtonTriggered = true;
      manageRequest(constants.requestTypes.POST, "connection/off")
        .then((response) => {
          if (response) {
            const status =
              response.data.status === constants.requestStatus.SUCCESS
                ? true
                : false;
            let message = response.data.message;
            if (status) {
              this.cassandraServerCredentials = Object.assign(
                {},
                constants.defaultServerConnectionCredentials
              );
              this.currentKeyspace = null;
              message = `Connection to Cassandra server ${this.cassandraServerCredentials.ipAddress}:${this.cassandraServerCredentials.port} discarded.`;
            }
            notificationStore.setUpSnackbarState(status, message);
          }
        })
        .catch((error) => {
          notificationStore.setUpSnackbarState(false, error);
        })
        .finally(() => {
          this.isConnectionButtonTriggered = false;
        });
    },
    retrieveKeyspaces: function () {
      const notificationStore = useNotificationStore();
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
              notificationStore.setUpSnackbarState(
                false,
                response.data.message
              );
            }
          }
        }
      );
    },
  },
});
