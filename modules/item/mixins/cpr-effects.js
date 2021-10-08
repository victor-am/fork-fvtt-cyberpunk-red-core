/* global $ */

import LOGGER from "../../utils/cpr-logger.js";
import CPRSystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * The Effects mixin in where the logic lives for managing active effects associated with Items.
 */
const Effects = function Effects() {
  /**
   * This method strives to provide what is needed for a good user experience when associating effects with
   * the stats they change. The intent is to present a bunch of readable names, and map them to internal
   * data structures.
   *
   * TODO: make this more dynamic
   * TODO: still very incomplete
   *
   * @returns {Object} - a big dictionary of data paths to user-readable names. Used in Item Sheet UIs.
   */
  this.getSupportedStats = function getSupportedStats() {
    return {
      "stats.luck": CPRSystemUtils.Localize("CPR.global.stats.luck"),
      "stats.dex.value": CPRSystemUtils.Localize("CPR.global.stats.dex"),
      "skills.perception": CPRSystemUtils.Localize("CPR.global.skills.perception"),
      "derivedStats.hp": CPRSystemUtils.Localize("CPR.global.generic.hitpoints"),
      "universalBonuses.attack": CPRSystemUtils.Localize("CPR.itemSheet.weapon.attackMod"),
    };
  };

  /**
   * A dispatcher for calling methods that affect active effects.
   *
   * @param {Object} event - object representing what was clicked, dragged, etc
   * @returns - usually the impacted active effect, or null if something was invalid in the event
   */
  this.manageEffects = function manageEffects(event) {
    LOGGER.trace("manageEffects | Effects | Called.");
    event.preventDefault();
    const action = $(event.currentTarget).attr("data-effect-action");
    LOGGER.debug(`managing effects: ${action}`);
    switch (event.action) {
      case "create":
        return this.createEffect();
      case "edit": {
        const effectId = $(event.currentTarget).attr("data-effect-id");
        const effect = this.items.find((i) => i.data._id === effectId);
        return this.editEffect(effect);
      }
      case "delete": {
        const effectId = $(event.currentTarget).attr("data-effect-id");
        const effect = this.items.find((i) => i.data._id === effectId);
        return this.deleteEffect(effect);
      }
      case "toggle": {
        const effectId = $(event.currentTarget).attr("data-effect-id");
        const effect = this.items.find((i) => i.data._id === effectId);
        return this.toggleEffect(effect);
      }
      default:
        LOGGER.error(`Unknown effects action: ${action}`);
    }
    return null;
  };

  /**
   * Create a new active effect for this item. This sets up all the defaults.
   * Note: It would be nice to add custom properties, but they seem to be ignored by Foundry.
   * This is why we provide a custom CPRActiveEffect object elsewhere in the code base.
   *
   * @returns {ActiveEffect} - the newly created document
   */
  this.createEffect = function createEffect() {
    LOGGER.trace("addEffect | Effects | Called.");
    return this.createEmbeddedDocuments("ActiveEffect", [{
      label: CPRSystemUtils.Localize("CPR.itemSheet.effects.newEffect"),
      icon: "icons/svg/aura.svg",
      origin: this.uuid,
      disabled: false,
    }]);
  };

  /**
   * Delete the active effect on this item with an ID of "eid"
   *
   * @param {String} eid - active effect ID
   * @returns - the deleted document
   */
  this.deleteEffect = function deleteEffect(eid) {
    LOGGER.trace("deleteEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    return effect.delete();
  };

  /**
   * Open up the dialog/sheet for editing an active effect with the given ID
   *
   * @param {String} eid - active effect ID
   * @returns
   */
  this.editEffect = function editEffect(eid) {
    LOGGER.trace("editEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    return effect.sheet.render(true);
  };

  /**
   * Return the active effect object on this item with the given ID. Should be used everywhere to
   * ensure proper error checking.
   *
   * @param {String} eid - active effect ID
   * @returns {ActiveEffect}
   */
  this.getEffect = function getEffect(eid) {
    LOGGER.trace("getEffect | Effects | Called.");
    const effect = this.data.effects.get(eid);
    if (!effect) {
      LOGGER.error(`Active effect ${eid} does not exist!`);
      return null;
    }
    return effect;
  };

  /**
   * Short hand method for getting all active effects on this item.
   *
   * @returns {Map} - all active effects on the item, even disabled ones
   */
  this.getAllEffects = function getAllEffects() {
    LOGGER.trace("getAllEffects | Effects | Called.");
    return this.data.effects;
  };

  /**
   * Short hand method for getting all mods in an effect.
   *
   * @param {String} eid - active effect ID
   * @returns {Array} - array of tuples in the form [stat, value]
   */
  this.getAllModsForEffect = function getAllModsForEffect(eid) {
    LOGGER.trace("getAllModsForEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    return effect.data.changes;
  };

  /**
   * Rename an active effect on this item with the given name.
   *
   * @param {String} eid - active effect ID
   * @param {String} name - new name (label) for the active effect
   * @returns {ActiveEffect}
   */
  this.renameEffect = function renameEffect(eid, name) {
    LOGGER.trace("setModOnEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    LOGGER.debug(`Setting name on ${eid} to ${name}`);
    return effect.update({ label: name });
  };

  /**
   * Add a modifier to the given active effect on this item. Valid mods are objects like this:
   * {
   *    key: "abilities.dex.mod"
   *    mode: 2
   *    priority: 10   <-- implies an order to applying effects; not used in this system
   *    value: "20"
   * }
   *
   * mode is an enum with the following behaviors:
   *    0 (CUSTOM) - calls the "applyActiveEffect" hook with the value to figure out what to do with it
   *    1 (MULTIPLY) - multiply this value with the current one
   *    2 (ADD) - add this value to the current value (as an Integer) or set it if currently null
   *    3 (DOWNGRADE) - like OVERRIDE but only replace if the value is lower (worse)
   *    4 (UPGRADE) - like OVERRIDE but only replace if the value is higher (better)
   *    5 (OVERRIDE) - replace the current value with this one
   *
   * Note: Only 1, 2, and 5 is used in this system
   *
   * @param {*} eid - active effect ID
   * @param {*} mod - the mod to add, see above for structure
   * @returns {ActiveEffect} - the active effect that was modified
   */
  this.setModOnEffect = function setModOnEffect(eid, mod) {
    LOGGER.trace("setModOnEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    // check that ability is valid!
    const changes = effect.data.changes.push(mod);
    effect.update({ changes });
    return effect;
  };

  /**
   * Enable or disable the mods on an active effect on this item.
   *
   * @param {String} eid - active effect ID
   * @returns {ActiveEffect}
   */
  this.toggleEffect = function toggleEffect(eid) {
    LOGGER.trace("toggleEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    const value = !effect.data.disabled;
    LOGGER.debug(`Setting disabled on ${eid} to ${value}`);
    return effect.update({ disabled: value });
  };
};

export default Effects;
