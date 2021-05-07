/* global ItemSheet */
/* global mergeObject, game, $, hasProperty, getProperty, setProperty, duplicate */
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import SelectCompatibleAmmo from "../../dialog/cpr-select-compatible-ammo.js";
import NetarchLevelPrompt from "../../dialog/cpr-netarch-level-prompt.js";
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
    formData = await SelectCompatibleAmmo.RenderPrompt(formData);
    if (formData.selectedAmmo) {
      await this.item.setCompatibleAmmo(formData.selectedAmmo);
      this._automaticResize(); // Resize the sheet as length of ammo list might have changed
    }
  }

  _automaticResize() {
    LOGGER.trace("ItemSheet | _automaticResize | Called.");
    const setting = game.settings.get("cyberpunk-red-core", "automaticallyResizeSheets");
    if (setting) {
      // It seems that the size of the content does not change immediately upon updating the content
      setTimeout(() => {
        this.setPosition({ width: this.position.width, height: 35 }); // Make sheet small, so this.form.offsetHeight does not include whitespace
        this.setPosition({ width: this.position.width, height: this.form.offsetHeight + 46 }); // 30px for the header and 8px top margin 8px bottom margin
      }, 10);
    }
  }

  async _netarchLevelAction(event) {
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
        level: "",
        dv: "",
        content: "",
        returnType: "string",
      };
      formData = await NetarchLevelPrompt.RenderPrompt(formData);

      if (hasProperty(itemData, "data.floors")) {
        const prop = getProperty(itemData, "data.floors");
        let maxIndex = -1;
        prop.forEach((floor) => { if (floor.index > maxIndex) { maxIndex = floor.index; } });
        prop.push({
          index: maxIndex + 1,
          level: formData.level,
          dv: formData.dv,
          content: formData.content,
        });
        setProperty(itemData, "data.floors", prop);
        this.item.update(itemData);
        this._automaticResize(); // Resize the sheet as length of settings list might have changed
      } else {
        const prop = [{
          index: 0,
          level: formData.level,
          dv: formData.dv,
          content: formData.content,
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
          level: editElement.level,
          dv: editElement.dv,
          content: editElement.content,
          returnType: "string",
        };
        formData = await NetarchLevelPrompt.RenderPrompt(formData);
        prop.splice(prop.indexOf(editElement), 1);
        prop.push({
          index: editElement.index,
          level: formData.level,
          dv: formData.dv,
          content: formData.content,
        });
        setProperty(itemData, "data.floors", prop);
        this.item.update(itemData);
        this._automaticResize(); // Resize the sheet as length of settings list might have changed
      }
    }
  }
}
