import { auth } from "@/includes/firebase";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { retrieveAllEntities } from './includes/astra'
import App from "./App.vue";
import PrimeVuePlugin from './includes/primevue';
import VeeValidatePlugin from "./includes/validation";
import router from "./router";

// TODO: Remove after full PrimeVue migration
// Vuetify related imports
import "vuetify/styles";
import { createVuetify } from "vuetify/lib/framework.mjs";
import * as components from "vuetify/lib/components/index.mjs";
import * as directives from "vuetify/lib/directives/index.mjs";

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

retrieveAllEntities();

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
