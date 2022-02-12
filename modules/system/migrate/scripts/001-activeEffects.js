/* global */

import CPRMigration from "../cpr-migration.js";
import CPRSystemUtils from "../../../utils/cpr-systemUtils.js";
import LOGGER from "../../../utils/cpr-logger.js";

export default class ActiveEffectsMigration extends CPRMigration {
  constructor() {
    LOGGER.trace("constructor | 1-activeEffects Migration");
    super();
    this.version = 1;
  }

  /**
   * The actors were updated in 2 ways.
   *    Universal Attack Bonus and Damage --> corresponding AE
   *    Deleted skill and role properties.
   *
   * @async
   * @static
   * @param {CPRActor} actor
   */
  static async updateActor(actor) {
    LOGGER.trace("updateActor | 1-activeEffects Migration");
    // const newActor = actor;
    if (!(actor.data.type === "character" || actor.data.type === "mook")) return;
    const updateData = {};
    if (actor.data.data.universalBonuses.attack !== 0) {
      const name = CPRSystemUtils.Localize("CPR.migration.effects.attackName");
      await ActiveEffectsMigration.addActorEffect(actor, name, "combat", "bonuses.universalAttack", actor.data.data.universalBonuses.attack);
    }
    if (actor.data.data.universalBonuses.damage !== 0) {
      const name = CPRSystemUtils.Localize("CPR.migration.effects.damageName");
      await ActiveEffectsMigration.addActorEffect(actor, name, "combat", "bonuses.universalDamage", actor.data.data.universalBonuses.damage);
    }

    // Deleting properties requires this special Foundry-specific magic. You create additional properties with "-=" appended
    // to the end, and the update() interprets that as, "delete the property with the same name but without the '-=' part."
    // Using delete or setting existing properties to null produces errors from update().
    updateData["data.-=skills"] = null;
    updateData["data.-=roleInfo"] = null;
    updateData["data.-=universalBonuses"] = null;
    await actor.update(updateData);
  }

  /**
   * Mutator that adds an active effect to the given actor. The name, key (stat), and value must also be provided.
   * Used when arbitrary mods are discovered on an actor and they must be preserved as AEs going forward.
   * This assumes exactly 1 change for the effect!
   *
   * @param {CPRActor} actor
   * @param {String} effectName - (hopefully localized) name for the active effect
   * @param {String} effectKey - dot-notation key of the stat being changed (see GetEffectModifierMap in cpr-systemUtils.js)
   * @param {Number} effectValue - how much the key is being changed by
   * @returns {CPRActiveEffect}
   */
  static async addActorEffect(actor, effectName, effectCat, effectKey, effectValue) {
    LOGGER.trace("addActorEffect | 1-activeEffects Migration");
    const [effect] = await actor.createEffect();
    actor.updateEmbeddedDocuments("ActiveEffect", [{
      _id: effect.id,
      label: effectName,
      changes: [{
        key: effectKey,
        mode: 2,
        value: effectValue,
        priority: effect.data.changes.length,
      }],
      "flags.cyberpunk-red-core.changes.0": effectCat,
    }]);
  }

  /**
   * Items changed in so many ways it seemed best to break out a separate migration
   * path for each item type. Here's the complete of changes in psuedocode.
   *  Ammo
   *    Lost quality
   *    Lost upgradeable properties
   *    Gained concealable
   *    if price is 0 and category is empty, set to 100/premium
   *    if variety is empty set to heavyPistol
   *    if type is empty set to basic
   *  Armor
   *    Lost quality
   *    Lost amount - create duplicate items
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  Clothing
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *    if type is empty set to jacket
   *    if style is empty set to genericChic
   *  Cyberware
   *    Migrate Upgrades
   *    Lost charges
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  Cyberdeck
   *    Lost quality
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  Drugs - Newly introduced, no migration needed
   *  Gear
   *    Lost quality
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  NetArch
   *    Lost quality
   *    Lost amount - create duplicate items
   *    if price is 0 and category is empty, set to 100/premium
   *  Program
   *    Lost quality
   *    Lost amount - create duplicate items
   *    "modifiers" property converted to AEs
   *    Lost slots - whoops?
   *    if price is 0 and category is empty, set to 100/premium
   *    Lost isDemon
   *  Skill:
   *    "skillmod" property converted to AEs
   *  Role:
   *    "skillBonuses" became "bonuses"
   *  CriticalInjury
   *    Add new AEs to model stat/skill effects
   *    No data model changes though.
   *  Vehicle
   *    Lost quality
   *    Lost ammount - create duplicate items
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  itemUpgrades
   *    Lost quality
   *    Lost amount - create duplicate items
   *    Lost charges
   *    confirm how upgrades and slots work
   *    modifiers.secondaryWeapon.configured = false if not already defined
   *    if price is 0 and category is empty, set to 100/premium
   *  Weapon
   *    Lost quality - "excellent" should become an AE for Universal Attack
   *    Lost amount - create duplicate items
   *    Lost charges
   *    Gained slots for upgrades
   *
   * TODO: is this just the item directory, or does it include or owned items?
   * TODO: understand how upgrade slots work for different item types
   *       this was originally in a case statement in the item code, now split per-type
   *       can subclasses override a function provided by the upgradeable mixin?
   *
   * @param {CPRItem} item
   */
  updateItem(item) {
    LOGGER.trace("updateItem | 1-activeEffects Migration");
    switch (item.type) {
      default:
        // ammo, drugs, and netarch drop through here
    }
  }
}
