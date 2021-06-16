/* globals Actor, duplicate, setProperty */
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
    const statValue = parseInt(this.data.data.stats[statName], 10);
    return new CPRRolls.CPRStatRoll(niceStatName, statValue);
  }

  /**
   * Set the statistics on this Black ICE Actor programmatically, such as
   * configuring a Black ICE Actor from a Black ICE Item (Program) on
   * a cyberdeck
   *
   * @public
   * @param {String} type   - Type of Black ICE, acceptable values found in config.js:CPR.blackIceType
   * @param {Number} per    - Value to set ATK to
   * @param {Number} spd    - Value to set ATK to
   * @param {Number} atk    - Value to set ATK to
   * @param {Number} def    - Value to set ATK to
   * @param {Number} rez    - Value to set REZ to, both value and max are configured to the same
   * @param {String} effect - Text to display in the effect field of the Black ICE. Any HTML is stripped from
   *                          the string. If this is not set it will default to whatever exists on the Actor.
   */
  programmaticallyUpdate(type, per, spd, atk, def, rezValue, rezMax = null, effect = null) {
    const actorData = duplicate(this.data);
    setProperty(actorData, "data.class", type);
    setProperty(actorData, "data.stats.per", per);
    setProperty(actorData, "data.stats.spd", spd);
    setProperty(actorData, "data.stats.atk", atk);
    setProperty(actorData, "data.stats.def", def);
    setProperty(actorData, "data.stats.rez.value", rezValue);
    // The last 2 args would only be passed upon creation, so we have default values so we can tell if
    // this is the Creation or Update
    if (rezMax !== null) {
      setProperty(actorData, "data.stats.rez.max", rezMax);
    }
    if (effect !== null) {
      const effectText = effect.replace(/(<([^>]+)>)/gi, "");
      setProperty(actorData, "data.effect", effectText);
    }
    this.update(actorData);
  }
}
