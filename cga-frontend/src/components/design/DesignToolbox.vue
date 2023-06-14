<template>
  <div class="design-toolbox-container">
    <Card
      class="design-toolbox"
      :class="{ 'toolbox-warning': !currentKeyspace }"
    >
      <template #title>{{ isTableInViewMode ? 'data structure lookup' : 'data structure config' }}</template>
      <template #subtitle>{{ isTableInViewMode ? 'hover over concepts' : 'build tables by filling the concepts below'  }}</template>
      
      <template #content>
        
        <!-- Table concept input -->
        <div 
          class="design-toolbox-section"
          :style="{ borderLeftColor: !currentKeyspace ? '#ececf1' : '#3B82F6' }"
        >
          <span class="design-toolbox-section-title">
            table concept
          </span>
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
                <InputText 
                  v-else 
                  v-model="tableName"
                  class="input-lookup"
                  :disabled="true"
                  placeholder="no table selected"
                  :readonly="true"
                />
            </div>
          </div>
        </div>

        <div class="design-toolbox-action-group">
          <Button 
            v-if="!isTableInViewMode"
            severity="danger"
            outlined
            icon="pi pi-times"
            label="clear"
            :disabled="!isGraphRendered"
            @click="resetToolbox"
          />
          <Button 
            v-if="!isTableInViewMode"
            severity="primary"
            outlined
            label="add table concept"
            :icon="isGraphRendered ? 'pi pi-check' : 'pi pi-plus'"
            :disabled="!isAddTableConceptButtonEnabled"
            @click="validateTableName"
          />
        </div>

        <Divider />

        <!-- Column and type concepts input -->

        <div 
          class="design-toolbox-section" 
          :style="{ borderLeftColor: !currentTableConcept.conceptName || !isGraphRendered ? '#ececf1' : '#3B82F6' }"
          >
          <span class="design-toolbox-section-title">
            column and data concepts
          </span>
          <div class="design-toolbox-input-container">
            <div class="design-toolbox-input-group">
              <div class="flex flex-column gap-2">
                <InputText
                  v-if="!isTableInViewMode"
                  v-model="currentColumnConcept.conceptName"
                  :class="{ 'p-invalid': doesColumnConceptAlreadyExists }"
                  placeholder="column name"
                  :disabled="!currentTableConcept.conceptName || !isGraphRendered"
                />
                <InputText 
                  v-else
                  v-model="hoveredColumn.conceptName"  
                  class="input-lookup"
                  :disabled="true"
                  placeholder="no column hovered"
                  :readonly="true"
                />
                <small class="p-error">{{ getColumnNameErrorMessage }}</small>
              </div>
              <Dropdown 
                v-if="!isTableInViewMode"
                v-model="currentColumnConcept.columnKind"
                placeholder="column kind"
                :disabled="!currentColumnConcept.conceptName || doesColumnConceptAlreadyExists"
                :options="designToolboxConstants.CQL_COLUMN_OPTIONS"
              />
              <InputText
                v-else
                v-model="hoveredColumn.columnKind"
                class="input-lookup"
                :disabled="true"
                placeholder="no column hovered"
                :readonly="true"
              >
              </InputText>
              <Dropdown 
                v-if="!isTableInViewMode"
                v-model="currentDataTypeConcept.conceptName"
                placeholder="column type"
                :disabled="!currentColumnConcept.conceptName || doesColumnConceptAlreadyExists"
                :options="designToolboxConstants.CQL_DATA_TYPES"
              />
              <InputText 
                v-else
                v-model="dataTypeForHoveredColumn.conceptName"
                class="input-lookup"
                :disabled="true"
                placeholder="no column hovered"
                :readonly="true"
              />
            </div>
          </div>
        </div>

        <div 
          class="design-toolbox-section design-toolbox-section-map"
          :style="{ borderLeftColor: currentDataTypeConcept.conceptName !== 'map' ? '#ececf1' : '#3B82F6' }"  
        >
          <span class="design-toolbox-section-title">
            map concept
          </span>
          <div class="design-toolbox-input-container">
            <div class="design-toolbox-input-group design-toolbox-input-group-row">
              <Dropdown 
                placeholder="map key type"
                :disabled="currentDataTypeConcept.conceptName !== 'map'"
                :options="designToolboxConstants.CQL_DATA_TYPES"
              />
              <Dropdown 
                placeholder="map value type"
                :disabled="currentDataTypeConcept.conceptName !== 'map'"
                :options="designToolboxConstants.CQL_DATA_TYPES"
              />
            </div>
          </div>
        </div>

        <div class="design-toolbox-action-group design-toolbox-action">
          <Button v-if="!isTableInViewMode"
              icon="pi pi-plus"
              outlined
              label="add column and type concepts"
              :disabled="!isAddColumnConceptButtonEnabled"
              @click.prevent="addColumnConceptToGraph"
            />
        </div>
        
        <Divider />

        <!-- Clustering column concepts options input -->

        <div 
          class="design-toolbox-section"
          :style="{ borderLeftColor: !isClusteringSectionEnabled ? '#ececf1' : '#3B82F6' }"  
        >
          <span class="design-toolbox-section-title">
            clustering index
          </span>
          <div class="design-toolbox-input-container" v-if="!isTableInViewMode">
            <div class="design-toolbox-input-group design-toolbox-input-group-row">
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
        </div>

      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import constants from '../../constants/constants';
