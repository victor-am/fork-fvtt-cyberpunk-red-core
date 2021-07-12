/* global Combat CONFIG game */
import LOGGER from "../utils/cpr-logger.js";
import CombatUtils from "../utils/cpr-combatUtils.js";

/**
 * A custom class so we can override initiative behaviors for Black-ICE and Demons.
 * According to the rules, these actors do not "roll" an initiative, instead they
 * get put "at the top", which an initiative value 1 better than whoever else is
 * currently first on the list. Foundry does not support this natively, so we
 * override the _getInitiativeFormula to address that.
 *
 * @extends
 */
export default class CPRCombat extends Combat {
  /**
   * Here is where the Black-ICE and Demon initiative behavior is implemented. If nothing
   * has an initiative set, the program gets "30", which should be high enough to always
   * be at the top. Otherwise we take the best, and increase it by 1.
   *
   * For all other actor types, the initiative is the system default (defined in system.json),
   * or the Foundry default if that is not specified.
   *
   * @param {*} combatant - the combatant object "rolling" for initiative
   * @returns - a string representation of the roll formula for the initiative. "30" is a
   *            valid formula, which is treated like a constant.
   */
  // eslint-disable-next-line class-methods-use-this
  _getInitiativeFormula(combatant) {
    LOGGER.trace("_getInitiativeFormula | CPRCombat | Called.");
    if (combatant.actor.data.type === "blackIce" || combatant.actor.data.type === "demon") {
      const bestInit = CombatUtils.GetBestInit();
      if (!bestInit) return "30";
      if (bestInit !== combatant.initiative) {
        return String(bestInit + 1);
      }
      return String(combatant.initiative);
    }
    return CONFIG.Combat.initiative.formula || game.system.data.initiative;
  }
}
