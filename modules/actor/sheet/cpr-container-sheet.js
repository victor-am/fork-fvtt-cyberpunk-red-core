/* global mergeObject game getProperty duplicate setProperty */
/* eslint-env jquery */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import CPRChat from "../../chat/cpr-chat.js";
import CPRItem from "../../item/cpr-item.js";
import PurchasePartPrompt from "../../dialog/cpr-purchase-part-prompt.js";
import ConfigureSellToPrompt from "../../dialog/cpr-container-configure-sell-to-prompt.js";
import PurchaseOrderPrompt from "../../dialog/cpr-container-vendor-purchase-order-prompt.js";

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
    // Eurobucks management
    html.find(".eurobucks-input-button").click((event) => this._updateEurobucks(event));
    html.find(".eurobucks-open-ledger").click(() => this.actor.showLedger());
    // Configure container to purchase items from players
    html.find(".vendor-configure-sell-to").click(() => this._configureSellTo());

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
    const actionType = SystemUtils.GetEventDatum(event, "data-action-type");
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
        reason = `${SystemUtils.Format(
          "CPR.containerSheet.tradeLog.multiplePurchased",
          { amount, name: item.name, price: cost },
        )} - ${username}`;
      } else {
        reason = `${SystemUtils.Format(
          "CPR.containerSheet.tradeLog.singlePurchased",
          { name: item.name, price: cost },
        )} - ${username}`;
      }
      const vendorReason = `${SystemUtils.Format(
        "CPR.containerSheet.tradeLog.vendorSold",
        {
          name: item.name,
          quantity: amount,
          purchaser: tradePartnerActor.name,
          price: cost,
        },
      )} - ${username}`;
      await tradePartnerActor.deltaLedgerProperty("wealth", -1 * cost, reason);
      await this.actor.recordTransaction(cost, vendorReason);
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
   * @param {string} sellerId - actor.id of the person selling the item
   * @param {Item} item - object to be purchased
   */
  async _sellItemTo(event) {
    LOGGER.trace("_sellItemTo | CPRContainerSheet | Called.");

    // Players must have Owned permission on Containers for them to function properly
    if (!this.actor.isOwner) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.insufficientPermissions"));
      return;
    }
    const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
    const tradePartnerActor = game.actors.get(dragData.actorId);

    const itemData = duplicate(dragData.data);
    const amount = parseInt(itemData.data.amount, 10);
    const vendorData = this.actor.data;
    const vendorConfig = vendorData.data.vendor;
    const username = game.user.name;

    let cost = 0;

    if (itemData.type === "weapon") {
      const { ammoId } = itemData.data.magazine;
      if (ammoId !== "") {
        SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradeLoadedWeaponWarn"));
        return;
      }
    }

    if (itemData.type === "ammo" && itemData.data.variety !== "grenade" && itemData.data.variety !== "rocket") {
      // Ammunition, which is neither grenades nor rockets, are prices are for 10 of them (pg. 344)
      cost = parseInt(parseInt(itemData.data.price.market, 10) / 10, 10);
    } else {
      cost = parseInt(itemData.data.price.market, 10);
    }
    const percent = parseInt(vendorConfig.itemTypes[itemData.type].purchasePercentage, 10);

    let itemName = itemData.name;

    if (itemData.data.isUpgraded) {
      itemData.data.upgrades.forEach((upgrade) => {
        const upgradeItem = tradePartnerActor.items.find((i) => i.data._id === upgrade._id);
        if (upgradeItem) {
          cost += upgradeItem.data.data.price.market;
        }
      });
      itemName = `${SystemUtils.Localize("CPR.global.generic.upgraded")} ${itemName}`;
    }

    let vendorOffer = parseInt(((amount * cost * percent) / 100), 10);
    vendorOffer = Math.min(vendorOffer, vendorData.data.wealth.value);

    const offerMessage = `${SystemUtils.Format(
      "CPR.dialog.container.vendor.offerToBuy",
      {
        vendorName: tradePartnerActor.name,
        vendorOffer,
        itemName,
        percent,
      },
    )}`;
    const formData = await PurchaseOrderPrompt.RenderPrompt(offerMessage).catch((err) => LOGGER.debug(err));

    if (formData !== undefined) {
      let createItems = [];
      const deleteItems = [];
      if (itemData.data.isUpgraded) {
        itemData.data.upgrades.forEach(async (upgrade) => {
          const upgradeItem = tradePartnerActor.items.find((i) => i.data._id === upgrade._id);
          if (upgradeItem) {
            const newItem = duplicate(upgradeItem.data);
            newItem.data.isInstalled = false;
            newItem.data.install = "";
            createItems.push(newItem);
            deleteItems.push(upgradeItem.data._id);
          }
        });
        itemData.data.isUpgraded = false;
        itemData.data.upgrades = [];
      }

      createItems.push(itemData);
      deleteItems.push(itemData._id);

      const infiniteStock = getProperty(this.actor.data, "flags.cyberpunk-red-core.infinite-stock");

      if (infiniteStock) {
        const itemList = createItems;
        itemList.forEach((item) => {
          if (this.actor.items.find((i) => i.data.name === item.name)) {
            createItems = createItems.filter((ci) => ci._id !== item._id);
          }
        });
      }

      if (createItems.length > 0) {
        await this.actor.createEmbeddedDocuments("Item", createItems);
      }
      await tradePartnerActor.deleteEmbeddedDocuments("Item", deleteItems);

      let reason = "";
      if (amount > 1) {
        reason = `${SystemUtils.Format(
          "CPR.containerSheet.tradeLog.multipleSold",
          {
            amount,
            name: itemData.name,
            price: vendorOffer,
            vendor: this.actor.name,
          },
        )} - ${username}`;
      } else {
        reason = `${SystemUtils.Format(
          "CPR.containerSheet.tradeLog.singleSold",
          { name: itemData.name, price: vendorOffer, vendor: this.actor.name },
        )} - ${username}`;
      }
      const vendorReason = `${SystemUtils.Format(
        "CPR.containerSheet.tradeLog.vendorPurchased",
        {
          name: itemData.name,
          quantity: itemData.data.amount,
          seller: tradePartnerActor.name,
          price: vendorOffer,
        },
      )} - ${username}`;
      await tradePartnerActor.deltaLedgerProperty("wealth", vendorOffer, reason);
      await this.actor.recordTransaction(vendorOffer, vendorReason);
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
    const itemType = SystemUtils.GetEventDatum(event, "data-item-type");
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
    const flagName = SystemUtils.GetEventDatum(event, "data-flag-name");
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
    const playersCanSell = getProperty(this.actor.data, "flags.cyberpunk-red-core.players-sell");
    if (game.user.isGM || playersCanCreate || playersCanSell) {
      if (!game.user.isGM && !playersCanCreate) {
        const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
        const vendorData = this.actor.data.data.vendor;
        if (dragData.type === "Item") {
          const itemData = dragData.data;
          if (typeof vendorData.itemTypes[itemData.type] !== "undefined" && vendorData.itemTypes[itemData.type].isPurchasing) {
            await this._sellItemTo(event);
            return;
          }
          SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradeDragNotBuying"));
          return;
        }
      }
      super._onDrop(event);
    } else {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradeDragInWarn"));
    }
  }

  /**
   * Configure Container Actor to be able to purchase items from a player.
   *
   * @private
   * @callback
   */
  async _configureSellTo() {
    LOGGER.trace("_configureSellTo | CPRContainerSheet | Called.");
    const actorData = duplicate(this.actor.data);
    const promptData = {};
    promptData.itemTypes = [];
    const itemEntities = game.system.template.Item;
    game.system.template.Item.types.forEach((itemType) => {
      if (itemEntities[itemType].templates.includes("physical")) {
        promptData.itemTypes.push(itemType);
      }
    });
    promptData.currentConfig = actorData.data.vendor;

    promptData.itemTypes.forEach((itemType) => {
      if (typeof promptData.currentConfig.itemTypes[itemType] === "undefined") {
        promptData.currentConfig.itemTypes[itemType] = {
          isPurchasing: false,
          purchasePercentage: 0,
        };
      }
    });

    const formData = await ConfigureSellToPrompt.RenderPrompt(promptData).catch((err) => LOGGER.debug(err));
    if (formData !== undefined) {
      promptData.itemTypes.forEach((itemType) => {
        const isPurchasing = formData[`sell-${itemType}`];
        const purchasePercentage = (isPurchasing) ? formData[`pct-${itemType}`] : 0;
        promptData.currentConfig.itemTypes[itemType] = { isPurchasing, purchasePercentage };
      });
      setProperty(actorData, "data.vendor", promptData.currentConfig);
      this.actor.update(actorData);
    }
  }

  async _updateEurobucks(event) {
    LOGGER.trace("_updateEurobucks | CPRContainerSheet | Called.");
    // const value = parseInt(event.currentTarget.parentElement.previousElementSibling.children[0].value, 10);
    const value = parseInt($("#eurobucks").val(), 10);
    const action = $(event.currentTarget).attr("data-action");
    if (Number.isNaN(value)) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.eurobucksModifyWarn"));
      return;
    }
    const reason = `Sheet update ${action} ${value}`;
    await this.actor.recordTransaction(value, reason);
  }
}
