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
                    @click="saveForceConfiguration(false)" 
                />
            </div>

            <div class="parameter-container">
                <Button 
                    outlined 
                    label="reset to default" 
                    severity="primary" 
                    :disabled="isSaveInProgress" 
                    :loading="isSaveInProgress" 
                    @click="saveForceConfiguration(true)" 
                />
            </div>

        </template>

    </Card>
</template>

<script setup lang="ts">
import { configurationsCollection, auth } from '@/configurations/firebase';
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
const { updateConceptNodeSize, updateConceptNodeColor, resetForceConfigurationsToDefault, DEFAULT_CONCEPT_NODE_COLOR, DEFAULT_CONCEPT_NODE_SIZE } = useForceGraph();

// Functionalities related to the saving of the force graph configuration
const isSaveInProgress: Ref<boolean> = ref(false);

const checkIfUserHasForceConfigurations = async (): Promise<boolean> => {

    try {

        const forceConfigDocumentRef = await configurationsCollection.doc(auth.currentUser.uid).get();
        return forceConfigDocumentRef.exists;

    }
    catch (error: any) {
        openNotificationToast(error.message, 'error');
    }

};

const saveForceConfiguration = async (isResetToDefault: boolean = false): Promise<void> => {
    isSaveInProgress.value = true;

    try {
        const newForceConfigDocument = {
            conceptNodeSize: isResetToDefault ? DEFAULT_CONCEPT_NODE_SIZE : conceptNodeSize.value,
            conceptNodeColor: isResetToDefault ? DEFAULT_CONCEPT_NODE_COLOR :  conceptNodeColor.value,
        };

        if (await checkIfUserHasForceConfigurations()) {
            await configurationsCollection.doc(auth.currentUser.uid).update(newForceConfigDocument);
        } else {
            await configurationsCollection.doc(auth.currentUser.uid).set(newForceConfigDocument);
        }

        openNotificationToast('force configuration successfully saved', 'success');

        if (isResetToDefault) {
            resetForceConfigurationsToDefault();
        }

    } catch (error: any) {
        openNotificationToast(error.message, 'error');
    }

    isSaveInProgress.value = false;
};

// Functionalities related to the retrieving of the force graph configuration
const retrieveForceConfiguration = async (): Promise<void> => {
    try {
       
        const forceConfigurationDocumentRef = await configurationsCollection.doc(auth.currentUser.uid).get();
        const forceConfiguration = forceConfigurationDocumentRef.data();

        conceptNodeSize.value = forceConfiguration.conceptNodeSize;
        conceptNodeColor.value = forceConfiguration.conceptNodeColor;

    } catch (error: any) {
        openNotificationToast('force configuration set to default due to missing configuration', 'warn');
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

        .parameter-container:last-of-type
            margin-top: 1rem
            

</style>    