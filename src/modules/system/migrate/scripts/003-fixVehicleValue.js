import CPRMigration from "../cpr-migration.js";
import LOGGER from "../../../utils/cpr-logger.js";

export default class FixVehicleValue extends CPRMigration {
  constructor() {
    LOGGER.trace("constructor | 3-FixVehicleValue Migration");
    super();
    this.version = 3;
    this.name = "Fix Vehicles Missing the Valueable Template";
  }

  /**
   * Executed before the migration takes place, see run() in the base migration class.
   */
  async preMigrate() {
    LOGGER.trace("preMigrate | 3-FixVehicleValue Migration");
    LOGGER.log(`Starting migration: ${this.name}`);
  }

  /**
   * Takes place after the data migration completes.
   */
  async postMigrate() {
    LOGGER.trace("postMigrate | 3-FixVehicleValue Migration");
    LOGGER.log(`Finishing migration: ${this.name}`);
  }

  /**
   * See migrateItem comments for what is supposed to change. The actors themselves do not change,
   * but the vehicles they own do.
   *
   * @async
   * @param {CPRActor} actor
   */
  async migrateActor(actor) {
    LOGGER.trace("migrateActor | 3-foundryV10 Migration");
    const updatedItemList = [];
    const price = 10000;
    actor.items.forEach((item) => {
      if (item.type === "vehicle" && typeof item.system.price === "undefined") {
        const updateData = {};
        updateData["system.price.market"] = price;
        updateData["system.price.category"] = item.getPriceCategory(price);
        updatedItemList.push({
          _id: item.id,
          system: updateData,
        });
      }
    });
    if (updatedItemList.length > 0) {
      await actor.updateEmbeddedDocuments("Item", updatedItemList);
    }
  }

  /**
   * We noticed Vehicles were missing the "valuable" data template during 0.83 development. We added it back
   * to the data model, but for any vehicle created in the 0.82 release, it will be missing the price properties.
   * We add them back in this migration.
   *
   * @param {CPRItem} item
   */
  static async migrateItem(item) {
    LOGGER.trace("migrateItem | 3-FixVehicleValue Migration");
    if (item.type === "vehicle" && typeof item.system.price === "undefined") {
      const updateData = {};
      const price = 10000;
      updateData["system.price.market"] = price;
      updateData["system.price.category"] = item.getPriceCategory(price);
      await item.update({ system: updateData }, { CPRmigration: true, mergeDeletes: true });
    }
  }
}
