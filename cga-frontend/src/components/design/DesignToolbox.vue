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
                v-model="currentTableConcept.conceptName"
                placeholder="table name"
                :class="{ 'p-invalid': !isTableConceptValid }"
                :disabled="!currentKeyspace"
                :readonly="isGraphRendered"
              />
          </div>
          <div class="design-toolbox-action-group">
            <Button 
              severity="secondary"
              text
              icon="pi pi-times"
              @click="resetToolbox"
            />
            <Button 
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
          <Button 
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
import { Concept, GraphMetadata } from '../../types/types';

import { useConnectionStore } from '../../stores/connection';

import { useConfetti } from '../../composables/confetti';
import { useMetadata } from '../../composables/metadata';
import { useQuery } from "../../composables/query";
import { useUtils } from "../../composables/utils";

import { manageRequest } from '../../includes/requests';
import { conceptualGraphsCollection } from "../../includes/firebase";
import { ComputedRef, Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { computed } from '@vue/reactivity';


type ClusteringOption = {
  clusteringColumn: string
  clusteringOrder: string
};

// Props and emits definitions
const emit = defineEmits(['render']);

// Functions mapped from composables
const { generateQueryAsCommands } = useQuery();
const { openNotificationToast } = useUtils();
const { createConfetti } = useConfetti();
const { getRelationTypeForColumnConcept } = useMetadata();


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

// Reactive data related to the main screen actions
const isSaveInProgress: Ref<boolean> = ref(false);


// Functions related to the initial configurations
const resetColumnConceptGroup = (): void => {
  currentColumnConcept.value = { ... constants.defaultConcept, conceptType: constants.conceptTypes.column, columnKind: constants.columnKinds.regular };
  currentDataTypeConcept.value = { ... constants.defaultConcept, conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType };
  currentClusteringOrderOption.value = { ... defaultClusteringOption };
};

const resetToolbox = (): void => {
  tableMetadata.value = { ... defaultGraphMetadata };
  isTableConceptValid.value = true;
  currentTableConcept.value = { ... constants.defaultConcept, conceptType: constants.conceptTypes.table };
  resetColumnConceptGroup();
  renderConceptualGraph(true);
  setClusteringOptionGroupEnabledState();
  isGraphRendered.value = false;
};

// Functions related to the validation of the data structure
const isTableConceptValid: Ref<boolean> = ref(true);

const getColumnNameErrorMessage: ComputedRef<string> = computed(() => {
  return doesColumnConceptAlreadyExists.value ? 'column already exists' : constants.inputValues.empty;
});

const isAddTableConceptButtonEnabled: ComputedRef<boolean> = computed(() => {
  return !!currentTableConcept.value.conceptName && !isGraphRendered.value;
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
    // TODO: Handle this case (maybe in the axios wrapper)
    return true;
  }
};

const checkIfTableExistsInKeyspace = async (): Promise<boolean> => {
  const response = await manageRequest(constants.requestTypes.GET, 'table', { 
    table_name: currentTableConcept.value.conceptName,
    keyspace_name: currentKeyspace.value
  });
  if (response && response.data) {
    if (response.data.status === constants.requestStatus.SUCCESS) {
      if (response.data.flag) {
        isTableConceptValid.value = false;
        openNotificationToast(`table ${currentTableConcept.value.conceptName} already exists in the current keyspace`, 'error');
        return true;
      } else {
        return false;
      }
    } else {
      openNotificationToast(response.data.message, 'error');
      // TODO: Handle this case (maybe in the axios wrapper)
      return true;
    }
  }
  // Handle this case (maybe in the axios wrapper)
  return true;
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
  return areColumnConceptFieldsCompleted && !doesColumnConceptAlreadyExists.value;
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
  const { _, clusteringColumnCount } = getPartitionAndClusteringColumnsCount();
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
    emit('render', tableMetadata.value);
    isGraphRendered.value = true;
  }
};

// Functions related to the main screen actions
const generateCQLQuery = (): void => {
  const [isConceptualGraphValid, errorMessage] = validateConceptualGraph();
    if (isConceptualGraphValid) {
      // const commands = generateQueryAsCommands(currentKeyspace.value, tableMetadata.value.tables, tableMetadata.value.columns, tableMetadata.value.dataTypes, currentClusteringOrderOption.value);
    } else {
      openNotificationToast(errorMessage, 'error');
    }
};

const getPartitionAndClusteringColumnsCount = (): { [key: string]: number } => {
  const initialCount = { partitionColumnsCount: 0, clusteringColumnCount: 0 };
  
  const columnConcepts: Concept[] | undefined = tableMetadata.value.columns.get(currentTableConcept.value.conceptName)
  if (!columnConcepts) {
    return initialCount;
  }

  return columnConcepts.reduce((accumulator, currentValue) => {
    if (currentValue.columnKind === 'partition_key') {
      accumulator.partitionColumnsCount += 1;
    } else if (currentValue.columnKind === constants.columnKinds.clustering) {
      accumulator.clusteringColumnCount += 1;
    }
    return accumulator;
  }, initialCount);
};

const validateConceptualGraph = (): [boolean, string] => {
  const { partitionColumnsCount, _ } = getPartitionAndClusteringColumnsCount();
  const errorMessage = partitionColumnsCount > 0 ? constants.inputValues.empty : "Cannot create primary key without any partition keys";
  return [partitionColumnsCount > 0, errorMessage];
};

const saveTableMetadata = async (): Promise<void> => {
  isSaveInProgress.value = true;
  
  const [isConceptualGraphValid, errorMessage] = validateConceptualGraph();
  if (!isConceptualGraphValid) {
    openNotificationToast(errorMessage, 'error');
    isSaveInProgress.value = false;
    return;
  }

  try {
    await conceptualGraphsCollection.add({
      tableName: currentTableConcept.value.conceptName,
      tableConcepts: tableMetadata.value.tables,
      columnConcepts: Object.fromEntries(tableMetadata.value.columns),
      dataTypeConcepts: Object.fromEntries(tableMetadata.value.dataTypes)
    });
    isSaveInProgress.value = false;
    openNotificationToast(designToolboxConstants.SUCCESSFUL_TABLE_GRAPH_SAVE, 'success');
    createConfetti();
  } catch (error) {
    isSaveInProgress.value = false;
    openNotificationToast(error.message, 'error');
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
