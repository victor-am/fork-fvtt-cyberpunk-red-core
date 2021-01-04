import LOGGER from "./cpr-logger.js";

export default class CPRSystemUtils {
    static async GetCoreSkills() {
        LOGGER.trace(`CPRActorUtils GetAllSkills | CPRActorUtils | called.`);
        // grab basic skills from compendium
        const pack = game.packs.get("cyberpunk-red-core.skills");
        // put into basickSkills array
        let content = await pack.getContent();
        return content;
      }
}