import LOGGER from "../utils/cpr-logger.js";
import { CPR } from "./config.js";
import CPRSystemUtils from "../utils/cpr-systemUtils.js";
export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers");

// Removed ifEquals in favor of a more universal comparison helper
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

  Handlebars.registerHelper("getObjId", (arr, propName, propValue) => {
    LOGGER.trace(`Calling findObj Helper | Arg1:${arr} Arg2:${propName} Arg3:${propValue}`);
    let result = arr.find(o => o[propName] == propValue);
    if (typeof result == 'object' && result.hasOwnProperty('_id')) {
      return result._id;
    }
    return;
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

  Handlebars.registerHelper("sortList", (objs, property) => {
    LOGGER.trace(`Calling sortList Helper | Arg1:${objs} Arg2:${property}`);
    objs.sort((a,b) => (a[property] > b[property]) ? 1 : ((b[property] > a[property]) ? -1 : 0)); 
    return objs;
  });

  Handlebars.registerHelper("dumpObj", (obj) => {
    LOGGER.trace(`Calling dumpObj Helper | Arg1:${obj}`);
    console.log(obj);
  });
}