import designToolboxConstants from "../design/designToolboxConstants";
import { ComputedRef, Ref, ref, watch } from 'vue';
import { computed } from '@vue/reactivity';
import { Concept, GraphMetadata, ClusteringOption } from '../../types/types';
import { useAstra } from '@/composables/requests/astra';
import { useConnectionStore } from '../../stores/connection';
import { useMetadata } from '@/composables/metadata/metadata';
import { useUtils } from "../../composables/utils";
import { storeToRefs } from 'pinia';
import { table } from 'console';

// Props and emits definitions
interface Props {
  isTableInViewMode: boolean,
  isTableInViewModeReady: boolean,
  tableInViewMode?: GraphMetadata
  hoveredColumn: Concept
  dataTypeForHoveredColumn: Concept
};

const props = defineProps<Props>();
const emit = defineEmits(['render']);

// Functions mapped from composables
const { openNotificationToast } = useUtils();
const { getRelationTypeForColumnConcept, getPartitionAndClusteringColumnsCount } = useMetadata();
const { retrieveTable } = useAstra();

// Local constants
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
const currentTableConcept: Ref<Concept> = ref(structuredClone(constants.defaultConcept));
const currentColumnConcept: Ref<Concept> = ref(structuredClone(constants.defaultConcept));
const currentDataTypeConcept: Ref<Concept> = ref(structuredClone(constants.defaultConcept));  
const currentClusteringOrderOption: Ref<ClusteringOption> = ref(structuredClone(defaultClusteringOption));
const isClusteringSectionEnabled: Ref<boolean> = ref(false);
const clusteringColumnOptions: Ref<string[]> = ref([]);

// Reactive data related to the rendering of the conceptual graph
const tableMetadata: Ref<GraphMetadata> = ref(structuredClone(defaultGraphMetadata));
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
  return !!currentTableConcept.value.conceptName && !isGraphRendered.value;
});

const checkIfTableExistsInKeyspace = async (): Promise<boolean> => {
  let isTableAlreadyInKeyspace = false;
  
  try {
    await retrieveTable(currentKeyspace.value, currentTableConcept.value.conceptName);
    isTableAlreadyInKeyspace = true;
  } catch (error: any) {
    isTableAlreadyInKeyspace = false;
  }

  if (isTableAlreadyInKeyspace) {
    isTableConceptValid.value = false;
    openNotificationToast(`table ${currentTableConcept.value.conceptName} already exists in the current keyspace`, 'error');
  }

  return isTableAlreadyInKeyspace;
};

const validateTableName = async (): Promise<void> => {

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
  return tableMetadata.value.tables.length && tableMetadata.value.columns.get(tableMetadata.value.tables.at(0).conceptName).some(x => x.conceptName === currentColumnConcept.value.conceptName);
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

watch(() => props.isTableInViewMode, () => {
  resetToolbox();
});

</script>

<style scoped lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'

.p-divider.p-divider-horizontal
  margin: 2rem 0 !important

.design-toolbox-container
  min-width: 30rem
  overflow: auto

  .design-toolbox
    box-shadow: none

    .design-toolbox-section-map
      margin-top: 1rem

    .design-toolbox-section
      @include containers.flex-container($flex-direction: column)
      border: 1px solid variables.$cassandra-light-gray
      border-left-width: 0.25rem
      padding: 1rem
      width: 100%

      .design-toolbox-section-title
        font-weight: 700
        margin-bottom: 1rem

      .design-toolbox-input-container
        @include containers.flex-container($justify-content: space-between, $align-items: flex-end)
        width: 100%

        .design-toolbox-input-group
          @include containers.flex-container($flex-direction: column)
          width: auto !important

          .flex.flex-column
            margin-bottom: 1rem
            
          .p-dropdown
            width: 100%

          .p-dropdown:not(:last-of-type)
            margin-bottom: 1rem

          .p-inputtext.input-lookup
            width: auto !important

            &:not(:last-of-type)
              margin-bottom: 1rem

            &[disabled]
              color: variables.$cassandra-app-blue
              opacity: 1

        .design-toolbox-input-group-row
          width: 100% !important
          flex-direction: row
          justify-content: space-between

          .p-component
            width: 12rem !important

    .design-toolbox-action-group
      @include containers.flex-container()
      margin-top: 1rem

      .p-button
        margin-top: 1rem
        width: 50%

      &.design-toolbox-action .p-button
        width: 100%
      
      .p-button:first-of-type
        margin-right: 0.5rem

</style>
