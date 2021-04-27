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
      let command = "";
      command += "// Set this to true if you want to skip the roll verify prompt.\n";
      command += "// Do not delete the semi-colon at the end of the line!\n";
      command += "const skipPrompt = false;\n";
      command += "\n";
      const itemName = item.name.replace(/\\/g, "\\\\").replace(/\\([\s\S])|(")/g, "\\$1$2");
      if (item.type === "weapon") {
        command += "// The roll type of the weapon for this macro is configurable.\n";
        command += "// By default, we do the standard attack, however the rollType,\n";
        command += "// may be configured by setting it to a different value:\n";
        command += "//\n";
        command += "// damage - Set the rollType to this to roll damage instead of an attack\n";
        command += "//\n";
        if (item.data.isRanged) {
          command += "// For ranged weapons, you can configure a number of alternate fire:\n";
          command += "// attacks:\n";
          command += "//\n";
          command += "// aimed       - Performs an aimed shot\n";
          command += "// autofire    - Performs an autofire attack,\n";
          command += "//               use only for SMG types and Assault Rifles\n";
          command += "// suppressive - Performs a suppressive fire attack,\n";
          command += "//               use only for SMG types and Assault Rifles\n";
          command += "//\n";
        }
        command += "// Simply change the \"attack\" to one of the above to change the function.\n";
        command += "\n";
        command += "const rollType = \"attack\";\n";
        command += "\n";
        command += "// Do not edit anything below this line, please.\n";
        command += "\n";
        command += `game.cpr.macro.rollItemMacro("${itemName}", {skipPrompt, rollType});`;
      } else {
        command += `game.cpr.macro.rollItemMacro("${itemName}", {skipPrompt});`;
      }
      let macro = game.macros.entities.find((m) => (m.name === item.name) && (m.command === command));
      const img = item.type === "skill" ? "systems/cyberpunk-red-core/icons/chip-skill.png" : item.img;
      if (!macro) {
        macro = await Macro.create({
          name: item.name,
          type: "script",
          img,
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
