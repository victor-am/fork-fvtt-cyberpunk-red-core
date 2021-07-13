/* global game */

import LOGGER from "./cpr-logger.js";

export default class CPRActorUtils {
  // Optional
  static async GetActorSkills() {
    LOGGER.trace("GetActorSkills | CPRActorUtils | Called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    const content = await pack.getDocuments();
    return content.filter((i) => i.data.data.basic).map((i) => i.data);
  }

  // Default
}
