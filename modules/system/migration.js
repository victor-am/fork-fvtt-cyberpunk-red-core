/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-await-in-loop */
export default class Migration {
  static async migrateWorld(oldDataModelVersion, newDataModelVersion) {
    ui.notifications.notify(`Beginning Migration of Cyberpunk Red Core from Data Model ${oldDataModelVersion} to ${newDataModelVersion}.`);
    let totalCount = game.items.contents.length;
    let quarterCount = totalCount / 4;
    let loopIndex = 0;
    let displayPercent = 25;

    // Migrate World Items
    ui.notifications.notify(`Beginning migration of ${totalCount} Items.`);
    for (const i of game.items.contents) {
      loopIndex += 1;
      if (loopIndex > quarterCount) {
        ui.notifications.notify(`Migration of Items ${displayPercent}% completed.`);
        displayPercent += 25;
        loopIndex = 0;
      }
      try {
        const updateData = this.migrateItemData(i.toObject());
        if (!foundry.utils.isObjectEmpty(updateData)) {
          this._migrationLog(`Migrating Item entity ${i.name}`);
          await i.update(updateData, { diff: false });
        }
      } catch (err) {
        err.message = `CPR MIGRATION | Failed cyberpunk-red-core system migration for Item ${i.name}: ${err.message}`;
        console.error(err);
      }
    }
    totalCount = game.actors.contents.length;
    quarterCount = totalCount / 4;
    displayPercent = 25;
    loopIndex = 0;

    // Migrate World Actors
    ui.notifications.notify(`Beginning migration of ${totalCount} Actors.`);
    for (const a of game.actors.contents) {
      loopIndex += 1;
      if (loopIndex > quarterCount) {
        ui.notifications.notify(`Migration of Actors ${displayPercent}% completed.`);
        displayPercent += 25;
        loopIndex = 0;
      }

      try {
        // Create any new items needed for the character or mook before manipulating
        // any data points, example: Missing core Cyberware, Critical Injury Items, etc
        if (a.type === "character" || a.type === "mook") {
          await this.createActorItems(a);
        }
        const updateData = this.migrateActorData(a.data);
        if (!foundry.utils.isObjectEmpty(updateData)) {
          this._migrationLog(`Migrating Actor entity ${a.name}`);
          await a.update(updateData, { enforceTypes: false });
        }
      } catch (err) {
        err.message = `CPR MIGRATION | Failed cyberpunk-red-core system migration for Actor ${a.name}: ${err.message}`;
        console.error(err);
      }
    }
    totalCount = game.packs.size;
    loopIndex = 0;

    // Migrate World Compendiums
    ui.notifications.notify(`Beginning migration of ${totalCount} Packs.`);
    for (const p of game.packs) {
      loopIndex += 1;
      ui.notifications.notify(`Migration of Pack ${loopIndex}/${totalCount} started.`);

      if (p.metadata.package === "world") {
        this.migrateCompendium(p);
      }
    }

    // Migrate Actor Override Tokens
    for (const s of game.scenes.contents) {
      try {
        const updateData = this.migrateSceneData(s.data);
        if (!foundry.utils.isObjectEmpty(updateData)) {
          this._migrationLog(`Migrating Scene entity ${s.name}`);
          await s.update(updateData, { enforceTypes: false });
          // If we do not do this, then synthetic token actors remain in cache
          // with the un-updated actorData.
          s.tokens.contents.forEach((t) => {
            // eslint-disable-next-line no-param-reassign
            t._actor = null;
          });
        }
      } catch (err) {
        err.message = `CPR MIGRATION | Failed cyberpunk-red-core system migration for Scene ${s.name}: ${err.message}`;
        console.error(err);
      }
    }

    ui.notifications.notify(`Migration of Cyberpunk Red Core to Data Model ${newDataModelVersion} Finished.`);

    game.settings.set("cyberpunk-red-core", "dataModelVersion", newDataModelVersion);
  }

