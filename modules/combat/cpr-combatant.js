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
  async getInitiativeRoll(formula) {
    LOGGER.trace("getInitiativeRoll | CPRCombatant | Called.");
    const { actor } = this.token;
    const cprInitiative = new CPRRolls.CPRInitiative(formula, actor.getStat("ref"));
    await cprInitiative.roll();
    return cprInitiative;
  }
}
