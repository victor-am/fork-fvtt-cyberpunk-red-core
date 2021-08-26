/* global loadTemplates */
import LOGGER from "../utils/cpr-logger.js";

export default function preloadHandlebarsTemplates() {
  LOGGER.log("Calling Preload Handlebars");
  return loadTemplates([
    // Chat Partials
    "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs",
    "systems/cyberpunk-red-core/templates/chat/cpr-damage-rollcard.hbs",
    "systems/cyberpunk-red-core/templates/chat/cpr-damage-application-card.hbs",

    // Dialog Partials
    "systems/cyberpunk-red-core/templates/dialog/cpr-confirmation-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-damage-application-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-improvement-point-edit-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-install-cyberware-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-ledger-form.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-load-ammo-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-mod-mook-skill-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-mook-name-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-roll-critical-injury-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-select-compatible-ammo-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/cpr-split-item-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-cyberdeck-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-damage-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-deathsave-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-generic-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-roleAbility-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-skill-prompt.hbs",
    "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-stat-prompt.hbs",

    // Left Pane Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-deathsave-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-handle-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-hitpoint-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-humanity-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-image-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-ip-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-role-block.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/left-pane/cpr-stat-block.hbs",

    // Right Pane Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/cpr-cyberware.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/cpr-gear.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/cpr-skills.hbs",

    // Bottom Pane Actor Partials
    "systems/cyberpunk-red-core/templates/actor/parts/bottom-pane/cpr-fight.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/bottom-pane/cpr-lifepath.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/bottom-pane/cpr-role.hbs",

    // Skill Tab Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/skills/cpr-skills-category.hbs",

    // Gear Tab Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-ammo-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-armor-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-clothing-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-cyberdeck-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-cyberware-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-cyberware-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-gear-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-itemUpgrade-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-program-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-program-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-vehicle-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/gear/cpr-weapon-content.hbs",

    // Cyberware Tab Partials
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/cyberware/cpr-cyberware-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/right-pane/parts/cyberware/cpr-cyberware-header.hbs",

    // Common Partials - Actions
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-actions.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-dv-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-equip-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-install-cyberware-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-install-programs-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-reload-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-repair-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-split-item.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-uninstall-glyph.hbs",
    "systems/cyberpunk-red-core/templates/actor/parts/common/actions/cpr-upgrade-glyph.hbs",

    // Debug
    "systems/cyberpunk-red-core/templates/actor/parts/debug/cpr-item-debug.hbs",
    "systems/cyberpunk-red-core/templates/actor/work-in-progress.hbs",

    // Mook Sheet Partials
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-armor.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-criticalInjury.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-cyberware.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-image.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-program.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-sheet-limited.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-skills.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-stats.hbs",
    "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-weapons.hbs",

    // Container Sheet
    "systems/cyberpunk-red-core/templates/actor/container/cpr-container-actions.hbs",
    "systems/cyberpunk-red-core/templates/actor/container/cpr-item-content.hbs",
    "systems/cyberpunk-red-core/templates/actor/cpr-container-sheet.hbs",

    // Item Sheet
    "systems/cyberpunk-red-core/templates/item/cpr-item-sheet.hbs",

    // Item Sheet - Header Partials
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-ammo.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-armor.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-clothing.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-criticalInjury.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-cyberdeck.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-cyberware.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-gear.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-itemUpgrade.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-netarch.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-program.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-skill.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-vehicle.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/header/cpr-weapon.hbs",
    // Item Sheet - Description Partials
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-ammo.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-armor.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-clothing.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-criticalInjury.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-cyberdeck.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-cyberware.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-gear.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-itemUpgrade.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-netarch.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-program.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-skill.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-vehicle.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/description/cpr-weapon.hbs",
    // Item Sheet - Settings Partials
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-ammo.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-armor.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-clothing.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-criticalInjury.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-cyberdeck.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-cyberware.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-gear.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-itemUpgrade.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-netarch.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-program.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-skill.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-vehicle.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/cpr-weapon.hbs",
    // Item Sheet - Settings Common Partials
    "systems/cyberpunk-red-core/templates/item/parts/settings/common/cpr-item-name.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/common/cpr-physical-item.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/common/cpr-upgradable-item.hbs",
    "systems/cyberpunk-red-core/templates/item/parts/settings/common/cpr-item-settings.hbs",
  ]);
}
