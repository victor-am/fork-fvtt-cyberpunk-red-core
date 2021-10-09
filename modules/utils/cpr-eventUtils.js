/* eslint-env jquery */
import LOGGER from "./cpr-logger.js";

/**
 * Utilities for retrieving and managing data in events such as drags and mouse clicks.
 */
export default class EventUtils {
  /**
   * Inspect an event object for passed-in field specific to the target (link) that was clicked.
   * This code will initially look at the current target, and if the field is not found, it will
   * climb up the parents of the target until one is found, or print an error and return undefined.
   *
   * @param {Object} event - event data from jquery
   * @param {String} datum - the field we are interested in getting
   * @returns {String} - the value of the field passed in the event data
   */
  static GetEventDatum(event, datum) {
    LOGGER.trace("GetEventDatum | CPREventUtils | Called.");
    let id = $(event.currentTarget).attr(datum);
    if (typeof id === "undefined") {
      LOGGER.debug(`Could not find ${datum} in currentTarget trying parents`);
      id = $(event.currentTarget).parents(".item").attr(datum);
      if (typeof id === "undefined") {
        LOGGER.error(`Could not find ${datum} in the event data!`);
      }
    }
    return id;
  }
}