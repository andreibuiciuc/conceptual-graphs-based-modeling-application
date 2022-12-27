import { Form as VeeForm, Field as VeeField } from "vee-validate"

export default {
    
    // Validation plugin outsourced from main.js file.
    // Registers the components to be available globally.

    install (app) {
        app.component("VeeForm", VeeForm);
        app.component("VeeField", VeeField);
    }

}