/* global ActorSheet mergeObject $ game duplicate */
import CPRChat from "../../chat/cpr-chat.js";
import LOGGER from "../../utils/cpr-logger.js";
import ConfigureBIActorFromProgramPrompt from "../../dialog/cpr-configure-bi-actor-from-program.js";

/**
 * Implement the Black-ICE sheet.
 * @extends {CPRActorSheet}
 */
export default class CPRBlackIceActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRBlackIceActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-black-ice-sheet.hbs",
      width: 745,
      height: 200,
    });
  }

  /** @override */
  activateListeners(html) {
    html.find(".rollable").click((event) => this._onRoll(event));
    html.find(".configure-from-program").click((event) => this._configureFromProgram(event));
    super.activateListeners(html);
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  async _onRoll(event) {
    LOGGER.trace("_onRoll | CPRBlackIceActorSheet | Called.");
    const rollType = $(event.currentTarget).attr("data-roll-type");
    const rollName = $(event.currentTarget).attr("data-roll-title");
    let cprRoll;
    switch (rollType) {
      case "stat": {
        cprRoll = this.actor.createStatRoll(rollName);
        break;
      }
      case "damage": {
        const programId = $(event.currentTarget).attr("data-program-id");
        const netrunnerTokenId = $(event.currentTarget).attr("data-netrunner-id");
        const sceneId = $(event.currentTarget).attr("data-scene-id");
        cprRoll = this.actor.createDamageRoll(programId, netrunnerTokenId, sceneId);
        break;
      }
      default:
    }
    cprRoll.setNetCombat(this.actor.name);

    const keepRolling = await cprRoll.handleRollDialog(event);
    if (!keepRolling) {
      return;
    }
    await cprRoll.roll();

    // output to chat
    const token = this.token === null ? null : this.token.data._id;
    cprRoll.entityData = { actor: this.actor.id, token };
    CPRChat.RenderRollCard(cprRoll);
  }

  async _configureFromProgram() {
    const biPrograms = game.items.filter((i) => i.type === "program" && i.data.data.class === "blackice");
    const linkedProgramId = this.actor.token.getFlag("cyberpunk-red-core", "programId");
    let formData = { biProgramList: biPrograms, linkedProgramId };
    formData = await ConfigureBIActorFromProgramPrompt.RenderPrompt(formData);
    const { programId } = formData;
    if (programId === "unlink") {
      await this.actor.token.unsetFlag("cyberpunk-red-core", "programId");
    } else {
      const program = (biPrograms.filter((p) => p.id === formData.programId))[0];
      const programData = duplicate(program.data.data);
      this.actor.programmaticallyUpdate(programData.blackIceType, programData.per, programData.spd, programData.atk, programData.def, programData.rez, programData.rez);
      if (this.actor.isToken) {
        this.actor.token.data.name = program.name;
        this.actor.data.name = program.name;
        await this.actor.token.setFlag("cyberpunk-red-core", "programId", program.data._id);
      }
    }
    this.render(true, { renderData: this.data });
  }
}
