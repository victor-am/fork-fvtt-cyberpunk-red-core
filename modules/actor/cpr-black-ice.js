/* globals Actor, duplicate, setProperty, game */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPR from "../system/config.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Black-ICE actors directly extend Actor from Foundry. They have very little in common with
 * Characters or Mooks.
 *
 * @extends {Actor}
 */
export default class CPRBlackIceActor extends Actor {
  /**
   * The only special thing we do when creating a new Black-ICE actor is set the "REZ" stat to
   * be the one to show for a bar on a token. Typically this is a lot like HP.
   *
   * @static
   * @async
   * @param {Object} data - a complex object with set up details and data for the actor
   * @param {Object} options - unused here, but passed up to the parent class where it is needed
   */
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

  /**
   * Black-ICE really only uses 2 types of rolls: stat and damage. A trimmed down version
   * of the roll code in cpr-actor.js is implemented here.
   *
   * @param {String} statName - name of the stat being rolled (DEF, ATK, etc)
   * @returns {CPRStatRoll}
   */
  createStatRoll(statName) {
    LOGGER.trace("createStatRoll | CPRBlackIceActor | called.");
    const niceStatName = SystemUtils.Localize(CPR.blackIceStatList[statName]);
    const statValue = parseInt(this.data.data.stats[statName], 10);
    const cprRoll = new CPRRolls.CPRStatRoll(niceStatName, statValue);
    if (this.isToken && typeof this.token.data.flags["cyberpunk-red-core"] !== "undefined") {
      const cprFlags = this.token.data.flags["cyberpunk-red-core"];
      if (typeof cprFlags.program !== "undefined") {
        cprRoll.rollCardExtraArgs.program = duplicate(cprFlags.program);
      }
    }

    if (cprRoll.rollCardExtraArgs.length === 0) {
      cprRoll.rollCardExtraArgs.program = {
        data: {
          class: "blackice",
          blackIceType: this.data.data.class,
        },
      };
    }
    return cprRoll;
  }

  /**
   * See createStatRoll
   *
   * @param {String} programId - Id for the program item doing the damage
   * @param {String} netrunnerTokenId - The token Id of the netrunner that supposedly owns the program item
   * @param {String} sceneId - the scene Id, used to find the token
   * @returns {CPRDamageRoll}
   */
  createDamageRoll(programId, netrunnerTokenId, sceneId) {
    LOGGER.trace("createDamageRoll | CPRBlackIceActor | called.");
    let program;
    if (netrunnerTokenId) {
      const sceneList = (sceneId) ? game.scenes.filter((s) => s.id === sceneId) : game.scenes;
      let netrunnerToken;
      sceneList.forEach((scene) => {
        const tokenList = scene.tokens.filter((t) => t.id === netrunnerTokenId);
        if (tokenList.length === 1) {
          [netrunnerToken] = tokenList;
        }
      });
      if (netrunnerToken) {
        program = netrunnerToken.actor._getOwnedItem(programId);
      }
    } else {
      const programList = game.items.filter((i) => i.data._id === programId);
      if (programList.length === 1) {
        [program] = programList;
      }
    }

    let damageFormula = "1d6";
    let programName = this.name;
    let programData = {};
    if (program) {
      damageFormula = (this.data.data.class === "antiprogram") ? program.data.data.damage.blackIce : program.data.data.damage.standard;
      programName = program.name;
      programData = program.data;
    }

    const cprRoll = new CPRRolls.CPRDamageRoll(programName, damageFormula, "program");
    cprRoll.rollCardExtraArgs.program = programData;
    return cprRoll;
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
    LOGGER.trace("programmaticallyUpdate | CPRBlackIceActor | called.");
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
