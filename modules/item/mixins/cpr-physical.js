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
