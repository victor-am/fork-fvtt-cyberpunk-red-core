/* globals Actor game */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPR from "../system/config.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import CombatUtils from "../utils/cpr-combatUtils.js";

/**
 * @extends {Actor}
 */
export default class CPRBlackIceActor extends Actor {
  static async create(data, options) {
    LOGGER.trace("create | CPRBlackIceActor | called.");
    const createData = data;
    if (typeof data.data === "undefined") {
      LOGGER.trace("create | New Actor | CPRBlackIceActor | called.");
      createData.token = {
        bar1: { attribute: "stats.rez" },
      };
    }
    super.create(createData, options);
  }

  getTokenId() {
    LOGGER.trace("getTokenId | CPRBlackIceActor | called.");
    return this.token === null ? null : this.token.data._id;
  }

  getCombatant() {
    LOGGER.trace("getCombatantId | CPRBlackIceActor | called.");
    const tokenId = this.getTokenId();
    if (!tokenId) {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.notokenforactor"));
      return null;
    }
    const combatant = game.combat.getCombatantByToken(tokenId);
    if (!combatant) {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.nocombatantfound"));
      return null;
    }
    return combatant;
  }

  setInitiative() {
    LOGGER.trace("setInitiative | CPRBlackIceActor | called.");
    // note this only works for the currently viewed combat, not all combats
    // this might help with that in the future:
    const combatant = this.getCombatant();
    if (!combatant) return;
    const initVal = CombatUtils.GetBestInit() + 1;
    const cid = combatant._id;
    LOGGER.debug(`setting combatant ${cid} to ${initVal}`);
    game.combat.setInitiative(cid, initVal);
  }

  // Black-ICE rolls are always "stat" rolls
  createStatRoll(statName) {
    LOGGER.trace("createStatRoll | CPRBlackIceActor | called.");
    const niceStatName = SystemUtils.Localize(CPR.blackIceStatList[statName]);
    const statValue = parseInt(this.data.data.stats[statName], 10);
    return new CPRRolls.CPRStatRoll(niceStatName, statValue);
  }
}
