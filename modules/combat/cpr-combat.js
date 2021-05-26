/* global Combat CONFIG game */
import LOGGER from "../utils/cpr-logger.js";
import CombatUtils from "../utils/cpr-combatUtils.js";

export default class CPRCombat extends Combat {
  /** @override */
  // eslint-disable-next-line class-methods-use-this
  _getInitiativeFormula(combatant) {
    LOGGER.trace("_getInitiativeFormula | CPRCombat | Called.");
    if (combatant.actor.data.type === "blackIce") {
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
