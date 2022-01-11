/* global game ui Folder */
/* eslint-env jquery */

import LOGGER from "./cpr-logger.js";

/**
 * CPR-C utilities that are meant to have broad application across the whole system module.
 */
export default class CPRSystemUtils {
  /**
   * Return an array of "core" skills that are defined in the rules, and all characters
   * start with them defined.
   *
   * @returns {Documents}
   */
  static async GetCoreSkills() {
    LOGGER.trace("GetCoreSkills | CPRSystemUtils | Called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSills array
    const content = await pack.getDocuments();
    return content;
  }

  /**
   * Return an array of "core" cyberware that is installed in all characters. These objects
   * are how cyberware with no corresponding foundation to install it in. (chipware for example)
   *
   * @returns {Documents}
   */
  static async GetCoreCyberware() {
    LOGGER.trace("GetCoreCyberware | CPRSystemUtils | Called.");
    // grab basic cyberware from compendium
    const pack = game.packs.get("cyberpunk-red-core.cyberware");
    // put into basicCyberware array
    const content = await pack.getDocuments();
    return content;
  }

  /**
   * Display user-visible message. (blue, yellow, or red background)
   *
   * @param {String} msgType - type of message to display, which controls the color fo the dialog
   * @param {String} msg - the message to print (untranslated)
   */
  static async DisplayMessage(msgType, msg) {
    LOGGER.trace("DisplayMessage | CPRSystemUtils | Called.");
    const localizedMessage = CPRSystemUtils.Localize(msg);
    switch (msgType) {
      case "warn":
        ui.notifications.warn(localizedMessage);
        break;
      case "error":
        ui.notifications.error(localizedMessage);
        break;
      case "notify":
        ui.notifications.notify(localizedMessage);
        break;
      default:
    }
  }

  // eslint-disable-next-line foundry-cpr/logger-after-function-definition
  static Localize(string) {
    return game.i18n.localize(string);
  }

  // eslint-disable-next-line foundry-cpr/logger-after-function-definition
  static Format(string, object) {
    return game.i18n.format(string, object);
  }

  /**
   * For settings like favorite items or skills, and opening or closing categories, we save the user's
   * preferences in a hidden system setting.
   *
   * To Do: Flags may be a better implementation.
   *
   * @param {String} type - indicate whether this is a sheetConfig setting or something else
   * @param {String} name - name for the setting
   * @param {*} value - the value for the setting to save
   * @param {*} extraSettings - a prefix for the name of the setting (sheetConfig only)
   */
  static SetUserSetting(type, name, value, extraSettings) {
    LOGGER.trace("SetUserSetting | CPRSystemUtils | Called.");
    const userSettings = game.settings.get("cyberpunk-red-core", "userSettings") ? game.settings.get("cyberpunk-red-core", "userSettings") : {};
    switch (type) {
      case "sheetConfig": {
        // If this is a sheetConfig setting, our user may have settings for different sheets, so
        // to account for this, we pass the id of the sheet that this setting is
        // for in extraSettings.  We store the value as the id-settingName in userSettings.sheetConfig
        const settingKey = `${extraSettings}-${name}`;
        // Get all of the sheet config data stored for this user
        let sheetConfigData = userSettings.sheetConfig;
        // See if we have any sheetConfig data
        if (sheetConfigData === undefined) {
          // If not, we set sheetConfigData to an empty object;
          sheetConfigData = {};
        }
        // We set the value of the sheet data for our key
        sheetConfigData[settingKey] = value;

        // Update the sheetConfig setting in our userSettings
        userSettings.sheetConfig = sheetConfigData;
        break;
      }
      default: {
        // By default, we store a simple name value/key pair
        userSettings[name] = value;
      }
    }
    // Update the userSettings object
    game.settings.set("cyberpunk-red-core", "userSettings", userSettings);
  }

  /**
   * Get a hidden user setting. (see SetUserSetting above)
   *
   * @param {String} type - indicate whether this is a sheetConfig setting or something else
   * @param {String} name - name for the setting
   * @param {*} extraSettings - a prefix for the name of the setting (sheetConfig only)
   * @returns - the request hidden setting value
   */
  static GetUserSetting(type, name, extraSettings) {
    LOGGER.trace("GetUserSetting | CPRSystemUtils | Called.");
    const userSettings = game.settings.get("cyberpunk-red-core", "userSettings") ? game.settings.get("cyberpunk-red-core", "userSettings") : {};
    let requestedValue;
    switch (type) {
      case "sheetConfig": {
        const settingKey = `${extraSettings}-${name}`;
        const sheetConfigData = userSettings.sheetConfig;
        if (sheetConfigData !== undefined) {
          requestedValue = sheetConfigData[settingKey];
        }
        break;
      }
      default: {
        requestedValue = userSettings[name];
      }
    }
    return requestedValue;
  }

  /**
   * When a new object (document) is created in our module, we want to provide a cool looking
   * default icon. This method retrieves paths to icons based on the object type.
   *
   * @param {String} foundryObject - the object (document) type (Actor, Item, etc)
   * @param {*} objectType - the subtype of object to get an icon for (e.g. ammo or armor for an Item)
   * @returns {String} - path to an icon to use
   */
  static GetDefaultImage(foundryObject, objectType) {
    LOGGER.trace("GetDefaultImage | CPRSystemUtils | Called.");
    let imageLink = "";
    if (foundryObject === "Item") {
      switch (objectType) {
        case "ammo": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Ammo.svg";
          break;
        }
        case "armor": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Armor.svg";
          break;
        }
        case "clothing": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Clothing.svg";
          break;
        }
        case "criticalInjury": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Critical_Injury.svg";
          break;
        }
        case "cyberdeck": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Cyberdeck.svg";
          break;
        }
        case "cyberware": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Cyberware.svg";
          break;
        }
        case "gear": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Gear.svg";
          break;
        }
        case "netarch": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Net_Architecture.svg";
          break;
        }
        case "program": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Program.svg";
          break;
        }
        case "role": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Role.svg";
          break;
        }
        case "skill": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Skill.svg";
          break;
        }
        case "vehicle": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Vehicle.svg";
          break;
        }
        case "weapon": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/weapons/heavyPistol.svg";
          break;
        }
        default: {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Gear.svg";
          break;
        }
      }
    } else if (foundryObject === "Actor") {
      switch (objectType) {
        case "blackIce": {
          imageLink = "systems/cyberpunk-red-core/icons/netrunning/Black_Ice.png";
          break;
        }
        case "container": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Container.svg";
          break;
        }
        case "demon": {
          imageLink = "systems/cyberpunk-red-core/icons/netrunning/Demon.png";
          break;
        }
        case "mook": {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_Mook.svg";
          break;
        }
        default: {
          imageLink = "systems/cyberpunk-red-core/icons/compendium/default/Default_CPR_Mystery_Man.svg";
        }
      }
    }
    return imageLink;
  }

  /**
   * Some actions users can take in this system will produce a bunch of documents are entities, and
   * we group them up in a dynamically created folder. This is where that magic happens.
   *
   * @param {String} type - the entity type the folder should group together
   * @param {String} name - a name for the folder
   * @returns {Folder} - the referenced folder or a newly created one
   */
  static async GetFolder(type, name) {
    LOGGER.trace("GetFolder | CPRSystemUtils | Called.");
    const folderList = game.folders.filter((folder) => folder.name === name && folder.type === type);
    // If the folder does not exist, we create it.
    return (folderList.length === 1) ? folderList[0] : Folder.create({ name, type });
  }

  /**
   * Given a data model template name, return the array of item types it is applied to
   *
   * @param {String} templateName - the template name to look up
   * @returns {Array}
   */
  static GetTemplateItemTypes(templateName) {
    LOGGER.trace("GetTemplateItemTypes | CPRSystemUtils | Called.");
    const itemTypes = [];
    const itemEntityTypes = game.system.template.Item.types;
    itemEntityTypes.forEach((entityType) => {
      const entity = game.system.template.Item[entityType];
      if (entity.templates.includes(templateName)) {
        itemTypes.push(entityType);
      }
    });
    return itemTypes;
  }

  /**
   * Given the (assumed unique) ID of an Active Effect, return the corresponding object. Active Effects only
   * exist as embedded objects on either Actors or Items. There is no place to look up from a list, so we
   * go by the origin property that exists on data.
   *
   * This is called by handlebars helpers because the template only has data to go by, not object instances.
   *
   * @param {String} effectId
   * @returns {CPRActiveEffect}
   */
  static GetEffect(effectId, origin) {
    LOGGER.trace("GetEffect | CPRSystemUtils | Called.");
    const originBits = origin.split(".");
    if (origin.startsWith("Item")) {
      // This AE is on an (unowned) item from the catalog
      const item = game.items.find((i) => i.data._id === originBits[1]);
      return item.effects.find((e) => e.data._id === effectId);
    }
    if (origin.startsWith("Actor")) {
      // This AE is on an item owned by an actor
      const actor = game.actors.find((a) => a.id === originBits[1]);
      const item = actor.items.find((i) => i.data._id === originBits[3]);
      return item.effects.find((e) => e.data._id === effectId);
    }
    LOGGER.error(`This AE has a crazy origin: ${origin}`);
    return null;
  }

  /**
   * Inspect an event object for passed-in field specific to the target (link) that was clicked.
   * This code will initially look at the current target, and if the field is not found, it will
   * climb up the parents of the target until one is found, or print an error and return undefined.
   *
   * @param {Object} event - event data from jquery
   * @param {String} datum - the field we are interested in getting
   * @returns {String} - the value of the field passed in the event data
   */
  static GetEventDatum(event, datum) {
    LOGGER.trace("GetEventDatum | CPRSystemUtils | Called.");
    let id = $(event.currentTarget).attr(datum);
    if (typeof id === "undefined") {
      LOGGER.debug(`Could not find ${datum} in currentTarget trying .item parents`);
      id = $(event.currentTarget).parents(".item").attr(datum);
      if (typeof id === "undefined") {
        LOGGER.error(`Could not find ${datum} in the event data!`);
      }
    }
    return id;
  }

  /**
   * Produce a config map of all stats, skills, and roles with their corresponding localized name.
   * Used in the ActiveEffects sheet when managing what is modified by an effect. This does not
   * consider custom skills or roles.
   *
   * This method is called by a handlebars helper and handlebars does not support async helpers.
   * That is why this is not programmatically generating the skill list with GetCoreSkills().
   * Maybe there is a way to make that not async?
   *
   * @param {String} category - a category that helps sort keys that are presented
   */
  static GetEffectModifierMap(category) {
    LOGGER.trace("GetEffectModifierMap | CPRSystemUtils | Called.");
    switch (category) {
      case "skill": {
        return {
          "bonuses.athletics": "CPR.global.skills.athletics",
          "bonuses.basicTech": "CPR.global.skills.basicTech",
          "bonuses.brawling": "CPR.global.skills.brawling",
          "bonuses.bribery": "CPR.global.skills.bribery",
          "bonuses.concentration": "CPR.global.skills.concentration",
          "bonuses.conversation": "CPR.global.skills.conversation",
          "bonuses.cyberTech": "CPR.global.skills.cybertech",
          "bonuses.education": "CPR.global.skills.education",
          "bonuses.evasion": "CPR.global.skills.evasion",
          "bonuses.firstAid": "CPR.global.skills.firstAid",
          "bonuses.humanPerception": "CPR.global.skills.humanPerception",
          "bonuses.interrogation": "CPR.global.skills.interrogation",
          "bonuses.localExpert": "CPR.global.skills.localExpert",
          "bonuses.meleeWeapon": "CPR.global.skills.meleeWeapon",
          "bonuses.perception": "CPR.global.skills.perception",
          "bonuses.persuasion": "CPR.global.skills.persuasion",
          "bonuses.playInstrument": "CPR.global.skills.playInstrument",
          "bonuses.stealth": "CPR.global.skills.stealth",
          "bonuses.tracking": "CPR.global.skills.tracking",
          "bonuses.accounting": "CPR.global.skills.accounting",
          "bonuses.acting": "CPR.global.skills.acting",
          "bonuses.airVehicleTech": "CPR.global.skills.airVehicleTech",
          "bonuses.animalHandling": "CPR.global.skills.animalHandling",
          "bonuses.archery": "CPR.global.skills.archery",
          "bonuses.autofire": "CPR.global.skills.autofire",
          "bonuses.bureaucracy": "CPR.global.skills.bureaucracy",
          "bonuses.business": "CPR.global.skills.business",
          "bonuses.composition": "CPR.global.skills.composition",
          "bonuses.concealOrRevealObject": "CPR.global.skills.concealOrRevealObject",
          "bonuses.contortionist": "CPR.global.skills.contortionist",
          "bonuses.criminology": "CPR.global.skills.criminology",
          "bonuses.cryptography": "CPR.global.skills.cryptography",
          "bonuses.dance": "CPR.global.skills.dance",
          "bonuses.deduction": "CPR.global.skills.deduction",
          "bonuses.demolitions": "CPR.global.skills.demolitions",
          "bonuses.driveLandVehicle": "CPR.global.skills.driveLandVehicle",
          "bonuses.electronicsAndSecurityTech": "CPR.global.skills.electronicsAndSecurityTech",
          "bonuses.endurance": "CPR.global.skills.endurance",
          "bonuses.forgery": "CPR.global.skills.forgery",
          "bonuses.gamble": "CPR.global.skills.gamble",
          "bonuses.handgun": "CPR.global.skills.handgun",
          "bonuses.heavyWeapons": "CPR.global.skills.heavyWeapons",
          "bonuses.landVehicleTech": "CPR.global.skills.landVehicleTech",
          "bonuses.language": "CPR.global.skills.language",
          "bonuses.librarySearch": "CPR.global.skills.librarySearch",
          "bonuses.lipReading": "CPR.global.skills.lipReading",
          "bonuses.martialArts": "CPR.global.skills.martialArts",
          "bonuses.paintOrDrawOrSculpt": "CPR.global.skills.paintOrDrawOrSculpt",
          "bonuses.paramedic": "CPR.global.skills.paramedic",
          "bonuses.personalGrooming": "CPR.global.skills.personalGrooming",
          "bonuses.photographyAndFilm": "CPR.global.skills.photographyAndFilm",
          "bonuses.pickLock": "CPR.global.skills.pickLock",
          "bonuses.pickPocket": "CPR.global.skills.pickPocket",
          "bonuses.pilotAirVehicle": "CPR.global.skills.pilotAirVehicle",
          "bonuses.pilotSeaVehicle": "CPR.global.skills.pilotSeaVehicle",
          "bonuses.resistTortureOrDrugs": "CPR.global.skills.resistTortureOrDrugs",
          "bonuses.riding": "CPR.global.skills.riding",
          "bonuses.science": "CPR.global.skills.science",
          "bonuses.seaVehicleTech": "CPR.global.skills.seaVehicleTech",
          "bonuses.shoulderArms": "CPR.global.skills.shoulderArms",
          "bonuses.streetWise": "CPR.global.skills.streetwise",
          "bonuses.tactics": "CPR.global.skills.tactics",
          "bonuses.trading": "CPR.global.skills.trading",
          "bonuses.wardrobeAndStyle": "CPR.global.skills.wardrobeAndStyle",
          "bonuses.weaponsTech": "CPR.global.skills.weaponstech",
          "bonuses.wildernessSurvival": "CPR.global.skills.wildernessSurvival",
        };
      }
      case "stat": {
        return {
          "data.stats.int.value": "CPR.global.stats.int",
          "data.stats.ref.value": "CPR.global.stats.ref",
          "data.stats.dex.value": "CPR.global.stats.dex",
          "data.stats.tech.value": "CPR.global.stats.tech",
          "data.stats.cool.value": "CPR.global.stats.cool",
          "data.stats.will.value": "CPR.global.stats.will",
          "data.stats.luck.max": "CPR.global.stats.luckMax",
          "data.stats.move.value": "CPR.global.stats.move",
          "data.stats.body.value": "CPR.global.stats.body",
          "data.stats.emp.max": "CPR.global.stats.empMax",
        };
      }
      case "combat": {
        return {
          "bonuses.hands": "CPR.effectSheet.combat.stats.numberOfHands",
          "bonuses.initiative": "CPR.effectSheet.combat.stats.initiative",
          "bonuses.maxHumanity": "CPR.effectSheet.combat.stats.maxHumanity",
          "bonuses.maxHp": "CPR.effectSheet.combat.stats.maxHp",
          "bonuses.deathSavePenalty": "CPR.effectSheet.combat.stats.deathPenalty",
          "bonuses.universalAttack": "CPR.effectSheet.combat.stats.universalAttack",
          "bonuses.universalDamage": "CPR.effectSheet.combat.stats.universalDamage",
          "bonuses.attack": "CPR.effectSheet.combat.net.attack",
          "bonuses.defense": "CPR.effectSheet.combat.net.defense",
          "bonuses.perception_net": "CPR.effectSheet.combat.net.perception",
          "bonuses.rez": "CPR.effectSheet.combat.net.rez",
          "bonuses.speed": "CPR.effectSheet.combat.net.speed",
        };
      }
      case "role": {
        return {
          "bonuses.operator": "CPR.global.role.fixer.ability.operator",
          "bonuses.teamwork": "CPR.global.role.exec.ability.teamwork",
          "bonuses.backup": "CPR.global.role.lawman.ability.backup",
          "bonuses.credibility": "CPR.global.role.media.ability.credibility",
          "bonuses.medicalTechCryosystemOperation": "CPR.global.role.medtech.ability.medtechCryo",
          "bonuses.medicalTechPharmaceuticals": "CPR.global.role.medtech.ability.medtechPharma",
          "bonuses.medicine": "CPR.global.role.medtech.ability.medicine",
          "bonuses.surgery": "CPR.global.role.medtech.ability.surgery",
          "bonuses.interface": "CPR.global.role.netrunner.ability.interface",
          "bonuses.backdoor": "CPR.global.role.netrunner.interfaceAbility.backdoor",
          "bonuses.cloak": "CPR.global.role.netrunner.interfaceAbility.cloak",
          "bonuses.control": "CPR.global.role.netrunner.interfaceAbility.control",
          "bonuses.eyedee": "CPR.global.role.netrunner.interfaceAbility.eyedee",
          "bonuses.pathfinder": "CPR.global.role.netrunner.interfaceAbility.pathfinder",
          "bonuses.scanner": "CPR.global.role.netrunner.interfaceAbility.scanner",
          "bonuses.slide": "CPR.global.role.netrunner.interfaceAbility.slide",
          "bonuses.virus": "CPR.global.role.netrunner.interfaceAbility.virus",
          "bonuses.zap": "CPR.global.role.netrunner.interfaceAbility.zap",
          "bonuses.moto": "CPR.global.role.nomad.ability.moto",
          "bonuses.charismaticImpact": "CPR.global.role.rockerboy.ability.charismaticImpact",
          "bonuses.combatAwareness": "CPR.global.role.solo.ability.combatAwareness",
          "bonuses.damageDeflection": "CPR.global.role.solo.ability.damageDeflection",
          "bonuses.fumbleRecovery": "CPR.global.role.solo.ability.fumbleRecovery",
          "bonuses.initiativeReaction": "CPR.global.role.solo.ability.initiativeReaction",
          "bonuses.precisionAttack": "CPR.global.role.solo.ability.precisionAttack",
          "bonuses.spotWeakness": "CPR.global.role.solo.ability.spotWeakness",
          "bonuses.threatDetection": "CPR.global.role.solo.ability.threatDetection",
          "bonuses.fabricationExpertise": "CPR.global.role.tech.ability.fabricationExpertise",
          "bonuses.fieldExpertise": "CPR.global.role.tech.ability.fieldExpertise",
          "bonuses.inventionExpertise": "CPR.global.role.tech.ability.inventionExpertise",
          "bonuses.maker": "CPR.global.role.tech.ability.maker",
          "bonuses.upgradeExpertise": "CPR.global.role.tech.ability.upgradeExpertise",
        };
      }
      // "custom" drops through here
      default:
    }
    return {};
  }

  /**
   * We use temporary objects with keys derived from skill names elsewhere in the code base.
   * We need to be able to programmatically produce those keys from the name, and that is
   * what this method does. It takes a string and converts it to camelcase.
   *
   * These are used as parts of translation string identifies too. Examples:
   *  "CPR.global.skills.languageStreetslang"               "CPR.global.skills.athleticsAndContortionist"
   *  "CPR.global.skills.basicTechAndWeaponstech"           "CPR.global.skills.compositionAndEducation"
   *  "CPR.global.skills.enduranceAndResistTortureAndDrugs" "CPR.global.skills.persuasionAndTrading"
   *  "CPR.global.skills.evasionAndDance"                   "CPR.global.skills.pickLockAndPickPocket"
   *  "CPR.global.skills.firstAidAndParamedicAndSurgery"
   *
   * NOTE: The strings above are used for Elfines characters, and not used in the code base anywhere. We
   *       have CI that checks all translation strings are used, so to avoid making that fail, please
   *       keep the examples here.
   *
   * TODO: not sure returning something based on the name will work with localization
   *
   * @returns {String}
   */
  static slugify(name) {
    LOGGER.trace("slugify | CPRSkillItem | Called.");
    const slug = name;
    const initialSplit = slug.split(" ").join("");
    const orCaseSplit = initialSplit.split("/").join("Or");
    const parenCaseSplit = initialSplit.split("(").join("").split(")").join("");
    const andCaseSplit = initialSplit.split("/").join("And").split("&").join("And");
    if (slug === "Conceal/Reveal Object" || slug === "Paint/Draw/Sculpt" || slug === "Resist Torture/Drugs") {
      return orCaseSplit.charAt(0).toLowerCase() + orCaseSplit.slice(1);
    }
    if (slug === "Language (Streetslang)") {
      return parenCaseSplit.charAt(0).toLowerCase() + parenCaseSplit.slice(1);
    }
    return andCaseSplit.charAt(0).toLowerCase() + andCaseSplit.slice(1);
  }

  /**
   * Given a key category (skill, role, stat, etc) and a key, return the human-readable
   * name for it. Used in item sheets that have active effects.
   *
   * @param {String} category - see GetEffectModifierMap for valid values
   * @param {String} key - e.g. "bonuses.perception"
   * @returns {String}
   */
  static GetEffectModifierKeyName(category, key) {
    LOGGER.trace("GetEffectModifierKeyName | CPRSystemUtils | Called.");
    if (category === "custom") return key;
    return CPRSystemUtils.GetEffectModifierMap(category)[key];
  }

  /**
   * Return an array of data model templates associated with this Item's type. "common" is intentionally
   * omitted because nothing should operate on it. The logic for common Item functionality should be in
   * this very file.
   *
   * @returns {Array} - array of template names which just happens to match mixins available
   */
  static getDataModelTemplates(itemType) {
    LOGGER.trace("getDataModelTemplates | CPRSystemUtils | Called.");
    return game.system.template.Item[itemType].templates.filter((t) => t !== "common");
  }

  /**
   * Answer whether an item has a specific data model template applied or not
   */
  static hasDataModelTemplate(itemType, template) {
    LOGGER.trace("hasDataModelTemplate | CPRSystemUtils | Called.");
    return CPRSystemUtils.getDataModelTemplates(itemType).includes(template);
  }

  /**
   * Return the list of actions that can be taken with this item. Used by the actor sheet.
   * Note that "pin" is left out, it is hardcoded in the sheet code.
   *
   * @param {ItemData} itemData - the item data we will be inspecting
   * @returns {String[]} - array of actions that can be taken
   */
  static getActions(itemData) {
    LOGGER.trace("getActions | CPRItem | Called.");
    const mixins = CPRSystemUtils.getDataModelTemplates(itemData.type);
    const actions = ["delete"];
    for (let m = 0; m < mixins.length; m += 1) {
      switch (mixins[m]) {
        case "drug": {
          if (itemData.data.amount > 0) actions.push("snort");
          break;
        }
        case "equippable": {
          actions.push("equip");
          break;
        }
        case "installable": {
          if (!itemData.data.isInstalled) actions.push("install");
          else actions.push("uninstall");
          break;
        }
        case "loadable": {
          actions.push("reload");
          actions.push("changeAmmo");
          break;
        }
        case "physical": {
          if (itemData.data.concealable.concealable) actions.push("conceal");
          break;
        }
        case "spawner": {
          actions.push("rez");
          break;
        }
        case "stackable": {
          if (itemData.data.amount > 1) actions.push("split");
          break;
        }
        default:
      }
    }
    return actions;
  }
}
