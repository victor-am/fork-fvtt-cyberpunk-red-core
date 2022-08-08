/* eslint-disable no-await-in-loop */
/* global game, duplicate */

import CPRMigration from "../cpr-migration.js";
import LOGGER from "../../../utils/cpr-logger.js";

export default class FoundryV10Migration extends CPRMigration {
  constructor() {
    LOGGER.trace("constructor | 2-foundryV10 Migration");
    super();
    this.version = 2;
  }

  /**
   * Executed before the migration takes place, see run() in the base migration class.
   * For this version, we create an item folder to copy items owned by characters. We do
   * this because active effects cannot be added or changed on owned items. So, we copy
   * an owned item here first, migrate it, and then copy it back to the character.
   */
  async preMigrate() {
    LOGGER.trace("preMigrate | 1-activeEffects Migration");
  }

  /**
   * Takes place after the data migration completes. All we do here is delete the migration
   * folder for owned items, if it is empty. If not, that means 1 or more items did not
   * migrate properly and we leave it behind for a GM to review what to do.
   */
  async postMigrate() {
    LOGGER.trace("postMigrate | 1-activeEffects Migration");
  }

  /**
   * The actors were updated in 2 ways. No changes to demons, black-ice or containers.
   *    Universal Attack Bonus and Damage --> corresponding AE
   *    Deleted skill and role properties.
   *
   * @async
   * @static
   * @param {CPRActor} actor
   */
  async migrateActor(actor) {
    LOGGER.trace("migrateActor | 2-foundryV10 Migration");
    const updatedItemList = [];
    actor.items.forEach((item) => {
      const systemChanges = FoundryV10Migration.scrubItem(item);

      if (item.system.upgrades && item.system.upgrades.length > 0) {
        const newUpgrades = [];
        item.system.upgrades.forEach((upgrade) => {
          const upgradeData = duplicate(upgrade.data);
          delete upgrade.data;
          upgrade.system = upgradeData;
          newUpgrades.push(upgrade);
        });
        systemChanges.upgrades = newUpgrades;
      }

      if (Object.keys(systemChanges).length !== 0) {
        updatedItemList.push({
          _id: item.id,
          system: systemChanges,
        });
      }
    });

    const cyberware = actor.items.filter((i) => i.type === "cyberware");
    cyberware.forEach((item) => {
      if (item.system.optionalIds.length > 0) {
        console.log("MIGRATION OPTIONAL IDS");
        console.log(item);
      }
    });

    const cyberdecks = actor.items.filter((i) => i.type === "cyberdeck");
    cyberdecks.forEach((item) => {
      const systemChanges = {};
      if (item.system.programs.installed.length > 0) {
        const newInstalled = [];
        item.system.programs.installed.forEach((program) => {
          const programData = duplicate(program.data);
          delete program.data;
          program.system = programData;
          newInstalled.push(program);
        });
        systemChanges.installed = newInstalled;
      }
      if (item.system.programs.rezzed.length > 0) {
        const newRezzed = [];
        item.system.programs.rezzed.forEach((program) => {
          const programData = duplicate(program.data);
          delete program.data;
          program.system = programData;
          newRezzed.push(program);
        });
        systemChanges.rezzed = newRezzed;
      }
      if (Object.keys(systemChanges).length !== 0) {
        updatedItemList.push({
          _id: item.id,
          system: {
            programs: systemChanges,
          },
        });
        console.log("CYBERDECK UPDATE");
        console.log(item.id);
        console.log(systemChanges);
      }
    });

    if (updatedItemList.length > 0) {
      await actor.updateEmbeddedDocuments("Item", updatedItemList);
      console.log(`Updated ${actor.id}`);
      console.log(updatedItemList);
    }
  }

  /**
   * The Foundry object migration handles most of the changes here.  The things that we are doing here
   * is cleaning up stale data points which somehow slipped through the cracks during previous migrations.
   *
   * @param {CPRItem} item
   */
  static async migrateItem(item) {
    LOGGER.trace("migrateItem | 2-foundryV10 Migration");

    const systemChanges = FoundryV10Migration.scrubItem(item);

    await item.update({ system: systemChanges }, { CPRmigration: true, mergeDeletes: true });
  }

  /**
   * Clean data points that shouldn't exist on our data model which must have slipped through the cracks
   * in the past migration code.
   *
   * @param {CPRItem} item
   */
  static scrubItem(item) {
    LOGGER.trace("scrubItem | 2-foundryV10 Migration");
    let systemChanges = {};
    if (typeof item.system.attachmentSlots !== "undefined") {
      systemChanges = { ...systemChanges, ...CPRMigration.safeDelete(item, "attachmentSlots") };
    }

    if (game.system.template.Item[item.type].templates.includes("physical") && typeof item.system.concealable !== "object") {
      systemChanges.concealable = {
        concealable: item.system.concealable,
        isConcealed: item.system.isConcealed,
      };
      systemChanges = { ...systemChanges, ...CPRMigration.safeDelete(item, "isConcealed") };
    }

    if (!game.system.template.Item[item.type].templates.includes("stackable") && (typeof item.system.amount !== "undefined")) {
      systemChanges = { ...systemChanges, ...CPRMigration.safeDelete(item, "amount") };
    }

    if (typeof item.system.upgrade !== "undefined") {
      systemChanges = { ...systemChanges, ...CPRMigration.safeDelete(item, "upgrade") };
    }
    return systemChanges;
  }
}
