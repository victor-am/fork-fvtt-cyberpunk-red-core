/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-await-in-loop */
export default class Migration {
  static async migrateWorld(oldDataModelVersion, newDataModelVersion) {
    ui.notifications.notify(`Beginning Migration of Cyberpunk Red Core from Data Model ${oldDataModelVersion} to ${newDataModelVersion}.`);
    let totalCount = game.items.entities.length;
    let quarterCount = totalCount / 4;
    let loopIndex = 0;
    let displayPercent = 25;

    ui.notifications.notify(`Beginning migration of ${totalCount} Items.`);
    for (const i of game.items.entities) {
      loopIndex += 1;
      if (loopIndex > quarterCount) {
        ui.notifications.notify(`Migration of Items ${displayPercent}% completed.`);
        displayPercent += 25;
        loopIndex = 0;
      }
      await i.update(this.migrateItemData(i.data));
    }

    totalCount = game.actors.entities.length;
    quarterCount = totalCount / 4;
    displayPercent = 25;
    loopIndex = 0;

    ui.notifications.notify(`Beginning migration of ${totalCount} Actors.`);
    for (const a of game.actors.entities) {
      loopIndex += 1;
      if (loopIndex > quarterCount) {
        ui.notifications.notify(`Migration of Actors ${displayPercent}% completed.`);
        displayPercent += 25;
        loopIndex = 0;
      }

      await this.migrateActorData(a);
    }

    totalCount = game.packs.size;
    loopIndex = 0;

    ui.notifications.notify(`Beginning migration of ${totalCount} Packs.`);
    for (const p of game.packs) {
      loopIndex += 1;
      ui.notifications.notify(`Migration of Pack ${loopIndex}/${totalCount} started.`);
      if (p.metadata.entity === "Item" && p.metadata.package === "world") {
        p.getContent().then(async (items) => {
          items.forEach(async (i) => {
            await p.updateEntity(this.migrateItemData(i.data));
          });
        });
      }

      if (p.metadata.entity === "Actor" && p.metadata.package === "world") {
        p.getContent().then(async (actors) => {
          actors.forEach(async (a) => {
            p.updateEntity(await this.migrateActorData(a));
          });
        });
      }
    }
    ui.notifications.notify(`Migration of Cyberpunk Red Core to Data Model ${newDataModelVersion} Finished.`);

    game.settings.set("cyberpunk-red-core", "dataModelVersion", newDataModelVersion);
  }

