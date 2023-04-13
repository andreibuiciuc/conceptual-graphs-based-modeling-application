import { defineStore } from "pinia";
import constants from '../constants/constants';
import { manageRequest } from '../includes/requests';
import { useUtils } from "../composables/utils";
import { Ref, ref } from "vue";

export const useConnectionStore = defineStore('connection', () => {
  const cassandraServerCredentials: Ref<any> = ref(null);
  const currentKeyspace: Ref<string> = ref(constants.inputValues.empty);
  const availableKeyspaces: Ref<string[]> = ref([]);

  const { openNotificationToast } = useUtils();

  async function connect (): Promise<void> {
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
      }
    } 
  }

  async function disconnect (): Promise<void> {
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
  }

  async function retrieveKeyspaces (): Promise<void> {
    const response = await manageRequest(constants.requestTypes.GET, 'keyspaces');
    if (response && response.data) {
      if (response.data.status === constants.requestStatus.SUCCESS) {
        availableKeyspaces.value = JSON.parse(JSON.stringify(response.data.keyspaces));
        openNotificationToast('keyspaces were successfully retrieved', 'success');
      } else {
      openNotificationToast(response.data.message, 'error');
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
