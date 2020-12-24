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


    /* ---------------------------------------------- */
    /* Render the skills on the character sheet */
    /* ---------------------------------------------- */

    const filteredItems = this.object.data.filteredItems

    // const skillItems = filteredItems.skill;

    // const stats = data.data.stats;
    // const bases = data.data.skills;

    // for (let [skill, value] of Object.entries(bases)) {
    //   // filter the relevant skill out of the skillItems
    //   const relevantSkill = skillItems.filter(function(item) {return item.data.name === skill});

    //   // get the relevant stat
    //   let relevantStat = ""
    //   let relevantStatValue = 0
    //   let relevantSkillName = ""
    //   let relevantSkillLevel = 0
    //   try {
    //     relevantStat = relevantSkill[0].data.data.stat;
    //     relevantStatValue = stats[relevantStat].value;
    //     relevantSkillName = relevantSkill[0].data.name;
    //     relevantSkillLevel = relevantSkill[0].data.data.level;
    //   } catch (err) {
    //     // console.log(err)
    //   }
      
    //   //set skill base to total
    //   bases[skill] = relevantSkillLevel + relevantStatValue;
    // }
    // /* ----------------------------------------------- */

    return data;
  }
}