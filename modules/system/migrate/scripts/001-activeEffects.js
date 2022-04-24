/* eslint-disable no-await-in-loop */
/* global duplicate Item */

import CPR from "../../config.js";
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
   * Executed before the migration takes place, see run() in the base migration class.
   * For this version, we create an item folder to copy items owned by characters. We do
   * this because active effects cannot be added or changed on owned items. So, we copy
   * an owned item here first, migrate it, and then copy it back to the character.
   */
  async preMigrate() {
    LOGGER.trace("preMigrate | 1-activeEffects Migration");
    CPRSystemUtils.DisplayMessage("notify", "Beginning pre-migration activities");
    this.migrationFolder = await CPRSystemUtils.GetFolder("Item", "Active Effect Migration Workspace");
  }

  /**
   * Copy an (owned) Item into the migration work folder. This will enable active effects to be created
   * or changed on them. If it already exists, just return that.
   *
   * TODO: handle the case of duplicate items in an inventory (name is not precise enough)
   *
   * @param {CPRItem} itemData - the item we are copying
   * @returns the copied item data
   */
  async backupOwnedItem(itemData) {
    LOGGER.trace("backupOwnedItem | 1-activeEffects Migration");
    let [foundItem] = this.migrationFolder.content.filter((i) => i.name === itemData.name);
    if (!foundItem) {
      foundItem = Item.create({
        name: itemData.name,
        type: itemData.type,
        data: itemData.data,
        folder: this.migrationFolder,
      });
    }
    return foundItem;
  }

  /**
   * Takes place after the data migration completes. All we do here is delete the migration
   * folder for owned items, if it is empty. If not, that means 1 or more items did not
   * migrate properly and we leave it behind for a GM to review what to do.
   */
  async postMigrate() {
    LOGGER.trace("postMigrate | 1-activeEffects Migration");
    CPRSystemUtils.DisplayMessage("notify", "Cleaning up migration data...");
    if (this.migrationFolder.content.length === 0) {
      LOGGER.debug("would delete migration folder");
      this.migrationFolder.delete();
    }
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
  async migrateActor(actor) {
    LOGGER.trace("migrateActor | 1-activeEffects Migration");
    // const newActor = actor;
    if (!(actor.data.type === "character" || actor.data.type === "mook")) return;
    let updateData = {};
    if (actor.data.data.universalBonuses.attack && actor.data.data.universalBonuses.attack !== 0) {
      const name = CPRSystemUtils.Localize("CPR.migration.effects.attackName");
      const changes = [{
        key: "bonuses.universalAttack",
        mode: 2,
        value: actor.data.data.universalBonuses.attack,
        priority: 0,
      }];
      // This AE goes on the actor, not the Item itself
      await ActiveEffectsMigration.addActiveEffect(actor, name, changes);
    }
    if (actor.data.data.universalBonuses.damage && actor.data.data.universalBonuses.damage !== 0) {
      const name = CPRSystemUtils.Localize("CPR.migration.effects.damageName");
      const changes = [{
        key: "bonuses.universalDamage",
        mode: 2,
        value: actor.data.data.universalBonuses.damage,
        priority: 0,
      }];
      // This AE goes on the actor, not the Item itself
      await ActiveEffectsMigration.addActiveEffect(actor, name, changes);
    }
    // skill mods are applied directly to the actor because the skill "items" cannot be accessed in the UI,
    // at least not the core ones
    for (const skill of actor.items.filter((i) => i.type === "skill")) {
      if (skill.data.data.skillmod && skill.data.data.skillmod !== 0) {
        const name = ` ${CPRSystemUtils.Localize("CPR.migration.effects.skill")} ${skill.name}`;
        const changes = [{
          key: `bonuses.${CPRSystemUtils.slugify(skill.name)}`,
          mode: 2,
          value: skill.data.data.skillmod,
          priority: 0,
        }];
        // This AE goes on the actor, not the Item itself
        await ActiveEffectsMigration.addActiveEffect(actor, name, changes);
      }
    }
    updateData = { ...updateData, ...CPRMigration.safeDelete(actor, "data.skills") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(actor, "data.roleInfo.roles") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(actor, "data.roleInfo.roleskills") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(actor, "data.universalBonuses") };
    await actor.update(updateData);

    // Finally, migrate their owned items by copying from the item directory to their inventory
    // on success, we delete the item from the directory, they should all be empty at the end.
    // Egregious violation of no-await-in-loop here, but not sure how else to approach.
    let doneItems = 0;
    let ownedItems = JSON.parse(JSON.stringify(actor.items));
    // We deliberately skip skills because for core skills their AEs cannot be edited or viewed
    // They are applied to the actor instead for this migration (see earlier code)
    ownedItems = ownedItems.filter((i) => {
      if (i.type === "skill") return false;
      if (i.type === "cyberware" && i.data.core) return false;
      return true;
    });
    const totalItems = ownedItems.length;
    for (const ownedItem of ownedItems) {
      const newItem = await this.backupOwnedItem(ownedItem);
      try {
        await ActiveEffectsMigration.migrateItem(newItem);
      } catch (err) {
        throw new Error(`${newItem.name} (${newItem.id}) had a migration error: ${err.message}`);
      }
      await actor.createEmbeddedDocuments("Item", [newItem.data]);
      await actor.deleteEmbeddedDocuments("Item", [ownedItem._id]);
      await newItem.delete();
      doneItems += 1;
      if (doneItems % 25 === 0) CPRSystemUtils.DisplayMessage("notify", `${doneItems}/${totalItems} owned items on ${actor.name} migrated so far`);
    }
    CPRSystemUtils.DisplayMessage("notify", `${actor.name} has migrated successfully`);
  }

  /**
   * Mutator that adds an active effect to the given Document. Works for CPRActors and unowned CPRItems.
   *
   * @param {Document} document
   * @param {String} effectName - (hopefully localized) name for the active effect
   * @param {Object} changes - array of changes the active effect provides; each element is an object with 4 properties:
   *   key: {String}                    // whatever stat/ability is being modified e.g. "bonuses.universalDamage"
   *   mode: {Number}                   // the AE mode that is appropriate (see cpr-effects.js, you probably want 2)
   *   value: {Number}                  // how much to change the skill by
   *   priority: {Number}               // the order in which the change is applied, start at 0
   * @returns {CPRActiveEffect}
   */
  static async addActiveEffect(document, effectName, changes) {
    LOGGER.trace("addActiveEffect | 1-activeEffects Migration");
    if (document.isOwned) return;
    const [effect] = await document.createEffect();
    const newData = {
      _id: effect.id,
      label: effectName,
      changes,
    };
    let index = 0;
    changes.forEach((change) => {
      // do a reverse look up on the activeEffectKeys object in config.js; given an AE key, find the category
      // the key category is saved as a flag on the AE document for the UI to pull later
      for (const [category, entries] of Object.entries(CPR.activeEffectKeys)) {
        if (typeof entries[change.key] !== "undefined") {
          newData[`flags.cyberpunk-red-core.changes.${index}`] = category;
          break;
        }
      }
      index += 1;
    });
    document.updateEmbeddedDocuments("ActiveEffect", [newData]);
  }

  /**
   * Items changed in so many ways it seemed best to break out a separate migration
   * path for each item type.
   *
   * TODO: understand how upgrade slots work for different item types
   *       this was originally in a case statement in the item code, now split per-type
   *       can subclasses override a function provided by the upgradeable mixin?
   *
   * @param {CPRItem} item
   */
  static async migrateItem(item) {
    LOGGER.trace("migrateItem | 1-activeEffects Migration");
    switch (item.type) {
      case "ammo":
        await ActiveEffectsMigration.updateAmmo(item);
        break;
      case "armor":
        await ActiveEffectsMigration.updateArmor(item);
        break;
      case "clothing":
        await ActiveEffectsMigration.updateClothing(item);
        break;
      case "criticalInjury":
        await ActiveEffectsMigration.updateCriticalInjury(item);
        break;
      case "cyberdeck":
        await ActiveEffectsMigration.updateCyberdeck(item);
        break;
      case "cyberware":
        // never call this for "core" cyberware on actors!
        await ActiveEffectsMigration.updateCyberware(item);
        break;
      case "gear":
        await ActiveEffectsMigration.updateGear(item);
        break;
      case "itemUpgrade":
        await ActiveEffectsMigration.updateItemUpgrade(item);
        break;
      case "netarch":
        await ActiveEffectsMigration.updateNetArch(item);
        break;
      case "program":
        await ActiveEffectsMigration.updateProgram(item);
        break;
      case "skill":
        // never call this for owned items!
        await ActiveEffectsMigration.updateSkill(item);
        break;
      case "role":
        await ActiveEffectsMigration.updateRole(item);
        break;
      case "vehicle":
        await ActiveEffectsMigration.updateVehicle(item);
        break;
      case "weapon":
        await ActiveEffectsMigration.updateWeapon(item);
        break;
      default:
        // note: drug was introduced with this release, so it will not fall through here
        LOGGER.warn(`An unrecognized item type was ignored: ${item.type}. It was not migrated!`);
    }
  }

  /**
   * Set a default price and category under certain conditions. This is meant to fill in empty
   * values that should not have been empty in the first place.
   *
   * @param {Number} price
   * @return {Object} - an object with keys to update in item.update()
   */
  static setPriceData(item, price) {
    LOGGER.trace("setPriceData | 1-activeEffects Migration");
    const updateData = {};
    // here we assume both values were never touched, and useless defaults still exist
    if (item.data.data.price.market === 0 && item.data.data.price.category === "") {
      updateData["data.price.market"] = price;
      updateData["data.price.category"] = item.getPriceCategory(price);
    }
    // here we assume the price was updated but not the category, so we update to match
    if (item.data.data.price.market !== 0 && item.data.data.price.category === "") {
      updateData["data.price.category"] = item.getPriceCategory(item.data.data.price.market);
    }
    return updateData;
  }

  /**
   * Some items lost the 'amount' property, which indicates how many are carried. We don't
   * want to lose that information, so we duplicate the items in an actor's inventory.
   * We cap this at 50 in case there is a bad or nonsensical value, like 10,000 pairs of pants.
   *
   * @param {CPRItem} item - the original object we inspect a bit
   * @param {Number} amount - the original value in the amount property (item no longer has it here)
   * @param {Object} dupeData - the item data to duplicate
   */
  static async dupeOwnedItems(item, amount, dupeData) {
    LOGGER.trace("dupeOwnedItems | 1-activeEffects Migration");
    if (item.isOwned && amount > 1) {
      // we assume the character is not actually wearing/wielding all of their (duplicate) items
      if (dupeData.data.equipped === "equipped") dupeData.data.equipped = "carried";
      const dupeItems = [];
      let dupeAmount = amount - 1;
      if (dupeAmount > 50) {
        dupeAmount = 50;
        CPRSystemUtils.DisplayMessage("warn", "Amount is over 50! Capping it to 50.");
      }
      for (let i = 0; i < dupeAmount; i += 1) {
        dupeItems.push(duplicate(dupeData));
      }
      await item.actor.createEmbeddedDocuments("Item", dupeItems);
    }
  }

  /**
   * Here's what changed with Ammo:
   *    Lost quality
   *    Lost upgradeable properties
   *    Gained concealable
   *    if price is 0 and category is empty, set to 100/premium
   *    if variety is empty set to heavyPistol
   *    if type is empty set to basic
   *
   * @param {CPRItem} ammo
   */
  static async updateAmmo(ammo) {
    LOGGER.trace("updateAmmo | 1-activeEffects Migration");
    let updateData = {};
    updateData = { ...updateData, ...CPRMigration.safeDelete(ammo, "data.quality") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(ammo, "data.isUpgraded") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(ammo, "data.upgrades") };
    updateData["data.concealable"] = {
      concealable: true,
      isConcealed: false,
    };
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(ammo, 100) };
    if (ammo.data.data.variety === "") updateData["data.variety"] = "heavyPistol";
    if (ammo.data.data.type === "") updateData["data.type"] = "basic";
    await ammo.update(updateData);
  }

  /**
   * Armor changed like so:
   *    Lost quality
   *    Gained usage
   *    if price is 0 and category is empty, set to 100/premium
   *    Gained slots for upgrades
   *    Lost amount - create duplicate items in inventory
   *
   * @param {CPRItem} clothing
   */
  static async updateArmor(armor) {
    LOGGER.trace("updateArmor | 1-activeEffects Migration");
    const { amount } = armor.data.data;
    let updateData = {};
    updateData = { ...updateData, ...CPRMigration.safeDelete(armor, "data.quality") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(armor, "data.amount") };
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(armor, 100) };
    updateData["data.slots"] = 3;
    updateData["data.usage"] = "equipped";
    const newItemData = duplicate(await armor.update(updateData));
    await ActiveEffectsMigration.dupeOwnedItems(armor, amount, newItemData);
  }

  /**
   * Clothing...
   *    Gained slots for upgrades
   *    Gained usage
   *    if price is 0 and category is empty, set to 50/premium
   *    if type is empty set to jacket
   *    if style is empty set to genericChic
   *
   * @param {CPRItem} clothing
   */
  static async updateClothing(clothing) {
    LOGGER.trace("updateClothing | 1-activeEffects Migration");
    let updateData = {};
    updateData["data.slots"] = 3;
    updateData["data.usage"] = "equipped";
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(clothing, 50) };
    if (clothing.data.data.type === "") updateData["data.type"] = "jacket";
    if (clothing.data.data.variety === "") updateData["data.variety"] = "genericChic";
    await clothing.update(updateData);
  }

  /**
   * Critical Injuries
   *    Gained usage
   *
   * @param {CPRItem} injury
   */
  static async updateCriticalInjury(injury) {
    LOGGER.trace("updateCriticalInjury | 1-activeEffects Migration");
    injury.update({ "data.usage": "toggled" });
  }

  /**
   * Cyberware
   *    Migrate Upgrades
   *    Gained usage
   *    Lost charges
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 500/premium
   *
   * @param {CPRItem} cyberware
   */
  static async updateCyberware(cyberware) {
    LOGGER.trace("updateCyberware | 1-activeEffects Migration");
    let updateData = {};
    updateData["data.usage"] = "installed";
    updateData["data.slots"] = 3;
    updateData = { ...updateData, ...CPRMigration.safeDelete(cyberware, "data.charges") };
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(cyberware, 500) };
    await cyberware.update(updateData);
  }

  /**
   * Cyberdeck. Note we skill "core" cyberware since there is no way it could be edited to
   * have mods that would require AEs to be created. Also we don't support "adding" core cyberware
   * to actors, so even if we did migrate the item and give it AEs, we couldn't add it back to the
   * actor. Here's what changed for everything else though.
   *    Lost quality
   *    Gained usage
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 500/premium
   *
   * @param {CPRItem} deck
   */
  static async updateCyberdeck(deck) {
    LOGGER.trace("updateCyberdeck | 1-activeEffects Migration");
    let updateData = {};
    updateData = { ...updateData, ...CPRMigration.safeDelete(deck, "data.quality") };
    updateData["data.usage"] = "toggled";
    updateData["data.slots"] = 3;
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(deck, 500) };
    await deck.update(updateData);
  }

  /**
   * Gear
   *    Lost quality
   *    Gained usage
   *    Gained slots for upgrades
   *    if price is 0 and category is empty, set to 100/premium
   *
   * @param {CPRItem} gear
   */
  static async updateGear(gear) {
    LOGGER.trace("updateGear | 1-activeEffects Migration");
    let updateData = {};
    updateData = { ...updateData, ...CPRMigration.safeDelete(gear, "data.quality") };
    updateData["data.usage"] = "toggled";
    updateData["data.slots"] = 3;
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(gear, 100) };
    await gear.update(updateData);
  }

  /**
   * itemUpgrades
   *    Lost quality
   *    Lost charges
   *    confirm how upgrades and slots work
   *    modifiers.secondaryWeapon.configured = false if not already defined
   *    if price is 0 and category is empty, set to 500/premium
   *    Lost amount - create duplicate items
   *
   * @param {CPRItem} upgrade
   */
  static async updateItemUpgrade(upgrade) {
    LOGGER.trace("updateItemUpgrade | 1-activeEffects Migration");
    let updateData = {};
    const { amount } = upgrade.data.data;
    updateData = { ...updateData, ...CPRMigration.safeDelete(upgrade, "data.quality") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(upgrade, "data.charges") };
    if (Object.keys(upgrade.data.data.modifiers).length === 0) {
      updateData["data.modifiers"] = { secondaryWeapon: { configured: false } };
    }
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(upgrade, 500) };
    const newItemData = duplicate(await upgrade.update(updateData));
    await ActiveEffectsMigration.dupeOwnedItems(upgrade, amount, newItemData);
  }

  /**
   * NetArch
   *    Lost quality
   *    if price is 0 and category is empty, set to 5000/premium
   *    Lost amount - create duplicate items
   *
   * @param {CPRItem} netarch
   */
  static async updateNetArch(netarch) {
    LOGGER.trace("updateNetArch | 1-activeEffects Migration");
    let updateData = {};
    const { amount } = netarch.data.data;
    updateData = { ...updateData, ...CPRMigration.safeDelete(netarch, "data.quality") };
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(netarch, 5000) };
    const newItemData = duplicate(await netarch.update(updateData));
    await ActiveEffectsMigration.dupeOwnedItems(netarch, amount, newItemData);
  }

  /**
   * Program
   *    Lost quality
   *    Gained usage
   *    Lost slots
   *    Lost isDemon
   *    "modifiers" property converted to AEs
   *    if price is 0 and category is empty, set to 100/premium
   *    Lost amount - create duplicate items
   *
   * @param {CPRItem} program
   */
  static async updateProgram(program) {
    LOGGER.trace("updateCrupdateProgramiticalInjury | 1-activeEffects Migration");
    let updateData = {};
    const { amount } = program.data.data;
    updateData = { ...updateData, ...CPRMigration.safeDelete(program, "data.quality") };
    updateData["data.usage"] = "rezzed";
    updateData = { ...updateData, ...CPRMigration.safeDelete(program, "data.slots") };
    updateData = { ...updateData, ...CPRMigration.safeDelete(program, "data.isDemon") };
    const changes = [];
    let index = 0;
    const name = CPRSystemUtils.Localize("CPR.migration.effects.program");
    for (const [key, value] of Object.entries(program.data.data.modifiers)) {
      changes.push({
        key: `bonuses.${CPRSystemUtils.slugify(key)}`,
        value,
        mode: 2,
        priority: index,
      });
      index += 1;
    }
    // put the AE on the Item, not the actor
    ActiveEffectsMigration.addActiveEffect(program, name, changes);
    updateData = { ...updateData, ...CPRMigration.safeDelete(program, "data.modifiers") };
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(program, 100) };
    const newItemData = duplicate(await program.update(updateData));
    await ActiveEffectsMigration.dupeOwnedItems(program, amount, newItemData);
  }

  /**
   * Role:
   *    "skillBonuses" became "bonuses"
   *
   * @param {CPRItem} role
   */
  static async updateRole(role) {
    LOGGER.trace("updateRole | 1-activeEffects Migration");
    let updateData = {};
    updateData["data.bonuses"] = role.data.data.skillBonuses;
    updateData = { ...updateData, ...CPRMigration.safeDelete(role, "data.quality") };
    await role.update(updateData);
  }

  /**
   * Skill:
   *    "skillmod" property converted to AEs
   *
   * @param {CPRItem} skill
   */
  static async updateSkill(skill) {
    LOGGER.trace("updateSkill | 1-activeEffects Migration");
    let updateData = {};
    const name = CPRSystemUtils.Localize("CPR.migration.effects.skill");
    const changes = [{
      key: `bonuses.${CPRSystemUtils.slugify(skill.name)}`,
      value: skill.data.data.skillmod,
      mode: 2,
      priority: 0,
    }];
    // put the AE on the Item, not the actor
    ActiveEffectsMigration.addActiveEffect(skill, name, changes);
    updateData = { ...updateData, ...CPRMigration.safeDelete(skill, "data.skillmod") };
    await skill.update(updateData);
  }

  /**
   * Vehicle
   *    Lost quality
   *    Lost ammount - create duplicate items
   *    if price is 0 and category is empty, set to 10000/premium
   *    Gained slots for upgrades
   *
   * @param {CPRItem} vehicle
   */
  static async updateVehicle(vehicle) {
    LOGGER.trace("updateVehicle | 1-activeEffects Migration");
    let updateData = {};
    const { amount } = vehicle.data.data;
    updateData = { ...updateData, ...CPRMigration.safeDelete(vehicle, "data.quality") };
    updateData["data.slots"] = 3;
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(vehicle, 10000) };
    const newItemData = duplicate(await vehicle.update(updateData));
    await ActiveEffectsMigration.dupeOwnedItems(vehicle, amount, newItemData);
  }

  /**
   * Weapon
   *    Lost quality - "excellent" should become an AE for Universal Attack
   *    Gained usage
   *    Lost charges
   *    Gained slots for upgrades (attachmentSlots became slots)
   *    if price is 0 and category is empty, set to 100/premium
   *    Lost amount - create duplicate items
   *
   * @param {CPRItem} weapon
   */
  static async updateWeapon(weapon) {
    LOGGER.trace("updateWeapon | 1-activeEffects Migration");
    let updateData = {};
    if (weapon.data.data.quality === "excellent") {
      const name = CPRSystemUtils.Localize("CPR.migration.effects.weapon");
      const changes = [{
        key: "bonuses.universalAttack",
        value: 1,
        mode: 2,
        priority: 0,
      }];
      // put the AE on the Item, not the actor
      ActiveEffectsMigration.addActiveEffect(weapon, name, changes);
    }
    const { amount } = weapon.data.data;
    updateData["data.usage"] = "equipped";
    updateData = { ...updateData, ...CPRMigration.safeDelete(weapon, "data.charges") };
    updateData["data.slots"] = 3;
    updateData = { ...updateData, ...CPRMigration.safeDelete(weapon, "data.quality") };
    updateData = { ...updateData, ...ActiveEffectsMigration.setPriceData(weapon, 100) };
    const newItemData = duplicate(await weapon.update(updateData));
    await ActiveEffectsMigration.dupeOwnedItems(weapon, amount, newItemData);
  }
}
