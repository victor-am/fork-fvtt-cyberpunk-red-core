/* globals game */
import ConfirmPrompt from "../dialog/cpr-confirmation-prompt.js";
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

    derivedStats.deathSave.basePenalty = basePenalty;
    derivedStats.deathSave.value = derivedStats.deathSave.penalty + derivedStats.deathSave.basePenalty;
    this.data.data.derivedStats = derivedStats;
    derivedStats.hp.value = Math.min(
      derivedStats.hp.value,
      derivedStats.hp.max,
    );
    if (derivedStats.humanity.value > derivedStats.humanity.max) {
      derivedStats.humanity.value = derivedStats.humanity.max;
    }
  }

  /**
   * Create an active effect on this actor. This method belongs here so migration scripts can
   * dynamically generate effects based on custom mods already on the actor from earlier versions.
   *
   * @returns {CPRActiveEffect} the new document
   */
  createEffect() {
    LOGGER.trace("createEffect | CPRCharacterActor | Called.");
    return this.createEmbeddedDocuments("ActiveEffect", [{
      label: SystemUtils.Localize("CPR.itemSheet.effects.newEffect"),
      icon: "icons/svg/aura.svg",
      origin: this.uuid,
      disabled: false,
    }]);
  }

  /**
   * Delete the desired effect from this actor. Pops up a confirmation box if permitted.
   *
   * @param {CPRActiveEffect} effect - the effect to delete
   * @returns null
   */
  static async deleteEffect(effect) {
    LOGGER.trace("deleteEffect | CPRCharacterActor | Called.");
    const setting = game.settings.get("cyberpunk-red-core", "deleteItemConfirmation");
    if (setting) {
      const promptMessage = `${SystemUtils.Localize("CPR.dialog.deleteConfirmation.message")} ${effect.data.label}?`;
      const confirmDelete = await ConfirmPrompt.RenderPrompt(
        SystemUtils.Localize("CPR.dialog.deleteConfirmation.title"), promptMessage,
      ).catch((err) => LOGGER.debug(err));
      if (!confirmDelete) return;
    }
    effect.delete();
  }
}
