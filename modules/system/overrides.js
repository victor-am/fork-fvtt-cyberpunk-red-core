export default function overrideRulerFunctions() {
  const originalLabel = Ruler.prototype._getSegmentLabel;
  Ruler.prototype._getSegmentLabel = function (segmentDistance, totalDistance, isTotal) {
    const distance = segmentDistance;
    let returnLabel = originalLabel.call(segmentDistance, totalDistance, isTotal);
    if (this.user.targets.size === 1) {
      const token = (Array.from(this.user.targets))[0];
      const DvTable = token.data.flags.cprDvTable;
      if (DvTable) {
        const rollTables = game.tables.filter((t) => t.data.name === DvTable);
        if (rollTables.length === 1) {
          const rollTable = rollTables[0];
          const tableResults = rollTable._getResultsForRoll(distance);
          if (tableResults.length === 1) {
            const DV = tableResults[0].text;
            returnLabel = `${returnLabel} DV: ${DV}`;
          }
        }
      }
    }
    return returnLabel;
  };
}