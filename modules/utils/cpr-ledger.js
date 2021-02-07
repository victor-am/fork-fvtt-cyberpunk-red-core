export default class Ledger {

  constructor() {
    /** 
     * Create a ledger object. 
     */
    this.records = []; 
  }

  addRecord(value, reason) {
    this.records.push([value, reason]);
  }

  listRecords() {
    return this.records;
  }
}
