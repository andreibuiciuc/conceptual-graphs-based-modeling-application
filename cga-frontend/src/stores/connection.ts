import { defineStore } from "pinia";
import constants from '../constants/constants';
import { manageRequest } from '../includes/requests';
import { useUtils } from "../composables/utils";
import { Ref, ref } from "vue";

export const useConnectionStore = defineStore('connection', () => {

  // Store responsible for the connection to Cassandra servers

  const cassandraServerCredentials: Ref<any> = ref(null);
  const currentKeyspace: Ref<string> = ref(constants.inputValues.empty);
  const availableKeyspaces: Ref<string[]> = ref([]);
  const isConnectionButtonTriggerd: Ref<boolean> = ref(false);

  const { openNotificationToast } = useUtils();

  async function connect (): Promise<void> {
    isConnectionButtonTriggerd.value = true;
    try {
      const response = await manageRequest(constants.requestTypes.GET, 'connection/on', {
        host: cassandraServerCredentials.value.ipAddress,
        port: cassandraServerCredentials.value.port
      });
      if (response && response.data) {
        if (response.data.status === constants.requestStatus.SUCCESS) {
          cassandraServerCredentials.value.isCassandraServerConnected = true;
          openNotificationToast(`Connection to Cassandra server ${this.cassandraServerCredentials.ipAddress}:${this.cassandraServerCredentials.port} established.`, 'success');
          retrieveKeyspaces();
        } else {
          openNotificationToast(response.data.message, 'error');
          isConnectionButtonTriggerd.value = false;
        }
      }
    } catch (exception: any) {
      openNotificationToast('unexpected network error occured. contact the CGA admin for assistance', 'error');
    }
  }

  async function disconnect (): Promise<void> {
    isConnectionButtonTriggerd.value = true;
    const response = await manageRequest(constants.requestTypes.POST, 'connection/off');
    if (response && response.data) {
      if (response.data.status === constants.requestStatus.SUCCESS) {
        openNotificationToast(`Connection to Cassandra server ${cassandraServerCredentials.value.ipAddress}:${cassandraServerCredentials.value.port} discarded.`, 'success');
        cassandraServerCredentials.value = { ... constants.defaultServerConnectionCredentials };
        currentKeyspace.value = constants.inputValues.empty;
      } else {
        openNotificationToast(response.data.message, 'error');
      }
    }
    isConnectionButtonTriggerd.value = false;
  }

  async function retrieveKeyspaces (): Promise<void> {
    const response = await manageRequest(constants.requestTypes.GET, 'keyspaces');
    if (response && response.data) {
      if (response.data.status === constants.requestStatus.SUCCESS) {
        availableKeyspaces.value = JSON.parse(JSON.stringify(response.data.keyspaces));
        openNotificationToast('keyspaces were successfully retrieved', 'success');
        isConnectionButtonTriggerd.value = false;
      } else {
        openNotificationToast(response.data.message, 'error');
        isConnectionButtonTriggerd.value = false;
      }
    }
  }

  return {
    cassandraServerCredentials,
    currentKeyspace,
    availableKeyspaces,
    connect,
    disconnect,
  };

});
