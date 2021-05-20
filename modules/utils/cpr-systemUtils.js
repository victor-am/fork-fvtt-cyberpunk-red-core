/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* global game, ui */
import LOGGER from "./cpr-logger.js";

export default class CPRSystemUtils {
  static async GetCoreSkills() {
    LOGGER.trace("CPRSystemUtils GetCoreSkills | CPRSystemUtils | called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    const content = await pack.getContent();
    return content;
  }

  static async GetCoreCyberware() {
    LOGGER.trace("CPRSystemUtils GetCoreCyberware | CPRSystemUtils | called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.cyberware");
    // put into basickSkills array
    const content = await pack.getContent();
    return content;
  }

  static async DisplayMessage(msgType, msg) {
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

  static Localize(string) {
    return game.i18n.localize(string);
  }

  static Format(string, object) {
    return game.i18n.format(string, object);
  }

  static SetUserSetting(type, name, value, extraSettings) {
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
}