  static async migrateActorData(actor) {
    const actorItems = actor.items;
    const updateItems = [];
    for (const i of actorItems) {
      updateItems.push({ _id: i.id, data: this.migrateItemData(i.data) });
    }

    // You can't updateEmbeddedDocuments of a Compendium Entity since it is only data
    if (actor.compendium === null) {
      await actor.updateEmbeddedDocuments("Item", updateItems);
    } else {
      actor.data.items = updateItems;
    }

    if ((typeof actor.data.data.criticalInjuries) !== "undefined") {
      if (actor.data.data.criticalInjuries.length > 0) {
        await this.migrateCriticalInjuries(actor);
      }
    }

    // Moved to after all of the items have been migrated, since this is used to
    // update our Actor.  If we set it before, the actor just gets updated with all of the
    // OLD item data! Oops!

    const actorData = actor.data;

    /*
    After version 0.53, we moved deathSave to 3 values to support the rules:

    There are two things that can modify your Death Save rolls, the "Death Save Penalty" and the "Base Death Save Penalty".

    Your "Death Save Penalty" increases by 1 every time you succeed at a Death Save, and is applied to the roll. For example,
    if you succeed your first Death Save, your next is made with a +1. If you succeed again, the next is made with a +2.

    Your "Base Death Save Penalty" increases when you receive certain Critical Injuries. It is also added to your Death Save
    rolls along with the regular "Death Save Penalty". For example, if you get a Whiplash Critical Injury, "Base Death Save Penalty"
    is increased by 1, and gets added to any Death Saving throws that are made. This would get added to the regular "Death Save Penalty"
    if any Death Saves have succeeded.

    When you are healed to 1 hit point by stabilization, your "Death Save Penalty" resets to your "Base Death Save Penalty".
    Only by healing critical injuries can you lower your "Base Death Save Penalty". This means that if your
    "Base Death Save Penalty" is +2, your "Death Save Penalty" can be reset to no lower than +2, and thus you have will have
    a +4 to Death Saves until those critical injuries are healed. It could also mean that if you are stabilized,
    only your "Base Death Save Penalty" applies to Death Saves and from our example, you would only add +2 to Death Saves until the
    critical injuries are healed. p221
    */

    // The following only applies to the character data model
    if (actorData.type === "character") {
      // Original Data Model had a spelling issue
      if ((typeof actorData.data.lifepath.familyBackground) === "undefined") {
        actorData.data.lifepath.familyBackground = "";
        if ((typeof actorData.data.lifepath.familyBackgrond) !== "undefined") {
          actorData.data.lifepath.familyBackground = actorData.data.lifepath.familyBackgrond;
        }
      }
      if ((typeof actorData.data.lifestyle.fashion) === "undefined") {
        actorData.data.lifestyle.fashion = "";
        if ((typeof actorData.data.lifestyle.fasion) !== "undefined") {
          actorData.data.lifestyle.fashion = actorData.data.lifestyle.fasion;
        }
      }

      // Changed in 0.72
      const myVar = (typeof actorData.data.lifepath.friends);
      if ((typeof actorData.data.lifepath.friends) === "object") {
        actorData.data.lifepath.friends = "";
      }
      // Changed in 0.72
      if ((typeof actorData.data.lifepath.tragicLoveAffairs) === "object") {
        actorData.data.lifepath.tragicLoveAffairs = "";
      }
      // Changed in 0.72
      if ((typeof actorData.data.lifepath.enemies) === "object") {
        actorData.data.lifepath.enemies = "";
      }

      // Changed in 0.72
      if ((typeof actorData.data.lifestyle.fashion) === "string") {
        const oldData = actorData.data.lifestyle.fashion;
        actorData.data.lifestyle.fashion = { description: oldData };
      }

      // Changed in 0.72
      if ((typeof actorData.data.lifestyle.housing) === "string") {
        const oldData = actorData.data.lifestyle.housing;
        actorData.data.lifestyle.housing = { description: oldData, cost: 0 };
      }

      // Changed in 0.72
      if ((typeof actorData.data.lifestyle.lifestyle) === "string") {
        const oldData = actorData.data.lifestyle.lifestyle;
        actorData.data.lifestyle.lifestyle = { description: oldData, cost: 0 };
      }

      // Added in 0.72
      if ((typeof actorData.data.lifestyle.traumaTeam) === "undefined") {
        actorData.data.lifestyle.traumaTeam = { description: "", cost: 0 };
      }
      // Added in 0.72
      if ((typeof actorData.data.lifestyle.extras) === "undefined") {
        actorData.data.lifestyle.extras = { description: "", cost: 0 };
      }

      if ((typeof actorData.data.improvementPoints) === "undefined") {
        actorData.data.improvementPoints = {
          value: 0,
          transactions: [],
        };
      } else if ((typeof actorData.data.improvementPoints.value) === "undefined") {
        let ipValue = 0;
        if ((typeof actorData.data.improvementPoints.total) !== "undefined") {
          ipValue = actorData.data.improvementPoints.total;
        }
        actorData.data.improvementPoints = {
          value: ipValue,
          transactions: [],
        };
      }

      if ((typeof actorData.data.wealth) === "undefined") {
        actorData.data.wealth = {
          value: 0,
          transactions: [],
        };
      } else if ((typeof actorData.data.wealth.value) === "undefined") {
        let eddies = 0;
        if ((typeof actorData.data.wealth.eddies) !== "undefined") {
          eddies = actorData.data.wealth.eddies;
        }
        actorData.data.wealth = {
          value: eddies,
          transactions: [],
        };
      }

      if ((typeof actorData.data.reputation) === "undefined") {
        actorData.data.reputation = {
          value: 0,
          transactions: [],
        };
      }
    }

    // Applies to both characters and mooks
    if ((typeof actorData.data.derivedStats.deathSave) === "number") {
      const oldDeathSave = actorData.data.derivedStats.deathSave;
      let oldDeathPenalty = 0;
      if (typeof actorData.data.derivedStats.deathSavePenlty !== "undefined") {
        oldDeathPenalty = actorData.data.derivedStats.deathSavePenlty;
      }
      actorData.data.derivedStats.deathSave = { value: oldDeathSave, penalty: oldDeathPenalty, basePenalty: 0 };
    }

    if ((typeof actorData.data.roleInfo.activeRole) === "undefined") {
      let configuredRole = "solo";
      if (actorData.data.roleInfo.roles.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        configuredRole = actorData.data.roleInfo.roles[0];
      }
      actorData.data.roleInfo.activeRole = configuredRole;
    }

    if ((typeof actorData.data.criticalInjuries) === "undefined") {
      actorData.data.criticalInjuries = [];
    }

    // Moved in 0.72
    if ((typeof actorData.data.humanity) !== "undefined") {
      actorData.data.derivedStats.humanity = actorData.data.humanity;
    }

    if ((typeof actorData.data.currentWoundState) !== "undefined") {
      actorData.data.derivedStats.currentWoundState = actorData.data.currentWoundState;
    }

    // Adds external data points to Actor (e.g. for Armor SP resource bars)
    if ((typeof actorData.data.externalData) === "undefined") {
      actorData.data.externalData = {
        currentArmorBody: {
          id: "",
          value: 0,
          max: 0,
        },

        currentArmorHead: {
          id: "",
          value: 0,
          max: 0,
        },

        currentArmorShield: {
          id: "",
          value: 0,
          max: 0,
        },

        currentWeapon: {
          id: "",
          value: 0,
          max: 0,
        },
      };
    }

    // Check the ActorData for properties no longer in use and add them
    // to the scrubData object to have them removed
    const scrubData = this.scrubActorData(actorData);

    // Update the actor with the new data model
    await actor.update(actorData, { diff: false, enforceTypes: false });

    // This was added as part of 0.72.  We had one report of
    // a scenario where the actors somehow lost their core Cyberware items
    // so this ensures all actors have them.
    const pack = game.packs.get("cyberpunk-red-core.cyberware");
    // put into basickSkills array
    const content = await pack.getContent();
    await this.validateCoreContent(actor, content);

    // Remove any unused properties if needed
    if (scrubData !== {}) {
      await actor.update(scrubData);
    }
    return actor.data;
  }

