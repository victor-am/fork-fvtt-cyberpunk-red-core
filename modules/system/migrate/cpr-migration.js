/* global game */
import * as Migrations from "./scripts/index.js";
import LOGGER from "../../utils/cpr-logger.js";
import CPRSystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * This is the base class for migration scripts. All migrations should extend this class and
 * implement the methods needed, which depends on what changed in the data model (actors, items, etc).
 * Put your migration in the scripts directory and add it to index.js so it is included.
 *
 * @abstract
 */
export default class CPRMigration {
  /**
   * Basic constructor to establish the version and other options
   */
  constructor() {
    LOGGER.trace("constructor | CPRMigration");
    this.version = null; // the data model version this migration will take us to
    this.flush = false; // migrations will stop after this script, even if more are needed
  }

  /**
   * Execute the migration code. This should not be overidden with the exception of the legacy
   * migration scripts. (000-base.js)
   */
  async run() {
    LOGGER.trace("run | CPRMigration");
    LOGGER.log(`Migrating to data model version ${this.version}`);
    // These shenanigans are how we dynamically call static methods on whatever migration object is
    // being run that extends this base class. Normally you need to be explicit, e.g. 
    // ActiveEffectsMigration.run().
    const classRef = Migrations[this.constructor.name];
    await this.preMigrate(); 
    const itemMigrations = await game.items.contents.map((actor) => classRef.updateItem(actor));
    await Promise.all(itemMigrations);
    CPRSystemUtils.DisplayMessage("notify", "All items migrated, continuing to actors");

    // migrate actors
    const actorMigrations = await game.actors.contents.map((actor) => this.updateActor(actor));
    await Promise.all(actorMigrations);
    CPRSystemUtils.DisplayMessage("notify", "All actors migrated, continuing to unlinked tokens");

    // migrate unlinked tokens

    await this.postMigrate();
    game.settings.set("cyberpunk-red-core", "dataModelVersion", this.version);
    return true;
  }

  /**
   * This block of abstract methods breaks down how each document type is migrated. If there
   * are any steps that need to be taken before migrating, put them in preMigrate. Likewise
   * any clean up or changes after go in postMigrate.
   *
   * These all assume data model changes are sent to the server (they're mutators).
   */
  async preMigrate() {};
  async updateActor(actor) {};
  static async updateItem(item) {};
  static async updateMacro(macro) {};
  static async updateToken(token) {};
  static async updateTable(table) {};
  static async updateCompendium(comp) {};
  async postMigrate() {};
}