  // @param {object} actorData    The actor data object to update
  static migrateActorData(actorData) {
    const updateData = {};

    // Migrate Owned Items
    if (actorData.items) {
      const items = actorData.items.reduce((arr, i) => {
        // Migrate the Owned Item
        const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
        const itemUpdate = this.migrateItemData(itemData);

        // Update the Owned Item
        if (!foundry.utils.isObjectEmpty(itemUpdate)) {
          itemUpdate._id = itemData._id;
          arr.push(expandObject(itemUpdate));
        }

        return arr;
      }, []);

      if (items.length > 0) {
        updateData.items = items;
      }
    }

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
        updateData["data.lifepath.familyBackground"] = "";
        if ((typeof actorData.data.lifepath.familyBackgrond) !== "undefined") {
          updateData["data.lifepath.familyBackground"] = actorData.data.lifepath.familyBackgrond;
          updateData["data.lifepath.-=familyBackgrond"] = null;
        }
      }
      if ((typeof actorData.data.lifestyle.fashion) === "undefined") {
        updateData["data.lifestyle.fashion"] = "";
        if ((typeof actorData.data.lifestyle.fasion) !== "undefined") {
          updateData["data.lifestyle.fashion"] = actorData.data.lifestyle.fasion;
          updateData["data.lifestyle.-=fasion"] = null;
        }

        if ((typeof actorData.data.improvementPoints.total) !== "undefined") {
          updateData["data.improvementPoints.-=total"] = null;
        }

        // Removed in 0.72
        if ((typeof actorData.data.hp) !== "undefined") {
          updateData["data.-=hp"] = null;
        }
      }

      // Lifepath migration/fixes
      // Changed in 0.72
      if ((typeof actorData.data.lifepath.friends) === "object") {
        updateData["data.lifepath.friends"] = "";
      }
      // Changed in 0.72
      if ((typeof actorData.data.lifepath.tragicLoveAffairs) === "object") {
        updateData["data.lifepath.tragicLoveAffairs"] = "";
      }
      // Changed in 0.72
      if ((typeof actorData.data.lifepath.enemies) === "object") {
        updateData["data.lifepath.enemies"] = "";
      }

      // Lifestyle migration/fixes
      // Changed in 0.72
      if ((typeof actorData.data.lifestyle.fashion) === "string") {
        const oldData = actorData.data.lifestyle.fashion;
        updateData["data.lifestyle.fashion"] = { description: oldData };
      }

      // Changed in 0.72
      if ((typeof actorData.data.lifestyle.housing) === "string") {
        const oldData = actorData.data.lifestyle.housing;
        updateData["data.lifestyle.housing"] = { description: oldData, cost: 0 };
      }
      // Changed in 0.72
      if ((typeof actorData.data.lifestyle.lifestyle) === "string") {
        const oldData = actorData.data.lifestyle.lifestyle;
        updateData["data.lifestyle.lifestyle"] = { description: oldData, cost: 0 };
      }

      // Removed in 0.72
      if ((typeof actorData.data.lifestyle.rent) !== "undefined") {
        updateData["data.lifestyle.-=rent"] = null;
      }

      // Added in 0.72
      if ((typeof actorData.data.lifestyle.traumaTeam) === "undefined") {
        updateData["data.lifestyle.traumaTeam"] = { description: "", cost: 0 };
      }
      // Added in 0.72
      if ((typeof actorData.data.lifestyle.extras) === "undefined") {
        updateData["data.lifestyle.extras"] = { description: "", cost: 0 };
      }

      // Improvement Points migration/fixes
      if ((typeof actorData.data.improvementPoints) === "undefined") {
        updateData["data.improvementPoints"] = {
          value: 0,
          transactions: [],
        };
      } else if ((typeof actorData.data.improvementPoints.value) === "undefined") {
        let ipValue = 0;
        if ((typeof actorData.data.improvementPoints.total) !== "undefined") {
          ipValue = actorData.data.improvementPoints.total;
        }
        updateData["data.improvementPoints"] = {
          value: ipValue,
          transactions: [],
        };
      }

      // Wealth/Eddies migration/fixes
      if ((typeof actorData.data.wealth) === "undefined") {
        updateData["data.wealth"] = {
          value: 0,
          transactions: [],
        };
      } else if ((typeof actorData.data.wealth.value) === "undefined") {
        let eddies = 0;
        if ((typeof actorData.data.wealth.eddies) !== "undefined") {
          eddies = actorData.data.wealth.eddies;
        }
        updateData["data.wealth"] = {
          value: eddies,
          transactions: [],
        };
      }

      if ((typeof actorData.data.wealth.eddies) !== "undefined") {
        updateData["data.wealth.-=eddies"] = null;
      }

