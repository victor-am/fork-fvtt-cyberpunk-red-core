/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-await-in-loop */
export default class Migration {
  static async migrateWorld(incomingDataModelVersion) {
    ui.notifications.notify(`Beginning Migration of Cyberpunk Red Core from Data Model ${incomingDataModelVersion} to ${game.system.data.version}.`);
    this.incomingDataModelVersion = incomingDataModelVersion;
    for (const i of game.items.entities) {
      await i.update(this.migrateItemData(duplicate(i.data)));
    }

    for (const a of game.actors.entities) {
      await this.migrateActorData(a);
    }

    for (const p of game.packs) {
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
    ui.notifications.notify(`Migration of Cyberpunk Red Core to Data Model ${game.system.data.version} Finished.`);

    game.settings.set("cyberpunk-red-core", "dataModelVersion", game.system.data.version);
  }

  static async migrateActorData(actor) {
    const actorItems = actor.items;
    const actorData = actor.data;
    for (const i of actorItems) {
      await actor.updateEmbeddedEntity("OwnedItem", this.migrateItemData(i.data));
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
    if ((typeof actorData.data.derivedStats.deathSave) === "number") {
      const oldDeathSave = actorData.data.derivedStats.deathSave;
      let oldDeathPenalty = 0;
      if (typeof actorData.data.derivedStats.deathSavePenlty !== "undefined") {
        oldDeathPenalty = actorData.data.derivedStats.deathSavePenlty;
        delete actorData.data.derivedStats.deathSavePenlty;
      }
      actorData.data.derivedStats.deathSave = { value: oldDeathSave, penalty: oldDeathPenalty, basePenalty: 0 };
    }

    if (typeof actorData.data.derivedStats.deathSavePenlty !== "undefined") {
      delete actorData.data.derivedStats.deathSavePenlty;
    }

    if ((typeof actorData.data.roleInfo.activeRole) === "undefined") {
      let configuredRole = "solo";
      if (actorData.data.roleInfo.roles.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        configuredRole = actorData.data.roleInfo.roles[0];
      }
      actorData.data.roleInfo.activeRole = configuredRole;
    }

    // Original Data Model had a spelling issue
    if ((typeof actorData.data.lifepath.familyBackground) === "undefined") {
      actorData.data.lifepath.familyBackground = "";
      if ((typeof actorData.data.lifepath.familyBackgrond) !== "undefined") {
        actorData.data.lifepath.familyBackground = actorData.data.lifepath.familyBackgrond;
        delete actorData.data.lifepath.familyBackgrond;
      }
    }

    if ((typeof actorData.data.lifestyle.fashion) === "undefined") {
      actorData.data.lifestyle.fashion = "";
      if ((typeof actorData.data.lifestyle.fasion) !== "undefined") {
        actorData.data.lifestyle.fashion = actorData.data.lifestyle.fasion;
        delete actorData.data.lifestyle.fasion;
      }
    }

    await actor.update(actorData, { diff: false, enforceTypes: false });
  }

  static migrateItemData(itemData) {
    return itemData;
  }
}
