import LOGGER from "./cpr-logger.js";

export default class ActorUtils {

  static async getSkills() {
    LOGGER.trace(`Actor _addBasicSkills | ActorUtils | called.`);
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    let content = await pack.getContent();
    return content;
  }
}