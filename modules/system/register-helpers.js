/* global Handlebars game getProperty */
import LOGGER from "../utils/cpr-logger.js";
import CPR from "./config.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers");

  /**
   * Run a comparison given a stringified operator and 2 operands. Returns true or false.
   */
  Handlebars.registerHelper("cprCompare", (v1, operator, v2) => {
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

  /**
   * Get the value of a property on a given object
   */
  Handlebars.registerHelper("cprGetProp", (object, property) => {
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

  /**
   * Return an owned item on an actor given the ID
   */
  Handlebars.registerHelper("cprGetOwnedItem", (actor, itemId) => actor.items.find((i) => i.id === itemId));

  /**
   * Return true if an object is defined or not
   */
  Handlebars.registerHelper("cprIsDefined", (object) => {
    if (typeof object === "undefined") {
      return false;
    }
    return true;
  });

  /**
   * Return true if a literal is a number
   */
  Handlebars.registerHelper("cprIsNumber", (value) => !Number.isNaN(value));

  /**
   * Given an Array of strings, create an object with those strings as properties. They are the assigned
   * in order to the remaining arguments passed to this helper.
   */
  Handlebars.registerHelper("cprMergeForPartialArg", (...args) => {
    LOGGER.trace("mergeForPartialArg | handlebarsHelper | Called.");
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

  /**
   * Given a list of objects, return the subset that a property with the desired value
   */
  Handlebars.registerHelper("cprFilter", (objList, key, value) => {
    LOGGER.trace("filter | handlebarsHelper | Called.");
    if (objList === undefined) {
      const warnText = "Improper use of the filter helper. This should not occur. Always provide an object list and not an undefined value.";
      LOGGER.warn(`${warnText} The following arguments were passed: objList = ${objList}, key = ${key}, value = ${value}`);
      return [];
    }
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

  /**
   * Calculate the price of a stack of items. This is amount * price with
   * a few exceptions.
   */
  Handlebars.registerHelper("cprCalculateStackValue", (item) => {
    LOGGER.trace("calculateStackValue | handlebarsHelper | Called.");
    const { type } = item;
    const price = item.data.data.price.market;
    const { amount } = item.data.data;
    let totalPrice = amount * price;
    if (type === "ammo") {
      const { variety } = item.data.data;
      if (!(variety === "grenade" || variety === "rocket")) {
        totalPrice = (amount / 10) * price;
      }
    }
    return totalPrice;
  });

  /**
   * Get a config mapping from config.js by name and key
   */
  Handlebars.registerHelper("cprFindConfigValue", (obj, key) => {
    LOGGER.trace("findConfigValue | handlebarsHelper | Called.");
    if (obj in CPR) {
      return CPR[obj][key];
    }
    return "INVALID_KEY";
  });

  /**
   * Get a config mapping from config.js by name
   */
  Handlebars.registerHelper("cprFindConfigObj", (obj) => {
    LOGGER.trace("findConfigObj | handlebarsHelper | Called.");
    if (obj in CPR) {
      return CPR[obj];
    }
    return "INVALID_LIST";
  });

  /**
   * Show option slots on a cyberware item
   */
  Handlebars.registerHelper("cprShowOptionSlotStatus", (obj) => {
    LOGGER.trace("showOptionSlotStatus | handlebarsHelper | Called.");
    if (obj.type === "cyberware") {
      const { optionSlots } = obj.data.data;
      if (optionSlots > 0) {
        LOGGER.trace(`hasOptionalSlots is greater than 0`);
        const installedOptionSlots = optionSlots - obj.availableSlots();
        return (`- ${installedOptionSlots}/${optionSlots} ${SystemUtils.Localize("CPR.itemSheet.cyberware.optionalSlots")}`);
      }
      LOGGER.trace(`hasOptionalSlots is 0`);
    }
    return "";
  });

  /**
   * This helper accepts a string that is a list of words separated by strings. It returns true if
   * any of them match a given value.
   */
  Handlebars.registerHelper("cprListContains", (list, val) => {
    LOGGER.trace("listContains | handlebarsHelper | Called.");
    let array = list;
    if (array) {
      switch (typeof array) {
        case "string": {
          array = array.split(",");
          break;
        }
        case "object": {
          if (!Array.isArray(array)) {
            array = Object.keys(array);
          }
          break;
        }
        default:
      }
      return array.includes(val);
    }
    return false;
  });

  /**
   * Returns true if an array contains a desired element
   */
  Handlebars.registerHelper("cprObjectListContains", (objectList, data, val) => {
    LOGGER.trace("Calling objectListContains Helper");
    const array = objectList;
    if (array) {
      return array.some((o) => o[data] === val);
    }
    return false;
  });

  /**
   * Accepts a string and replaces VAR with the desired value. Usually used to dynamically
   * produce file names for partial templates.
   */
  Handlebars.registerHelper("cprGeneratePartial", (arg1, arg2) => {
    LOGGER.trace("generatePartial | handlebarsHelper | Called.");
    return arg1.replace("VAR", arg2);
  });

  /**
   * Calculate the size (in pixels) of images for dice given the number of sides they have
   * and how many need to be displayed in a chat card.
   */
  Handlebars.registerHelper("cprDiceSizeImageClass", (formula) => {
    LOGGER.trace("diceSizeImageClass | handlebarsHelper | Called.");
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

  /**
   * Sort an array of objects by the values in a specific property
   */
  Handlebars.registerHelper("cprSort", (arr, property) => {
    LOGGER.trace("sort | handlebarsHelper | Called.");
    arr.sort((a, b) => {
      let comparator = 0;
      if (a[property] > b[property]) {
        comparator = 1;
      } else if (b[property] > a[property]) {
        comparator = -1;
      }
      return comparator;
    });
    return arr;
  });

  /**
   * Return an array in reverse order
   */
  Handlebars.registerHelper("cprReverse", (arr) => {
    LOGGER.trace("reverse | handlebarsHelper | Called.");
    arr.reverse();
    return arr;
  });

  /**
   * Perform a basic mathematical statement starting with a stringified
   * operator and an array of operands
   */
  Handlebars.registerHelper("cprMath", (...args) => {
    LOGGER.trace("math | handlebarsHelper | Called.");
    let mathArgs = [...args];
    let mathFunction = mathArgs[0];
    mathArgs.shift();
    mathArgs.pop();
    if (Array.isArray(mathArgs[0])) {
      [mathArgs] = mathArgs;
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
      case "product": {
        return mathArgs.reduce((a, b) => a * b, 1);
      }
      default:
        LOGGER.error(`!ERR: Not a Math function: ${mathFunction}`);
        return "null";
    }
  });

  /**
   * Given a skill (item), return the stat associated with it, which is a property buried therein
   */
  Handlebars.registerHelper("cprGetSkillStat", (skill, actor) => {
    LOGGER.trace("getSkillStat | handlebarsHelper | Called.");
    const skillStat = skill.data.data.stat;
    return actor.data.data.stats[skillStat].value;
  });

  /**
   * Return true if any installed cyberware is a weapon
   */
  Handlebars.registerHelper("cprHasCyberneticWeapons", (actor) => {
    LOGGER.trace("hasCyberneticWeapons | handlebarsHelper | Called.");
    let returnValue = false;
    const cyberware = actor.getInstalledCyberware();
    cyberware.forEach((cw) => {
      if (cw.data.data.isWeapon === "true") {
        returnValue = true;
      }
    });
    return returnValue;
  });

  /**
   * Return true if an embedded flag on an actor matches the firemode currently set.
   * Used to figure out if a weapon was just used with an alternative fire mode set.
   */
  Handlebars.registerHelper("cprFireMode", (actor, firemode, weaponID) => {
    LOGGER.trace("fireMode | handlebarsHelper | Called.");
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

  /**
   * Return a system setting value given the name
   */
  Handlebars.registerHelper("cprSystemConfig", (settingName) => game.settings.get("cyberpunk-red-core", settingName));

  /**
   * Some skills and roles have spaces and/or parantheses in their name. When substituting in translated strings,
   * this can be a problem to find the key they're listed under. This helper does a little string manipulation
   * to make that easier to manage.
   * Example: Resist Torture/Drugs -> Resist Torture Or Drugs
   */
  Handlebars.registerHelper("cprSplitJoinCoreSkills", (string) => {
    LOGGER.trace("splitJoinCoreSkills | handlebarsHelper | Called.");
    const cprDot = "CPR.global.skills.";
    const initialSplit = string.split(" ").join("");
    const orCaseSplit = initialSplit.split("/").join("Or");
    const parenCaseSplit = initialSplit.split("(").join("").split(")").join("");
    const andCaseSplit = initialSplit.split("/").join("And").split("&").join("And");
    if (string === "Conceal/Reveal Object" || string === "Paint/Draw/Sculpt" || string === "Resist Torture/Drugs") {
      return cprDot + orCaseSplit.charAt(0).toLowerCase() + orCaseSplit.slice(1);
    }
    if (string === "Language (Streetslang)") {
      // Creates "CPR.global.skills.languageStreetslang", which is not used elsewhere and thus mentioned in this
      // comment to fulfill the test case of the language file.
      return cprDot + parenCaseSplit.charAt(0).toLowerCase() + parenCaseSplit.slice(1);
    }
    return cprDot + andCaseSplit.charAt(0).toLowerCase() + andCaseSplit.slice(1);
    // This helper also translates the skills for the Elflines Online characters, created with by the macro in the compendium.
    // In order for the test case to work these skills have to appear in the code. They are not used anywhere else, thus added
    // here as a comment: "CPR.global.skills.athleticsAndContortionist", "CPR.global.skills.basicTechAndWeaponstech",
    // "CPR.global.skills.compositionAndEducation", "CPR.global.skills.enduranceAndResistTortureAndDrugs", "CPR.global.skills.evasionAndDance",
    // "CPR.global.skills.firstAidAndParamedicAndSurgery", "CPR.global.skills.persuasionAndTrading", "CPR.global.skills.pickLockAndPickPocket"
  });

  /**
   * Get an Item ID from the catalog by name and type. Does not consider owned items.
   */
  Handlebars.registerHelper("cprItemIdFromName", (itemName, itemType) => {
    LOGGER.trace("itemIdFromName | handlebarsHelper | Called.");
    const item = game.items.find((i) => i.data.name === itemName && i.type === itemType);
    if (item !== undefined) {
      return item.data._id;
    }
    return "DOES NOT EXIST";
  });

  /**
   * Convert a string with a delimiter (such as a comma or space) to an Array of elements
   */
  Handlebars.registerHelper("cprToArray", (string, delimiter) => string.split(delimiter));

  /**
   * Concatenate 1 object to another with the concat method.
   */
  Handlebars.registerHelper("cprObjConcat", (obj1, obj2) => {
    LOGGER.trace("objConcat | handlebarsHelper | Called.");
    const obj = obj1.concat(obj2);
    return obj;
  });

  /**
   * Get all skills on a mook that have a level above 0. This is used to present
   * specialized skills a mook may have.
   */
  Handlebars.registerHelper("cprGetMookSkills", (array) => {
    LOGGER.trace("getMookSkills | handlebarsHelper | Called.");
    const skillList = [];
    array.forEach((skill) => {
      if (skill.data.data.level > 0 || skill.data.data.skillmod > 0) {
        skillList.push(skill);
      }
    });
    return skillList;
  });

  /**
   * Get all installed cyberware and options and return it as an array. This is
   * used in the mook sheet.
   */
  Handlebars.registerHelper("cprGetMookCyberware", (installedCyberware) => {
    LOGGER.trace("getMookCyberware | handlebarsHelper | Called.");
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

  /**
   * Get details about an entity type that the game system is aware of
   */
  Handlebars.registerHelper("cprEntityTypes", (entityType) => {
    LOGGER.trace("entityTypes | handlebarsHelper | Called.");
    return typeof game.system.entityTypes[entityType] === "object" ? game.system.entityTypes[entityType] : {};
  });

  /**
   * Returns true if an item type can be upgraded. This means it has the upgradable property in the data model.
   */
  Handlebars.registerHelper("cprIsUpgradable", (itemType) => {
    LOGGER.trace("isUpgradable | handlebarsHelper | Called.");
    const itemEntities = game.system.template.Item;
    return itemEntities[itemType].templates.includes("upgradable");
  });

  /**
   * Returns true if an item type has a particular template applied in the data model
   * To Do: isUpgradeable should use this instead
   */
  Handlebars.registerHelper("cprHasTemplate", (itemType, templateName) => {
    LOGGER.trace("hasTemplate | handlebarsHelper | Called.");
    const itemEntities = game.system.template.Item;
    return itemEntities[itemType].templates.includes(templateName);
  });

  /**
   * Return the stat-changing details as text if an object has an upgrade
   */
  Handlebars.registerHelper("cprShowUpgrade", (obj, dataPoint) => {
    LOGGER.trace("showUpgrade | handlebarsHelper | Called.");
    const itemEntities = game.system.template.Item;
    const itemType = obj.type;
    let upgradeText = "";
    if (itemEntities[itemType].templates.includes("upgradable") && obj.data.data.isUpgraded) {
      const upgradeValue = obj.getAllUpgradesFor(dataPoint);
      if (upgradeValue !== 0 && upgradeValue !== "") {
        const modType = obj.getUpgradeTypeFor(dataPoint);
        const modSource = (itemType === "weapon") ? SystemUtils.Localize("CPR.itemSheet.weapon.attachments") : SystemUtils.Localize("CPR.itemSheet.common.upgrades");
        upgradeText = `(${SystemUtils.Format("CPR.itemSheet.common.modifierChange", { modSource, modType, value: upgradeValue })})`;
      }
    }
    return upgradeText;
  });

  /**
   * If an upgrade exists that applies changes to a stat or skill, calculate and return the
   * result.
   */
  Handlebars.registerHelper("cprApplyUpgrade", (obj, baseValue, dataPoint) => {
    LOGGER.trace("applyUpgrade | handlebarsHelper | Called.");
    const itemEntities = game.system.template.Item;
    const itemType = obj.type;
    let upgradeResult = Number(baseValue);
    if (Number.isNaN(upgradeResult)) {
      upgradeResult = baseValue;
    }
    if (itemEntities[itemType].templates.includes("upgradable") && obj.data.data.isUpgraded) {
      const upgradeValue = obj.getAllUpgradesFor(dataPoint);
      const upgradeType = obj.getUpgradeTypeFor(dataPoint);
      if (upgradeValue !== "" && upgradeValue !== 0) {
        if (upgradeType === "override") {
          upgradeResult = upgradeValue;
        } else if (typeof upgradeResult !== "number" || typeof upgradeValue !== "number") {
          if (upgradeValue !== 0 && upgradeValue !== "") {
            upgradeResult = `${upgradeResult} + ${upgradeValue}`;
          }
        } else {
          upgradeResult += upgradeValue;
        }
      }
    }
    return upgradeResult;
  });

  /**
   * Return true/false depending on whether debugElements setting in the game is enabled
   */
  Handlebars.registerHelper("cprIsDebug", () => {
    LOGGER.trace("isDebug | handlebarsHelper | Called.");
    return game.settings.get("cyberpunk-red-core", "debugElements");
  });

  /**
   * Emit a debug message to the dev log
   */
  Handlebars.registerHelper("cprDebug", (msg) => {
    LOGGER.debug(msg);
  });

  /**
   * Emit a trace message to the dev log
   */
  Handlebars.registerHelper("cprTrace", (msg) => {
    LOGGER.trace(msg);
  });
}
