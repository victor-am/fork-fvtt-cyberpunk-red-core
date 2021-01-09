import LOGGER from "../utils/cpr-logger.js";
import { CPR } from "./config.js";
export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers");

  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    // LOGGER.trace(`Calling ifEquals Helper | Arg1:${arg1} Arg2:${arg2}`);
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("loud", function (string) {
    // LOGGER.trace(`Calling loud Helper | Arg1:${string}`);
    return string.toUpperCase();
  });

  Handlebars.registerHelper("getProp", (object, property) => {
    // LOGGER.trace(`Calling getProp Helper | Arg1:${object} Arg2:${property}`);
    return getProperty(object, property);
  });

  Handlebars.registerHelper("add", (x, y) => {
    LOGGER.trace(`Calling add Helper | Arg1:${x} Arg2:${y}`);
    return parseInt(x) + parseInt(y);
  });

  Handlebars.registerHelper("findConfigValue", (obj, key) => {
    LOGGER.trace(`Calling findConfigValue Helper | Arg1:${obj} Arg2:${key}`);

    if (obj in CPR) {
      return CPR[obj][key];
    }
    return "INVALID_KEY";
  });

  Handlebars.registerHelper("findConfigObj", (obj) => {
    LOGGER.trace(`Calling findConfigObj Helper | Arg1:${obj}`);

    if (obj in CPR) {
      return CPR[obj];
    }
    return "INVALID_LIST";
  });

  Handlebars.registerHelper("ifIn", function (arg1, arg2, options) {
    // LOGGER.trace(`Calling ifIn Helper | Arg1:${arg1} Arg2:${arg2}`);
    let array = arg2.split(",");
    return array.includes(arg1) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("generatePartial", function (arg1, arg2) {
    LOGGER.trace(`Calling generatePartial Helper | Arg1:${arg1} Arg2:${arg2}`);
    return arg1.replace("VAR", arg2);
  });

  Handlebars.registerHelper("dumpObj", (obj) => {
    LOGGER.trace(`Calling dumpObj Helper | Arg1:${obj}`);
    console.log(obj);
  });
}
