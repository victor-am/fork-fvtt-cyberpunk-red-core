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

    // Left Pane Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-image-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-handle-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-role-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-hitpoint-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-deathsave-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-humanity-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-stat-block.hbs",

    // Right Pane Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/cpr-skills.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/cpr-gear.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/cpr-cyberware.hbs",

    // Bottom Pane Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/bottom-pane/cpr-role.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/bottom-pane/cpr-fight.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/bottom-pane/cpr-lifepath.hbs",

    // Skill Tab Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/skills/cpr-skills-category.hbs",

    // Gear Tab Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-gear-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-weapon-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-ammo-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-armor-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-cyberware-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-vehicle-content.hbs",

    // Cyberware Tab Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/cyberware/cpr-cyberware-header.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/cyberware/cpr-cyberware-content.hbs",

    // Common Partials - Actions
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-actions.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-equip-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-reload-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-install-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-uninstall-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-repair-glyph.hbs",

    // Debug
    "systems/cyberpunk-red-core/templates/actor/parts/debug/cpr-item-debug.hbs",

    // Mook Sheet Partials

    // Item Sheet Partials
    "systems/cyberpunk-red-core/templates/item/parts/cpr-header.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/cpr-info-pane-skill.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/cpr-info-pane-armor.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/cpr-description.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/details/cpr-details-physical.hbs",
  ]);
}
