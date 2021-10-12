/* global setProperty duplicate */
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Lessons:
 *   1. Arrow functions do not work here, because they are not bound to "this", and are generally
 *      unsuitable for "call" functions, which is this is.
 *   2. You cannot put properties in this definition, only functions. Locally scoped variables
 *      are ok though.
 *   3. eslint recommends these functions must have names to assist with debugging
 */
const Physical = function Physical() {
  /**
   * Calculate the price of an Item when the category is changed. Called in a preUpdate hook.
   * See the comments in MR #445 (unmerged) for details about the logic.
   *   https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/merge_requests/445
   * Also remember that "amount" is sheet-level data, not Item data.
   *
   * @param {Number} category - price category the user put the Item in
   * @returns {Number} - the price in Eurobucks
   */
  this.calcPrice = function calcPrice(category) {
    // Note: since we use "const", this map is not persisted on the Item object the mixin is added to
    const PRICE_CATEGORY_MAPPINGS = {
      free: 0,
      cheap: 5,
      everyday: 20,
      costly: 50,
      premium: 100,
      expensive: 500,
      veryExpensive: 1000,
      luxury: 5000,
      superLuxury: 10000,
    };
    return PRICE_CATEGORY_MAPPINGS[category];
  };

  // if (this.data.type === "ammo") {
  //  if (data["data.variety"] !== "grenade" && data["data.variety"] !== "rocket") price /= 10;

  /**
   * Set whether this Item is concealable or not. This also unsets isConcealed if concealable is
   * set to false.
   *
   * @param {Boolean} val - set whether the Item is concealable (true) or not (false)
   */
  this.setConcealable = function setConcealable(val) {
    LOGGER.trace("setConcealable | Physical | Called.");
    const itemData = duplicate(this.data);
    let target = "data.concealable.concealable";
    setProperty(itemData, target, val);
    LOGGER.log(`${itemData._id} ${target} set to ${val}`);
    // if we are making an item "unconcealable" (too big), we also unset "concealed" for consistency's sake
    if (!val) {
      target = "data.concealable.isConcealed";
      setProperty(itemData, target, val);
      LOGGER.log(`${itemData._id} ${target} set to ${val}`);
    }
    this.update(itemData);
  };
};

export default Physical;
