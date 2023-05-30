<template>
    <Card class="force-config-card-container">
        
        <template #title>
            force configuration
        </template>
        
        <template #content>

            <div class="parameter-container">
                <div class="parameter-input-container">
                    <span>concept node size</span>
                    <Slider 
                        v-model="conceptNodeSize" 
                        :min="8"
                        :max="16"
                        @update:model-value="updateConceptNodeSize($event)"
                    />
                </div>
                <div class="parameter-info-container">
                    <span>{{ conceptNodeSize }}</span>
                </div>
            </div>
            <Divider />

            <div class="parameter-container">
                <div class="parameter-input-container">
                    <span>concept node color</span>
                </div>
                <div class="parameter-info-container">
                    <ColorPicker 
                        v-model="conceptNodeColor"  
                        @update:model-value="updateConceptNodeColor($event)"
                    />
                </div>
            </div>
            <Divider />

            <div class="parameter-container">
                <Button 
                    outlined 
                    label="save configuration" 
                    severity="primary" 
                    :disabled="isSaveInProgress" 
                    :loading="isSaveInProgress" 
                    @click="saveForceConfiguration" 
                />

            </div>

        </template>

    </Card>
</template>

<script setup lang="ts">
import { configurationsCollection, FORCE_CONFIGURATIONS_DOC_ID } from '@/configurations/firebase';
import { onBeforeMount, Ref, ref } from 'vue';
import { useForceGraph } from '@/composables/forcegraph';
import { useUtils } from '@/composables/utils';
import { useQueryStore } from '@/stores/query';
import { storeToRefs } from 'pinia';

// Pinia store mappings
const queryStore = useQueryStore();
const { conceptNodeColor, conceptNodeSize } = storeToRefs(queryStore);
    
// Composable mappings    
const { openNotificationToast } = useUtils();
const { updateConceptNodeSize, updateConceptNodeColor, resetForceConfigurationsToDefault } = useForceGraph();

// Functionalities related to the saving of the force graph configuration
const isSaveInProgress: Ref<boolean> = ref(false);

const saveForceConfiguration = async (): Promise<void> => {
    isSaveInProgress.value = true;

    try {
       
        await configurationsCollection.doc(FORCE_CONFIGURATIONS_DOC_ID).update({
            conceptNodeSize: conceptNodeSize.value,
            conceptNodeColor: conceptNodeColor.value
        });

        openNotificationToast('force configuration successfully saved', 'success');

    } catch (error: any) {
        openNotificationToast(error.message, 'error');
    }

    isSaveInProgress.value = false;
};

// Functionalities related to the retrieving of the force graph configuration
const retrieveForceConfiguration = async (): Promise<void> => {
    try {
       
        const forceConfigurationDocumentRef = await configurationsCollection.doc(FORCE_CONFIGURATIONS_DOC_ID).get();
        const forceConfiguration = forceConfigurationDocumentRef.data();

        conceptNodeSize.value = forceConfiguration.conceptNodeSize;
        conceptNodeColor.value = forceConfiguration.conceptNodeColor;

    } catch (error: any) {
        openNotificationToast(error.message, 'error');
        openNotificationToast('force configuration set to default due to error', 'warn');

        resetForceConfigurationsToDefault();
    }
}

// Lifecycle hooks
onBeforeMount(() => {
    retrieveForceConfiguration();
});

</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"

.force-config-card-container
    @include containers.flex-container($flex-direction: column)
    border: 1px solid #e9ecef !important
    box-shadow: none !important
    padding: 1.5rem
    width: 100%
    height: 100%
    overflow: auto

    .p-card-body
        width: 100%
        padding: 0

        .p-card-title
            text-align: center
    
        .parameter-container
            @include containers.flex-container($justify-content: space-between, $align-items: center)
            width: 100%

            .parameter-input-container
                @include containers.flex-container($flex-direction: column)

                .p-slider
                    margin-top: 1rem
                    width: 10rem

            .parameter-info-container
                @include containers.flex-container($justify-content: center, $align-items: center)   

                span
                    font-size: 1.5rem
                    color: variables.$cassandra-app-blue

            .p-button
                width: 100%

</style>    