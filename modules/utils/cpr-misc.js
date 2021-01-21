export default class CPRArrayUtils {
  static PushMultipleNumbersFromString(array, string, delims) {
    array.push(...string.split(new RegExp(delims.join("|"), "")));
    const result = array.map((x) => parseInt(x, 10));
    return result;
  }
}
