import { auth } from "@/configurations/firebase";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import PrimeVuePlugin from './configurations/primevue';
import VeeValidatePlugin from "./configurations/validation";
import router from "./router";

// Vuetify related imports
import "vuetify/styles";
import { createVuetify } from "vuetify/lib/framework.mjs";
import * as components from "vuetify/lib/components/index.mjs";
import * as directives from "vuetify/lib/directives/index.mjs";

// Styles imports
import "./assets/main.css";
import "@mdi/font/css/materialdesignicons.css";

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
    
    app.use(vuetify);

    app.use(createPinia());
    app.use(router);
    app.use(VeeValidatePlugin);
    app.use(PrimeVuePlugin);

    app.mount("#app");
  }
});

