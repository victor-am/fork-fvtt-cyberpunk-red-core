/* eslint-disable no-undef */
import LOGGER from "../utils/cpr-logger.js";

const hotbarHooks = () => {
  Hooks.on("hotbarDrop", async (bar, data, slot) => {
    LOGGER.trace("hotbarDrop | hotbarHooks | Called.");
    /**
             * Create a macro when dropping an entity on the hotbar
             * Item      - open roll dialog for item
             * Actor     - open actor sheet
             * Journal   - open journal sheet
             */
    if (data.type === "Item") {
      if (data.data === undefined || data.data._id === undefined) {
        return;
      }
      const itemId = data.data._id;
      let item = game.items.find((i) => i._id === itemId);

      if (item === null) {
        // Item not found in the world, check actor for the item
        if (data.actorId !== undefined) {
          const actor = game.actors.find((a) => a._id === data.actorId);
          if (actor !== null) {
            item = actor.getEmbeddedEntity("OwnedItem", itemId);
          }
        }
      }

      if (item === null) {
        return;
      }

      // Create item macro if rollable item - weapon or skill
      if (item.type !== "weapon" && item.type !== "skill") {
        return;
      }
      const command = `game.cpr.utility.rollItemMacro("${item.name}");`;
      let macro = game.macros.entities.find((m) => (m.name === item.name) && (m.command === command));
      if (!macro) {
        macro = await Macro.create({
          name: item.name,
          type: "script",
          img: item.img,
          command,
        }, { displaySheet: false });
      }
      game.user.assignHotbarMacro(macro, slot);
    } else if (data.type === "Actor") {
      // Create a macro to open the actor sheet of the actor dropped on the hotbar

      const actor = game.actors.get(data.id);
      const command = `game.actors.get("${data.id}").sheet.render(true)`;
      let macro = game.macros.entities.find((m) => (m.name === actor.name) && (m.command === command));
      if (!macro) {
        macro = await Macro.create({
          name: actor.data.name,
          type: "script",
          img: actor.data.img,
          command,
        }, { displaySheet: false });
        game.user.assignHotbarMacro(macro, slot);
      }
    } else if (data.type === "JournalEntry") {
      // Create a macro to open the journal sheet of the journal dropped on the hotbar
      const journal = game.journal.get(data.id);
      const command = `game.journal.get("${data.id}").sheet.render(true)`;
      let macro = game.macros.entities.find((m) => (m.name === journal.name) && (m.command === command));
      if (!macro) {
        macro = await Macro.create({
          name: journal.data.name,
          type: "script",
          img: "systems/cyberpunk-red-core/icons/memory-card.svg",
          command,
        }, { displaySheet: false });
        game.user.assignHotbarMacro(macro, slot);
      }
    }
  });
};

export default hotbarHooks;
