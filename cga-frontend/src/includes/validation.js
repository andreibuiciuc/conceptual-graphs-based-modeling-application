import { Form as VeeForm, Field as VeeField, defineRule } from "vee-validate";
import { required, min, max, alpha_spaces as alphaSpaces, email } from '@vee-validate/rules';

export default {
    
    // Validation plugin outsourced from main.js file.
    // Registers the components to be available globally and defines the validation rules.

    install (app) {
        app.component("VeeForm", VeeForm);
        app.component("VeeField", VeeField);
    
        defineRule('required', required);
        defineRule('min', min);
        defineRule('max', max);
        defineRule('alpha_spaces', alphaSpaces);
        defineRule('email', email);
    }

}