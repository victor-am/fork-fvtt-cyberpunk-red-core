/* global game */

import LOGGER from "./cpr-logger.js";
import SystemUtils from "./cpr-systemUtils.js";

export default class CPRCombatUtils {
  // Optional
  static GetBestInit() {
    LOGGER.trace("GetBestInit | CPRCombatUtils | called.");
    const combat = game.combats.viewed;
    if (!combat) {
      // no combat encounters are happening in this scene
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.nocombatselected"));
      return null;
    }
    const { combatants } = combat.data;
    if (combatants.length === 0) {
      // a combat encounter is viewed but devoid of combatants
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.nocombatantsfound"));
      return null;
    }
    const initiatives = combatants.map((c) => c.initiative);
    LOGGER.debug(`raw initiatives: ${initiatives}`);
    const definedInits = initiatives.filter((i) => Number.isInteger(i));
    LOGGER.debug(`definedInits: ${definedInits}`);
    if (definedInits.length === 0) {
      // a combat encounter is viewed but nobody has rolled initiative
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.nobodyrolledinitiative"));
      return null;
    }
    return Math.max(...definedInits);
  }
}
