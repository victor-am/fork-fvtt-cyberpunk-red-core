import LOGGER from "./cpr-logger.js";

export default class CPRSystemUtils {
    static async GetCoreSkills() {
        LOGGER.trace(`CPRSystemUtils GetCoreSkills | CPRSystemUtils | called.`);
        // grab basic skills from compendium
        const pack = game.packs.get("cyberpunk-red-core.skills");
        // put into basickSkills array
        let content = await pack.getContent();
        return content;
      }

      static async SendWarningMessage (msg) {
        let localizedMessage = game.i18n.localize(msg);
        ui.notifications.warn(localizedMessage);
      }

      static async SendErrorMessage (msg) {
        let localizedMessage = game.i18n.localize(msg);
        ui.notifications.error(localizedMessage);
      }
}