/* eslint-disable no-undef */
export default class DvUtils {
  static GetDvTables() {
    const dvPattern = new RegExp("^DV ");
    const tableNames = [];
    const tableList = game.tables.filter((t) => t.data.name.match(dvPattern));
    tableList.forEach((table) => tableNames.push(table.data.name));
    return tableNames.sort();
  }

  static GetDv(tableName, distance) {
    const dvTables = this.GetDvTables();
    let DV = null;
    if (dvTables.includes(tableName)) {
      const rollTable = (game.tables.filter((t) => t.data.name === tableName))[0];
      const tableResults = rollTable.getResultsForRoll(distance);
      if (tableResults.length === 1) {
        DV = tableResults[0].data.text;
      }
    }
    return DV;
  }
}
