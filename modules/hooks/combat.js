/* eslint-disable no-unused-vars */
/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";

const combatPreHooks = () => {
  Hooks.on("createCombat", (combat, data) => {
    LOGGER.trace("createCombat | combatHooks | Called.");
    // This is called when combat intiates, not sure what we can use it for
    // but figured I would just add the hook here.  As far as I can tell,
    // theres' no useful data passed in 'data'.
  });
  Hooks.on("createCombatant", async (combat, data) => {
    LOGGER.trace("createCombatant | combatHooks | Called.");
    // This is called when an actor is added to combat
    // We can used it to add mods to their initiative or
    // have a Solo allocate ability points.
    /*
    const combatantData = await data;
    const actor = combatantData.actor;
    const combatantRoles = actor.data.data.roleInfo.roles;
    const combatantPlayer = combatantData.players[0];

    Object.keys(combatantRoles).forEach((index) => {
      const role = combatantRoles[index];
      switch (role) {
        case "solo": {
          if (combatantPlayer.active) {
            const userId = combatantPlayer.data._id;
            actor.soloCheckAbilities(userId);
          }
          break;
        }
        default:
      }
    });
    */
  });
};

export default combatPreHooks;
