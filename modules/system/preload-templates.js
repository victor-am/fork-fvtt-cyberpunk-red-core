/* global loadTemplates */
import LOGGER from "../utils/cpr-logger.js";

export default function preloadHandlebarsTemplates() {
  LOGGER.log("Calling Preload Handlebars");
  return loadTemplates([
    // Chat Partials
    "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs",
    "systems/cyberpunk-red-core/templates/chat/cpr-damage-rollcard.hbs",

    // Dialog Partials
    "systems/cyberpunk-red-core/templates/dialog/cpr-install-cyberware-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-confirmation-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-select-ammo-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-attack-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-damage-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-generic-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-roleAbility-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-skill-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-stat-prompt.hbs",

    // Shared Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-stat-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-image-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-hitpoint-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-handle-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-combat-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/cpr-deathsave-block.hbs",

    // Character Sheet Partials
    // Blocks - Main Sheet
    "systems/cyberpunk-red-core/templates/actor/parts/character-blocks/cpr-humanity-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/character-blocks/cpr-role-block.hbs",
    // Tabs
    "systems/cyberpunk-red-core/templates/actor/parts/tabs/cpr-skills.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/skills/cpr-skills-category.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/tabs/cpr-item-debug.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/tabs/cpr-role.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/tabs/cpr-inventory.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/tabs/cpr-gear.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/tabs/cpr-cyberware.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/tabs/cpr-information.hbs",

    // Inventory Item Display Partials
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-weapon-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-ammo-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-armor-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-gear-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-cyberware-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/content/cpr-vehicle-content.hbs",

    // Inventory Control Partials
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-actions.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-equip-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-reload-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-install-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/inventory/actions/cpr-uninstall-glyph.hbs",
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
    "systems/cyberpunk-red-core/templates/item/parts/details/cpr-details-physical.hbs",
  ]);
}
