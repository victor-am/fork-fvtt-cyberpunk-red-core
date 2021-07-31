/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* global game, ui */
import LOGGER from "./cpr-logger.js";

export default class CPRSystemUtils {
  static async GetCoreSkills() {
    LOGGER.trace("GetCoreSkills | CPRSystemUtils | Called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSills array
    const content = await pack.getDocuments();
    return content;
  }

  static async GetCoreCyberware() {
    LOGGER.trace("GetCoreCyberware | CPRSystemUtils | Called.");
    // grab basic cyberware from compendium
    const pack = game.packs.get("cyberpunk-red-core.cyberware");
    // put into basicCyberware array
    const content = await pack.getDocuments();
    return content;
  }

  static async DisplayMessage(msgType, msg) {
    LOGGER.trace("DisplayMessage | CPRSystemUtils | Called.");
    const localizedMessage = game.i18n.localize(msg);
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

  static async GetFolder(type, name) {
    LOGGER.trace("GetFolder | CPRSystemUtils | Called.");
    const folderList = game.folders.filter((folder) => folder.name === name && folder.type === type);
    // If the folder does not exist, we create it.
    return (folderList.length === 1) ? folderList[0] : Folder.create({ name, type });
  }

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
}
