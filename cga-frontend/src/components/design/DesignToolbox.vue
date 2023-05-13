<template>
  <div class="design-toolbox-container">
    <Card
      class="design-toolbox"
      :class="{ 'toolbox-warning': !currentKeyspace }"
    >
      <template #title>data structure config</template>
      <template #content>
        
        <!-- Table concept input -->
        <div class="design-toolbox-input-container">
          <div class="design-toolbox-input-group">
              <InputText
                v-if="!isTableInViewMode"
                v-model="currentTableConcept.conceptName"
                placeholder="table name"
                :class="{ 'p-invalid': !isTableConceptValid }"
                :disabled="!currentKeyspace"
                :readonly="isGraphRendered"
                @change="changeTableConcept"
              />
              <InputText v-else 
                v-model="tableName"
                :disabled="true"
                :readonly="true"
              />
          </div>
          <div class="design-toolbox-action-group">
            <Button v-if="!isTableInViewMode"
              severity="secondary"
              text
              icon="pi pi-times"
              :disabled="!isGraphRendered"
              @click="resetToolbox"
            />
            <Button v-if="!isTableInViewMode"
              severity="primary"
              text
              :icon="isGraphRendered ? 'pi pi-check' : 'pi pi-plus'"
              :disabled="!isAddTableConceptButtonEnabled"
              @click="validateTableName"
            />
          </div>
        </div>

        <Divider />

        <!-- Column and type concepts input -->

        <div class="design-toolbox-input-container">
          <div class="design-toolbox-input-group">
            <div class="flex flex-column gap-2">
              <InputText
                v-model="currentColumnConcept.conceptName"
                :class="{ 'p-invalid': doesColumnConceptAlreadyExists }"
                placeholder="column name"
                :disabled="!currentTableConcept.conceptName || !isGraphRendered"
              />
              <small class="p-error">{{ getColumnNameErrorMessage }}</small>
            </div>
            <Dropdown 
              v-model="currentColumnConcept.columnKind"
              placeholder="column kind"
              :disabled="!currentColumnConcept.conceptName || doesColumnConceptAlreadyExists"
              :options="designToolboxConstants.CQL_COLUMN_OPTIONS"
            />
            <Dropdown 
              v-model="currentDataTypeConcept.conceptName"
              placeholder="column type"
              :disabled="!currentColumnConcept.conceptName || doesColumnConceptAlreadyExists"
              :options="designToolboxConstants.CQL_DATA_TYPES"
            />
          </div>
          <Button v-if="!isTableInViewMode"
            icon="pi pi-plus"
            text
            :disabled="!isAddColumnConceptButtonEnabled"
            @click.prevent="addColumnConceptToGraph"
          />
        </div>

        <Divider />

        <!-- Clustering column concepts options input -->

        <div class="design-toolbox-input-container">
          <div class="design-toolbox-input-group">
            <Dropdown
              v-model="currentClusteringOrderOption.clusteringColumn"
              placeholder="clustering column"
              :disabled="!isClusteringSectionEnabled"
              :options="clusteringColumnOptions"
            />
            <Dropdown 
              v-model="currentClusteringOrderOption.clusteringOrder"
              placeholder="clustering order"
              :disabled="!isClusteringSectionEnabled"
              :options="designToolboxConstants.CQL_CLUSTERING_ORDER_ITEMS"
            />
          </div>
        </div>

      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import designToolboxConstants from "../design/designToolboxConstants";
import { AstraApiResponse } from '@/types/astra/types';
import { AxiosResponse } from 'axios';
import { ComputedRef, Ref, ref } from 'vue';
import { computed } from '@vue/reactivity';
import { conceptualGraphsCollection } from "../../includes/firebase";
import { Concept, GraphMetadata, ClusteringOption } from '../../types/types';
import { useAstra } from '@/composables/requests/astra';
import { useConnectionStore } from '../../stores/connection';
import { useMetadata } from '../../composables/metadata';
import { useUtils } from "../../composables/utils";
import { storeToRefs } from 'pinia';

// Props and emits definitions
interface Props {
  isTableInViewMode: boolean,
  isTableInViewModeReady: boolean,
  tableInViewMode?: GraphMetadata
};

