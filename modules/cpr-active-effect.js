/* global ActiveEffect */
import LOGGER from "./utils/cpr-logger.js";
import SystemUtils from "./utils/cpr-systemUtils.js";

/**
 * An "enum" for different kinds of usage
 */
export const usageValues = {
  ALWAYS: "always",
  CARRIED: "carried",
  CONSUMED: "consumed",
  EQUIPPED: "equipped",
  TOGGLED: "toggled",
};

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class CPRActiveEffect extends ActiveEffect {
  /**
   * Provide a few system-specific properties to ActiveEffects. The logic generally lives
   * in the "effects" mixin for items.
   *
   * Flags are the only way to persist data in ActiveEffects, at least in Foundry 0.8.x. They
   * cannot be extended in template.json, and the document model prevents adding object properties.
   *
   * @override
   * @private
   */
  _onCreate(data, options, userId) {
    LOGGER.trace("_onCreate | CPRActiveEffect | Called.");

    /**
     *
     * Should this active effect be visible to non-GMs?
     * To Do: not currently used; just an idea
     *
     * @type {boolean}
     */
    this.setFlag("cyberpunk-red-core", "revealed", true);

    /**
     * Track how an active effect is turned on and off
     *
     * @type {String}
     */
    this.setFlag("cyberpunk-red-core", "usage", "toggled");

    super._onCreate(data, options, userId);
  }

  /**
   * Based on the activated mixins, determine how an item can be "used" to enable or disable
   * an active effect. This can only be used in the UIs, it is not saved as a property.
   *
   * @override
   */
  prepareDerivedData() {
    LOGGER.trace("prepareDerivedData | CPRActiveEffect | Called.");
    const effectData = this.data;
    const parentItem = this.parent.data;
    effectData.usageAllowed = ["always", "toggled"];
    if (SystemUtils.hasDataModelTemplate(parentItem, "consumable")) {
      effectData.usageAllowed.push("consumed");
    }
    if (SystemUtils.hasDataModelTemplate(parentItem, "physical")) {
      effectData.usageAllowed.push("carried");
      effectData.usageAllowed.push("equipped");
    }
    super.prepareDerivedData();
  }

  /**
   * Some usages require a specific mixin be activated, so we check for that here. In this setter
   * a Flag (in Foundry speak) is used to track the usage property.
   *
   * @param {String} use - the usage value to set
   */
  set usage(use) {
    LOGGER.trace("set usage | CPRActiveEffect | Called.");
    // if this effect is not on a physical object, it cannot be carried or equipped
    if (!(SystemUtils.hasDataModelTemplate(this.parent, "physical"))) {
      if (use === usageValues.CARRIED || use === usageValues.EQUIPPED) {
        LOGGER.error(`Cannot set usage to ${use} on a non-physical item!`);
        return null;
      }
    }
    if (!(Object.values(usageValues).includes(use))) {
      LOGGER.error(`Invalid usage chosen: ${use}`);
      return null;
    }
    this.setFlag("cyberpunk-red-core", "usage", use);
    return use;
  }

  /**
   * Likewise to the setter, this getter retrieves the Flag for usage
   */
  get usage() {
    LOGGER.trace("get usage | CPRActiveEffect | Called.");
    return this.getFlag("cyberpunk-red-core", "usage");
  }
}
