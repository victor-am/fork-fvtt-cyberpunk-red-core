/* global game */
import LOGGER from "../../utils/cpr-logger.js";

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
   * ToDo: should toObject() be called on each thing being migrated?
   */
  async run() {
    LOGGER.trace("run | CPRMigration");
    await this.preMigrate();
    for (const item of game.items.contents) await this.updateItem(item);
    for (const actor of game.actors.contents) await this.updateActor(actor);
    await this.postMigrate();
    game.settings.set("cyberpunk-red-core", "dataModelVersion", this.version);
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
  async updateItem(item) {};
  async updateMacro(macro) {};
  async updateToken(token) {};
  async updateTable(table) {};
  async updateCompendium(comp) {};
  async postMigrate() {};
}