const props = defineProps<Props>();
const emit = defineEmits(['render']);

// Functions mapped from composables
const { openNotificationToast } = useUtils();
const { getRelationTypeForColumnConcept, getPartitionAndClusteringColumnsCount } = useMetadata();
const { retrieveTable } = useAstra();

// Local constants
// TODO: Move this to the constants file
const defaultGraphMetadata: GraphMetadata = {
  keyspace: constants.defaultConcept,
  tables: [],
  columns: new Map<string, Concept[]>(),
  dataTypes: new Map<string, Concept>()
};

const defaultClusteringOption: ClusteringOption = {
  clusteringColumn: constants.inputValues.empty,
  clusteringOrder: constants.inputValues.empty
};

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace } = storeToRefs(connectionStore);

// Reactive data related to the data structure configurations
const currentTableConcept: Ref<Concept> = ref({ ... constants.defaultConcept });
const currentColumnConcept: Ref<Concept> = ref({ ... constants.defaultConcept });
const currentDataTypeConcept: Ref<Concept> = ref({ ... constants.defaultConcept });  
const currentClusteringOrderOption: Ref<ClusteringOption> = ref({ ... defaultClusteringOption });
const isClusteringSectionEnabled: Ref<boolean> = ref(false);
const clusteringColumnOptions: Ref<string[]> = ref([]);

// Reactive data related to the rendering of the conceptual graph
const tableMetadata: Ref<GraphMetadata> = ref({ ... defaultGraphMetadata });
const isGraphRendered: Ref<boolean> = ref(false);


// Functions related to the toolbox form
const changeTableConcept = (): void => {
  isTableConceptValid.value = true;
};

const resetColumnConceptGroup = (): void => {
  currentColumnConcept.value = { ... constants.defaultConcept, conceptType: constants.conceptTypes.column, columnKind: constants.columnKinds.regular };
  currentDataTypeConcept.value = { ... constants.defaultConcept, conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType };
  currentClusteringOrderOption.value = { ... defaultClusteringOption };
};

const resetToolbox = async (): Promise<void> => {
  tableMetadata.value = { ... defaultGraphMetadata };
  isTableConceptValid.value = true;
  currentTableConcept.value = { ... constants.defaultConcept, conceptType: constants.conceptTypes.table };
  resetColumnConceptGroup();
  renderConceptualGraph(true);
  setClusteringOptionGroupEnabledState();
  isGraphRendered.value = false;
};

const tableName: ComputedRef<string> = computed(() => {
  return props.isTableInViewMode && props.tableInViewMode && props.isTableInViewModeReady ? props.tableInViewMode.tables.at(0).conceptName : constants.inputValues.empty;
});

// Functions related to the validation of the data structure
const isTableConceptValid: Ref<boolean> = ref(true);

const getColumnNameErrorMessage: ComputedRef<string> = computed(() => {
  return doesColumnConceptAlreadyExists.value ? 'column already exists' : constants.inputValues.empty;
});

const isAddTableConceptButtonEnabled: ComputedRef<boolean> = computed(() => {
  // return !!currentTableConcept.value.conceptName && !isGraphRendered.value;
  return true;
});

