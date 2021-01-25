<<<<<<< HEAD
export class CPRArrayUtils {
    static PushMultipleNumbersFromString(array, string, delims) {
        array.push(...string.split(new RegExp(delims.join('|'), '')));
        let result = array.map(function (x) {
            return parseInt(x);
        });

        return result;
    }
}
=======
export default class CPRArrayUtils {
  static PushMultipleNumbersFromString(array, string, delims) {
    array.push(...string.split(new RegExp(delims.join("|"), "")));
    const result = array.map((x) => parseInt(x, 10));
    return result;
  }
}
>>>>>>> dev
