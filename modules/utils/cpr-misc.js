export class CPRArrayUtils {
    static PushMultipleNumbersFromString(array, string, delims) {
        array.push(...string.split(new RegExp(delims.join('|'), '')));
        let result = array.map(function (x) {
            return parseInt(x);
        });
        console.log(array);
        return result;
    }
}