import * as Migrations from "./scripts/index.js";
import LOGGER from "../../utils/cpr-logger.js";
import CPRSystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * This class provides a method to find and execute all migrations that are needed
 * to get the data to the latest data model.
 */
export default class MigrationRunner {
  /**
   * This is the top level entry point for executing migrations. This code assumes the user is a GM.
   *
   * @param {Number} oldDataModelVersion - the current data model version
   * @param {Number} newDataModelVersion - the data model version we want to get to, may be multiple versions ahead
   */
  static async migrateWorld(oldDataModelVersion, newDataModelVersion) {
    LOGGER.trace("migrateWorld | MigrationRunner");
    const migrationsToDo = MigrationRunner._getMigrations(oldDataModelVersion, newDataModelVersion);
    CPRSystemUtils.DisplayMessage("notify", `Beginning Migration of Cyberpunk Red Core from Data Model ${oldDataModelVersion} to ${newDataModelVersion}.`);
    migrationsToDo.forEach(async (m) => m.run());
    CPRSystemUtils.DisplayMessage("notify", "Migrations completed!");
  }

  /**
   * Knowing the data models, figure out which migration scripts (as objects) to run.
   *
   * @param {Number} oldDataModelVersion - the current data model version
   * @param {Number} newDataModelVersion - the data model version we want to get to, may be multiple versions ahead
   * @return {Array} - an ordered list of objects from each relevant migration script
   */
  static _getMigrations(oldDataModelVersion, newDataModelVersion) {
    LOGGER.trace("_getMigrations | MigrationRunner");
    const migrations = Object.values(Migrations).map((M) => new M());
    return migrations.filter((m) => m.version > oldDataModelVersion && m.version <= newDataModelVersion)
      .sort((a, b) => a.version > b.version);
  }
}
