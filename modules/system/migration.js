/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-await-in-loop */
export default class Migration {
  static async migrateWorld() {
    ui.notifications.notify(`Beginning Migration of Cyberpunk Red Core to Data Model ${game.system.data.version}.`);
    for (const i of game.items.entities) {
      console.log("Migrate game items");
      await i.update(this.migrateItemData(duplicate(i.data)));
    }

    for (const a of game.actors.entities) {
      console.log("Migrate game actors");
      await this.migrateActorData(a);
    }

    for (const p of game.packs) {
      console.log("Migrate game packs");
      if (p.metadata.entity === "Item" && p.metadata.package === "world") {
        p.getContent().then(async (items) => {
          items.forEach(async (i) => {
            await p.updateEntity(this.migrateItemData(i.data));
          });
        });
      }

      if (p.metadata.entity === "Actor" && p.metadata.package === "world") {
        console.log("Update metadata packs");
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
    console.log("Migrate actor items");
    console.log(actorItems);
    for (const i of actorItems) {
      await actor.updateEmbeddedEntity("OwnedItem", this.migrateItemData(i.data));
    }
    return actor.data;
  }

  static migrateItemData(itemData) {
    console.log(itemData);
    return itemData;
  }
}
