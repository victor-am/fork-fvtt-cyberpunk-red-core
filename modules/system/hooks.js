import * as actorHooks from "../hooks/actor.js";
import * as chatHooks from "../hooks/chat.js";
import * as tokenHooks from "../hooks/token.js";

export default function registerHooks() {
  actorHooks.default();
  chatHooks.default();
  tokenHooks.default();
}
