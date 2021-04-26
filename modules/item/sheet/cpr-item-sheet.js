/* global ItemSheet */
/* global mergeObject, game, $, hasProperty, getProperty, setProperty, duplicate */
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import SelectCompatibleAmmo from "../../dialog/cpr-select-compatible-ammo.js";
import DvUtils from "../../utils/cpr-dvUtils.js";
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
    const setting = game.settings.get("cyberpunk-red-core", "automaticallyResizeSheets");
    if (setting) {
      if (Object.entries(options).length === 0) {
        // In case of updating an item on an actor all the items, which were ever opened from that actor sheet are called with options = { action:"update" }
        // to prevent rendering them it is checked that the options object is empty. For changes directly on the item _delayedRender is called after the change to resize the sheet
        this.setPosition({ width: this.position.width, height: 35 }); // Make sheet small, so this.form.offsetHeight does not include whitespace
        this.setPosition({ width: this.position.width, height: this.form.offsetHeight + 46 }); // 30px for the header and 8px top margin 8px bottom margin
      }
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

    // Sheet resizing
    html.find(".tab-label").click((event) => this._delayedRender(this));
  }

  /*
  INTERNAL METHODS BELOW HERE
*/
  _delayedRender(sheet) {
    // It seems that the size of the content does not change immediately upon updating the content
    setTimeout(() => {
      sheet._render();
    }, 10);
  }

  _itemCheckboxToggle(event) {
    LOGGER.trace("CPRItemID _itemCheckboxToggle Called | CPRItemSheet | Called.");
    const itemData = duplicate(this.item.data);
    const target = $(event.currentTarget).attr("data-target");
    if (hasProperty(itemData, target)) {
      setProperty(itemData, target, !getProperty(itemData, target));
      this.item.update(itemData);
      this._delayedRender(this);
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
      this._delayedRender(this);
    }
  }

  async _selectCompatibleAmmo(event) {
    const itemData = this.item.getData();
    let formData = { id: this.item.data._id, name: this.item.data.name, data: itemData };
    formData = await SelectCompatibleAmmo.RenderPrompt(formData);
    if (formData.selectedAmmo) {
      await this.item.setCompatibleAmmo(formData.selectedAmmo);
      this._delayedRender(this);
    }
  }
}
