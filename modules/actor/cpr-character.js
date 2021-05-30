/* globals game */
import CPRActor from "./cpr-actor.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * @extends {Actor}
 */
export default class CPRCharacterActor extends CPRActor {
  /** @override */
  static async create(data, options) {
    LOGGER.trace("create | CPRCharacterActor | called.");
    const createData = data;
    if (typeof data.data === "undefined") {
      LOGGER.trace("create | New Actor | CPRCharacterActor | called.");
      createData.items = [];
      const tmpItems = data.items.concat(await SystemUtils.GetCoreSkills(), await SystemUtils.GetCoreCyberware());
      tmpItems.forEach((item) => {
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

  _calculateDerivedStats() {
    // Calculate MAX HP
    LOGGER.trace("_calculateDerivedStats | CPRCharacterActor | Called.");
    const actorData = this.data;
    actorData.filteredItems = this.itemTypes;

    const { stats } = actorData.data;
    const { derivedStats } = actorData.data;
    const setting = game.settings.get("cyberpunk-red-core", "calculateDerivedStats");

    // After the initial config of the game, a GM may want to disable the auto-calculation
    // of stats for Mooks & Players for custom homebrew rules
    if (setting) {
      // Set max HP
      derivedStats.hp.max = 10 + 5 * Math.ceil((stats.will.value + stats.body.value) / 2);

      derivedStats.hp.value = Math.min(
        derivedStats.hp.value,
        derivedStats.hp.max,
      );

      // Max Humanity
      let cyberwarePenalty = 0;
      this.getInstalledCyberware().forEach((cyberware) => {
        if (cyberware.getData().type === "borgware") {
          cyberwarePenalty += 4;
        } else if (parseInt(cyberware.getData().humanityLoss.static, 10) > 0) {
          cyberwarePenalty += 2;
        }
      });
      derivedStats.humanity.max = 10 * stats.emp.max - cyberwarePenalty; // minus sum of installed cyberware
      if (derivedStats.humanity.value > derivedStats.humanity.max) {
        derivedStats.humanity.value = derivedStats.humanity.max;
      }
      // Setting EMP to value based on current humannity.
      stats.emp.value = Math.floor(derivedStats.humanity.value / 10);
    }

    // Seriously wounded
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    // We need to always call this because if the actor was wounded and now is not, their
    // value would be equal to max, however their current wound state was never updated.
    this._setWoundState();
    // Updated derivedStats variable with currentWoundState
    derivedStats.currentWoundState = this.data.data.derivedStats.currentWoundState;

    // Death save
    let basePenalty = 0;
    const critInjury = this.data.filteredItems.criticalInjury;
    critInjury.forEach((criticalInjury) => {
      const { deathSaveIncrease } = criticalInjury.data.data;
      if (deathSaveIncrease) {
        basePenalty += 1;
      }
    });

    // In 0.73.2 we moved all of the Death Save data into the single data point of
    // derivedStats.deathSave.basePenalty, however, it causes a chicken/egg situation
    // since it loads the data up before it migrates, triggering this code to run which
    // errors out and ultimately messing the migration up. Yay. We should be able to
    // remove this code after a release or two
    if ((typeof derivedStats.deathSave) === "number") {
      const oldPenalty = derivedStats.deathSave;
      derivedStats.deathSave = {
        value: 0,
        penalty: oldPenalty,
        basePenalty,
      };
    }
    derivedStats.deathSave.basePenalty = basePenalty;
    derivedStats.deathSave.value = derivedStats.deathSave.penalty + derivedStats.deathSave.basePenalty;
    this.data.data.derivedStats = derivedStats;
  }
}
