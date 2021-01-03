import LOGGER from "../../utils/cpr-logger.js";

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
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "main" }],
      width: 450,
      height: 300,
    });
  }

  get template() {
    LOGGER.trace(`template | CPRItemSheet | Called with type [${this.item.type}].`);
    return `systems/cyberpunk-red-core/templates/item/cpr-${this.item.type}-sheet.hbs`;
  }

  get classes() {
    LOGGER.trace(`classes | CPRItemSheet | Called with type [${this.item.type}].`);
    return super.defaultOptions.classes.concat(["sheet", "item", `${this.item.type}`]);
  }

  /* -------------------------------------------- */
  /** @override */
  getData() {
    const data = super.getData();
    // data.isGM = game.user.isGM;
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

    html.find(".item-checkbox").click(event => this._itemCheckboxToggle(event));
  }

/*
  INTERNAL METHODS BELOW HERE
*/

  _itemCheckboxToggle(event) {
    LOGGER.trace(`_itemCheckboxToggle Called | .checkbox click | Called with type ${this.item}.`);
    let itemData = duplicate(this.item.data)
    let target = $(event.currentTarget).attr("data-target")
    if (hasProperty(itemData, target)) {
      setProperty(itemData, target, !getProperty(itemData, target))
      this.item.update(itemData);
    }
  }
}