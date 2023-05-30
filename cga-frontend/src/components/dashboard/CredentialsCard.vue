<template>
    <div class="upload-container">
        <div 
            class='upload-card-container'
            :class="{ 'upload-card-dragged-over': isFileDraggedOver || userAstraDatabaseId }"
            @dragenter.prevent.stop="isFileDraggedOver = true"
            @dragend.prevent.stop="isFileDraggedOver = false"
            @dragleave.prevent.stop="isFileDraggedOver = false"
            @dragover.prevent.stop="isFileDraggedOver = true"
            @drop.prevent.stop="uploadAstraCredentials($event)"
        >
            <i class="pi pi-upload"></i>    
            <span>{{ userAstraDatabaseId ? 'credentials file uploaded' : 'drop astra credentials file'}}</span>
        </div>
        <input 
            class="upload-file-button"
            type="file" 
            :disabled="isFileUploaded"
            @change="uploadAstraCredentials($event)" 
        />
    </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx';
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';
import { useConnectionStore } from '@/stores/connection';
import { useUtils } from '@/composables/utils';


// Composable mappings
const { openNotificationToast } = useUtils();

// Store mappings
const connectioStore = useConnectionStore();
const { userAstraDatabaseId, userAstraDatabaseRegion, userAstraToken } = storeToRefs(connectioStore);

// Functionalities related to the upload of credentials file
const isFileUploaded: Ref<boolean> = ref(false);
const isFileDraggedOver: Ref<boolean> = ref(false);
const uploadButtonContent: Ref<string> = ref('press to upload file');

const isFileExtensionValid = (filename: string): boolean => {
    return ['csv', 'xlsx', 'numbers'].includes(filename.split('.').pop().toLowerCase());
};

const parseXLSXData = (excelData: any[]): void => {
    const xlsxHeader = excelData.at(0) as string[];
    const xlsxData = excelData.at(1) as string[];

    const databaseIdIndex = xlsxHeader.findIndex(header => header === 'Database Id');
    const regionIndex = xlsxHeader.findIndex(header => header === 'Database Region');
    const tokenIndex = xlsxHeader.findIndex(header => header === 'Token');

    if (databaseIdIndex > -1 && regionIndex > -1 && tokenIndex > -1) {
        userAstraDatabaseId.value = xlsxData.at(databaseIdIndex);
        userAstraDatabaseRegion.value = xlsxData.at(regionIndex);
        userAstraToken.value = xlsxData.at(tokenIndex);

        isFileUploaded.value = true;
        uploadButtonContent.value = 'credentials file uploaded';
    }
};

const uploadAstraCredentials = (uploadEvent: any): void => {
    if (userAstraDatabaseId.value) {
        return;
    }

    isFileDraggedOver.value = false;

    const file: File = uploadEvent.dataTransfer ? [ ... uploadEvent.dataTransfer.files ].at(0) : [ ... uploadEvent.target.files].at(0);

    if (isFileExtensionValid(file.name)) {
        const reader = new FileReader();
    
        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
            parseXLSXData(excelData);
        }
    
        reader.readAsArrayBuffer(file);
    }
    else {
        openNotificationToast('invalid file format', 'error', 'please provide a xlsx or csv file');
    }

};



</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"

.upload-container
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
    width: 100%

    .upload-card-container
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
        border: 1px solid variables.$cassandra-light-gray
        width: 100%
        padding: 2.5rem 2rem 1rem 2rem
        margin-bottom: 1rem 

        .pi.pi-upload
            font-size: 2.5rem
            margin-bottom: 2.5rem

    .upload-card-dragged-over
        border-bottom: 1px solid variables.$cassandra-app-blue

        .pi.pi-upload
            color: variables.$cassandra-app-blue

    span
        margin-bottom: 1rem

    .upload-file-button::-webkit-file-upload-button
        display: none

    .upload-file-button
        width: 10rem !important
        overflow: hidden
        margin-bottom: 2rem !important

    .upload-file-button[disabled]
        width: 6rem !important
        color: variables.$cassandra-black
        
        &::before
            content: 'file uploaded'

    .upload-file-button::before
        -webkit-user-select: none
        content: 'select credentials file' 
        cursor: pointer
        white-space: nowrap
        outline: none
        margin-right: 1rem

    .upload-file-button::after
        visibility: hidden

    .upload-file-button:hover::before 
        border-color: black

</style>