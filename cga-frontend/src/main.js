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
import "primevue/resources/themes/lara-light-indigo/theme.css";     
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// PrimeVue
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';

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
    
    app.use(PrimeVue, { ripple: true });

    app.component('Button', Button);
    app.component('Dropdown', Dropdown);
    app.component('Divider', Divider);

    app.directive('tooltip', Tooltip);
    app.mount("#app");
  }
});
