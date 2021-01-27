import * as actorHooks from "../hooks/actor.js";
import * as combatHooks from "../hooks/combat.js";

export default function registerHooks() {
  actorHooks.default();
  combatHooks.default();
}
