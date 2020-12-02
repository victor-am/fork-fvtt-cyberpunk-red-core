/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 */
export class CPRActorSheet extends ActorSheet {

  /**
   * Return the type of the current Actor.
   * @return {String} Actor type - character, npc, or creature 
   */
  get actorType() {
    return this.actor.data.type;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = options.classes.concat(["sheet", "actor"]),
    options.tabs = [{ navSelector: ".tabs", contentSelector: ".content", initial: "main" }],
    options.width = 576;
    return options;
  }
}

