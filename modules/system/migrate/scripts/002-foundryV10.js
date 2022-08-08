/* eslint-disable no-await-in-loop */
/* global game, duplicate */

import CPR from "../../config.js";
import CPRMigration from "../cpr-migration.js";
import CPRSystemUtils from "../../../utils/cpr-systemUtils.js";
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
    LOGGER.trace("preMigrate | 2-foundryV10 Migration");
  }

  /**
   * Takes place after the data migration completes. All we do here is delete the migration
   * folder for owned items, if it is empty. If not, that means 1 or more items did not
   * migrate properly and we leave it behind for a GM to review what to do.
   */
  async postMigrate() {
    LOGGER.trace("postMigrate | 2-foundryV10 Migration");
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
    console.log(actor);
  }

  /**
   * Items changed in so many ways it seemed best to break out a separate migration
   * path for each item type.
   *
   * @param {CPRItem} item
   */
  static async migrateItem(item) {
    LOGGER.trace("migrateItem | 2-foundryV10 Migration");
    let itemData = duplicate(item.system);
    const system = {};
    let updateData = {};
    /*
    game.system.template.Item[item.type].templates.forEach((template) => {
      switch (template) {
        case "attackable": {
          updateData = FoundryV10Migration.migrateAttackableTemplate(item);
        }
        case "common": {
          updateData = FoundryV10Migration.migrateCommonTemplate(item);
        }
        case "effects": {
          updateData = FoundryV10Migration.migrateEffectsTemplate(item);
        }
        case "equippable": {
          updateData = FoundryV10Migration.migrateEquippableTemplate(item);
        }
        case "loadable": {
          updateData = FoundryV10Migration.migrateLoadableTemplate(item);
        }
        case "installable": {
          updateData = FoundryV10Migration.migrateInstallableTemplate(item);
        }
        case "physical": {
          updateData = FoundryV10Migration.migratePhysicalTemplate(item);
        }
        case "stackable": {
          updateData = FoundryV10Migration.migrateStackableTemplate(item);
          break;
        }
        case "upgradeable": {
          updateData = FoundryV10Migration.migrateUpgradeableTemplate(item);
          break;
        }
        case "valuable": {
          updateData = FoundryV10Migration.migrateValuableTemplate(item);
          break;
        }
        default: {
          break;
        }
      }
    });
    */
  }

  static async migrateMacro(macro) {
    LOGGER.trace("migrateMacro | 2-foundryV10 Migration");
    console.log(macro);
  }

  static async migrateToken(token) {
    LOGGER.trace("migrateToken | 2-foundryV10 Migration");
    console.log(token);
  }

  static async migrateTable(table) {
    LOGGER.trace("migrateTable | 2-foundryV10 Migration");
    console.log(table);
  }

  /**
   * Upgradeable
   *
   * @param {CPRItem} systemData
   */
  static async updateUpgradeableTemplate(item) {
    LOGGER.trace("updateUpgradeableTemplate | 2-foundryV10 Migration");
    let updateData = {};
    const itemData = duplicate(item.system);
    if (typeof itemData.attachmentSlots !== "undefined") {
      updateData = { ...updateData, ...CPRMigration.safeDelete(item, "system.attachmentSlots") };
    }
    if (typeof itemData.availableSlots !== "undefined") {
      updateData = { ...updateData, ...CPRMigration.safeDelete(item, "system.availableSlots") };
    }
    return updateData;
  }

  /**
   * Attackable
   *
   * @param {CPRItem} systemData
   */
  static async updatePhysicalTemplate(item) {
    LOGGER.trace("updatePhysicalTemplate | 2-foundryV10 Migration");
    let updateData = {};
    const itemData = duplicate(item.system);
    if (typeof itemData.concealable !== "object") {
      const concealableData = {
        concealable: itemData.concealable,
        isConcealed: itemData.isConcealed,
      };
      updateData.concealable = concealableData;
      updateData = { ...updateData, ...CPRMigration.safeDelete(item, "system.isConcealed") };
    }
    return updateData;
  }
}
