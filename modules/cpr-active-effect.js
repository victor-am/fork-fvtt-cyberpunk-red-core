/* global ActiveEffect */
import LOGGER from "./utils/cpr-logger.js";

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class CPRActiveEffect extends ActiveEffect {
  // XXX: I don't know why this is needed or whether it is even valid js. 5E does it, and without it,
  // there are errors. :(
  // isSuppressed = false;

  /**
   * Get the item that provides this active effect. You might think this is simply
   * this.parent, but that returns the actor if this is on an owned item! Instead
   * we use the origin property and follow that.
   *
   * This method assumes this CPRActiveEffect instance is not on an item but rather
   * an actor.
   */
  getSourceItem() {
    LOGGER.trace("getSourceItem | CPRActiveEffect | Called.");
    // Example origin value for an AE on an actor: "Actor.voAMugZgXyH2OG9l.Item.ioY6vLPzo2ZuhXuS"
    // AE provided by an Item: "Item.ioY6vLPzo2ZuhXuS"
    const [parentType, parentId, documentType, documentId] = this.data.origin?.split(".") ?? [];
    if (parentType === "Item") return this.parent;
    // LOGGER.debugObject(documentType);
    // LOGGER.debugObject(this.data.origin?.split(".") ?? []);
    if ((parentType !== "Actor") || (parentId !== this.parent.id) || (documentType !== "Item")) {
      LOGGER.error("This AE has a crazy origin!");
      return null;
    }
    const item = this.parent.items.get(documentId);
    if (!item) return null;
    return item;
  }

  /**
   * Convenience getter for retrieving how an effect is "used", this is actually stored
   * on the item providing the effect.
   *
   * XXX: LOGGER calls do not work in this getter. I don't know why; use console.
   */
  get usage() {
    LOGGER.trace("get usage | CPRActiveEffect | Called.");
    const item = this.getSourceItem();
    if (!item) return null;
    return item.data.data.usage;
  }

  /**
   * set the key category for a mod
   *
   * @param {Number} num - the index of the mod in the changes array
   * @param {String} category - the key category value to set
   */
  async setModKeyCategory(num, category) {
    LOGGER.trace("setModKeyCategory | CPRActiveEffect | Called.");
    this.setFlag("cyberpunk-red-core", `changes.${num}`, category);
  }

  /**
   * Check if this effect is suppressed before applying it. Taken from the 5E code in
   * active-effect.js.
   *
   * @override
   * @param {CPRActor} actor - who's getting the active effect?
   * @param {Object} change - the change to apply from an effect
   * @returns null if this is suppressed, apply() otherwise
   */
  apply(actor, change) {
    LOGGER.trace("apply | CPRActiveEffect | Called.");
    if (this.data.isSuppressed) return null;
    return super.apply(actor, change);
  }

  /**
   * Determine if this effect is suppressed because of some game mechanic, like the item is not equipped.
   * This was mostly copied from the dnd5e module in active-effect.js.
   *
   * @returns nothing, it only sets the isSuppressed property (it's a mutator)
   */
  determineSuppression() {
    LOGGER.trace("determineSuppression | CPRActiveEffect | Called.");
    this.data.isSuppressed = false;
    if (this.data.disabled || (this.parent.documentName !== "Actor")) return;
    const item = this.getSourceItem();
    this.data.isSuppressed = item.areEffectsSuppressed();
    LOGGER.debug(`isSuppressed is ${this.data.isSuppressed}`);
  }
}