      // Reputation migration/fixes
      if ((typeof actorData.data.reputation) === "undefined") {
        updateData["data.reputation"] = {
          value: 0,
          transactions: [],
        };
      }
      if ((typeof actorData.data["reputation:"]) !== "undefined") {
        updateData["data.-=reputation:"] = null;
      }
    }

    if (actorData.type === "character" || actorData.type === "mook") {
      // Applies to both characters and mooks
      // Death Save/Death Penalty migration/fixes
      if ((typeof actorData.data.derivedStats.deathSave) === "number") {
        const oldDeathSave = actorData.data.derivedStats.deathSave;
        let oldDeathPenalty = 0;
        if (typeof actorData.data.derivedStats.deathSavePenlty !== "undefined") {
          oldDeathPenalty = actorData.data.derivedStats.deathSavePenlty;
        }
        updateData["data.derivedStats.deathSave"] = { value: oldDeathSave, penalty: oldDeathPenalty, basePenalty: 0 };
      }

      if (typeof actorData.data.derivedStats.deathSavePenlty !== "undefined") {
        updateData["data.derivedStats.-=deathSavePenlty"] = null;
      }

      if ((typeof actorData.data.roleInfo.activeRole) === "undefined") {
        let configuredRole = "solo";
        if (actorData.data.roleInfo.roles.length > 0) {
          // eslint-disable-next-line prefer-destructuring
          configuredRole = actorData.data.roleInfo.roles[0];
        }
        updateData["data.roleInfo.activeRole"] = configuredRole;
      }

      if ((typeof actorData.data.criticalInjuries) === "undefined") {
        updateData["data.criticalInjuries"] = [];
      }

      // Humanity migration/fixes
      // Moved to derivedStats in 0.72
      if ((typeof actorData.data.humanity) !== "undefined") {
        updateData["data.derivedStats.humanity"] = actorData.data.humanity;
      }

      if ((typeof actorData.data.humanity) !== "undefined") {
        updateData["data.-=humanity"] = null;
      }

      // Wound State migration/fixes
      // Moved to derivedStats in 0.72
      if ((typeof actorData.data.currentWoundState) !== "undefined") {
        updateData["data.derivedStats.currentWoundState"] = actorData.data.currentWoundState;
      }

      if ((typeof actorData.data.woundState) !== "undefined") {
        updateData["data.-=woundState"] = null;
      }

      // Critical Injuries migration/fixes
      // Moved to items in 0.72
      if ((typeof actorData.data.criticalInjuries) !== "undefined") {
        updateData["data.-=criticalInjuries"] = null;
      }

      // Adds external data points to actorData (e.g. for Armor SP resource bars)
      if ((typeof actorData.data.externalData) === "undefined") {
        updateData["data.externalData"] = {
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
    }

    return updateData;
  }

  // Segmented out the creation of items for the Actors as they are not just
  // manipulating the Actor Data, they are creating new Item entities in the
  // world and adding them to the actors.
  static async createActorItems(actorDocument) {
    let newItems = [];
    const actorData = actorDocument.data;
    // Migrate critical injures to items
    if ((typeof actorData.data.criticalInjuries) !== "undefined") {
      if (actorData.data.criticalInjuries.length > 0) {
        const migratedInjuries = this.migrateCriticalInjuries(actorData);
        if (!foundry.utils.isObjectEmpty(migratedInjures)) {
          this._migrationLog(`Migration critical injuries for Actor "${actorData.name}" (${actorData._id})`);
          newItems = migratedInjuries;
        }
      }
    }

    // This was added as part of 0.72.  We had one report of
    // a scenario where the actors somehow lost their core Cyberware items
    // so this ensures all actors have them.
    const pack = game.packs.get("cyberpunk-red-core.cyberware");
    // put into basickSkills array
    const content = await pack.getDocuments();
    const missingContent = this._validateCoreContent(actorData, content);
    if (missingContent.length > 0) {
      missingContent.forEach((c) => {
        const missingItem = c.data;
        this._migrationLog(`Actor "${actorData.name}" (${actorData._id}) is missing "${missingItem.name}". Creating.`);
        newItems.push(missingItem);
      });
    }

    // Previously we supported stackable programs, but with the upcoming Netrunning changes
    // programs should be handled like Cyberware as the Program ID gets correlated to the Cyberdeck
    // Item
    const programList = actorData.filteredItems.program;
    programList.forEach((p) => {
      const itemData = p.data;
      let quantity = itemData.data.amount;
      if (quantity > 1) {
        this._migrationLog(`Splitting Program "${itemData.name}" (${itemData._id}) Quanity: ${quantity} on actor "${actorData.name}" (${actorData._id}). Net new items: ${quantity - 1}`);
        itemData.data.amount = 1;
        while (quantity > 1) {
          newItems.push(itemData);
          quantity -= 1;
        }
      }
    });

    if (newItems.length > 0) {
      await actorDocument.createEmbeddedDocuments("Item", newItems, { CPRmigration: true });
    }
  }

  static _validateCoreContent(actorData, content) {
    const ownedCyberware = actorData.items.filter((o) => o.type === "cyberware");
    const installedCyberware = ownedCyberware.filter((i) => {
      let isInstalled = false;
      if ((typeof i.data.isInstalled) !== "undefined") {
        isInstalled = i.data.isInstalled;
      }
      if ((typeof i.data.data.isInstalled) !== "undefined") {
        isInstalled = i.data.data.isInstalled;
      }
      return isInstalled;
    });

    // Remove any installed items from the core content since the actorData has those items
    installedCyberware.forEach((c) => {
      content = content.filter((cw) => cw.name !== c.name);
    });

    // Anything left in content is missing
    return content;
  }

  static _migrateCriticalInjuries(actorData) {
    const { criticalInjuries } = actorData.data;
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
      injuryItems.push({ _id: injury.id, data: itemData });
    });
    return injuryItems;
  }

  // @param {object} itemData    The actor data object to update
  static migrateItemData(itemData) {
    let updateData = {};

    if (typeof itemData.data.description === "string") {
      const oldDescription = itemData.data.description;
      updateData["data.description"] = {
        value: oldDescription,
        chat: "",
        unidentified: "",
      };
    }
    switch (itemData.type) {
      case "weapon": {
        updateData = this._migrateWeapon(itemData, updateData);
        break;
      }
      case "program": {
        updateData = this._migrateProgram(itemData, updateData);
        break;
      }
      case "vehicle": {
        updateData = this._migrateVehicle(itemData, updateData);
        break;
      }
      case "gear": {
        updateData = this._migrateGear(itemData, updateData);
        break;
      }
      case "skill": {
        updateData = this._migrateSkill(itemData, updateData);
        break;
      }
      case "cyberware": {
        updateData = this._migrateCyberware(itemData, updateData);
        break;
      }
      case "netarch": {
        this._migrateNetArchitecture(itemData, updateData);
        break;
      }
      default:
    }
    return updateData;
  }

  // Item specific migration tasks
  static _migrateWeapon(itemData, updateData) {
    if ((typeof itemData.data.isConcealed) === "undefined") {
      updateData["data.isConcealed"] = false;
    }
    if ((typeof itemData.data.dvTable) === "undefined") {
      updateData["data.dvTable"] = "";
    }
    if ((typeof itemData.data.attackMod) === "undefined") {
      updateData["data.attackMod"] = 0;
    }
    // Added with 0.75.1
    if ((typeof itemData.data.unarmedAutomaticCalculation) === "undefined") {
      updateData["data.unarmedAutomaticCalculation"] = true;
    }
    return updateData;
  }

  static _migrateProgram(itemData, updateData) {
    if ((typeof itemData.data.slots) === "undefined" || itemData.data.slots === null) {
      updateData["data.slots"] = 1;
    }
    if ((typeof itemData.data.install) === "undefined" || itemData.data.install === null) {
      updateData["data.install"] = "";
    }
    if ((typeof itemData.data.isInstalled) === "undefined" || itemData.data.isInstalled === null) {
      updateData["data.isInstalled"] = false;
    }

    if ((typeof itemData.data.modifiers) !== "object") {
      updateData["data.modifiers"] = {};
    }

    if ((typeof itemData.data.damage) !== "object") {
      updateData["data.damage"] = { standard: "1d6", blackIce: "" };
    }

    if (itemData.data.amount !== 1) {
      updateData["data.amount"] = 1;
    }

    if ((typeof itemData.data.blackIceType) === "undefined" || itemData.data.blackIceType === null) {
      updateData["data.blackIceType"] = "antipersonnel";
    }

    if ((typeof itemData.data.prototypeActor) === "undefined" || itemData.data.prototypeActor === null) {
      updateData["data.prototypeActor"] = "";
    }

    const lowerName = itemData.name.toLowerCase().replace(/\s/g, "");

    // Setting a default program class since we are moving from
    // a free-form text to a selectable program class
    updateData["data.class"] = "antipersonnelattacker";
    // Set program class based on name
    switch (lowerName) {
      case "eraser":
      case "seeya":
      case "see-ya":
      case "speedygonzalez":
      case "worm": {
        updateData["data.class"] = "booster";
        break;
      }
      case "armor":
      case "flak":
      case "shield": {
        updateData["data.class"] = "defender";
        break;
      }
      case "banhammer":
      case "sword": {
        updateData["data.class"] = "antiprogramattacker";
        break;
      }
      case "deckkrash":
      case "hellbolt":
      case "nervescrub":
      case "poisonflatline":
      case "superglue":
      case "vrizzbolt": {
        updateData["data.class"] = "antipersonnelattacker";
        break;
      }
      case "asp":
      case "giant":
      case "hellhound":
      case "kracken":
      case "liche":
      case "raven":
      case "scorpion":
      case "skunk":
      case "wisp": {
        updateData["data.class"] = "blackice";
        updateData["data.blackIceType"] = "antipersonnel";
        break;
      }
      case "dragon":
      case "killer":
      case "sabertooth": {
        updateData["data.class"] = "blackice";
        updateData["data.blackIceType"] = "antiprogram";
        break;
      }

      default:
    }

    switch (itemData.data.class) {
      case "Anti-Program Attacker": {
        updateData["data.class"] = "antiprogramattacker";
        break;
      }
      case "Anti-Personnel Attacker": {
        updateData["data.class"] = "antipersonnelattacker";
        break;
      }
      case "Booster": {
        updateData["data.class"] = "booster";
        break;
      }
      case "Defender": {
        updateData["data.class"] = "defender";
        break;
      }
      case "BlackICE":
      case "Black ICE":
      case "Black-ICE": {
        updateData["data.class"] = "blackice";
        updateData["data.blackIceType"] = "other";
        break;
      }
      default:
    }

    if ((typeof itemData.data.equipped) === "undefined" || itemData.data.equipped === null) {
      updateData["data.equipped"] = "owned";
    }
    return updateData;
  }

  static _migrateVehicle(itemData, updateData) {
    if ((typeof itemData.data.sdp) === "undefined") {
      updateData["data.sdp"] = 0;
    }

    if ((typeof itemData.data.spd) !== "undefined") {
      updateData["data.sdp"] = itemData.data.spd;
      updateData["data.-=spd"] = null;
    }

    if ((typeof itemData.data.seats) === "string") {
      updateData["data.seats"] = Number(itemData.data.seats);
    }
    return updateData;
  }

  static _migrateGear(itemData, updateData) {
    if ((typeof itemData.data.equipped) === "undefined") {
      updateData["data.equipped"] = "owned";
    }

    const gearName = itemData.name.toLowerCase();

    // Cyberdecks became their own item type, so any "Gear" object with the name "cyberdeck"
    // in it's name will be prepended with a MIGRATE tag to let users know there's a new item type.
    if (gearName.includes("cyberdeck")) {
      const oldName = itemData.name;
      updateData.name = `${game.i18n.localize("CPR.migration.tag")} ${oldName}`;
    }

    return updateData;
  }

  static _migrateCyberware(itemData, updateData) {
    if (typeof itemData.data.slotSize !== "number") {
      updateData["data.slotSize"] = 1;
    }

    if ((itemData.data.isInstalled === true) && (itemData.data.isFoundational === true)) {
      updateData["data.installedOptionSlots"] = itemData.data.optionalIds.length;
    }

    if (itemData.data.type === "") {
      updateData["data.type"] = "cyberArm";
    }

    if (typeof itemData.data.isWeapon !== "boolean") {
      updateData["data.isWeapon"] = false;
    }
    return updateData;
  }

  // I (Jalen) spoke with Darin and he mentioned it might make most sense for
  // migration code like this to check if the value isn't a number rather
  // than if it is undefined because sometimes the value shows up as null.
  // Testing that theory here.
  static _migrateSkill(itemData, updateData) {
    if ((typeof itemData.data.skillmod) !== "number") {
      updateData["data.skillmod"] = 0;
    }

    return updateData;
  }

  static _migrateNetArchitecture(itemData, updateData) {
    if (itemData.data.floors.length !== 0) {
      const newfloors = [];
      itemData.data.floors.forEach((floor) => {
        if (!floor.content.startsWith("CPR.netArchitecture.floor.options")) {
          const splitString = floor.content.split(".");
          const editedFloor = duplicate(floor);
          switch (splitString[1]) {
            case "password":
            case "file":
            case "controlnode": {
              editedFloor.content = `CPR.netArchitecture.floor.options.${splitString[1]}`;
              break;
            }
            case "demon":
            case "balron":
            case "efreet":
            case "imp": {
              editedFloor.content = `CPR.netArchitecture.floor.options.demon.${splitString[1]}`;
              break;
            }
            case "blackice": {
              editedFloor.content = "CPR.global.programClass.blackice";
              break;
            }
            default: {
              editedFloor.content = `CPR.netArchitecture.floor.options.blackIce.${splitString[1]}`;
            }
          }
          newfloors.push(editedFloor);
        } else {
          newfloors.push(floor);
        }
      });
      updateData["data.floors"] = newfloors;
    }

    return updateData;
  }

  static async migrateCompendium(pack) {
    const { entity } = pack.metadata;
    if (!["Actor", "Item", "Scene"].includes(entity)) return;
    // Unlock the pack for editing
    const wasLocked = pack.locked;
    await pack.configure({ locked: false });

    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const documents = await pack.getDocuments();

    // Iterate over compendium entries - applying fine-tuned migration functions
    for (const doc of documents) {
      let updateData = {};
      try {
        switch (entity) {
          case "Actor": {
            updateData = this.migrateActorData(doc.data);
            break;
          }
          case "Item": {
            updateData = this.migrateItemData(doc.toObject());
            break;
          }
          default:
        }

        // Save the entry
        await doc.update(updateData);
      } catch (err) {
        err.message = `Failed cyberpunk-red-core system migration for entity ${doc.name} in pack ${pack.collection}: ${err.message}`;
        console.error(err);
      }
    }

    // Apply the original locked status for the pack
    await pack.configure({ locked: wasLocked });
  }

  static migrateSceneData(scene) {
    // Tokens contain an actorData element which is a diff from the original actor
    // and does NOT have all of the data elements of the original actor.  As best
    // as I can tell, token.actor.data is from the original actor with
    // the token.actorData merged to it.
    const tokens = scene.tokens.map((token) => {
      const t = token.toJSON();
      if (!t.actorId || t.actorLink) {
        // If we get here, we have a linked token and don't have
        // to do anything as the link actor was already migrated
        t.actorData = {};
      } else if (!game.actors.has(t.actorId)) {
        // If we get here, the token has an ID and is unlinked, however
        // the original actor that the token was created from was deleted.
        // This makes token.actor null so we don't have a full view of all
        // of the actor data.  I am unsure where the token charactersheet
        // is pulling the data from?  Either way, this is technically a broken
        // token and even Foundry throws errors when you do certain things
        // with this token.
        this._migrationLog(`WARNING: Token "${t.name}" (${t.actorId}) on Scene "${scene.name}" (${scene._id}) appears to be missing the source Actor and may cause Foundry issues.`);
        t.actorId = null;
        t.actorData = {};
      } else if (!t.actorLink) {
        // If we get here, we have an unlinked token actor, but the original
        // actor still exists.
        const actorData = duplicate(token.actor.data);
        actorData.type = token.actor?.type;

        const updateData = this.migrateActorData(actorData);
        ["items", "effects"].forEach((embeddedName) => {
          if (!updateData[embeddedName]?.length) return;
          const embeddedUpdates = new Map(updateData[embeddedName].map((u) => [u._id, u]));
          if (t.actorData[embeddedName]) {
            t.actorData[embeddedName].forEach((original) => {
              const updateMerge = embeddedUpdates.get(original._id);
              if (updateMerge) mergeObject(original, updateMerge);
            });
          }
          delete updateData[embeddedName];
        });

        mergeObject(t.actorData, updateData);
      }
      return t;
    });
    return { tokens };
  }

  static _migrationLog(message) {
    console.log(`CPR MIGRATION | ${message}`);
  }
}
