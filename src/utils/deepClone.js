/**
 * CAUTION: Doesn't work for built-in JavaScript objects! (e.g., Date)
 *
 * @param  {*} obj
 * @return {*}
 */
export default function deepClone(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];
      clone[key] = typeof val === 'object' ? deepClone(val) : val;
    }
  }

  return clone;
}
