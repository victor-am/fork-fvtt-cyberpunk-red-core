import LOGGER from "../utils/cpr-logger.js";

export default function() {
  Hooks.on("preCreateActor", (createData) => {
    LOGGER.trace(`"preCreateActor | actorHooks | Called."`)
    if (!createData.token) {
        // TODO - Token Setup Goes Here
    }
  })

  Hooks.on("preUpdateActor", (actor, updatedData) => {
    LOGGER.trace(`"preUpdateActor | actorHooks | Called."`)
  })
}