/* eslint-disable no-await-in-loop */
/* global game hasProperty */
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
    this.errors = 0; // Increment if there were errors as part of this migration.
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

    // migrate unowned items
    CPRSystemUtils.updateLoadBar(1, "Migration running. Migrating Items, Actors, Scenes and Compendia...");

    if (!await CPRMigration.migrateItems(classRef)) {
      CPRSystemUtils.DisplayMessage("error", CPRSystemUtils.Localize("CPR.migration.status.itemErrors"));
      return false;
    }
    CPRSystemUtils.DisplayMessage("notify", CPRSystemUtils.Localize("CPR.migration.status.allItemsDone"));

    CPRSystemUtils.updateLoadBar(25, "Migration running. Migrating Actors, Scenes and Compendia... [COMPLETED: Items]");

    // migrate actors
    if (!await this.migrateActors()) {
      CPRSystemUtils.DisplayMessage("error", CPRSystemUtils.Localize("CPR.migration.status.actorErrors"));
      return false;
    }
    CPRSystemUtils.DisplayMessage("notify", CPRSystemUtils.Localize("CPR.migration.status.allActorsDone"));

    CPRSystemUtils.updateLoadBar(50, "Migration running. Migrating Scenes and Compendia... [COMPLETED: Items, Actors]");

    // unlinked actors (tokens)
    if (!await this.migrateScenes()) {
      CPRSystemUtils.DisplayMessage("error", CPRSystemUtils.Localize("CPR.migration.status.tokenErrors"));
      return false;
    }
    CPRSystemUtils.DisplayMessage("notify", CPRSystemUtils.Localize("CPR.migration.status.allTokensDone"));

    CPRSystemUtils.updateLoadBar(75, "Migration running. Migrating Compendia... [COMPLETED: Items, Actors, Scenes]");

    // compendia
    if (!await this.migrateCompendia(classRef)) {
      CPRSystemUtils.DisplayMessage("error", CPRSystemUtils.Localize("CPR.migration.status.compendiaErrors"));
      return false;
    }
    CPRSystemUtils.DisplayMessage("notify", CPRSystemUtils.Localize("CPR.migration.status.allCompendiaDone"));

    CPRSystemUtils.updateLoadBar(100, "Migration completed. [COMPLETED: Items, Actors, Scenes, Compendia]");

    // In the future, put top-level migrations for tokens, scenes, and other things here

    await this.postMigrate();

    if (this.errors !== 0) {
      throw Error("Migration errors encountered");
    }
    game.settings.set("cyberpunk-red-core", "dataModelVersion", this.version);
    return true;
  }

  /**
   * Return a data object that can be merged to delete a document property. This method
   * safely checks if the property exists before passing back the Foundry-specific directive to
   * delete a property. Attempting to delete keys in normal JS ways produces errors when calling
   * Doc.update().
   *
   * Example deletion key that will delete "data.whatever.property":
   *    { "data.whatever.-=property": null }
   *
   * @param {Document} doc - document (item or actor) that we intend to delete properties on
   * @param {String} prop - dot-notation of the property, "data.roleInfo.role" for example
   * @returns {Object}
   */
  static safeDelete(doc, prop) {
    LOGGER.trace("safeDelete | CPRMigration");
    let key = prop;
    if (key.includes("data.data")) key = key.slice(0, 4); // should only be one data
    if (hasProperty(doc.data, key)) {
      key = prop.replace(/.([^.]*)$/, ".-=$1");
      return { [key]: null };
    }
    return {};
  }

  /**
   * Migrate unowned Items
   */
  static async migrateItems(classRef) {
    LOGGER.trace("migrateItems | CPRMigration");
    let good = true;
    const itemMigrations = game.items.contents.map(async (item) => {
      try {
        return await classRef.migrateItem(item);
      } catch (err) {
        throw new Error(`${item.name} had a migration error: ${err.message}`);
      }
    });
    const values = await Promise.allSettled(itemMigrations);
    for (const value of values.filter((v) => v.status !== "fulfilled")) {
      LOGGER.error(`Migration error: ${value.reason.message}`);
      LOGGER.error(value.reason.stack);
      good = false;
    }
    return good;
  }

  /**
   * Migrate actors
   */
  async migrateActors() {
    LOGGER.trace("migrateActors | CPRMigration");
    // actors in the "directory"
    let good = true;
    const actorMigrations = game.actors.contents.map(async (actor) => {
      try {
        return await this.migrateActor(actor);
      } catch (err) {
        throw new Error(`${actor.name} had a migration error: ${err.message}`);
      }
    });
    const values = await Promise.allSettled(actorMigrations);
    for (const value of values.filter((v) => v.status !== "fulfilled")) {
      LOGGER.error(`Migration error: ${value.reason.message}`);
      LOGGER.error(value.reason.stack);
      good = false;
    }
    return good;
  }

  /**
   * Migrate scenes. We specifically focus on unlinked tokens for now.
   */
  async migrateScenes() {
    LOGGER.trace("migrateScenes | CPRMigration");
    let good = true;
    for (const scene of game.scenes.contents) {
      const tokens = scene.tokens.contents.filter((token) => {
        if (!token.data.actorLink && !game.actors.has(token.data.actorId)) {
          // Degenerate case where the token is unlinked, but the actor it is derived from was since
          // deleted. This makes token.actor null so we don't have a full view of all of the actor data.
          // This is technically a broken token and even Foundry throws errors when you do certain things
          // with this token. We skip it.
          LOGGER.warn(`WARNING: Token "${token.data.name}" (${token.data.actorId}) on Scene "${scene.name}" (${scene.id})`
            + ` is missing the source Actor, so we will skip migrating it. Consider replacing or deleting it.`);
          return false;
        }
        if (!token.data.actorLink) return true; // unlinked tokens, this is what we're after
        // anything else is a linked token, we assume they're already migrated
        return false;
      });
      const tokenMigrations = tokens.map(async (token) => {
        try {
          return await this.migrateActor(token.actor);
        } catch (err) {
          throw new Error(`${token.actor.name} token had a migration error: ${err.message}`);
        }
      });
      const values = await Promise.allSettled(tokenMigrations);
      for (const value of values.filter((v) => v.status !== "fulfilled")) {
        LOGGER.error(`Migration error: ${value.reason.message}`);
        LOGGER.error(value.reason.stack);
        good = false;
      }
      CPRSystemUtils.DisplayMessage("notify", `Migrated scene: ${scene.name}`);
    }
    return good;
  }

  /**
   * Migrate compendia. This code is not meant to be run on the system-provided compendia
   * that we provide. They are updated and imported on the side. The benefit of that approach
   * to users is decreased migration times. I.e., we already migrated our compendia.
   *
   * We respect whether a compendium is locked. If it is, do not touch it. This does invite problems
   * later on if a user tries to use entries with an outdated data model. However, the discord
   * community for Foundry preferred locked things to be left alone.
   */
  async migrateCompendia(classRef) {
    LOGGER.trace("migrateCompendia | CPRMigration");
    let good = true;
    for (const pack of game.packs.filter((p) => p.metadata.package === "world" && ["Actor", "Item", "Scene"].includes(p.metadata.type) && !p.locked)) {
      // Iterate over compendium entries - applying fine-tuned migration functions
      const docs = await pack.getDocuments();
      const packMigrations = docs.map(async (doc) => {
        switch (pack.metadata.type) {
          case "Actor": {
            await this.migrateActor(doc);
            break;
          }
          case "Item": {
            await classRef.migrateItem(doc);
            break;
          }
          case "Scene": {
            await this.migrateScenes(doc);
            break;
          }
          default:
            CPRSystemUtils.DisplayMessage("error", `Unexpected doc type in compendia: ${doc}`);
        }
      });
      const values = await Promise.allSettled(packMigrations);
      for (const value of values.filter((v) => v.status !== "fulfilled")) {
        LOGGER.error(`Migration error: ${value.reason.message}`);
        LOGGER.error(value.reason.stack);
        good = false;
      }
    }
    return good;
  }

  /**
   * This block of abstract methods breaks down how each document type is migrated. If there
   * are any steps that need to be taken before migrating, put them in preMigrate. Likewise
   * any clean up or changes after go in postMigrate. Note that uncommenting these will cause
   * the linter to traceback for some ridiculous reason.
   *
   * They all assume data model changes are sent to the server (they're mutators).
   *
   * async preMigrate() {}
   * async migrateActor(actor) {}
   * static async migrateItem(item) {}
   * static async migrateMacro(macro) {}
   * static async migrateToken(token) {}
   * static async migrateTable(table) {}
   * async postMigrate() {}
  */
}
