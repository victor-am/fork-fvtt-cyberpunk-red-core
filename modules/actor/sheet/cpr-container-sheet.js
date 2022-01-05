/* global mergeObject $ game getProperty duplicate */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import CPRChat from "../../chat/cpr-chat.js";
import CPRItem from "../../item/cpr-item.js";
import PurchasePartPrompt from "../../dialog/cpr-purchase-part-prompt.js";

/**
 * Implement the sheet for containers and shop keepers. This extends CPRActorSheet to make use
 * of owned-item management methods like _getOwnedItem and _deleteOwnedItem.
 *
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
    LOGGER.trace("activateListeners | CPRContainerSheet | Called.");

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
   * We extend CPRContainerSheet._render to enable automatic fitting of the content to the window size.
   *
   * @override
   * @private
   * @param {Boolean} force - for this to be rendered. We don't use this, but the parent class does.
   * @param {Object} options - rendering options that are passed up the chain to the parent
   */
  async _render(force = false, options = {}) {
    LOGGER.trace("_render | CPRContainerSheet | Called.");
    await super._render(force, options);
    this._automaticContentResize();
  }

  /**
   * We extend CPRContainerSheet._onRezize to enable automatic fitting of the content to the window size.
   *
   * @override
   * @private
   * @param {event} event - object capruting evene t data
   */
  _onResize(event) {
    LOGGER.trace("_onResize | CPRContainerSheet | Called.");
    this._automaticContentResize();
    super._onResize(event);
  }

  /**
   * Automatically resize the content such that it fills the window.
   *
   * @private
   */
  _automaticContentResize() {
    LOGGER.trace("_automaticContentResize | CPRContainerSheet | Called.");
    if (this.form !== null) {
      const newHeight = this.position.height - 46;
      this.form.children[0].children[1].setAttribute("style", `height:${newHeight}px`);
    }
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
          await this._purchaseItem(item, true);
          break;
        }
        case "purchaseFraction": {
          this._purchaseItem(item, false);
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
   * @param {boolean} all - Toggle to purchase all of the items in the stack or just a part of them
   */
  async _purchaseItem(item, all) {
    LOGGER.trace("_purchaseItem | CPRContainerSheet | Called.");
    if (this.tradePartnerId === undefined || this.tradePartnerId === "") {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradeWithWarn"));
      return;
    }

    // Players must have Owned permission on Containers for them to function properly
    if (!this.actor.isOwner) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.insufficientPermissions"));
      return;
    }
    console.log(this);
    const transferredItemData = duplicate(item.data);
    let cost = 0;
    if (item.type === "ammo" && item.data.data.variety !== "grenade" && item.data.data.variety !== "rocket") {
      // Ammunition, which is neither grenades nor rockets, are prices are for 10 of them (pg. 344)
      cost = item.data.data.price.market / 10;
    } else {
      cost = item.data.data.price.market;
    }
    if (!all) {
      const itemText = SystemUtils.Format("CPR.dialog.purchasePart.text", { itemName: item.name });
      const formData = await PurchasePartPrompt.RenderPrompt(itemText).catch((err) => LOGGER.debug(err));
      if (formData === undefined) {
        return;
      }
      const newAmount = parseInt(formData.purchaseAmount, 10);
      if (newAmount < 1 || newAmount >= parseInt(item.data.data.amount, 10)) {
        SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.dialog.purchasePart.wrongAmountWarning"));
        return;
      }
      transferredItemData.data.amount = newAmount;
      cost *= newAmount;
    } else {
      cost *= item.data.data.amount;
    }
    const tradePartnerActor = game.actors.get(this.tradePartnerId);
    if (!getProperty(this.actor.data, "flags.cyberpunk-red-core.items-free")) {
      if (tradePartnerActor.data.data.wealth.value < cost) {
        SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradePriceWarn"));
        return;
      }
      const { amount } = transferredItemData.data;
      const username = game.user.name;
      let reason = "";
      if (amount > 1) {
        reason = `${SystemUtils.Format("CPR.containerSheet.tradeLog.multiple",
          { amount, name: item.name, price: cost })} - ${username}`;
      } else {
        reason = `${SystemUtils.Format("CPR.containerSheet.tradeLog.single",
          { name: item.name, price: cost })} - ${username}`;
      }
      await tradePartnerActor.deltaLedgerProperty("wealth", -1 * cost, reason);
      await this.actor.recordTransaction(cost, reason);
    }
    if (tradePartnerActor.automaticallyStackItems(new CPRItem(transferredItemData))) {
      await tradePartnerActor.createEmbeddedDocuments("Item", [transferredItemData]);
    }
    if (!getProperty(this.actor.data, "flags.cyberpunk-red-core.infinite-stock")) {
      if (all) {
        await this._deleteOwnedItem(item, true);
      } else {
        const keepAmount = item.data.data.amount - transferredItemData.data.amount;
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: item.id, "data.amount": keepAmount }]);
      }
    }
  }

  /**
   * Handle the purchase of an item. The item is added to the actor specified as
   * the tradePartner and money is deducted accordingly.
   *
   * @private
   * @param {Item} item - object to be purchased
   * @param {boolean} all - Toggle to purchase all of the items in the stack or just a part of them
   */
  async _sellItem(item, all) {
    LOGGER.trace("_sellItem | CPRContainerSheet | Called.");
    if (this.tradePartnerId === undefined || this.tradePartnerId === "") {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradeWithWarn"));
      return;
    }
    const transferredItemData = duplicate(item.data);
    let cost = 0;
    if (item.type === "ammo" && item.data.data.variety !== "grenade" && item.data.data.variety !== "rocket") {
      // Ammunition, which is neither grenades nor rockets, are prices are for 10 of them (pg. 344)
      cost = item.data.data.price.market / 10;
    } else {
      cost = item.data.data.price.market;
    }
    if (!all) {
      const itemText = SystemUtils.Format("CPR.dialog.purchasePart.text", { itemName: item.name });
      const formData = await PurchasePartPrompt.RenderPrompt(itemText).catch((err) => LOGGER.debug(err));
      if (formData === undefined) {
        return;
      }
      const newAmount = parseInt(formData.purchaseAmount, 10);
      if (newAmount < 1 || newAmount >= parseInt(item.data.data.amount, 10)) {
        SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.dialog.purchasePart.wrongAmountWarning"));
        return;
      }
      transferredItemData.data.amount = newAmount;
      cost *= newAmount;
    } else {
      cost *= item.data.data.amount;
    }
    const tradePartnerActor = game.actors.get(this.tradePartnerId);
    if (!getProperty(this.actor.data, "flags.cyberpunk-red-core.items-free")) {
      if (tradePartnerActor.data.data.wealth.value < cost) {
        SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradePriceWarn"));
        return;
      }
      const { amount } = transferredItemData.data;
      const username = game.user.name;
      let reason = "";
      if (amount > 1) {
        reason = `${SystemUtils.Format("CPR.containerSheet.tradeLog.multiple",
          { amount, name: item.name, price: cost })} - ${username}`;
      } else {
        reason = `${SystemUtils.Format("CPR.containerSheet.tradeLog.single",
          { name: item.name, price: cost })} - ${username}`;
      }
      await tradePartnerActor.deltaLedgerProperty("wealth", -1 * cost, reason);
    }
    if (tradePartnerActor.automaticallyStackItems(new CPRItem(transferredItemData))) {
      await tradePartnerActor.createEmbeddedDocuments("Item", [transferredItemData]);
    }
    if (!getProperty(this.actor.data, "flags.cyberpunk-red-core.infinite-stock")) {
      if (all) {
        await this._deleteOwnedItem(item, true);
      } else {
        const keepAmount = item.data.data.amount - transferredItemData.data.amount;
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: item.id, "data.amount": keepAmount }]);
      }
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
    const itemName = `${SystemUtils.Localize("CPR.actorSheets.commonActions.new")} ${SystemUtils.Localize(itemTypeLocal)}`;
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
  async _checkboxToggle(event) {
    LOGGER.trace("_checkboxToggle | CPRContainerSheet | Called.");
    const flagName = $(event.currentTarget).attr("data-flag-name");
    const actor = this.token === null ? this.actor : this.token.actor;
    if (this.token === null) {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.containerSettingsOnToken"));
    } else {
      actor.toggleFlag(flagName);
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
    const actor = this.token === null ? this.actor : this.token.actor;
    if (this.token === null) {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.containerSettingsOnToken"));
    } else {
      await actor.setContainerType(containerType);
    }
  }

  /**
   * _onDrop is provided by ActorSheet and extended here. When an Item is dragged to an ActorSheet a new
   * copy is created. This extension ensures players are allowed to create items in the container-actor before doing so.
   *
   * @private
   * @override
   * @param {Object} event - an object capturing event details
   */
  async _onDrop(event) {
    LOGGER.trace("_onDrop | CPRContainerSheet | Called.");
    const playersCanCreate = getProperty(this.actor.data, "flags.cyberpunk-red-core.players-create");
    if (game.user.isGM || playersCanCreate) {
      super._onDrop(event);
    } else {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradeDragInWarn"));
    }
  }
}
