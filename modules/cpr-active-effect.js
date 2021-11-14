/* global ActiveEffect game */
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
   * @return {Array}
   */
  getAllowedUsage() {
    LOGGER.trace("getAllowedUsage | CPRActiveEffect | Called.");
    const usageAllowed = ["always", "toggled"];
    const parentItem = this.getItem();
    if (SystemUtils.hasDataModelTemplate(parentItem.data.type, "consumable")) {
      usageAllowed.push("consumed");
    }
    if (SystemUtils.hasDataModelTemplate(parentItem.data.type, "physical")) {
      usageAllowed.push("carried");
      usageAllowed.push("equipped");
    }
    return usageAllowed;
  }

  /**
   * Get the item that provides this active effect. You might think this is simply
   * this.parent, but that returns the actor if this is on an owned item! Instead
   * we use the origin property and follow that.
   */
  getItem() {
    LOGGER.trace("getItem | CPRActiveEffect | Called.");
    // Example origin value: "Actor.voAMugZgXyH2OG9l.Item.ioY6vLPzo2ZuhXuS"
    const { origin } = this.data;
    let retVal = null;
    if (origin.startsWith("Item")) {
      // This AE is on unowned item, we can just use the parent property
      retVal = this.parent;
    } else if (origin.startsWith("Actor")) {
      // This AE is on an item owned by an actor
      const originBits = origin.split(".");
      const actor = game.actors.find((a) => a.id === originBits[1]);
      retVal = actor.items.find((i) => i.data._id === originBits[3]);
    } else {
      LOGGER.error(`This AE origin is crazy! ${origin}`);
    }
    return retVal;
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
    const parentItem = this.getItem();
    if (!(SystemUtils.hasDataModelTemplate(parentItem.data.type, "physical"))) {
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
