import CPRActor from "./cpr-actor.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Character actors are generally represented by players, but for especially detailed NPCs,
 * they are appropriate too. Characters are the most complex actors in the system.
 *
 * @extends {Actor}
 */
export default class CPRCharacterActor extends CPRActor {
  /**
   * create() is called when creating the actor, but it's not the same as a constructor. In the
   * code here, we pre-populate characters with skills, core cyberware, and other baked-in items.
   * We also pre-configure a few token options to reduce repetitive clicking, such as setting HP
   * as a resource bar.
   *
   * @async
   * @static
   * @param {Object} data - a complex structure with details and data to stuff into the actor object
   * @param {Object} options - not used here, but required by the parent class
   */
  static async create(data, options) {
    LOGGER.trace("create | CPRCharacterActor | called.");
    const createData = data;
    if (typeof data.data === "undefined") {
      LOGGER.trace("create | New Actor | CPRCharacterActor | called.");
      createData.items = [];
      const tmpItems = data.items.concat(await SystemUtils.GetCoreSkills(), await SystemUtils.GetCoreCyberware());
      tmpItems.forEach((item) => {
        // With 0.8.8 a warning about effects not being an array was thrown,
        // this converts it into an array for the creation.
        // eslint-disable-next-line no-param-reassign
        item.data.effects = item.data.effects.contents;
        createData.items.push(item.data);
      });
      createData.token = {
        actorLink: true,
        disposition: 1,
        vision: true,
        bar1: { attribute: "derivedStats.hp" },
      };
    }
    super.create(createData, options);
  }

  /**
   * Automatically calculate "derived" stats based on changes to other stats. This includes max HP,
   * Humanity, Empathy, and Death Saves. None of the automation happens if a player disabled it in
   * their client settings.
   */
  _calculateDerivedStats() {
    LOGGER.trace("_calculateDerivedStats | CPRCharacterActor | Called.");
    const actorData = this.data;
    actorData.filteredItems = this.itemTypes; // the itemTypes getter is in foundry.js
    const { derivedStats } = actorData.data;

    // Seriously wounded
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    // We need to always call this because if the actor was wounded and now is not, their
    // value would be equal to max, however their current wound state was never updated.
    this._setWoundState();
    // Updated derivedStats variable with currentWoundState
    derivedStats.currentWoundState = this.data.data.derivedStats.currentWoundState;

    // Death save
    let basePenalty = actorData.bonuses.deathSavePenalty; // 0 + active effects
    const critInjury = this.data.filteredItems.criticalInjury;
    critInjury.forEach((criticalInjury) => {
      const { deathSaveIncrease } = criticalInjury.data.data;
      if (deathSaveIncrease) {
        basePenalty += 1;
      }
    });

    // We need to check this because the object is instantiated by the entity factory
    // prior to migration and this data point changed from a type number to an type object
    // which gets fixed during migration
    if ((typeof derivedStats.deathSave) === "object") {
      derivedStats.deathSave.basePenalty = basePenalty;
      derivedStats.deathSave.value = derivedStats.deathSave.penalty + derivedStats.deathSave.basePenalty;
      this.data.data.derivedStats = derivedStats;
    }
    derivedStats.hp.value = Math.min(
      derivedStats.hp.value,
      derivedStats.hp.max,
    );
    if (derivedStats.humanity.value > derivedStats.humanity.max) {
      derivedStats.humanity.value = derivedStats.humanity.max;
    }
  }
}
