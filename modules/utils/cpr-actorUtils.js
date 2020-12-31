import LOGGER from "./cpr-logger.js";

export default class ActorUtils {

  static async getBasicSkills() {
    LOGGER.trace(`Actor _addBasicSkills | ActorUtils | called.`);
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    let content = await pack.getContent();
    return content.filter(i => i.data.data.basic).map(i => i.data);
  }
}