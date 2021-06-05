/* global mergeObject $ game */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Implement the sheet for containers and shop keepers.
 * @extends {CPRActorSheet}
 */
export default class CPRContainerActorSheet extends CPRActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRContainerActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-container-sheet.hbs",
      width: 750,
      height: 496,
    });
  }

  /** @override */
  getData() {
    // TODO - Understand how to use getData and when.
    // INFO - Only add new data points to getData when you need a complex struct.
    // DO NOT add new data points into getData to shorten dataPaths
    LOGGER.trace("ActorID getData | CPRContainerSheet | Called.");
    const data = super.getData();
    data.isGM = game.user.isGM;
    data.userOwnedActors = game.actors.filter((a) => a.isOwner && a.type === "character");
    data.userOwnedActors.unshift({ id: "", name: "--" });
    if (game.user.character !== undefined) {
      data.userCharacter = game.user.character.id;
      this.tradePartnerId = game.user.character.id;
    } else {
      data.userCharacter = "";
    }
    return data;
  }

  /** @override */
  activateListeners(html) {
    // Selection of trade partner
    html.find(".trade-with-dropdown").change((event) => this._setTradePartner(event));

    super.activateListeners(html);
  }

  /** @override */
  async _itemAction(event) {
    LOGGER.trace("_itemAction | CPRContainerSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const actionType = $(event.currentTarget).attr("data-action-type");
    if (item) {
      switch (actionType) {
        case "delete": {
          await this._deleteOwnedItem(item);
          break;
        }
        case "create": {
          await this._createInventoryItem($(event.currentTarget).attr("data-item-type"));
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

  _setTradePartner(event) {
    LOGGER.trace("_setTradePartner | CPRContainerSheet | Called.");
    this.tradePartnerId = $(event.currentTarget).val();
  }

  async _purchaseItem(item) {
    LOGGER.trace("_purchaseItem | CPRContainerSheet | Called.");
    if (this.tradePartnerId === undefined || this.tradePartnerId === "") {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.tradewithwarn"));
      return;
    }

    const tradePartnerActor = game.actors.get(this.tradePartnerId);
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
    await tradePartnerActor.createEmbeddedDocuments("Item", [item.data]);
    await tradePartnerActor.deltaLedgerProperty("wealth", -1 * price, reason);
    await this._deleteOwnedItem(item, true);
  }
}
