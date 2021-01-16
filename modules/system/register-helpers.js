import LOGGER from "../utils/cpr-logger.js";
import { CPR } from "./config.js";
import CPRSystemUtils from "../utils/cpr-systemUtils.js";
export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers");

  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    // LOGGER.trace(`Calling ifEquals Helper | Arg1:${arg1} Arg2:${arg2}`);
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('compare', function (v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
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

  Handlebars.registerHelper("contains", function (arg1, arg2, options) {
    // LOGGER.trace(`Calling contains Helper | Arg1:${arg1} Arg2:${arg2}`);
    let array = arg2.split(",");
    return array.includes(arg1) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("generatePartial", function (arg1, arg2) {
    LOGGER.trace(`Calling generatePartial Helper | Arg1:${arg1} Arg2:${arg2}`);
    return arg1.replace("VAR", arg2);
  });

  Handlebars.registerHelper("sort", (object, property) => {
    LOGGER.trace(`Calling sort Helper | Sorting by ${property}`);
    object.sort((a, b) => (a[property] > b[property]) ? 1 : ((b[property] > a[property]) ? -1 : 0));
    return object;
  });

  Handlebars.registerHelper("maths", function() {
    LOGGER.trace(`Calling math Helper | Arg1:${arguments}`);
    let mathArgs = [...arguments];
    let mathFunction = mathArgs[0];
    mathArgs.shift();
    mathArgs.pop();
    mathArgs = mathArgs.map(Number);
    if (typeof Math[mathFunction] === 'function') {
      return Math[mathFunction].apply(null, mathArgs);
    }
    return `!ERR: Not a Math function: ${mathFunction}`;
  });


}
