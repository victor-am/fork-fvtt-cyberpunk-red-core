/* global Hooks dragRuler */
import LOGGER from "../utils/cpr-logger.js";

const externalHooks = () => {
  /**
   * The cprSpeedProvider Hook is provided for integration with the Drag Ruler
   * module
   * https://github.com/manuelVo/foundryvtt-drag-ruler/
   *
   * @public
   * @memberof hookEvents
   */
  Hooks.once("dragRuler.ready", (SpeedProvider) => {
    LOGGER.trace("dragRulerHook | cprSpeedProvider | Called.");
    class cprSpeedProvider extends SpeedProvider {
      get colors() {
        LOGGER.trace("dragRulerHook | get colors | Called.");
        return [
          { id: "walk", default: 0x00FF00, name: "cprDragRuler.speeds.walk" },
          { id: "run", default: 0xFF8000, name: "cprDragRuler.speeds.run" },
        ];
      }

      getRanges(token) {
        LOGGER.trace("dragRulerHook | getRanges  | Called.");
        const walkSpeed = token.actor.data.data.derivedStats.walk.value;
        const runSpeed = token.actor.data.data.derivedStats.run.value;
        const ranges = [
          { range: walkSpeed, color: "walk" },
          { range: runSpeed, color: "run" },
        ];
        return ranges;
      }
    }

    dragRuler.registerSystem("cyberpunk-red-core", cprSpeedProvider);
  });
};

export default externalHooks;
