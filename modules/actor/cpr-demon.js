/* globals Actor */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPR from "../system/config.js";
import CPRChat from "../chat/cpr-chat.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Demons are very simple stand-alone actors right now.
 *
 * @extends {Actor}
 */
export default class CPRDemonActor extends Actor {
  /**
   * create() is called when the actor is... being created. All we do in here
   * is set "rez" to a resource bar.
   *
   * @static
   * @async
   * @param {Object} data - a complex structure of data used in creating the actor
   * @param {Object} options - unused here but passed up to the parent
   */
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

  /**
   * Very simple code to roll a stat
   *
   * @param {String} statName - the name of the stat being rolled
   * @returns {CPRProgramStatRoll}
   */
  createStatRoll(statName) {
    LOGGER.trace("createStatRoll | CPRDemonActor | called.");
    const niceStatName = SystemUtils.Localize(CPR.demonStatList[statName]);
    const statValue = parseInt(this.data.data.stats[statName], 10);
    return new CPRRolls.CPRProgramStatRoll(niceStatName, statValue);
  }

  /**
   * Apply damage to the rez of the deamon.
   * @param {int} damage - direct damage dealt
   * @param {int} bonusDamage - bonus damage dealt
   */
  async _applyDamage(damage, bonusDamage) {
    LOGGER.trace("_applyDamage | CPRDemonActor | Called.");
    // As a deamon does not have any armor the damage will be simply subtracted from the REZ.
    const currentRez = this.data.data.stats.rez.value;
    await this.update({ "data.stats.rez.value": currentRez - damage - bonusDamage });
    CPRChat.RenderDamageApplicationCard({ name: this.name, hpReduction: damage + bonusDamage, rezReduction: true });
  }

  /**
   * Given a stat name, return the value of it off the actor
   *
   * @param {String} statName - name (from CPR.statList) of the stat to retrieve
   * @returns {Number}
  */
  getStat(statName) {
    LOGGER.trace("getStat | CPRDemonActor | Called.");
    const statValue = (statName === "rez") ? this.data.data.stats[statName].value : this.data.data.stats[statName];
    return parseInt(statValue, 10);
  }
}
