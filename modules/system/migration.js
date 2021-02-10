/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-await-in-loop */
export default class Migration {
  static async migrateWorld() {
    ui.notifications.notify("Beginning Migration of Cyberpunk-Red-Core to CPR2.0");
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
            if (i.type === "weapon") {
              await p.updateEntity(this.migrateItemData(i.data));
            }
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
    ui.notifications.notify("Migration to CPR2.0 Finished");

    game.settings.set("cyberpunk-red-core", "systemMigrationVersion", game.system.data.version);
  }

  static async migrateActorData(actor) {
    const actorItems = actor.items;
    for (const i of actorItems) {
      await actor.updateEmbeddedEntity("OwnedItem", this.migrateItemData(i.data));
    }
    return actor.data;
  }

  static migrateItemData(itemData) {
    return itemData;
  }
}
