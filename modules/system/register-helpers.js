/* eslint-disable no-else-return */
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

  Handlebars.registerHelper("getOwnedItem", (actor, itemId) => actor.items.find((i) => i._id === itemId));

  // Context gets lost when calling to Partials.  This Helper will allow us to
  // merge objects into a single object to pass to a partial.  We needed this
  // capability on the inventory because the items were passed to the content
  // partial but we couldn't access the actor information from that partial
  // to get info like the name of the ammo (one item) loaded in a weapon (another item).
  Handlebars.registerHelper("mergeForPartialArg", (...args) => {
    const partialArgs = [...args];
    const partialKeys = ((partialArgs[0]).replace(/\s/g, '')).split(",");
    partialArgs.shift();
    const mergedObject = {};
    let arrayNDX = 0;
    partialKeys.forEach((objectName) => {
      mergedObject[objectName] = partialArgs[arrayNDX];
      arrayNDX += 1;
    });
    return mergedObject;
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
      case "subtract": {
        const minutend = mathArgs.shift();
        const subtrahend = mathArgs.reduce((a, b) => a + b, 0);
        return minutend - subtrahend;
      }
      default:
        LOGGER.error(`!ERR: Not a Math function: ${mathFunction}`);
        return "null";
    }
  });

  Handlebars.registerHelper("ablated", (armor, slot) => {
    LOGGER.trace(`Calling ablated Helper | Arg1:${armor} Arg2:${slot}`);
    if (slot === "body") {
      return armor.bodyLocation.sp - armor.bodyLocation.ablation;
    } else if (slot === "head") {
      return armor.headLocation.sp - armor.headLocation.ablation;
    }
    LOGGER.error(`Received a bad slot: ${slot}`);
    return -1; // return a clear bug but not a broken behavior
  });
}
