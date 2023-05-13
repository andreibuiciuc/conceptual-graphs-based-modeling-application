
import constants from '../constants/constants';
import { Ref, ref } from "vue";
import { defineStore } from "pinia";
import { AstraApiResponse } from "@/types/astra/types";
import { useUtils } from "../composables/utils";
import { useAstra } from "@/composables/astra";

export const useConnectionStore = defineStore('connection', () => {
  // Store responsible for the connection to Cassandra servers

  const cassandraServerCredentials: Ref<any> = ref(null);
  const currentKeyspace: Ref<string> = ref(constants.inputValues.empty);
  const availableKeyspaces: Ref<string[]> = ref([]);
  const isConnectionButtonTriggerd: Ref<boolean> = ref(false);

  const { openNotificationToast } = useUtils();
  const { retrieveAllKeyspaces } = useAstra();

  async function connect (): Promise<void> {
    isConnectionButtonTriggerd.value = true;
    retrieveKeyspaces();
  }

  async function disconnect (): Promise<void> {
    cassandraServerCredentials.value.isCassandraServerConnected = false;
    currentKeyspace.value = constants.inputValues.empty;
    openNotificationToast(`connection to astra db cassandra server discarded.`, 'success');
  }

  async function retrieveKeyspaces (): Promise<void> {
    const response = await retrieveAllKeyspaces();
    if (response && response.data) {
      const responseData = response.data as AstraApiResponse;
      if (responseData.data) {
        const mappedKeyspaces = responseData.data.map((keyspace: any) => keyspace.name);
        availableKeyspaces.value = JSON.parse(JSON.stringify(mappedKeyspaces));

        openNotificationToast('keyspaces were successfully retrieved', 'success');
        cassandraServerCredentials.value.isCassandraServerConnected = true;
        isConnectionButtonTriggerd.value = false;
      } else {
        openNotificationToast(responseData.description, 'error');
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
