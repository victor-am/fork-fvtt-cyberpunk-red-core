import * as actorHooks from "../hooks/actor.js";
import * as chatHooks from "../hooks/chat.js";
import * as tokenHooks from "../hooks/token.js";
import * as combatHooks from "../hooks/combat.js";
import * as uiHooks from "../hooks/ui.js";

export default function registerHooks() {
  actorHooks.default();
  chatHooks.default();
  tokenHooks.default();
  combatHooks.default();
  uiHooks.default();
}
