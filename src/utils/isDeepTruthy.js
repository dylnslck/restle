/**
 * Returns an array of all values (enumerable or not) found directly upon `obj`.
 *
 * @param  {Object} obj
 * @return {Array}
 */
const objectGetOwnValues = obj => Object.getOwnPropertyNames(obj).map(key => obj[key]);

/**
 * If `value` is a nonempty object or array, returns true if all its nested values are truthy, else
 * false. Otherwise, it returns the booleanness of `value`.
 *
 * @param  {*} value
 * @return {Boolean}
 */
export default function isDeepTruthy(value) {
  if (!value) return false;

  if (typeof value !== 'object') return !!value;

  if (!Array.isArray(value)) return isDeepTruthy(objectGetOwnValues(value));

  return value.every(v => {
    if (typeof v === 'object') return isDeepTruthy(v);
    return !!v;
  });
}
