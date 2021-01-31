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
}
