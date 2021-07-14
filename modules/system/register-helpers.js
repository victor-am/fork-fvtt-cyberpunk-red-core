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

  // eslint-disable-next-line valid-typeof
  Handlebars.registerHelper("isType", (object, type) => typeof object === type);

  Handlebars.registerHelper("getOwnedItem", (actor, itemId) => actor.items.find((i) => i.id === itemId));

  Handlebars.registerHelper("isDefined", (object) => {
    if (typeof object === "undefined") {
      return false;
    }
    return true;
  });

  Handlebars.registerHelper("isEmpty", (object) => {
    if (typeof object === "object") {
      if (Array.isArray(object)) {
        if (object.length === 0) {
          return true;
        }
      } else if (Object.keys(object).length === 0) {
        return true;
      }
    }
    return false;
  });

  Handlebars.registerHelper("isNumber", (value) => !Number.isNaN(value));

  Handlebars.registerHelper("isLimitedPerm", (document) => {
    return !game.user.isGM && document.limited
  });

  // TODO - Refactor / Revist
  Handlebars.registerHelper("mergeForPartialArg", (...args) => {
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

  Handlebars.registerHelper("filter", (objList, key, value) => {
    LOGGER.trace("filter | handlebarsHelper | Called.");
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

  Handlebars.registerHelper("calculateStackValue", (item) => {
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

  Handlebars.registerHelper("findConfigValue", (obj, key) => {
    LOGGER.trace("findConfigValue | handlebarsHelper | Called.");
    if (obj in CPR) {
      return CPR[obj][key];
    }
    return "INVALID_KEY";
  });

  Handlebars.registerHelper("findConfigObj", (obj) => {
    LOGGER.trace("findConfigObj | handlebarsHelper | Called.");
    if (obj in CPR) {
      return CPR[obj];
    }
    return "INVALID_LIST";
  });

  Handlebars.registerHelper("showOptionSlotStatus", (obj) => {
    LOGGER.trace("showOptionSlotStatus | handlebarsHelper | Called.");
    if (obj.type === "cyberware") {
      const { optionSlots } = obj.data.data;
      if (optionSlots > 0) {
        LOGGER.trace(`hasOptionalSlots is greater than 0`);
        const installedOptionSlots = optionSlots - obj.availableSlots();
        return (`- ${installedOptionSlots}/${optionSlots} ${SystemUtils.Localize("CPR.itemSheet.cyberware.optionalSlots")}`);
      } else {
        LOGGER.trace(`hasOptionalSlots is 0`);
      }
    }
    return "";
  });

  Handlebars.registerHelper("findObj", (objList, propertyName, propertyValue) => {
    LOGGER.trace("findObj | handlebarsHelper | Called.");
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

  // TODO - Rename?
  Handlebars.registerHelper("generatePartial", (arg1, arg2) => {
    LOGGER.trace("generatePartial | handlebarsHelper | Called.");
    return arg1.replace("VAR", arg2);
  });

  Handlebars.registerHelper("diceSizeImageClass", (formula) => {
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

  Handlebars.registerHelper("sort", (object, property) => {
    LOGGER.trace("sort | handlebarsHelper | Called.");
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
    LOGGER.trace("reverse | handlebarsHelper | Called.");
    object.reverse();
    return object;
  });

  Handlebars.registerHelper("math", (...args) => {
    LOGGER.trace("math | handlebarsHelper | Called.");
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
      case "product": {
        return mathArgs.reduce((a, b) => a * b, 1);
      }
      default:
        LOGGER.error(`!ERR: Not a Math function: ${mathFunction}`);
        return "null";
    }
  });

  Handlebars.registerHelper("getSkillStat", (skill, actor) => {
    LOGGER.trace("getSkillStat | handlebarsHelper | Called.");
    const skillStat = skill.data.data.stat;
    return actor.data.data.stats[skillStat].value;
  });

  Handlebars.registerHelper("hasCyberneticWeapons", (actor) => {
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

  Handlebars.registerHelper("ablated", (armor, slot) => {
    LOGGER.trace("ablated | handlebarsHelper | Called.");
    if (slot === "body") {
      return armor.bodyLocation.sp - armor.bodyLocation.ablation;
    } else if (slot === "head") {
      return armor.headLocation.sp - armor.headLocation.ablation;
    }
    LOGGER.error(`Received a bad slot: ${slot}`);
    return -1; // return a clear bug but not a broken behavior
  });

  Handlebars.registerHelper("fireMode", (actor, firemode, weaponID) => {
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

  Handlebars.registerHelper("fireflag", (actor, firetype, weaponID) => {
    LOGGER.trace("fireflag | handlebarsHelper | Called.");
    const flag = getProperty(actor, `data.flags.cyberpunk-red-core.firetype-${weaponID}`);
    if (flag === firetype) {
      return "checked";
    }
    return "";
  });

  Handlebars.registerHelper("systemConfig", (settingName) => game.settings.get("cyberpunk-red-core", settingName));

  Handlebars.registerHelper("splitJoinCoreSkills", (string) => {
    LOGGER.trace("splitJoinCoreSkills | handlebarsHelper | Called.");
    const cprDot = "CPR.global.skills.";
    const initialSplit = string.split(" ").join("");
    const orCaseSplit = initialSplit.split("/").join("Or");
    const parenCaseSplit = initialSplit.split("(").join("").split(")").join("");
    const andCaseSplit = initialSplit.split("/").join("And").split("&").join("And");
    if (string === "Conceal/Reveal Object" || string === "Paint/Draw/Sculpt" || string === "Resist Torture/Drugs") {
      return cprDot + orCaseSplit.charAt(0).toLowerCase() + orCaseSplit.slice(1);
    } else if (string === "Language (Streetslang)") {
      // Creates "CPR.global.skills.languageStreetslang", which is not used elsewhere and thus mentioned in this
      // comment to fulfill the test case of the language file.
      return cprDot + parenCaseSplit.charAt(0).toLowerCase() + parenCaseSplit.slice(1);
    }
    return cprDot + andCaseSplit.charAt(0).toLowerCase() + andCaseSplit.slice(1);
  });

  Handlebars.registerHelper("sortCoreSkills", (object) => {
    LOGGER.trace("sortCoreSkills | handlebarsHelper | Called.");
    const objectTranslated = [];
    object.forEach((o) => {
      const newElement = o;
      if (o.data.data.core) {
        const cprDot = "CPR.global.skills.";
        const initialSplit = o.name.split(" ").join("");
        const orCaseSplit = initialSplit.split("/").join("Or");
        const parenCaseSplit = initialSplit.split("(").join("").split(")").join("");
        const andCaseSplit = initialSplit.split("/").join("And").split("&").join("And");
        if (o.name === "Conceal/Reveal Object" || o.name === "Paint/Draw/Sculpt" || o.name === "Resist Torture/Drugs") {
          const string = cprDot + orCaseSplit.charAt(0).toLowerCase() + orCaseSplit.slice(1);
          newElement.translatedName = SystemUtils.Localize(string).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        } else if (o.name === "Language (Streetslang)") {
          // Creates "CPR.global.skills.languageStreetslang", which is not used elsewhere and thus mentioned in this
          // comment to fulfill the test case of the language file.
          const string = cprDot + parenCaseSplit.charAt(0).toLowerCase() + parenCaseSplit.slice(1);
          newElement.translatedName = SystemUtils.Localize(string).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        } else {
          const string = cprDot + andCaseSplit.charAt(0).toLowerCase() + andCaseSplit.slice(1);
          newElement.translatedName = SystemUtils.Localize(string).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }
      } else {
        newElement.translatedName = o.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
      objectTranslated.push(newElement);
    });

    objectTranslated.sort((a, b) => {
      let comparator = 0;
      if (a.translatedName > b.translatedName) {
        comparator = 1;
      } else if (b.translatedName > a.translatedName) {
        comparator = -1;
      }
      return comparator;
    });
    return objectTranslated;
  });

  Handlebars.registerHelper("itemIdFromName", (itemName, itemType) => {
    LOGGER.trace("itemIdFromName | handlebarsHelper | Called.");
    const item = game.items.find((i) => i.data.name === itemName && i.type === itemType);
    if (item !== undefined) {
      return item.data._id;
    }
    return "DOES NOT EXIST";
  });

  Handlebars.registerHelper("toArray", (string, delimiter) => string.split(delimiter));

  Handlebars.registerHelper("isTokenSheet", (title) => {
    LOGGER.trace("isTokenSheet | handlebarsHelper | Called.");
    LOGGER.debug(`title is ${title}`);
    const substr = `[${SystemUtils.Localize("CPR.global.generic.token")}]`;
    return title.includes(substr);
  });

  Handlebars.registerHelper("objConcat", (obj1, obj2) => {
    LOGGER.trace("objConcat | handlebarsHelper | Called.");
    const obj = obj1.concat(obj2);
    return obj;
  });

  Handlebars.registerHelper("getMookSkills", (array) => {
    LOGGER.trace("getMookSkills | handlebarsHelper | Called.");
    const skillList = [];
    array.forEach((skill) => {
      if (skill.data.data.level > 0 || skill.data.data.skillmod > 0) {
        skillList.push(skill);
      }
    });
    return skillList;
  });

  Handlebars.registerHelper("getMookCyberware", (installedCyberware) => {
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

  Handlebars.registerHelper("getMookCyberwareLength", (installedCyberware) => {
    LOGGER.trace("getMookCyberwareLength | handlebarsHelper | Called.");
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
    return installedCyberwareList.length;
  });

  Handlebars.registerHelper("entityTypes", (entityType) => {
    LOGGER.trace("entityTypes | handlebarsHelper | Called.");
    return typeof game.system.entityTypes[entityType] === "object" ? game.system.entityTypes[entityType] : {};
  });

  Handlebars.registerHelper("isUpgradable", (itemType) => {
    LOGGER.trace("isUpgradable | handlebarsHelper | Called.");
    const itemEntities = game.system.template.Item;
    return itemEntities[itemType].templates.includes("upgradable");
  });

  Handlebars.registerHelper("hasTemplate", (itemType, templateName) => {
    LOGGER.trace("hasTemplate | handlebarsHelper | Called.");
    const itemEntities = game.system.template.Item;
    return itemEntities[itemType].templates.includes(templateName);
  });

  Handlebars.registerHelper("showUpgrade", (obj, dataPoint) => {
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

  Handlebars.registerHelper("applyUpgrade", (obj, baseValue, dataPoint) => {
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

  Handlebars.registerHelper("isDebug", () => {
    LOGGER.trace("isDebug | handlebarsHelper | Called.");
    return game.settings.get("cyberpunk-red-core", "debugElements");
  });

  Handlebars.registerHelper("debug", (msg) => {
    LOGGER.debug(msg);
  });

  Handlebars.registerHelper("trace", (msg) => {
    LOGGER.trace(msg);
  });
}
