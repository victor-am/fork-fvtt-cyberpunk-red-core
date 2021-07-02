/* global ItemSheet */
/* global mergeObject, game, $, hasProperty, getProperty, setProperty, duplicate */
import LOGGER from "../../utils/cpr-logger.js";
import CPR from "../../system/config.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import SelectCompatibleAmmo from "../../dialog/cpr-select-compatible-ammo.js";
import NetarchLevelPrompt from "../../dialog/cpr-netarch-level-prompt.js";
import CyberdeckSelectProgramsPrompt from "../../dialog/cpr-select-install-programs-prompt.js";
import SelectItemUpgradePrompt from "../../dialog/cpr-select-item-upgrade-prompt.js";
import BoosterAddModifierPrompt from "../../dialog/cpr-booster-add-modifier-prompt.js";
import ConfirmPrompt from "../../dialog/cpr-confirmation-prompt.js";
import DvUtils from "../../utils/cpr-dvUtils.js";
import CPRNetarchUtils from "../../utils/cpr-netarchUtils.js";
/**
 * Extend the basic ActorSheet.
 * @extends {ItemSheet}
 */

export default class CPRItemSheet extends ItemSheet {
  /* -------------------------------------------- */
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRItemSheet | Called.");
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: ".navtabs-item", contentSelector: ".item-bottom-content-section", initial: "item-description" }],
      width: 590,
      height: 450,
    });
  }

  async _render(force = false, options = {}) {
    LOGGER.trace("ItemSheet | _render | Called.");
    await super._render(force, options);
    if (!Object.keys(options).some((k) => ((k === "action") && (options[k] === "update")))) {
      // In case of updating a value on an item sheet the resizing should not happen.
      // If a value is updated the _render function is called with options = { action: "update" }
      // Should one still desire resizing the sheet afterwards, please call _automaticResize explicitly.
      // Additionally if one item owned by an actor is updated, all items, which were opened before
      // are called with options = { action: "update" }.
      this._automaticResize();
    }
  }

  get template() {
    LOGGER.trace(`template | CPRItemSheet | Called with type [${this.item.type}].`);
    return `systems/cyberpunk-red-core/templates/item/cpr-item-sheet.hbs`;
  }

  get classes() {
    LOGGER.trace(`classes | CPRItemSheet | Called with type [${this.item.type}].`);
    return super.defaultOptions.classes.concat(["sheet", "item", `${this.item.type}`]);
  }

  /* --------------------------------------------
  Had to make this async to get await to work on the GetCoreSkills?  Not
  sure if that is the right way to do this?
  */
  /** @override */
  async getData() {
    const data = super.getData();
    // data.isGM = game.user.isGM;
    data.isGM = game.user.isGM;
    data.isOwned = this.object.isOwned;
    // data.filteredItems will be other items relevant to this one.
    // For owned objects, the item list will come from the character owner
    // For unowned objects, the item list will come from the core list of objects
    data.filteredItems = {};
    if (data.isOwned) {
      data.filteredItems = this.object.actor.itemTypes;
    } else {
      data.filteredItems.skill = await SystemUtils.GetCoreSkills();
    }
    if (data.item.type === "cyberdeck" || data.item.type === "weapon" || data.item.type === "cyberware") {
      data.data.data.availableSlots = this.object.availableSlots();
    }
    data.dvTableNames = DvUtils.GetDvTables();
    return data;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.options.editable) return;

    // Select all text when grabbing text input.
    $("input[type=text]").focusin(function () {
      $(this).select();
    });

    html.find(".item-checkbox").click((event) => this._itemCheckboxToggle(event));

    html.find(".item-multi-option").click((event) => this._itemMultiOption(event));

    html.find(".select-compatible-ammo").click((event) => this._selectCompatibleAmmo(event));

    html.find(".netarch-level-action").click((event) => this._netarchLevelAction(event));

    html.find(".select-installed-programs").click((event) => this._cyberdeckSelectInstalledPrograms(event));

    html.find(".program-uninstall").click((event) => this._cyberdeckProgramUninstall(event));

    html.find(".program-add-booster-modifier").click((event) => this._addBoosterModifier(event));

    html.find(".program-del-booster-modifier").click((event) => this._delBoosterModifier(event));

    html.find(".select-item-upgrades").click((event) => this._selectItemUpgrades(event));

    html.find(".item-view").click((event) => this._renderReadOnlyItemCard(event));

    html.find(".netarch-generate-auto").click((event) => {
      if (game.user.isGM) {
        const netarchGenerator = new CPRNetarchUtils(this.item);
        netarchGenerator._generateNetarchScene();
      } else {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netarchgeneratenogmerror"));
      }
    });

    html.find(".netarch-generate-custom").click((event) => {
      if (game.user.isGM) {
        const netarchGenerator = new CPRNetarchUtils(this.item);
        netarchGenerator._customize();
      } else {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netarchgeneratenogmerror"));
      }
    });

    html.find(".netarch-item-link").click((event) => this._openItemFromId(event));

    // Sheet resizing
    html.find(".tab-label").click((event) => this._automaticResize());
  }

  /*
  INTERNAL METHODS BELOW HERE
*/
  _itemCheckboxToggle(event) {
    LOGGER.trace("CPRItemID _itemCheckboxToggle Called | CPRItemSheet | Called.");
    const itemData = duplicate(this.item.data);
    const target = $(event.currentTarget).attr("data-target");
    if (hasProperty(itemData, target)) {
      setProperty(itemData, target, !getProperty(itemData, target));
      this.item.update(itemData);
      this._automaticResize(); // Resize the sheet as length of settings list might have changed
    }
  }

  async _itemMultiOption(event) {
    LOGGER.trace("CPRItemID _itemMultiOption Called | CPRItemSheet | Called.");
    const itemData = duplicate(this.item.data);
    // the target the option wants to be put into
    const target = $(event.currentTarget).parents(".item-multi-select").attr("data-target");
    const value = $(event.currentTarget).attr("data-value");
    if (hasProperty(itemData, target)) {
      const prop = getProperty(itemData, target);
      if (prop.includes(value)) {
        prop.splice(prop.indexOf(value), 1);
      } else {
        prop.push(value);
      }
      setProperty(itemData, target, prop);
      this.item.update(itemData);
      this._automaticResize(); // Resize the sheet as length of settings list might have changed
    }
  }

  async _selectCompatibleAmmo(event) {
    const itemData = this.item.getData();
    let formData = { id: this.item.data._id, name: this.item.data.name, data: itemData };
    formData = await SelectCompatibleAmmo.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    if (formData.selectedAmmo) {
      await this.item.setCompatibleAmmo(formData.selectedAmmo);
      this._automaticResize(); // Resize the sheet as length of ammo list might have changed
    }
  }

  _automaticResize() {
    LOGGER.trace("ItemSheet | _automaticResize | Called.");
    const setting = game.settings.get("cyberpunk-red-core", "automaticallyResizeSheets");
    if (setting && this.rendered && !this._minimized) {
      // It seems that the size of the content does not change immediately upon updating the content
      setTimeout(() => {
        this.setPosition({ width: this.position.width, height: 35 }); // Make sheet small, so this.form.offsetHeight does not include whitespace
        this.setPosition({ width: this.position.width, height: this.form.offsetHeight + 46 }); // 30px for the header and 8px top margin 8px bottom margin
      }, 10);
    }
  }

  async _netarchLevelAction(event) {
    LOGGER.trace("ItemSheet | _netarchLevelAction | Called.");
    const target = Number($(event.currentTarget).attr("data-action-target"));
    const action = $(event.currentTarget).attr("data-action-type");
    const itemData = duplicate(this.item.data);

    if (action === "delete") {
      const setting = game.settings.get("cyberpunk-red-core", "deleteItemConfirmation");
      if (setting) {
        const promptMessage = `${SystemUtils.Localize("CPR.deleteconfirmation")} ${SystemUtils.Localize("CPR.netarchfloordeleteconfirmation")} ${SystemUtils.Localize("CPR.netarch")}?`;
        const confirmDelete = await ConfirmPrompt.RenderPrompt(
          SystemUtils.Localize("CPR.deletedialogtitle"), promptMessage,
        );
        if (!confirmDelete) {
          return;
        }
      }
      if (hasProperty(itemData, "data.floors")) {
        const prop = getProperty(itemData, "data.floors");
        let deleteElement = null;
        prop.forEach((floor) => { if (floor.index === target) { deleteElement = floor; } });
        prop.splice(prop.indexOf(deleteElement), 1);
        setProperty(itemData, "data.floors", prop);
        this.item.update(itemData);
        this._automaticResize(); // Resize the sheet as length of settings list might have changed
      }
    }

    if (action === "up" || action === "down") {
      if (hasProperty(itemData, "data.floors")) {
        const prop = getProperty(itemData, "data.floors");
        const indices = [];
        prop.forEach((floor) => { indices.push(floor.index); });
        let swapPartner = null;
        if (action === "up") {
          swapPartner = Math.min(...indices);
        } else {
          swapPartner = Math.max(...indices);
        }
        if (target !== swapPartner) {
          if (action === "up") {
            indices.forEach((i) => { if (i < target && i > swapPartner) { swapPartner = i; } });
          } else {
            indices.forEach((i) => { if (i > target && i < swapPartner) { swapPartner = i; } });
          }
          let element1 = null;
          let element2 = null;
          prop.forEach((floor) => { if (floor.index === target) { element1 = floor; } });
          prop.forEach((floor) => { if (floor.index === swapPartner) { element2 = floor; } });
          const newElement1 = duplicate(element1);
          const newElement2 = duplicate(element2);
          prop.splice(prop.indexOf(element1), 1);
          prop.splice(prop.indexOf(element2), 1);
          newElement1.index = swapPartner;
          newElement2.index = target;
          prop.push(newElement1);
          prop.push(newElement2);
          setProperty(itemData, "data.floors", prop);
          this.item.update(itemData);
        }
      }
    }

    if (action === "create") {
      let formData = {
        floornumbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
        branchlabels: ["a", "b", "c", "d", "e", "f", "g", "h"],
        dvoptions: ["N/A", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
        contentoptions: {
          "CPR.password": SystemUtils.Localize("CPR.password"),
          "CPR.file": SystemUtils.Localize("CPR.file"),
          "CPR.controlnode": SystemUtils.Localize("CPR.controlnode"),
          "CPR.blackice": SystemUtils.Localize("CPR.blackice"),
        },
        blackiceoptions: {
          "--": "--",
          "CPR.asp": SystemUtils.Localize("CPR.asp"),
          "CPR.giant": SystemUtils.Localize("CPR.giant"),
          "CPR.hellhound": SystemUtils.Localize("CPR.hellhound"),
          "CPR.kraken": SystemUtils.Localize("CPR.kraken"),
          "CPR.liche": SystemUtils.Localize("CPR.liche"),
          "CPR.raven": SystemUtils.Localize("CPR.raven"),
          "CPR.scorpion": SystemUtils.Localize("CPR.scorpion"),
          "CPR.skunk": SystemUtils.Localize("CPR.skunk"),
          "CPR.wisp": SystemUtils.Localize("CPR.wisp"),
          "CPR.dragon": SystemUtils.Localize("CPR.dragon"),
          "CPR.killer": SystemUtils.Localize("CPR.killer"),
          "CPR.sabertooth": SystemUtils.Localize("CPR.sabertooth"),
        },
        floor: "1",
        branch: "a",
        dv: "N/A",
        content: SystemUtils.Localize("CPR.password"),
        blackice: "--",
        description: "",
        returnType: "string",
      };
      formData = await NetarchLevelPrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
      if (formData === undefined) {
        return;
      }

      if (hasProperty(itemData, "data.floors")) {
        const prop = getProperty(itemData, "data.floors");
        let maxIndex = -1;
        prop.forEach((floor) => { if (floor.index > maxIndex) { maxIndex = floor.index; } });
        prop.push({
          index: maxIndex + 1,
          floor: formData.floor,
          branch: formData.branch,
          dv: formData.dv,
          content: formData.content,
          blackice: formData.blackice,
          description: formData.description,
        });
        setProperty(itemData, "data.floors", prop);
        this.item.update(itemData);
        this._automaticResize(); // Resize the sheet as length of settings list might have changed
      } else {
        const prop = [{
          index: 0,
          floor: formData.floor,
          branch: formData.branch,
          dv: formData.dv,
          content: formData.content,
          blackice: formData.blackice,
          description: formData.description,
        }];
        setProperty(itemData, "data.floors", prop);
        this.item.update(itemData);
        this._automaticResize(); // Resize the sheet as length of settings list might have changed
      }
    }

    if (action === "edit") {
      if (hasProperty(itemData, "data.floors")) {
        const prop = getProperty(itemData, "data.floors");
        let editElement = null;
        prop.forEach((floor) => { if (floor.index === target) { editElement = floor; } });
        let formData = {
          floornumbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
          branchlabels: ["a", "b", "c", "d", "e", "f", "g", "h"],
          dvoptions: ["N/A", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
          contentoptions: {
            "CPR.password": SystemUtils.Localize("CPR.password"),
            "CPR.file": SystemUtils.Localize("CPR.file"),
            "CPR.controlnode": SystemUtils.Localize("CPR.controlnode"),
            "CPR.blackice": SystemUtils.Localize("CPR.blackice"),
          },
          blackiceoptions: {
            "--": "--",
            "CPR.asp": SystemUtils.Localize("CPR.asp"),
            "CPR.giant": SystemUtils.Localize("CPR.giant"),
            "CPR.hellhound": SystemUtils.Localize("CPR.hellhound"),
            "CPR.kraken": SystemUtils.Localize("CPR.kraken"),
            "CPR.liche": SystemUtils.Localize("CPR.liche"),
            "CPR.raven": SystemUtils.Localize("CPR.raven"),
            "CPR.scorpion": SystemUtils.Localize("CPR.scorpion"),
            "CPR.skunk": SystemUtils.Localize("CPR.skunk"),
            "CPR.wisp": SystemUtils.Localize("CPR.wisp"),
            "CPR.dragon": SystemUtils.Localize("CPR.dragon"),
            "CPR.killer": SystemUtils.Localize("CPR.killer"),
            "CPR.sabertooth": SystemUtils.Localize("CPR.sabertooth"),
          },
          floor: editElement.floor,
          branch: editElement.branch,
          dv: editElement.dv,
          content: editElement.content,
          blackice: editElement.blackice,
          description: editElement.description,
          returnType: "string",
        };
        formData = await NetarchLevelPrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
        if (formData === undefined) {
          return;
        }
        prop.splice(prop.indexOf(editElement), 1);
        prop.push({
          index: editElement.index,
          floor: formData.floor,
          branch: formData.branch,
          dv: formData.dv,
          content: formData.content,
          blackice: formData.blackice,
          description: formData.description,
        });
        setProperty(itemData, "data.floors", prop);
        this.item.update(itemData);
        this._automaticResize(); // Resize the sheet as length of settings list might have changed
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _openItemFromId(event) {
    LOGGER.trace("ItemSheet | _netarchLevelAction | Called.");
    const itemId = $(event.currentTarget).attr("data-item-id");
    const itemEntity = game.items.get(itemId);
    if (itemEntity !== null) {
      itemEntity.sheet.render(true);
    } else {
      SystemUtils.DisplayMessage("error", SystemUtils.Format("CPR.itemdoesnotexisterror", { itemid: itemId }));
    }
  }

  // Program Code

  async _addBoosterModifier(event) {
    const boosterTypes = Object.keys(CPR.interfaceAbilities);
    let formData = {
      boosterTypes,
      returnType: "array",
    };
    formData = await BoosterAddModifierPrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    if (formData) {
      this.item.data.data.modifiers[formData.boosterType] = formData.modifierValue;
    }
    if (this.actor) {
      await this.actor.updateEmbeddedDocuments("Item", [{ _id: this.item.id, "data.modifiers": this.item.data.data.modifiers }]);
    }
    this.item.update({ "data.modifiers": this.item.data.data.modifiers });
  }

  async _delBoosterModifier(event) {
    const boosterType = $(event.currentTarget).attr("data-booster-type");
    delete this.item.data.data.modifiers[boosterType];
    if (this.actor) {
      const updatedObject = { _id: this.item.id };
      const objectKey = `data.modifiers.-=${boosterType}`;
      updatedObject[objectKey] = null;
      await this.actor.updateEmbeddedDocuments("Item", [updatedObject]);
    }
    return this.item.update({ "data.modifiers": this.item.data.data.modifiers });
  }

  // Cyberdeck Code

  async _cyberdeckSelectInstalledPrograms(event) {
    LOGGER.debug("_cyberdeckSelectInstalledPrograms | CPRItem | Called.");
    const cyberdeck = this.item;
    if (cyberdeck.data.type !== "cyberdeck") {
      return;
    }

    // We only support loading programs onto owned decks, so let's get the actor
    // Get the actor that owns this cyberdeck (if owned)
    const actor = (cyberdeck.isOwned) ? cyberdeck.actor : null;

    if (!actor || (actor.type !== "character" && actor.type !== "mook")) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.owneditemonlyerror"));
      return;
    }

    // Get a list of programs that are installed on this cyberdeck
    const installedPrograms = cyberdeck.getInstalledPrograms();

    // Prepare a list of programs for the prompt to select from
    let programList = [];

    // Start with the list of all programs owned by the actor
    programList = actor.data.filteredItems.program;

    // Remove all programs that are installed somewhere other than this deck
    actor.data.filteredItems.programsInstalled.forEach((programId) => {
      const onDeck = installedPrograms.filter((p) => p._id === programId);
      if (onDeck.length === 0) {
        programList = programList.filter((p) => p.id !== programId);
      }
    });

    programList = programList.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));

    let formData = {
      cyberdeck,
      programList,
      returnType: "array",
    };

    formData = await CyberdeckSelectProgramsPrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }

    let selectedPrograms = [];
    let unselectedPrograms = programList;

    let storageRequired = 0;

    formData.selectedPrograms.forEach((pId) => {
      const program = (programList.filter((p) => p.data._id === pId))[0];
      storageRequired += program.data.data.slots;
      selectedPrograms.push(program);
      unselectedPrograms = unselectedPrograms.filter((p) => p.data._id !== program.data._id);
    });

    selectedPrograms = selectedPrograms.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));
    unselectedPrograms = unselectedPrograms.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));

    if (storageRequired > cyberdeck.data.data.slots) {
      SystemUtils.DisplayMessage("warn", "CPR.cyberdeckinsufficientstorage");
    }

    cyberdeck.uninstallPrograms(unselectedPrograms);
    cyberdeck.installPrograms(selectedPrograms);

    const updateList = [{ _id: cyberdeck.id, data: cyberdeck.data.data }];
    programList.forEach((program) => {
      updateList.push({ _id: program.id, data: program.data.data });
    });
    await actor.updateEmbeddedDocuments("Item", updateList);
  }

  async _cyberdeckProgramUninstall(event) {
    const programId = $(event.currentTarget).attr("data-item-id");
    LOGGER.debug("_cyberdeckProgramUninstall | CPRItem | Called.");
    const cyberdeck = this.item;
    if (cyberdeck.data.type !== "cyberdeck") {
      return;
    }

    const actor = (cyberdeck.isOwned) ? cyberdeck.actor : null;

    if (!actor) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.owneditemonlyerror"));
      return;
    }

    const program = (actor.data.filteredItems.program.filter((p) => p.data._id === programId))[0];

    cyberdeck.uninstallPrograms([program]);

    const updateList = [{ _id: cyberdeck.data._id, data: cyberdeck.data.data }];
    updateList.push({ _id: program.data._id, "data.isInstalled": false });
    await actor.updateEmbeddedDocuments("Item", updateList);
  }

  async _selectItemUpgrades(event) {
    const { item } = this;

    // We only support upgraded items thatr are owned by an actor
    // Get the actor that owns this item (if owned)

    const actor = (item.isOwned) ? item.actor : null;
    if (!actor || (actor.type !== "character" && actor.type !== "mook")) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.owneditemonlyerror"));
      return;
    }

    const installedUpgrades = item.data.data.upgrades;
    const ownedUpgrades = actor.data.filteredItems.itemUpgrade;
    const availableUpgrades = ownedUpgrades.filter((u) => u.data.data.type === item.type && u.data.data.isInstalled === false);
    let uninstallList = [];
    installedUpgrades.forEach((u) => {
      const upgradeId = u._id;
      const upgradeItem = actor._getOwnedItem(upgradeId);
      availableUpgrades.push(upgradeItem);
      uninstallList.push(upgradeItem);
    });
    let formData = {
      item,
      availableUpgrades,
    };
    formData = await SelectItemUpgradePrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }

    const installList = [];
    formData.selectedUpgradeIds.forEach((id) => {
      const upgradeItem = actor._getOwnedItem(id);
      installList.push(upgradeItem);
      uninstallList = uninstallList.filter((u) => u.id !== id);
    });

    if (uninstallList.length > 0) {
      await item.uninstallUpgrades(uninstallList);
    }

    if (installList.length > 0) {
      await item.installUpgrades(installList);
    }

    if (item.type === "weapon" && item.availableSlots() < 0) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.toomanyattachments"));
    }
  }

  /**
   * Render an item sheet in read-only mode, which is used on installed cyberware. This is to
   * prevent a user from editing data while it is installed, such as the foundation type.
   *
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  _renderReadOnlyItemCard(event) {
    LOGGER.trace("_renderReadOnlyItemCard | CPRItemSheet | Called.");
    const itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
    const item = this.actor.items.find((i) => i.data._id === itemId);
    item.sheet.render(true, { editable: false });
  }
}
