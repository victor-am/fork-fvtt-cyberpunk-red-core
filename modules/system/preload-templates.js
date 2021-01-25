/* global loadTemplates */
import LOGGER from "../utils/cpr-logger.js";

export default function preloadHandlebarsTemplates() {
<<<<<<< HEAD
  LOGGER.log("Calling Preload Handlebars")
    return loadTemplates([

      // Chat Partials
      "systems/cyberpunk-red-core/templates/chat/cpr-rollcard.hbs",

      // Dialog Partials
      "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-prompt.hbs",
      "systems/cyberpunk-red-core/templates/dialog/cpr-select-ammo-prompt.hbs",

      // Shared Actor Partials
      "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-stat-block.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-image-block.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-hitpoint-block.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-handle-block.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-equip-glyph.hbs",

      // Character Sheet Partials
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-skills.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-item-debug.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-role.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-combat.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-inventory.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-cyberware.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-information.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-deathsave-block.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-humanity-block.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/cpr-role-block.hbs",
      // Inventory Partials
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-weapon-inventory-header.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-weapon-inventory-content.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-ammo-inventory-header.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-ammo-inventory-content.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-armor-inventory-header.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-armor-inventory-content.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-gear-inventory-header.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-gear-inventory-content.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-vehicle-inventory-header.hbs",
      "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/cpr-vehicle-inventory-content.hbs",

      // Mook Sheet Partials

      // Item Sheet Partials
      "systems/cyberpunk-red-core/templates/item/parts/cpr-header.hbs",
      "systems/cyberpunk-red-core/templates/item/parts/cpr-info-pane-skill.hbs",
      "systems/cyberpunk-red-core/templates/item/parts/cpr-info-pane-armor.hbs",
      "systems/cyberpunk-red-core/templates/item/parts/cpr-description.hbs"
    ]);
  }
=======
  LOGGER.log("Calling Preload Handlebars");
  return loadTemplates([
    // Chat Partials
    "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs",
    "systems/cyberpunk-red-core/templates/chat/cpr-damage-rollcard.hbs",

    // Dialog Partials
    "systems/cyberpunk-red-core/templates/dialog/cpr-install-cyberware-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-confirmation-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-select-ammo-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-base-roll-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-damage-roll-prompt.hbs",

    // Shared Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-stat-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-image-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-hitpoint-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-handle-block.hbs",

    // Character Sheet Partials
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-skills.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-item-debug.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-role.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-combat.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-inventory.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-cyberware.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-information.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-deathsave-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-humanity-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-role-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/cpr-ability-block.hbs",

    // Inventory Item Display Partials
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-weapon-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-ammo-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-armor-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-gear-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-cyberware-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-vehicle-content.hbs",

    // Inventory Control Partials
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-equip-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-reload-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-install-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-repair-glyph.hbs",

    // Cyberware Partials
    "systems/cyberpunk-red-core/templates/actor/parts/common/cyberware/cpr-cyberware-header.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cyberware/cpr-cyberware-content.hbs",

    // Mook Sheet Partials

    // Item Sheet Partials
    "systems/cyberpunk-red-core/templates/item/parts/cpr-header.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/cpr-info-pane-skill.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/cpr-info-pane-armor.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/cpr-description.hbs",
  ]);
}
>>>>>>> dev
