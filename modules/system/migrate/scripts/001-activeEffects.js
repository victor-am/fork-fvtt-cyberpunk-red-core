import CPRMigration from "../cpr-migration.js";
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
   *    Deleted skill and role properties. I think this is a no-op.
   *
   * @param {CPRActor} actor
   */
  updateActor(actor) {
    LOGGER.trace("updateActor | 1-activeEffects Migration");
  }

  /**
   * Items changed in so many ways it seemed best to break out a separate migration
   * path for each item type. Here's the complete of changes in psuedocode.
   *  Ammo
   *    Lost quality - NO-OP
   *    Lost upgradeable properties - NO-OP
   *    Gained concealable - NO-OP
   *    if price is 0 and category is empty, set to 100/premium
   *    if variety is empty set to heavyPistol
   *    if type is empty set to basic
   *  Armor
   *    Lost quality - NO-OP
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
   *    Lost charges - NO-OP
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  Cyberdeck
   *    Lost quality - NO-OP
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  Drugs - Newly introduced, no migration needed
   *  Gear
   *    Lost quality - NO-OP
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  NetArch
   *    Lost quality - NO-OP
   *    Lost amount - create duplicate items
   *    if price is 0 and category is empty, set to 100/premium
   *  Program
   *    Lost quality - NO-OP
   *    Lost amount - create duplicate items
   *    "modifiers" property converted to AEs
   *    Lost slots - whoops?
   *    if price is 0 and category is empty, set to 100/premium
   *    Lost isDemon - NO-OP
   *  Skill:
   *    "skillmod" property converted to AEs
   *  Role:
   *    "skillBonuses" became "bonuses"
   *  CriticalInjury
   *    Add new AEs to model stat/skill effects
   *    No data model changes though.
   *  Vehicle
   *    Lost quality - NO-OP
   *    Lost ammount - create duplicate items
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *  itemUpgrades
   *    Lost quality - NO-OP
   *    Lost amount - create duplicate items
   *    Lost charges - NO-OP
   *    confirm how upgrades and slots work
   *    modifiers.secondaryWeapon.configured = false if not already defined
   *    if price is 0 and category is empty, set to 100/premium
   *  Weapon
   *    Lost quality - "excellent" should become an AE for Universal Attack
   *    Lost amount - create duplicate items
   *    Lost charges - NO-OP
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
      case "ammo":
        this.migrateAmmo(item);
        break;
      default:
        // ammo, drugs, and netarch drop through here
    }
  }
}
