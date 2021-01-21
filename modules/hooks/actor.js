/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger";

const actorPreHooks = () => {
  Hooks.on("preCreateActor", (createData) => {
    LOGGER.trace("\"preCreateActor | actorHooks | Called.\"");
    if (!createData.token) {
      // TODO - Token Setup Goes Here
    }
  });

  Hooks.on("preUpdateActor", (actor, updatedData) => {
    LOGGER.trace("\"preUpdateActor | actorHooks | Called.\"");
  });
};

export default actorPreHooks;
