/* eslint-disable no-undef */
/* eslint-disable no-else-return */
/* global Handlebars, getProperty */
import LOGGER from "../utils/cpr-logger.js";
import CPR from "./config.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

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

  Handlebars.registerHelper("numToWord", (num) => {
    switch (num) {
      case 0:
        return "zero";
      case 1:
        return "one";
      case 2:
        return "two";
      case 3:
        return "three";
      case 4:
        return "four";
      case 5:
        return "five";
      case 6:
        return "six";
      case 7:
        return "seven";
      case 8:
        return "eight";
      case 9:
        return "nine";
      case 10:
        return "ten";
      default:
        return "";
    }
  });

  Handlebars.registerHelper("getProp", (object, property) => {
    if (typeof object !== "undefined") {
      if (typeof object.length === "undefined") {
        return getProperty(object, property);
      }
      if (object.length > 0) {
        const returnValues = [];
        object.forEach((obj) => {
          returnValues.push(getProperty(obj, property));
        });
        return returnValues;
      }
    }
    return "";
  });

  Handlebars.registerHelper("getOwnedItem", (actor, itemId) => actor.items.find((i) => i.id === itemId));

  Handlebars.registerHelper("isDefined", (object) => {
    if (typeof object === "undefined") {
      return false;
    }
    return true;
  });

  Handlebars.registerHelper("isNumber", (value) => !Number.isNaN(value));

  // TODO - Refactor / Revist
  Handlebars.registerHelper("mergeForPartialArg", (...args) => {
    const partialArgs = [...args];
    const partialKeys = partialArgs[0].replace(/\s/g, "").split(",");
    partialArgs.shift();
    const mergedObject = {};
    let index = 0;
    partialKeys.forEach((objectName) => {
      mergedObject[objectName] = partialArgs[index];
      index += 1;
    });
    return mergedObject;
  });

  Handlebars.registerHelper("filter", (objList, key, value) => {
    const filteredList = objList.filter((obj) => {
      let objProp = obj;
      const propDepth = key.split(".");
      // eslint-disable-next-line consistent-return
      propDepth.forEach((propName) => {
        if (typeof objProp[propName] !== "undefined") {
          objProp = objProp[propName];
        } else {
          return false;
        }
      });
      if (objProp === value) {
        return true;
      }
      return false;
    });
    return filteredList;
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

  Handlebars.registerHelper("hasOptionalSlots", (installedOptionSlots, optionSlots) => {
    LOGGER.trace(`Calling hasOptionalSlots`);
    if (optionSlots > 0) {
      LOGGER.trace(`hasOptionalSlots is greater than 0`);
      return (`- ${installedOptionSlots}/${optionSlots} ${SystemUtils.Localize("CPR.optionalslots")}`);
    } else {
      LOGGER.trace(`hasOptionalSlots is 0`);
    }
    return "";
  });

  Handlebars.registerHelper("findObj", (objList, propertyName, propertyValue) => {
    LOGGER.trace(`Calling findObj Helper | Arg1:${objList}`);
    if (typeof objList === "object") {
      const searchResult = objList.filter((o) => o[propertyName] === propertyValue);
      if (searchResult.length === 1) {
        return searchResult[0];
      }
      if (searchResult.length > 1) {
        return "AMBIGUOUS SEARCH";
      }
    }
    return {};
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

  Handlebars.registerHelper("diceSizeImageClass", (formula) => {
    LOGGER.trace(`Calling sizeDice Helper | formula:${formula}`);
    let diceSize = "";
    let className = "d10";
    const formulaParts = formula.split("d");
    if (formulaParts.length === 2) {
      const diceCount = parseInt(formulaParts[0], 10);
      const diceSides = parseInt(formulaParts[1], 10);
      className = `d${diceSides}`;

      if (diceSides === 6) {
        diceSize = 60;
        if (diceCount > 2) {
          diceSize = 40;
        }
        if (diceCount > 4) {
          diceSize = 30;
        }
        if (diceCount > 10) {
          diceSize = 20;
        }
      }

      if (diceSides === 10) {
        diceSize = 60;
        if (diceCount > 2) {
          diceSize = 40;
        }
        if (diceCount > 4) {
          diceSize = 30;
        }
        if (diceCount > 10) {
          diceSize = 20;
        }
      }
      if (diceSize) {
        className = `${className} ${className}-${diceSize}`;
      }
    }
    return className;
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

  Handlebars.registerHelper("reverse", (object) => {
    LOGGER.trace(`Calling reverse Helper | Reversing array object`);
    object.reverse();
    return object;
  });

  Handlebars.registerHelper("math", (...args) => {
    LOGGER.trace(`Calling math Helper | Arg1:${args}`);
    let mathArgs = [...args];
    let mathFunction = mathArgs[0];
    mathArgs.shift();
    mathArgs.pop();
    if (Array.isArray(mathArgs[0])) {
      // eslint-disable-next-line prefer-destructuring
      mathArgs = mathArgs[0];
    }
    mathArgs = mathArgs.map(Number);
    if (typeof Math[mathFunction] === "function") {
      return Math[mathFunction].apply(null, mathArgs);
    }
    // Math doesn't have basic functions, we can account
    // for those here as needed:
    if (typeof mathArgs === "undefined") {
      mathFunction = `${mathFunction} bad args: ${mathArgs}`;
    }
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

  Handlebars.registerHelper("getSkillStat", (skill, actor) => {
    LOGGER.trace("Calling getSkillStat Helper");
    const skillStat = skill.data.data.stat;
    return actor.data.data.stats[skillStat].value;
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

  Handlebars.registerHelper("fireMode", (actor, firemode, weaponID) => {
    LOGGER.trace("Calling fireMode Helper");
    LOGGER.debug(`firemode is ${firemode}`);
    LOGGER.debug(`weaponID is ${weaponID}`);
    const flag = getProperty(actor, `data.flags.cyberpunk-red-core.firetype-${weaponID}`);
    LOGGER.debugObject(flag);
    if (flag === firemode) {
      LOGGER.debug("returning true");
      return true;
    }
    LOGGER.debug("returning false");
    return false;
  });

  Handlebars.registerHelper("fireflag", (actor, firetype, weaponID) => {
    LOGGER.trace("Calling fireflag Helper");
    const flag = getProperty(actor, `data.flags.cyberpunk-red-core.firetype-${weaponID}`);
    if (flag === firetype) {
      return "checked";
    }
    return "";
  });

  Handlebars.registerHelper("systemConfig", (settingName) => game.settings.get("cyberpunk-red-core", settingName));

  Handlebars.registerHelper("splitJoinCoreSkills", (string) => {
    LOGGER.trace("Calling splitJoinCoreSkills Helper");
    const cprDot = "CPR.";
    const initialSplit = string.split(" ").join("");
    const orCaseSplit = initialSplit.split("/").join("or");
    const parenCaseSplit = initialSplit.split("(").join("").split(")").join("");
    const andCaseSplit = initialSplit.split("/").join("and").split("&").join("and");
    if (string === "Conceal/Reveal Object" || string === "Paint/Draw/Sculpt" || string === "Resist Torture/Drugs") {
      return cprDot + orCaseSplit.toLowerCase();
    } else if (string === "Language (Streetslang)") {
      return cprDot + parenCaseSplit.toLowerCase();
    }
    return cprDot + andCaseSplit.toLowerCase();
  });

  Handlebars.registerHelper("itemIdFromName", (itemName, itemType) => {
    LOGGER.trace("Calling itemIdFromName Helper");
    const item = game.items.find((i) => i.data.name === itemName && i.type === itemType);
    if (item !== undefined) {
      return item.data._id;
    }
    return "DOES NOT EXIST";
  });

  Handlebars.registerHelper("toArray", (string, delimiter) => string.split(delimiter));

  Handlebars.registerHelper("isTokenSheet", (title) => {
    LOGGER.trace("Calling isTokenSheet Helper");
    LOGGER.debug(`title is ${title}`);
    const substr = `[${SystemUtils.Localize("CPR.token")}]`;
    return title.includes(substr);
  });

  Handlebars.registerHelper("arrayConcat", (array1, array2) => {
    LOGGER.trace("Calling arrayConcat Helper");
    const array = array1.concat(array2);
    return array;
  });

  Handlebars.registerHelper("getMookSkills", (array) => {
    LOGGER.trace("Calling getMookSkills Helper");
    const skillList = [];
    array.forEach((skill) => {
      if (skill.data.level > 0 || skill.data.skillmod > 0) {
        skillList.push(skill);
      }
    });
    return skillList;
  });

  Handlebars.registerHelper("getMookCyberware", (installedCyberware) => {
    LOGGER.trace("Calling getMookCyberware Helper");
    const installedCyberwareList = [];
    Object.entries(installedCyberware).forEach(([k, v]) => {
      if (installedCyberware[k].length > 0) {
        if (k !== "cyberwareInternal" && k !== "cyberwareExternal" && k !== "fashionware") {
          v.forEach((a) => {
            installedCyberwareList.push(a);
          });
        } else if (installedCyberware[k][0].optionals.length > 0) {
          v.forEach((a) => {
            installedCyberwareList.push(a);
          });
        }
      }
    });
    return installedCyberwareList;
  });

  Handlebars.registerHelper("isDebug", () => {
    LOGGER.trace("Calling isDebug Helper");
    return game.settings.get("cyberpunk-red-core", "debugElements");
  });

  Handlebars.registerHelper("debug", (msg) => {
    LOGGER.debug(msg);
  });

  Handlebars.registerHelper("trace", (msg) => {
    LOGGER.trace(msg);
  });
}
