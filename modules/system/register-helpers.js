/* global Handlebars, getProperty */
import LOGGER from "../utils/cpr-logger.js";
import CPR from "./config.js";
// import CPRSystemUtils from "../utils/cpr-systemUtils";

export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers");

  Handlebars.registerHelper("compare", (v1, operator, v2) => {
    switch (operator) {
      case "==":
        return v1 == v2; // eslint-disable-line eqeqeq
      case "===":
        return v1 === v2;
      case "!==":
        return v1 !== v2;
      case "<":
        return v1 < v2;
      case "<=":
        return v1 <= v2;
      case ">":
        return v1 > v2;
      case ">=":
        return v1 >= v2;
      case "&&":
        return v1 && v2;
      case "||":
        return v1 || v2;
      default:
        return false;
    }
  });

  Handlebars.registerHelper("getProp", (object, property) => getProperty(object, property));

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

  // TODO - Refactor / Revist
  Handlebars.registerHelper("contains", (arg1, arg2, options) => {
    // LOGGER.trace(`Calling contains Helper | Arg1:${arg1} Arg2:${arg2}`);
    const array = arg2.split(",");
    return array.includes(arg1) ? options.fn(this) : options.inverse(this);
  });

  // TODO - Rename?
  Handlebars.registerHelper("generatePartial", (arg1, arg2) => {
    LOGGER.trace(`Calling generatePartial Helper | Arg1:${arg1} Arg2:${arg2}`);
    return arg1.replace("VAR", arg2);
  });

  Handlebars.registerHelper("sort", (object, property) => {
    LOGGER.trace(`Calling sort Helper | Sorting by ${property}`);
    object.sort((a, b) => {
      let comparator = 0;
      if (a[property] > b[property]) {
        comparator = 1;
      } else if (b[property] > a[property]) {
        comparator = -1;
      }
      return comparator;
    });
    return object;
  });

  Handlebars.registerHelper("math", (...args) => {
    LOGGER.trace(`Calling math Helper | Arg1:${args}`);
    let mathArgs = [...args];
    const mathFunction = mathArgs[0];
    mathArgs.shift();
    mathArgs.pop();
    mathArgs = mathArgs.map(Number);
    if (typeof Math[mathFunction] === "function") {
      return Math[mathFunction].apply(null, mathArgs);
    }
    // Math doesn't have basic functions, we can account
    // for those here as needed:
    switch (mathFunction) {
      case "sum":
        return mathArgs.reduce((a, b) => a + b, 0);
      default:
        LOGGER.error(`!ERR: Not a Math function: ${mathFunction}`);
        return "null";
    }
  });
}
