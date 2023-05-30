import {
  Form as VeeForm,
  Field as VeeField,
  defineRule,
  configure,
} from "vee-validate";
import {
  required,
  min,
  max,
  alpha_spaces as alphaSpaces,
  email,
} from "@vee-validate/rules";

export default {
  install(app) {
    app.component("VeeForm", VeeForm);
    app.component("VeeField", VeeField);

    defineRule("required", required);
    defineRule("min", min);
    defineRule("max", max);
    defineRule("alpha_spaces", alphaSpaces);
    defineRule("email", email);

    configure({
      generateMessage: (context) => {

        const errorMessages = {
          required: `the field ${context.field} is required`,
          min: `the field ${context.field} is too short`,
          max: `the field ${context.field} is too long`,
          alpha_spaces: `the field ${context.field} may only contain alphabetic characters and spaces`,
          email: `the field ${context.field} must be a valid email`,
        };

        const errorMessage = errorMessages[context.rule.name]
          ? errorMessages[context.rule.name]
          : `the field ${context.field} is invalid.`;
          
        return errorMessage;
      },
    });
  },
};
