import CPRActor from "./cpr-actor.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * The mook actor extends CPRActor since there is a lot of overlap behind the scenes with the
 * way items interact and how stats and skills are used.
 *
 * @extends {Actor}
 */
export default class CPRMookActor extends CPRActor {
  /**
   * create() is called when creating the actor, but it's not the same as a constructor. In the
   * code here, we pre-populate characters with skills, core cyberware, and other baked-in items.
   * We also pre-configure a few token options to reduce repetitive clicking, such as setting HP
   * as a resource bar. Mooks by default have a neutral disposition and no actor link with tokens.
   *
   * TODO: most of this can be moved up to CPRActor.create()
   *
   * @async
   * @static
   * @param {Object} data - data used in creating a basic mook
   * @param {Object} options - not used here but passed up to the parent class
   */
  static async create(data, options) {
    LOGGER.trace("create | CPRMookActor | called.");
    const createData = data;
    if (typeof data.system === "undefined") {
      LOGGER.trace("create | New Actor | CPRMookActor | called.");
      createData.items = [];
      const tmpItems = data.items.concat(await SystemUtils.GetCoreSkills(), await SystemUtils.GetCoreCyberware());
      tmpItems.forEach((item) => {
        const cprItem = {
          name: item.name,
          img: item.img,
          type: item.type,
          system: item.system,
        };
        createData.items.push(cprItem);
      });
      createData.token = {
        vision: true,
        bar1: { attribute: "derivedStats.hp" },
      };
    }
    super.create(createData, options);
  }
}
