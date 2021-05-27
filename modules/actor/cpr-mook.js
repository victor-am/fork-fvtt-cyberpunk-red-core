/* globals */
import CPRActor from "./cpr-actor.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * @extends {Actor}
 */
export default class CPRMookActor extends CPRActor {
  static async create(data, options) {
    LOGGER.trace("create | CPRMookActor | called.");
    const createData = data;
    if (typeof data.data === "undefined") {
      LOGGER.trace("create | New Actor | CPRMookActor | called.");
      createData.items = [];
      createData.items = data.items.concat(await SystemUtils.GetCoreSkills(), await SystemUtils.GetCoreCyberware());
      createData.token = {
        vision: true,
        bar1: { attribute: "derivedStats.hp" },
      };
    }
    super.create(createData, options);
  }

  setMookName(formData) {
    return this.update(formData);
  }

  _calculateDerivedStats() {
    // Calculate MAX HP
    LOGGER.trace("_calculateDerivedStats | CPRMookActor | Called.");
    const actorData = this.data;
    actorData.filteredItems = this.itemTypes;
    const { derivedStats } = actorData.data;

    // Seriously wounded
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    // We need to always call this because if the actor was wounded and now is not, their
    // value would be equal to max, however their current wound state was never updated.
    this._setWoundState();
    // Updated derivedStats variable with currentWoundState
    derivedStats.currentWoundState = this.data.data.derivedStats.currentWoundState;

    // Death save
    let basePenalty = 0;
    const critInjury = this.data.filteredItems.criticalInjury;
    critInjury.forEach((criticalInjury) => {
      const { deathSaveIncrease } = criticalInjury.data.data;
      if (deathSaveIncrease) {
        basePenalty += 1;
      }
    });
    // In 0.73.2 we moved all of the Death Save data into the single data point of
    // derivedStats.deathSave.basePenalty, however, it causes a chicken/egg situation
    // since it loads the data up before it migrates, triggering this code to run which
    // errors out and ultimately messing the migration up. Yay. We should be able to
    // remove this code after a release or two
    if ((typeof derivedStats.deathSave) === "number") {
      const oldPenalty = derivedStats.deathSave;
      derivedStats.deathSave = {
        value: 0,
        penalty: oldPenalty,
        basePenalty,
      };
    }
    derivedStats.deathSave.basePenalty = basePenalty;
    derivedStats.deathSave.value = derivedStats.deathSave.penalty + derivedStats.deathSave.basePenalty;
    this.data.data.derivedStats = derivedStats;
  }

  handleMookDraggedItem(item) {
    // called by the createOwnedItem listener (hook) when a user drags an item on a mook sheet
    // handles the automatic equipping of gear and installation of cyberware
    LOGGER.trace("_handleMookDraggedItem | CPRActor | Called.");
    LOGGER.debug("auto-equipping or installing a dragged item to the mook sheet");
    LOGGER.debugObject(item);
    const newItem = item;
    switch (item.type) {
      case "clothing":
      case "weapon":
      case "gear":
      case "program":
      case "armor": {
        if (newItem.data.data) {
          newItem.data.data.equipped = "equipped";
          this.updateEmbeddedEntity("OwnedItem", newItem.data);
        } else {
          newItem.data.equipped = "equipped";
          this.updateEmbeddedEntity("OwnedItem", newItem);
        }
        break;
      }
      case "cyberware": {
        this.addCyberware(item._id);
        break;
      }
      default:
    }
  }
}
