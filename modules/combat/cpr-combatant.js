/* global Combatant CONFIG game mergeObject */
import LOGGER from "../utils/cpr-logger.js";
import * as CPRRolls from "../rolls/cpr-rolls.js";

/**
 * A custom class so we can override initiative behaviors for Black-ICE and Demons.
 * According to the rules, these actors do not "roll" an initiative, instead they
 * get put "at the top", which an initiative value 1 better than whoever else is
 * currently first on the list. Foundry does not support this natively, so we
 * override the _getInitiativeFormula to address that.
 *
 * @extends Combatant
 */
export default class CPRCombatant extends Combatant {
  async getInitiativeRoll(formula, initiativeType) {
    LOGGER.trace("getInitiativeRoll | CPRCombatant | Called.");
    let cprInitiative;
    const { actor } = this.token;
    switch (actor.type) {
      case "character":
      case "mook": {
        if (initiativeType === "meat") {
          cprInitiative = new CPRRolls.CPRInitiative(initiativeType, actor.type, formula, actor.getStat("ref"));
        } else {
          const cyberdeck = (actor.data.filteredItems.cyberdeck.filter((c) => c.data.data.equipped === "equipped"))[0];
          const netSpeed = cyberdeck.getBoosters("speed");
          // This will need to be changed with Jalen's roles as items to identify
          // what the net skill is to use.
          cprInitiative = new CPRRolls.CPRInitiative(initiativeType, actor.type, formula, actor._getRoleValue("interface"), netSpeed);
        }
        break;
      }
      case "demon":
      case "blackIce": {
        cprInitiative = new CPRRolls.CPRInitiative("net", "program", formula, actor.getStat("spd"));
      }
      default:
        break;
    }
    await cprInitiative.roll();
    return cprInitiative;
  }
}
