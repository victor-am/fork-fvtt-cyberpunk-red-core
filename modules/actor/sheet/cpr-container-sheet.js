/* global mergeObject $ game getProperty */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import CPRChat from "../../chat/cpr-chat.js";

/**
 * Implement the sheet for containers and shop keepers.
 * @extends {CPRActorSheet}
 */
export default class CPRContainerActorSheet extends CPRActorSheet {
  /**
   * Set the template, width and height of the window.
   *
   * @override
   * @returns - sheet options merged with default options in ActorSheet
   */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRContainerActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-container-sheet.hbs",
      width: 750,
      height: 496,
    });
  }

  /**
   * Get actor data into a more convenient organized structure. This should be called sparingly in code.
   * Only add new data points to getData when you need a complex struct, not when you only need to add
   * new data points to shorten dataPaths.
   *
   * @override
   * @returns {Object} data - a curated structure of actorSheet data
   */
  getData() {
    LOGGER.trace("getData | CPRContainerSheet | Called.");
    const data = super.getData();
    data.isGM = game.user.isGM;
    data.userOwnedActors = game.actors.filter((a) => a.isOwner && a.type === "character");
    data.userOwnedActors.unshift({ id: "", name: "--" });
    if (game.user.character !== undefined) {
      data.userCharacter = game.user.character.id;
      if (this.tradePartnerId === undefined) {
        this.tradePartnerId = game.user.character.id;
      }
      data.tradePartnerId = this.tradePartnerId;
    } else {
      data.userCharacter = "";
      data.tradePartnerId = this.tradePartnerId;
    }
    return data;
  }

  /**
   * Add listeners specific to the Container sheet. Remember additional listeners are added from the
   * parent class, CPRActorSheet.
   *
   * @override
   * @param {*} html - the DOM object
   */
  activateListeners(html) {
    // Selection of trade partner
    html.find(".trade-with-dropdown").change((event) => this._setTradePartner(event));
    // Create item in inventory
    html.find(".item-create").click((event) => this._createInventoryItem(event));
    //
    html.find(".container-type-dropdown").change((event) => this._setContainerType(event));
    // Toggle the state of a flag for the data of the checkbox
    html.find(".checkbox-toggle").click((event) => this._checkboxToggle(event));

    super.activateListeners(html);
  }

  /**
   * Override the _itemAction() of the CPRActorSheet to add "purchase" action
   * and remove non needed other action types.
   *
   *
   * @async
   * @private
   * @callback
   * @param {event} event - object capturing event data (what was clicked and where?)
   */
  async _itemAction(event) {
    LOGGER.trace("_itemAction | CPRContainerSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const actionType = $(event.currentTarget).attr("data-action-type");
    if (item) {
      switch (actionType) {
        case "delete": {
          await this._deleteOwnedItem(item);
          break;
        }
        case "purchase": {
          await this._purchaseItem(item);
          break;
        }
        default: {
          item.doAction(this.actor, event.currentTarget.attributes);
        }
      }
      // Only update if we aren't deleting the item.  Item deletion is handled in this._deleteOwnedItem()
      // The same holds for purchasing the item, as it is handled by this._purchaseItem()
      if (actionType !== "delete" && actionType !== "purchase") {
        this.actor.updateEmbeddedDocuments("Item", [{ _id: item.id, data: item.data.data }]);
      }
    }
  }

  /**
   * Render the item card (chat message) when ctrl-click happens on an item link, or display
   * the item sheet if ctrl was not pressed.
   *
   * @override
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  _renderItemCard(event) {
    LOGGER.trace("_renderItemCard | CPRContainerSheet | Called.");
    const itemId = CPRActorSheet._getItemId(event);
    const item = this.actor.items.find((i) => i.data._id === itemId);
    if (event.ctrlKey) {
      CPRChat.RenderItemCard(item);
    } else {
      const playersCanModify = getProperty(this.actor.data, "flags.cyberpunk-red-core.players-modify");
      if (playersCanModify || game.user.isGM) {
        item.sheet.render(true, { editable: true });
      } else {
        item.sheet.render(true, { editable: false });
      }
    }
  }

  /**
   * This is the callback for setting the trade partner of the container.
   * This given the knowledge, which actor to mofify upon purchase of items.
   *
   * @callback
   * @private
   * @param {} event - object capturing event data (what was clicked and where?)
   */
  _setTradePartner(event) {
    LOGGER.trace("_setTradePartner | CPRContainerSheet | Called.");
    this.tradePartnerId = $(event.currentTarget).val();
  }

  /**
   * Handle the purchase of an item. The item is added to the actor specified as
   * the tradePartner and money is deducted accordingly.
   *
   * @private
   * @param {Item} item - object to be purchased
   */
  async _purchaseItem(item) {
    LOGGER.trace("_purchaseItem | CPRContainerSheet | Called.");
    if (this.tradePartnerId === undefined || this.tradePartnerId === "") {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.tradewithwarn"));
      return;
    }

    const tradePartnerActor = game.actors.get(this.tradePartnerId);
    if (!getProperty(this.actor.data, "flags.cyberpunk-red-core.items-free")) {
      const price = item.data.data.price.market;
      if (tradePartnerActor.data.data.wealth.value < price) {
        SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.tradepricewarn"));
        return;
      }
      const { amount } = item.data.data;
      let reason = "";
      if (amount > 1) {
        reason = `${SystemUtils.Format("CPR.tradelogmultiple", { amount, name: item.name, price })} - ${game.user.name}`;
      } else {
        reason = `${SystemUtils.Format("CPR.tradelogsingle", { name: item.name, price })} - ${game.user.name}`;
      }
      await tradePartnerActor.deltaLedgerProperty("wealth", -1 * price, reason);
    }
    await tradePartnerActor.createEmbeddedDocuments("Item", [item.data]);
    if (!getProperty(this.actor.data, "flags.cyberpunk-red-core.infinite-stock")) {
      await this._deleteOwnedItem(item, true);
    }
  }

  /**
   * Create an item in the inventory of the actor. The templates will hide this functionality
   * if the GMs does not want to permit players to create their own items.
   *
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  async _createInventoryItem(event) {
    LOGGER.trace("_createInventoryItem | CPRContainerSheet | Called.");
    const itemType = $(event.currentTarget).attr("data-item-type");
    const itemTypeNice = itemType.toLowerCase().capitalize();
    const itemString = "ITEM.Type";
    const itemTypeLocal = itemString.concat(itemTypeNice);
    const itemName = `${SystemUtils.Localize("CPR.new")} ${SystemUtils.Localize(itemTypeLocal)}`;
    const itemImage = SystemUtils.GetDefaultImage("Item", itemType);
    const itemData = { img: itemImage, name: itemName, type: itemType };
    await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Set or unset a corresponding flag on the actor when a checkbox is clicked.
   *
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  _checkboxToggle(event) {
    LOGGER.trace("_checkboxToggle | CPRContainerSheet | Called.");
    const flagName = $(event.currentTarget).attr("data-flag-name");
    const flag = getProperty(this.actor.data, `flags.cyberpunk-red-core.${flagName}`);
    if (flag === undefined || flag === false) {
      // if the flag was already set to firemode, that means we unchecked a box
      this.actor.setFlag("cyberpunk-red-core", flagName, true);
    } else {
      this.actor.unsetFlag("cyberpunk-red-core", flagName);
    }
  }

  /**
   * This is the callback for setting the container type.
   *
   * @callback
   * @private
   * @param {} event - object capturing event data (what was clicked and where?)
   */
  async _setContainerType(event) {
    LOGGER.trace("_setContainerType | CPRContainerSheet | Called.");
    const containerType = $(event.currentTarget).val();
    await this.actor.setFlag("cyberpunk-red-core", "container-type", containerType);
    switch (containerType) {
      case "shop": {
        await this.actor.unsetFlag("cyberpunk-red-core", "items-free");
        await this.actor.unsetFlag("cyberpunk-red-core", "players-create");
        await this.actor.unsetFlag("cyberpunk-red-core", "players-delete");
        await this.actor.unsetFlag("cyberpunk-red-core", "players-modify");
        break;
      }
      case "loot": {
        await this.actor.unsetFlag("cyberpunk-red-core", "infinite-stock");
        await this.actor.setFlag("cyberpunk-red-core", "items-free", true);
        await this.actor.unsetFlag("cyberpunk-red-core", "players-create");
        await this.actor.unsetFlag("cyberpunk-red-core", "players-delete");
        await this.actor.unsetFlag("cyberpunk-red-core", "players-modify");
        break;
      }
      case "stash": {
        await this.actor.unsetFlag("cyberpunk-red-core", "infinite-stock");
        await this.actor.setFlag("cyberpunk-red-core", "items-free", true);
        await this.actor.setFlag("cyberpunk-red-core", "players-create", true);
        await this.actor.setFlag("cyberpunk-red-core", "players-delete", true);
        await this.actor.setFlag("cyberpunk-red-core", "players-modify", true);
        break;
      }
      case "custom": {
        break;
      }
      default: {
        break;
      }
    }
  }

  async _onDrop(event) {
    const playersCanCreate = getProperty(this.actor.data, "flags.cyberpunk-red-core.players-create");
    if (game.user.isGM || playersCanCreate) {
      super._onDrop(event);
    } else {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.tradedraginwarn"));
    }
  }
}
