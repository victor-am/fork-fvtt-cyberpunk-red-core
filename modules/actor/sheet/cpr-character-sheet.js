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
      console.log(`${hp.value} out of ${hp.max}`)

      // Humanity
      hum.max = 10 * empStat;
      if (hum.value > hum.max) hum.value = hum.max;

      // Seriously wounded
      data.data.derivedStats.seriouslyWounded = Math.ceil(hp.max / 2);

      // Death save
      deathSave.max = Number(bodyStat);
      console.log(deathSave)
      if (deathSave.value > deathSave.max) deathSave.value = deathSave.max;

    /* ---------------------------------------------- */
    /* Render the skills on the character sheet */
    /* ---------------------------------------------- */

    const filteredItems = this.object.data.filteredItems
    const skillItems = filteredItems.skill;
    const stats = data.data.stats;
    const bases = data.data.skills;
    for (let [skill, value] of Object.entries(bases)) {
      // filter the relevant skill out of the skillItems
      const relevantSkill = skillItems.filter(function(item) {return item.data.name === skill});
      // get the relevant stat
      let relevantStat = ""
      let relevantStatValue = 0
      let relevantSkillName = ""
      let relevantSkillLevel = 0
      try {
        relevantStat = relevantSkill[0].data.data.stat;
        relevantStatValue = stats[relevantStat].value;
        relevantSkillName = relevantSkill[0].data.name;
        relevantSkillLevel = relevantSkill[0].data.data.level;
      } catch (err) {
        // console.log(err)
      }
      //set skill base to total
      bases[skill] = relevantSkillLevel + relevantStatValue;
    }
    /* ----------------------------------------------- */

    return data;
  }
}