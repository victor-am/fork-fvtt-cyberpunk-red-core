/* global Combatant CONFIG game mergeObject */
import LOGGER from "../utils/cpr-logger.js";
import * as CPRRolls from "../rolls/cpr-rolls.js";

/**
 * A custom class so we can override initiative behaviors for Black-ICE and Demons.
 * According to the rules, these actors do not "roll" an initiative, instead they
 * get put "at the top", which an initiative value 1 better than whoever else is
 * currently first on the list. Foundry does not support this natively, so we
 * override the _getInitiativeFormula to address that.
 *
 * @extends Combatant
 */
export default class CPRCombatant extends Combatant {
  /**
 * Create an initiative roll for this combatant
 *
 * @param {String} formula - Roll formula to use for initiative
 * @param {String} initiativeType - Expecting either "meat" or "net"
 * @returns {Roll}
 */
  async getInitiativeRoll(formula, initiativeType) {
    LOGGER.trace("getInitiativeRoll | CPRCombatant | Called.");
    let cprInitiative;
    const { actor } = this.token;
    switch (actor.type) {
      case "character":
      case "mook": {
        if (initiativeType === "meat") {
          cprInitiative = new CPRRolls.CPRInitiative(initiativeType, actor.type, formula, actor.getStat("ref"));
          const roleList = actor.getRoles();

          roleList.forEach((role) => {
            const relevantAbilities = role.data.data.abilities.filter((a) => a.name === "Initiative Reaction");
            if (relevantAbilities.length > 0) {
              relevantAbilities.forEach((ability) => {
                cprInitiative.addMod(ability.rank);
              });
            }
          });
        } else {
          const netSpeed = actor.data.bonuses.speed; // active effects for speed, note "initiative" AEs come later
          // Filter for the Netrunner role on the actor then assign `netrunnerRank` the proper value
          const netrunnerRole = (actor.data.filteredItems.role.filter((d) => d.data.name === "Netrunner"))[0];
          const netrunnerRank = netrunnerRole.data.data.rank;
          cprInitiative = new CPRRolls.CPRInitiative(initiativeType, actor.type, formula, netrunnerRank, netSpeed);
        }
        break;
      }
      case "demon": {
        cprInitiative = new CPRRolls.CPRInitiative("net", actor.type, formula, actor.getStat("interface"));
        break;
      }
      case "blackIce": {
        cprInitiative = new CPRRolls.CPRInitiative("net", actor.type, formula, actor.getStat("spd"));
        break;
      }
      default:
        // The only way we get here is if someone tries to roll initiative for something that
        // should not have an initiative roll (container?), so we will just roll whatever formula is passed with
        // no base value
        cprInitiative = new CPRRolls.CPRInitiative("meat", actor.type, formula, 0);
        break;
    }
    await cprInitiative.roll();
    cprInitiative.addMod(actor.data.bonuses.initiative); // consider any active effects
    return cprInitiative;
  }
}
