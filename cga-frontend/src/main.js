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

// Plugins
import VeeValidatePlugin from "./includes/validation";
import PrimeVuePlugin from './includes/primevue';

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
    
    // TODO: Delete this after the PrimeVue migration is completed
    app.use(vuetify);

    app.use(createPinia());
    app.use(router);
    app.use(VeeValidatePlugin);
    app.use(PrimeVuePlugin);

    app.mount("#app");
  }
});