const checkIfTableExistsInCollection = async (): Promise<boolean> => {
  try {
    const snapshot = await conceptualGraphsCollection.where('tableName', '==', currentTableConcept.value.conceptName).get();
    if (!snapshot.empty) {
      isTableConceptValid.value = false;
      openNotificationToast(`table ${currentTableConcept.value.conceptName} is already saved in your collection`, 'error');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    openNotificationToast(error.message, 'error');
    return true;
  }
};

const checkIfTableExistsInKeyspace = async (): Promise<boolean> => {
  let response: AxiosResponse<any, any>, responseData: AstraApiResponse;
  
  try {
    response = await retrieveTable(currentKeyspace.value, currentTableConcept.value.conceptName);
  } catch (error: any) {
    openNotificationToast(error.message, 'error');
    return false;
  }

  if (response && response.data) {
    responseData = response.data as AstraApiResponse;
    if (responseData.data) {
      isTableConceptValid.value = true;
      openNotificationToast(`table ${currentTableConcept.value.conceptName} already exists in the current keyspace`, 'error');
      return true;
    } else {
      return false;
    }
  } else {
    openNotificationToast(responseData.description, 'error');
  }
};

const validateTableName = async (): Promise<void> => {

  const isTableAlreadySavedInCollecton = await checkIfTableExistsInCollection();
  if (isTableAlreadySavedInCollecton) {
    return;
  }
  
  const doesTableAlreadyExistInKeyspace = await checkIfTableExistsInKeyspace();
  if (doesTableAlreadyExistInKeyspace) {
    return;
  }

  addTableConceptToGraph();
};

// Functions related to the rendering of the conceptual graph
const areColumnConceptFieldsCompleted: ComputedRef<boolean> = computed(() => {
  return !!currentColumnConcept.value.conceptName && !!currentColumnConcept.value.columnKind && !!currentDataTypeConcept.value.conceptName;
});

const doesColumnConceptAlreadyExists: ComputedRef<boolean> = computed(() => {
  return !!tableMetadata.value.columns && !!tableMetadata.value.columns[currentTableConcept.value.conceptName] &&
    !!tableMetadata.value.columns.get(currentTableConcept.value.conceptName)?.some(x => x.conceptName === currentColumnConcept.value.conceptName);
});

const isAddColumnConceptButtonEnabled: ComputedRef<boolean> = computed(() => {
  return areColumnConceptFieldsCompleted.value && !doesColumnConceptAlreadyExists.value;
});

const addTableConceptToGraph = (): void => {
  tableMetadata.value.keyspace = { conceptName: currentKeyspace.value, conceptType: constants.conceptTypes.keyspace };
  tableMetadata.value.tables = [{ ... currentTableConcept.value, relation: constants.relationTypes.hasMore }];
  tableMetadata.value.columns = new Map<string, Concept[]>();
  tableMetadata.value.columns.set(currentTableConcept.value.conceptName, []);
  renderConceptualGraph();
};

const addColumnConceptToGraph = (): void => {
  if (!doesColumnConceptAlreadyExists.value && currentColumnConcept.value.columnKind) {
    tableMetadata.value.columns.get(currentTableConcept.value.conceptName)?.push({ ... currentColumnConcept.value, relation: getRelationTypeForColumnConcept(currentColumnConcept.value.columnKind) });
    tableMetadata.value.dataTypes.set(currentColumnConcept.value.conceptName, currentDataTypeConcept.value);
    setClusteringOptionGroupEnabledState();
    resetColumnConceptGroup();
    renderConceptualGraph();
  }
};

const setClusteringOptionGroupEnabledState = (): void => {
  const { _, clusteringColumnCount } = getPartitionAndClusteringColumnsCount(tableMetadata.value);
    if (clusteringColumnCount > 0) {
      isClusteringSectionEnabled.value = true;
      clusteringColumnOptions.value = tableMetadata.value.columns.get(currentTableConcept.value.conceptName)!
        .filter(concept => concept.columnKind === constants.columnKinds.clustering)
        .map(concept => concept.conceptName);
    } else {
      isClusteringSectionEnabled.value = false;
    }
};

const renderConceptualGraph = (onInitialLoad?: boolean): void => {
  if (!onInitialLoad) {
    emit('render', tableMetadata.value, clusteringColumnOptions.value);
    isGraphRendered.value = true;
  } else {
    emit('render', null, null);
  }
};

resetToolbox();

</script>

<style scoped lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.design-toolbox-container
  min-width: 30rem

  .design-toolbox
    box-shadow: none

    .design-toolbox-input-container
      @include containers.flex-container($justify-content: space-between, $align-items: flex-end)

      .design-toolbox-input-group
        @include containers.flex-container($flex-direction: column)

        .flex.flex-column
          margin-bottom: 1rem
          
        .p-dropdown
          width: 100%

        .p-dropdown:not(:last-of-type)
          margin-bottom: 1rem

      .design-toolbox-action-group
        @include containers.flex-container

</style>
