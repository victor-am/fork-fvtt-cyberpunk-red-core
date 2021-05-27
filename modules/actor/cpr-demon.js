/* globals Actor */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPR from "../system/config.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * @extends {Actor}
 */
export default class CPRDemonActor extends Actor {
  static async create(data, options) {
    LOGGER.trace("create | CPRDemonActor | called.");
    const createData = data;
    if (typeof data.data === "undefined") {
      LOGGER.trace("create | New Actor | CPRDemonActor | called.");
      createData.token = {
        bar1: { attribute: "rez" },
      };
    }
    super.create(createData, options);
  }

  createStatRoll(statName) {
    LOGGER.trace("createStatRoll | CPRDemonActor | called.");
    const niceStatName = SystemUtils.Localize(CPR.demonStatList[statName]);
    const statValue = parseInt(this.data.data.stats[statName], 10);
    return new CPRRolls.CPRStatRoll(niceStatName, statValue);
  }
}
