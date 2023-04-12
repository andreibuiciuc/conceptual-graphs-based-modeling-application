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
          required: `The field ${context.field} is required.`,
          min: `The field ${context.field} is too short.`,
          max: `The field ${context.field} is too long.`,
          alpha_spaces: `The field ${context.field} may only contain alphabetic characters and spaces.`,
          email: `The field ${context.field} must be a valid email.`,
        };
        const errorMessage = errorMessages[context.rule.name]
          ? errorMessages[context.rule.name]
          : `The field ${context.field} is invalid.`;
        return errorMessage;
      },
    });
  },
};
