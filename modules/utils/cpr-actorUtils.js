import LOGGER from "./cpr-logger.js";

export default class CPRActorUtils {

  // Optional
  static async GetBasicSkills() {
    LOGGER.trace(`CPRActorUtils getBasicSkills | CPRActorUtils | called.`);
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    let content = await pack.getContent();
    return content.filter(i => i.data.data.basic).map(i => i.data);
  }

  // Default
  static async GetAllSkills() {
    LOGGER.trace(`CPRActorUtils GetAllSkills | CPRActorUtils | called.`);
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    let content = await pack.getContent();
    return content;
  }
}