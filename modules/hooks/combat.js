/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";

const combatPreHooks = () => {
  Hooks.on("createCombat", (combat, data) => {
    LOGGER.trace("createCombat | combatHooks | Called.");
    // This is called when combat intiates, not sure what we can use it for
    // but figured I would just add the hook here.  As far as I can tell,
    // theres' no useful data passed in 'data'.
    console.log(combat);
    console.log(data);
  });
  Hooks.on("createCombatant", (combat, actor) => {
    LOGGER.trace("createCombatant | combatHooks | Called.");
    // This is called when an actor is added to combat
    // We can used it to add mods to their initiative or
    // have a Solo allocate ability points.
    console.log(combat);
    console.log(actor);
  });
};

export default combatPreHooks;
