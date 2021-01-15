import LOGGER from "../../utils/cpr-logger.js";
import CPRSystemUtils from "../../utils/cpr-systemUtils.js";
import CPRRolls from "../../rolls/cpr-rolls.js";
import { CPR } from "../../system/config.js";
import CPRBaseRollRequest from "../../rolls/cpr-baseroll-request.js";
import CPRDmgRollRequest from "../../rolls/cpr-dmgroll-request.js";
import { VerifyRollPrompt } from "../../dialog/cpr-verify-roll-prompt.js";
import CPRChat from "../../chat/cpr-chat.js";
import Rules from "../../utils/cpr-rules.js";
import { InstallCyberwarePrompt } from "../../dialog/cpr-cyberware-install-prompt.js";

/**
 * Extend the basic ActorSheet.
 * @extends {ActorSheet}
 */
export default class CPRActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("ActorID defaultOptions | CPRActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      classes: super.defaultOptions.classes.concat(["sheet", "actor"]),
      width: 600,
      height: 600,
    });
  }

  /* -------------------------------------------- */
  /** @override */
  getData() {
    // TODO - Understand how to use getData and when.
    // INFO - Only add new data points to getData when you need a complex struct.
    // DO NOT add new data points into getData to shorten dataPaths
    LOGGER.trace("ActorID getData | CPRActorSheet | Called.");
    const data = super.getData();
    data.installedCyberware = this._getInstalledCyberware();
    return data;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    $("input[type=text]").focusin(function () {
      $(this).select();
    });

    // Make a roll
    html.find(".rollable").click((event) => this._onRoll(event));

    // Update equipment
    html.find(".equip").click(event => this._cycleEquipState(event));

    // Install Cyberware
    html.find(".install").click(event => this._installCyberware(event));

    // Uninstall Cyberware
    html.find(".uninstall").click(event => this._uninstallCyberware(event));

    // Generic item action
    html.find(".item-action").click(event => this._itemAction(event));

    // Render Item Card
    html.find(".item-edit").click((event) => this._renderItemCard(event));

    // Delete item
    html.find(".item-delete").click((event) => this._deleteOwnedItem(event));

    // Add New Skill Item To Sheet
    html.find(".add-skill").click((event) => this._addSkill(event));

    html.find(`.skill-level-input`).click(event => event.target.select()).change(event => this._updateSkill(event));

    // Show edit and delete buttons
    html.find(".row.item").hover(
      (event) => {
        // show edit and delete buttons
        $(event.currentTarget).contents().contents().addClass("show");
      },
      (event) => {
        // hide edit and delete buttons
        $(event.currentTarget).contents().contents().removeClass("show");
      }
    );
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  // TODO - Function is getting far to long, we need to find ways to condense it.
  async _onRoll(event) {
    LOGGER.trace(`ActorID _onRoll | CPRActorSheet | Called.`);

    // TODO - Cleaner way to init all this fields?
    // TODO - Create a input object to encompass these fields?
    let rollRequest;
    // Short circuit function to use damagerollrequest instead
    if ($(event.currentTarget).attr("data-roll-type") === "damage") {
      rollRequest = new CPRDmgRollRequest();
    } else {
      rollRequest = new CPRBaseRollRequest();
    }

    // TODO-- Where do these go?
    rollRequest.rollType = $(event.currentTarget).attr("data-roll-type");
    rollRequest.rollTitle = $(event.currentTarget).attr("data-roll-title");

    // Moving cases to their own functions, per request from Jay
    switch (rollRequest.rollType) {
      case "stat": {
        this._prepareRollStat(rollRequest);
        break;
      }
      case "skill": {
        const itemId = this._getItemId(event);
        this._prepareRollSkill(rollRequest, itemId);
        break;
      }
      case "roleAbility": {
        this._prepareRollAbility(rollRequest);
        break;
      }
      case "attack": {
        const itemId = $(event.currentTarget).attr("data-item-id");
        // check whether the weapon is equipped before allowing an attack
        const weap = this._getOwnedItem(itemId);
        if (weap.data.data.equippable.equipped === "equipped") {
          this._prepareRollAttack(rollRequest, itemId);
        } else {
          CPRSystemUtils.DisplayMessage("warn", "CPR.warningweaponnotequipped");
          return;
        }
        break;
      }
      case "damage": {
        const itemId = $(event.currentTarget).attr("data-item-id");
        this._prepareRollDamage(rollRequest, itemId);
        break;
      }
    }

    // TODO needs separate ATTACK and DAMAGE prompts
    if (!event.ctrlKey) {
      rollRequest = await VerifyRollPrompt(rollRequest);
      LOGGER.debug(
        `ActorID _onRoll | CPRActorSheet | Checking rollRequest post VerifyRollPrompt.`
      );
    }

    if (rollRequest.rollType == "abort") {
      return;
    }

    if (rollRequest.rollType === "attack") {
      const weaponId = $(event.currentTarget).attr("data-item-id");
      let weaponItem = this.actor.items.find((i) => i.data._id == weaponId);
      if (weaponItem.data.data.isRanged) {
        // Need to figure out how to determine which we are doing here, single, autofire and suppressive
        // Defaulting to Single
        weaponItem.fireRangedWeapon("single");
      }
    }


    if (rollRequest.rollType === "damage") {
      CPRChat.RenderRollCard(CPRRolls.DamageRoll(rollRequest));
    } else {
      // outputs to chat 
      CPRChat.RenderRollCard(CPRRolls.BaseRoll(rollRequest));
    }

  }

  _cycleEquipState(event) {
    LOGGER.trace(`ActorID _cycleEquipState | CPRActorSheet | Called.`);
    const item = this._getOwnedItem(this._getItemId(event));
    let prop = this._getObjProp(event);
    switch (item.data.data.equippable.equipped) {
      case "owned": {
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
      case "carried": {
        if (item.data.type == "weapon") {
          Rules.lawyer(this._canHoldWeapon(item));
        }
        this._updateOwnedItemProp(item, prop, "equipped");
        break;
      }
      case "equipped": {
        this._updateOwnedItemProp(item, prop, "owned");
        break;
      }
      default: {
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
    }
  }

  async _installCyberware(event) {
    LOGGER.trace(`ActorID _installCyberware | CPRActorSheet | Called.`);
    let item = this._getOwnedItem(this._getItemId(event));
    let data = await InstallCyberwarePrompt({ item: item.data, cyberware: this.actor.getInstalledFoundationalCyberware(item.getData().type)});
    // id of the selected foundational && HL type selection
  }

  _uninstallCyberware(event) {
    LOGGER.trace(`ActorID _uninstallCyberware | CPRActorSheet | Called.`);
    let item = this._getOwnedItem(this._getItemId(event));
  }

  _getInstalledCyberware() {
    // TODO
    return [];
  }

  _itemAction(event) {
    LOGGER.trace(`ActorID _itemAction | CPRActorSheet | Called.`);
    const itemId = $(event.currentTarget).attr("data-item-id");
    const item = this._getOwnedItem(itemId);
    if (item) {
      item.doAction(this.actor, (event.currentTarget).attributes);
      this.actor.updateEmbeddedEntity("OwnedItem", item.data);
    }
  }

  // TODO - Move to cpr-actor
  _getEquippedArmors(location) {
    LOGGER.trace(`ActorID _getEquippedArmors | CPRActorSheet | Called.`);
    // TODO - Helper function on ACTOR to get equipedArmors
    const armors = this.actor.items.filter((item) => item.data.type == "armor");
    const equipped = armors.filter((item) => item.data.data.equippable.equipped == "equipped");

    if (location == "body") {
      return equipped.filter((item) => item.data.data.isBodyLocation);
    } else if (location == "head") {
      return equipped.filter((item) => item.data.data.isHeadLocation);
    } else {
      throw new Error(`Bad location given: ${location}`);
    }
  }


  // ARMOR HELPERS
  // TODO - Move to cpr-actor
  _getArmorValue(valueType, location) {
    /**
     * game.actors.entities[].sheet.getArmorValue
     * Given a list of armor items, find the highest valueType (sp or penalty) of them.
     * Return a 0 if nothing is equipped.
     */
    LOGGER.trace(`ActorID _getArmorValue| CPRActorSheet | Called.`);

    const armors = this._getEquippedArmors(location);
    let sps;
    let penalties;

    if (location === "body") {
      sps = armors.map(a => a.data.data.bodyLocation.sp);
    } else if (location === "head") {
      sps = armors.map(a => a.data.data.headLocation.sp);
    } // we assume getEquippedArmors will throw an error with a bad loc
    penalties = armors.map(a => a.data.data.penalty);

    penalties.push(0);
    sps.push(0);                // force a 0 if nothing is equipped

    if (valueType === "sp") {
      return Math.max(...sps);    // Math.max treats null values in array as 0  
    }
    if (valueType === "penalty") {
      return Math.max(...penalties);    // Math.max treats null values in array as 0  
    }
    return 0;
  }

  // TODO - Revist hands restrictions, possibly remove.
  // TODO - Move to cpr-actor
  _getHands() {
    LOGGER.trace(`ActorID _getHands | CPRActorSheet | Called.`);
    return 2;
  }

  // TODO - Revist hands restrictions, possibly remove.
  // TODO - Move to cpr-actor
  _getFreeHands() {
    LOGGER.trace(`ActorID _getFreeHands | CPRActorSheet | Called.`);
    const weapons = this._getEquippedWeapons();
    const needed = weapons.map(w => w.data.data.handsReq);
    const free_hands = this._getHands() - needed.reduce((a, b) => a + b, 0);
    return free_hands
  }

  // TODO - Move to cpr-actor
  _canHoldWeapon(weapon) {
    LOGGER.trace(`ActorID _canHoldWeapon | CPRActorSheet | Called.`);
    const needed = weapon.data.data.handsReq;
    if (needed > this._getFreeHands()) {
      return false;
    }
    return true;
  }

  // TODO - Move to cpr-actor
  _getEquippedWeapons() {
    LOGGER.trace(`ActorID _getEquippedWeapons | CPRActorSheet | Called.`);
    const weapons = this.actor.data.filteredItems.weapon;
    return weapons.filter((a) => a.data.data.equippable.equipped == "equipped");
  }

  // TODO - We should go through the following, and assure all private methods can be used outside of the context of UI controls as well.
  // TODO - Move to cpr-actor
  _updateSkill(event) {
    LOGGER.trace(`ActorID _updateSkill | CPRActorSheet | Called.`);
    const item = this._getOwnedItem(this._getItemId(event));
    item.setSkillLevel(parseInt(event.target.value));
    this._updateOwnedItem(item);
  }

  // OWNED ITEM HELPER FUNCTIONS
  // TODO - Assert all usage correct.
  _updateOwnedItemProp(item, prop, value) {
    LOGGER.trace(`ActorID _updateOwnedItemProp | Called.`);
    setProperty(item.data, prop, value);
    this._updateOwnedItem(item);
  }
  
  _updateOwnedItem(item) {
    LOGGER.trace(`ActorID _updateOwnedItemProp | Called.`);
    this.actor.updateEmbeddedEntity("OwnedItem", item.data);
  }

  _renderItemCard(event) {
    LOGGER.trace(`ActorID _itemUpdate | CPRActorSheet | Called.`);
    let itemId = this._getItemId(event);
    const item = this.actor.items.find(i => i.data._id == itemId)
    item.sheet.render(true);
  }

  _getItemId(event) {
    LOGGER.trace(`ActorID _getItemId | CPRActorSheet | Called.`);
    return $(event.currentTarget).parents(`.item`).attr(`data-item-id`);
  }

  _getOwnedItem(itemId) {
    return this.actor.items.find((i) => i.data._id == itemId);
  }

  _getObjProp(event) {
    return $(event.currentTarget).attr(`data-item-prop`);
  }

  _deleteOwnedItem(event) {
    LOGGER.trace(`ActorID _deleteOwnedItem | CPRActorSheet | Called.`);
    let itemId = this._getItemId(event);
    let itemList = this.actor.items;
    itemList.forEach((item) => {
      if (item.data._id === itemId) item.delete();
    });
  }

  // TODO - Revist, do we need template data? Is function used.
  _addSkill() {
    LOGGER.trace(`ActorID _addSkill | CPRActorSheet | called.`);
    let itemData = {
      name: "skill",
      type: "skill",
      data: {},
    };
    this.actor.createOwnedItem(itemData, { renderSheet: true });
  }

  // TODO - Fix
  _getArmorPenaltyMods(stat) {
    let penaltyStats = ['ref', 'dex', 'move'];
    let penaltyMods = [0];
    if (penaltyStats.includes(stat)) {
      for (let location of ["head", "body"]) {
        let penaltyValue = Number(this._getArmorValue("penalty", location));
        if (penaltyValue > 0) {
          penaltyMods.push((0 - penaltyValue));
        }
      }
    }
    penaltyMods = [(Math.min(...penaltyMods))];
    if (penaltyMods == 0) {
      penaltyMods = "";
    }
    return penaltyMods;
  }

  // PREPARE ROLLS
  _prepareRollStat(rollRequest) {
    rollRequest.statValue = this.getData().data.stats[rollRequest.rollTitle].value;
    rollRequest.mods.push(this._getArmorPenaltyMods(rollRequest.rollTitle));
    LOGGER.trace(`ActorID _prepareRollStat | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue}`);
  }

  _prepareRollSkill(rollRequest, itemId) {
    LOGGER.trace(
      `ActorID _prepareRollSkill | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue} + Skill Value:${rollRequest.skillValue}`
    );
    const item = this._getOwnedItem(itemId);

    rollRequest.statValue = this.getData().data.stats[item.data.data.stat].value;
    rollRequest.skillValue = item.data.data.level;

    rollRequest.mods.push(this._getArmorPenaltyMods(item.data.data.stat));
  }

  _prepareRollAbility(rollRequest) {
    LOGGER.trace(
      `ActorID _prepareRollAbility | rolling ability: ` +
      rollRequest.rollTitle +
      ` | ` +
      rollRequest.skillValue
    );
    const actorData = this.getData().data;
    rollRequest.roleValue = actorData.roleInfo.roleskills[actorData.roleInfo["role"]][rollRequest.rollTitle];
    rollRequest.rollTitle = game.i18n.localize(CPR['roleAbilityList'][rollRequest.rollTitle]);
  }

  _prepareRollAttack(rollRequest, itemId) {
    const weaponItem = this._getOwnedItem(itemId);
    rollRequest.rollTitle = weaponItem.data.name;
    const isRanged = weaponItem.data.data.isRanged;
    const weaponSkill = weaponItem.data.data.weaponSkill;
    const skillId = this.actor.items.find((i) => i.name == weaponSkill);
    rollRequest.statValue = this.getData().data.stats["dex"].value;
    // if weapon is ranged, change stat to ref
    if (isRanged === "true") {
      rollRequest.statValue = this.getData().data.stats["ref"].value;
    }
    // +1 to attack on Excellent Quality Weapons
    if (weaponItem.data.data.quality == "excellent")
    {
      rollRequest.mods.push(1);
    }
    // if char owns relevant skill, get skill value
    if (skillId == null) {
      rollRequest.skillValue = 0;
    } else {
      rollRequest.skillValue = skillId.data.data.level;
    }
    LOGGER.trace(`Actor _prepareRollAttack | rolling attack | skillName: ${weaponSkill} skillValue: ${rollRequest.skillValue} statValue: ${rollRequest.statValue}`);
  }

  _prepareRollDamage(rollRequest, itemId) {
    // setup data
    const weaponItem = this._getOwnedItem(itemId);
    rollRequest.rollTitle = weaponItem.data.name;
    const attackSkill = weaponItem.data.data.weaponSkill;
    const weaponType = weaponItem.data.data.weaponType;

    // adjust roleRequest object
    rollRequest.formula = weaponItem.data.data.damage;
    rollRequest.attackSkill = attackSkill;
    rollRequest.weaponType = weaponType;
  }
}