  static async validateCoreContent(actor, content) {
    // Get what cyberware is installed
    const installedCyberware = actor.getInstalledCyberware();
    // Remove any installed items from the core content since the actor has those items
    installedCyberware.forEach((c) => {
      content = content.filter((cw) => cw.name !== c.name);
    });

    // Loop through and add the items the actor is missing
    content.forEach(async (c) => {
      const itemData = [c.data];
      await actor.createEmbeddedDocuments("Item", [{ data: itemData }]);
    });
  }

  static async migrateCriticalInjuries(actor) {
    const { criticalInjuries } = actor.data.data;
    const injuryItems = [];
    criticalInjuries.forEach(async (injury) => {
      const { mods } = injury;
      const hasPenalty = (mods.filter((mod) => mod.name === "deathSavePenalty"))[0].value;
      const itemData = {
        type: "criticalInjury",
        name: injury.name,
        data: {
          location: injury.location,
          description: {
            value: injury.effect,
            chat: "",
            unidentified: "",
          },
          quickFix: {
            type: "firstAidParamedic",
            dvFirstAid: 0,
            dvParamedic: 0,
          },
          treatment: {
            type: "paramedicSurgery",
            dvParamedic: 0,
            dvSurgery: 0,
          },
          deathSaveIncrease: hasPenalty,
        },
      };
      injuryItems.push(itemData);
    });
    return actor.createEmbeddedDocuments("Item", injuryItems, { force: true });
  }

