import * as actorHooks from "../hooks/actor.js";
import * as chatHooks from "../hooks/chat.js";

export default function registerHooks() {
  actorHooks.default();
  chatHooks.default();
}
