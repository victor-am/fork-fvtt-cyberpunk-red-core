import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the basic CPRActorSheet.
 * @extends {CPRActorSheet}
 */
export default class CPRCharacterActorSheet extends CPRActorSheet {

  /** @override */
  static get defaultOptions() {
    LOGGER.trace("Default Options | CPRCharacterActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-character-sheet.hbs",
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "skills" }],
    });
  }

  /** @override */
  getData() {
    LOGGER.trace("Get Data | CPRCharacterActorSheet | Called.");
    const data = super.getData();
    /*----------------------------------------------
      Calculate derived stats
      --------------------------------------------  */
      let hp = data.data.derivedStats.hp;
      let hum = data.data.derivedStats.humanity;
      let deathSave = data.data.derivedStats.deathSave;
      const willStat = data.data.stats.will.value;
      const bodyStat = data.data.stats.body.value;
      const empStat = data.data.stats.emp.value;
      
      // HP
      hp.max = 10 + 5*(Math.ceil((willStat + bodyStat) / 2));
      if (hp.value > hp.max) hp.value = hp.max;

      // Humanity
      hum.max = 10 * empStat;
      if (hum.value > hum.max) hum.value = hum.max;

      // Seriously wounded
      data.data.derivedStats.seriouslyWounded = Math.ceil(hp.max / 2);

      // Death save
      deathSave.max = Number(bodyStat);
      if (deathSave.value > deathSave.max) deathSave.value = deathSave.max;

    const filteredItems = this.object.data.filteredItems
    return data;
  }
}