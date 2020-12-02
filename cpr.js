import { CPRActor } from "./modules/actor/cpr-actor.js";
import { CPRCharacterActorSheet } from "./modules/actor/sheet/cpr-character-sheet"
import { CPRMookActorSheet } from "./modules/actor/sheet/cpr-mook-sheet"

Hooks.once("init", async function () {
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cpr", CPRCharacterActorSheet, { types: ["character"], makeDefault: false });
    Actors.registerSheet("cpr", CPRMookActorSheet, { types: ["mook"], makeDefault: true });
    // Items.unregisterSheet("core", ItemSheet);
    // Items.registerSheet("cprc", CPRItemSheet, { makeDefault: true });
  
    game.cpr = {
      apps : {
      },
      entities : {
      },
    }
  
    // Assign the actor class to the CONFIG
    CONFIG.Actor.entityClass = CPRActor;
    // CONFIG.Item.entityClass = ItemCPR;
  });
  
  registerHooks()