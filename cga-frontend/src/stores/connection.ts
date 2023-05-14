
import constants from '../constants/constants';
import { Ref, ref } from "vue";
import { defineStore } from "pinia";
import { AstraApiResponse } from "@/types/astra/types";
import { useUtils } from "../composables/utils";
import { useAstra } from "@/composables/requests/astra";

export const useConnectionStore = defineStore('connection', () => {
  // Store responsible for the connection to Cassandra servers

  const userAstraDatabaseId: Ref<string> = ref(constants.inputValues.empty);
  const userAstraDatabaseRegion: Ref<string> = ref(constants.inputValues.empty);
  const userAstraToken: Ref<string> = ref(constants.inputValues.empty);

  const cassandraServerCredentials: Ref<any> = ref(null);
  const currentKeyspace: Ref<string> = ref(constants.inputValues.empty);
  const availableKeyspaces: Ref<string[]> = ref([]);
  const isConnectionButtonTriggered: Ref<boolean> = ref(false);

  const { openNotificationToast } = useUtils();
  const { retrieveAllKeyspaces } = useAstra();

  async function connect (): Promise<void> {
    isConnectionButtonTriggered.value = true;
    retrieveKeyspaces();
  }

  async function disconnect (): Promise<void> {
    cassandraServerCredentials.value.isCassandraServerConnected = false;
    currentKeyspace.value = constants.inputValues.empty;
    userAstraDatabaseId.value = constants.inputValues.empty;
    userAstraDatabaseRegion.value = constants.inputValues.empty;
    openNotificationToast(`connection to astra db cassandra server discarded.`, 'success');
  }

  function getUserKeyspaces (keyspacesData: any): string[] {
    const mappedKeyspaces = keyspacesData.map((keyspace: any) => keyspace.name);
    return mappedKeyspaces.filter((keyspace: string) => !['system_traces', 'system_auth', 'system', 'system_schema', 'data_endpoint_auth', 'datastax_sla'].includes(keyspace));
  };

  async function retrieveKeyspaces (): Promise<void> {
    const response = await retrieveAllKeyspaces();
    if (response && response.data) {
      const responseData = response.data as AstraApiResponse;
      if (responseData.data) {
        availableKeyspaces.value = getUserKeyspaces(responseData.data);
        openNotificationToast('keyspaces were successfully retrieved', 'success');
        cassandraServerCredentials.value.isCassandraServerConnected = true;
        isConnectionButtonTriggered.value = false;
      } else {
        openNotificationToast(responseData.description, 'error');
        isConnectionButtonTriggered.value = false;
      }
    }
  }

  return {
    cassandraServerCredentials,
    currentKeyspace,
    availableKeyspaces,
    connect,
    disconnect,
    userAstraDatabaseId,
    userAstraDatabaseRegion,
    userAstraToken,
    isConnectionButtonTriggered
  };

});
