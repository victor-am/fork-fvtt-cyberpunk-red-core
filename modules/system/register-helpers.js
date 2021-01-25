/* eslint-disable no-else-return */
/* global Handlebars, getProperty */
import LOGGER from "../utils/cpr-logger.js";
<<<<<<< HEAD
import { CPR } from "./config.js";
export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers");

  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    // LOGGER.trace(`Calling ifEquals Helper | Arg1:${arg1} Arg2:${arg2}`);
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
  });

  Handlebars.registerHelper("loud", function (string) {
    // LOGGER.trace(`Calling loud Helper | Arg1:${string}`);
    return string.toUpperCase();
  });
=======
import CPR from "./config.js";
// import CPRSystemUtils from "../utils/cpr-systemUtils";

export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers");
>>>>>>> dev

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
<<<<<<< HEAD

=======
>>>>>>> dev
    if (obj in CPR) {
      return CPR[obj][key];
    }
    return "INVALID_KEY";
  });

  Handlebars.registerHelper("findConfigObj", (obj) => {
    LOGGER.trace(`Calling findConfigObj Helper | Arg1:${obj}`);
<<<<<<< HEAD

=======
>>>>>>> dev
    if (obj in CPR) {
      return CPR[obj];
    }
    return "INVALID_LIST";
  });

<<<<<<< HEAD
  Handlebars.registerHelper("ifIn", function (arg1, arg2, options) {
    // LOGGER.trace(`Calling ifIn Helper | Arg1:${arg1} Arg2:${arg2}`);
    let array = arg2.split(",");
    return array.includes(arg1) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("generatePartial", function (arg1, arg2) {
=======
  // TODO - Refactor / Revist
  Handlebars.registerHelper("listContains", (list, val) => {
    // LOGGER.trace(`Calling contains Helper | Arg1:${arg1} Arg2:${arg2}`);
    let array = list;
    if (array) {
      if (typeof array === "string") {
        array = array.split(",");
      }
      return array.includes(val);
    }
    return false;
  });

  // TODO - Rename?
  Handlebars.registerHelper("generatePartial", (arg1, arg2) => {
>>>>>>> dev
    LOGGER.trace(`Calling generatePartial Helper | Arg1:${arg1} Arg2:${arg2}`);
    return arg1.replace("VAR", arg2);
  });

<<<<<<< HEAD
  Handlebars.registerHelper("dumpObj", (obj) => {
    LOGGER.trace(`Calling dumpObj Helper | Arg1:${obj}`);
    console.log(obj);
=======
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
>>>>>>> dev
  });
}
