/* global Actor */
import CPRBlackIceActor from "./cpr-black-ice.js";
import CPRCharacterActor from "./cpr-character.js";
import CPRContainerActor from "./cpr-container.js";
import CPRDemonActor from "./cpr-demon.js";
import CPRMookActor from "./cpr-mook.js";
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

function factory(entities, baseClass) {
  return new Proxy(baseClass, {
    construct: (target, args) => {
      LOGGER.trace("object construct | factory | actor-factor.js");
      const [data, options] = args;
      const constructor = entities[data.type];
      if (!constructor) {
        // emit error
        const error = `${SystemUtils.Localize("CPR.unsupportedentityerror")}: ${data.type}`;
        SystemUtils.DisplayMessage("error", error);
        throw new Error(error);
      }
      return new constructor(data, options);
    },
    get: (target, prop) => {
      LOGGER.trace("object get | factory | actor-factor.js");
      switch (prop) {
        case "create":
          // Calling the class' create() static function
          return (data, options) => {
            const constructor = entities[data.type];
            if (!constructor) {
              const error = `${SystemUtils.Localize("CPR.unsupportedentityerror")}: ${data.type}`;
              SystemUtils.DisplayMessage("error", error);
              throw new Error(error);
            }
            return constructor.create(data, options);
          };
        case Symbol.hasInstance:
          // Applying the "instanceof" operator on the instance object
          return (instance) => {
            const constr = entities[instance.data.type];
            if (!constr) {
              return false;
            }
            return instance instanceof constr;
          };
        default:
          // Just forward any requested properties to the base Actor class
          return baseClass[prop];
      }
    },
  });
}

const actorTypes = {};
actorTypes.blackIce = CPRBlackIceActor;
actorTypes.character = CPRCharacterActor;
actorTypes.container = CPRContainerActor;
actorTypes.demon = CPRDemonActor;
actorTypes.mook = CPRMookActor;
const actorConstructor = factory(actorTypes, Actor);
export default actorConstructor;

// If we wanted to split items into separate objects we can:
// const itemTypes = {};
// itemTypes["cyberware"] = CPRCyberwareItem;
// itemTypes["gear"] = CPRGearItem;
// export const itemConstructor = factory(itemTypes, Item);