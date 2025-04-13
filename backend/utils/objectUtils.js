/**
 * Safely merges objects without using deprecated util._extend
 * @param {Object} target - The target object
 * @param {Object} source - The source object
 * @returns {Object} - The merged object
 */
exports.mergeObjects = (target, source) => {
  return Object.assign({}, target, source);
};

/**
 * Deep clone an object without using deprecated methods
 * @param {Object} obj - The object to clone
 * @returns {Object} - The cloned object
 */
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
}; 