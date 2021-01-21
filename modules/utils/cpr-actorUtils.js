/* global game */
import LOGGER from "./cpr-logger";

export default class CPRActorUtils {
  // Optional
  static async GetActorSkills() {
    LOGGER.trace("CPRActorUtils GetBasicSkills | CPRActorUtils | called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    const content = await pack.getContent();
    return content.filter((i) => i.data.data.basic).map((i) => i.data);
  }

  // Default
}