  // The following is code that is used to remove data points on the actor model that
  // is no longer in use.  Removing properties uses a special syntax for actor.update()
  // Basically you prefix the data point you want to remove with '-=' and set it to null.
  // We build up scrubData with anything that needs to be removed and return it
  static scrubActorData(actorData) {
    const scrubData = {};
    // Remove unused data points from a character actor
    if (actorData.type === "character") {
      if ((typeof actorData.data.lifepath.familyBackgrond) !== "undefined") {
        scrubData["data.lifepath.-=familyBackgrond"] = null;
      }
      if ((typeof actorData.data.lifestyle.fasion) !== "undefined") {
        scrubData["data.lifestyle.-=fasion"] = null;
      }
      if ((typeof actorData.data.improvementPoints.total) !== "undefined") {
        scrubData["data.improvementPoints.-=total"] = null;
      }
      if ((typeof actorData.data.wealth.eddies) !== "undefined") {
        scrubData["data.wealth.-=eddies"] = null;
      }
      if ((typeof actorData.data["reputation:"]) !== "undefined") {
        scrubData["data.-=reputation:"] = null;
      }
      // Removed in 0.72
      if ((typeof actorData.data.lifestyle.rent) !== "undefined") {
        scrubData["data.lifestyle.-=rent"] = null;
      }
      // Removed in 0.72
      if ((typeof actorData.data.hp) !== "undefined") {
        scrubData["data.-=hp"] = null;
      }
    }
    // Remove unused data points from an actor (character & mooks)
    if (typeof actorData.data.derivedStats.deathSavePenlty !== "undefined") {
      scrubData["data.derivedStats.-=deathSavePenlty"] = null;
    }
    // Moved to derivedStats in 0.72
    if ((typeof actorData.data.woundState) !== "undefined") {
      scrubData["data.-=woundState"] = null;
    }
    // Moved to derivedStats in 0.72
    if ((typeof actorData.data.humanity) !== "undefined") {
      scrubData["data.-=humanity"] = null;
    }
    // Moved to items in 0.72
    if ((typeof actorData.data.criticalInjuries) !== "undefined") {
      scrubData["data.-=criticalInjuries"] = null;
    }
    return scrubData;
  }

  static migrateItemData(itemData) {
    if (typeof itemData.data.description === "string") {
      const oldDescription = itemData.data.description;
      itemData.data.description = {
        value: oldDescription,
        chat: "",
        unidentified: "",
      };
    }
    switch (itemData.type) {
      case "weapon": {
        return this.migrateWeapon(itemData);
      }
      case "program": {
        return this.migrateProgram(itemData);
      }
      case "vehicle": {
        return this.migrateVehicle(itemData);
      }
      case "gear": {
        return this.migrateGear(itemData);
      }
      case "skill": {
        return this.migrateSkill(itemData);
      }
      case "cyberware": {
        return this.migrateCyberware(itemData);
      }
      default:
    }
    return itemData;
  }

  // Item specific migration tasks
  static migrateWeapon(itemData) {
    if ((typeof itemData.data.isConcealed) === "undefined") {
      itemData.data.isConcealed = false;
    }
    if ((typeof itemData.data.dvTable) === "undefined") {
      itemData.data.dvTable = "";
    }
    if ((typeof itemData.data.attackMod) === "undefined") {
      itemData.data.attackMod = 0;
    }
    // Added with 0.75.1
    if ((typeof itemData.data.unarmedAutomaticCalculation) === "undefined") {
      itemData.data.unarmedAutomaticCalculation = true;
    }
    return itemData;
  }

  static migrateProgram(itemData) {
    if ((typeof itemData.data.slots) === "undefined") {
      itemData.data.slots = 0;
    }

    if ((typeof itemData.data.equipped) === "undefined") {
      itemData.data.equipped = "owned";
    }
    return itemData;
  }

  static migrateVehicle(itemData) {
    if ((typeof itemData.data.sdp) === "undefined") {
      itemData.data.sdp = itemData.data.spd;
      delete itemData.data.spd;
    }
    return itemData;
  }

  static migrateGear(itemData) {
    if ((typeof itemData.data.equipped) === "undefined") {
      itemData.data.equipped = "owned";
    }

    return itemData;
  }

  static migrateCyberware(itemData) {
    if (typeof itemData.data.slotSize !== "number") {
      itemData.data.slotSize = 1;
    }

    if ((itemData.data.isInstalled === true) && (itemData.data.isFoundational === true)) {
      itemData.data.installedOptionSlots = itemData.data.optionalIds.length;
    }

    if (itemData.data.type === "") {
      itemData.data.type = "cyberArm";
    }

    return itemData;
  }

  // I (Jalen) spoke with Darin and he mentioned it might make most sense for
  // migration code like this to check if the value isn't a number rather
  // than if it is undefined because sometimes the value shows up as null.
  // Testing that theory here.
  static migrateSkill(itemData) {
    if ((typeof itemData.data.skillmod) !== "number") {
      itemData.data.skillmod = 0;
    }

    return itemData;
  }
}
