import CPRMigration from "../cpr-migration.js";
import LOGGER from "../../../utils/cpr-logger.js";

export default class ActiveEffectsMigration extends CPRMigration {
  constructor() {
    LOGGER.trace("constructor | 1-activeEffects Migration");
    super();
    this.version = 1;
  }
}
