/* globals Actor */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPR from "../system/config.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

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

  // Black-ICE rolls are always "stat" rolls
  createStatRoll(statName) {
    LOGGER.trace("createStatRoll | CPRBlackIceActor | called.");
    const niceStatName = SystemUtils.Localize(CPR.blackIceStatList[statName]);
    const statValue = parseInt(this.data.data.stats[statName].value, 10);
    return new CPRRolls.CPRStatRoll(niceStatName, statValue);
  }
}
