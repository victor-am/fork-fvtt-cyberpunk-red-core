import LOGGER from "../utils/cpr-logger.js";

export default async function preloadHandlebarsTemplates() {
  LOGGER.log("Calling Preload Handlebars")
    return loadTemplates([
  
      // Shared Actor Partials
      "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-stat-block.hbs",
      
      // Character Sheet Partials
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-skills.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-role.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-combat.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-inventory.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-cyberware.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-information.hbs",
      // Mook Sheet Partials

      // Item Sheet Partials
      "systems/cyberpunk-red-core/templates/item/parts/cpr-header.hbs",
      "systems/cyberpunk-red-core/templates/item/parts/cpr-info-pane-skill.hbs",
      "systems/cyberpunk-red-core/templates/item/parts/cpr-description.hbs"
    ]);
  }