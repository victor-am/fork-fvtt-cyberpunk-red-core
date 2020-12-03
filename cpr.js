import { CPRActor } from "./modules/actor/cpr-actor.js";
import { CPRActorSheet } from "./modules/actor/sheet/cpr-actor-sheet.js";
import { CPRCharacterActorSheet } from "./modules/actor/sheet/cpr-character-sheet.js";
import { CPRMookActorSheet } from "./modules/actor/sheet/cpr-mook-sheet.js";
import registerHooks from "./modules/system/hooks.js";

import { sqrt } from 'mathjs'

console.log(sqrt(-4).toString()) // 2i

Hooks.once("init", async function () {
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cyberpunk-red-core", CPRCharacterActorSheet, { types: ["character"], makeDefault: true });
    Actors.registerSheet("cyberpunk-red-core", CPRMookActorSheet, { types: ["mook"], makeDefault: true });
    // Items.unregisterSheet("core", ItemSheet);
    // Items.registerSheet("cprc", CPRItemSheet, { makeDefault: true });

    // Give ourselves console access to our objects
    game.cpr = {
      apps : {
        CPRActorSheet,
        CPRCharacterActorSheet,
        CPRMookActorSheet
      },
      entities : {
        CPRActor
      },
    }
  
    // Assign the actor class to the CONFIG
    CONFIG.Actor.entityClass = CPRActor;
    // CONFIG.Item.entityClass = ItemCPR;
});
  
registerHooks()
