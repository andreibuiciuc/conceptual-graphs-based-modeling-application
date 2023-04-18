// Vue app and state management related imports
import { createApp } from "vue";
import { createPinia } from "pinia";

// Vuetify related imports
import "vuetify/styles";
import { createVuetify } from "vuetify/lib/framework.mjs";
import * as components from "vuetify/lib/components/index.mjs";
import * as directives from "vuetify/lib/directives/index.mjs";

// Router related imports
import router from "./router";

// Validation related imports
import VeeValidatePlugin from "./includes/validation";

// Firebase related imports
import { auth } from "@/includes/firebase";

// Root component
import App from "./App.vue";

// Styles imports
import "./assets/main.css";
import "@mdi/font/css/materialdesignicons.css";
import "primevue/resources/themes/lara-light-blue/theme.css";     
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// PrimeVue components
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import Tooltip from 'primevue/tooltip';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Sidebar from 'primevue/sidebar';
import InputSwitch from 'primevue/inputswitch';
import ConfirmPopup from 'primevue/confirmpopup';
import ConfirmationService from 'primevue/confirmationservice';
import Splitter from 'primevue/splitter';
import SplitterPanel from "primevue/splitterpanel";
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Chip from 'primevue/chip';

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
  },
});

let app;
auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App);
    
    app.use(createPinia());
    app.use(vuetify);
    app.use(router);
    app.use(VeeValidatePlugin);
    app.use(ConfirmationService);
    app.use(PrimeVue, { ripple: true });
    app.use(ToastService);

    app.component('Card', Card);
    app.component('Button', Button);
    app.component('Dropdown', Dropdown);
    app.component('Divider', Divider);
    app.component('InputText', InputText);
    app.component('Accordion', Accordion);
    app.component('AccordionTab', AccordionTab);
    app.component('Sidebar', Sidebar);
    app.component('InputSwitch', InputSwitch);
    app.component('ConfirmPopup', ConfirmPopup);
    app.component('Splitter', Splitter);
    app.component('SplitterPanel', SplitterPanel);
    app.component('Dialog', Dialog);
    app.component('Toast', Toast);
    app.component('DataTable', DataTable);
    app.component('Column', Column);
    app.component('ProgressSpinner', ProgressSpinner);
    app.component('Chip', Chip);

    app.directive('tooltip', Tooltip);
    app.mount("#app");
  }
});
