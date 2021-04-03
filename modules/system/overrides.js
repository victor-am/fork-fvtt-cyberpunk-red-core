/* eslint-disable no-undef */
import DvUtils from "../utils/cpr-dvUtils.js";

export default function overrideRulerFunctions() {
  const originalLabel = Ruler.prototype._getSegmentLabel;
  Ruler.prototype._getSegmentLabel = function (segmentDistance, totalDistance, isTotal) {
    const distance = segmentDistance;
    let returnLabel = originalLabel.call(segmentDistance, totalDistance, isTotal);
    const token = canvas.tokens.controlled['0'];
    if (token) {
      const DvTable = token.data.flags.cprDvTable;
      if (DvTable) {
        const DV = DvUtils.GetDv(DvTable, distance);
        if (DV !== null) {
          const displayTable = DvTable.replace(/^DV /, "");
          returnLabel = `${returnLabel} (${displayTable} DV: ${DV})`;
        }
      }
    }
    return returnLabel;
  };
}
