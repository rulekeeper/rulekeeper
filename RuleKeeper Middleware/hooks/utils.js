/* eslint-disable no-underscore-dangle */
const flatten = require('flat');

module.exports = {

  /**
   * Generates raw value of array of nested keys
   * Example: if array = [{ key1: { key2: value1 }}, { key1: { key2: value2 }}] and key = key1.key2,
   * simpleArray = [value1, value 2]
   * @param array
   * @param key
   * @returns {[]|*[]}
   */
  generateSimpleArray(array, key, previousArray= []) {
    let simpleArray = []
    const keys = key.split(".");

    for (let i = 0; i < array.length; i += 1) {
      let value = array[i]
      if (Object.keys(value).length === 0) continue;
      for (let k = 0; k < keys.length; k +=1) {
        value = value[keys[k]];
        if (Array.isArray(value) && k+1 < keys.length) {
          simpleArray = this.generateSimpleArray(value, keys[k+1], simpleArray)
          return simpleArray
        }
        else simpleArray.push(value)
      }
    }
    return simpleArray;
  },

  /** Generates a list of flat keys.
   * { a: { b : 1 }} => [ a.b ]
   * { a: { b : [1,2] }} => [a.b]
   * { a: { b : [ { c : 1 } ] }} => [a.b.c]
   * */
  getFlatKeys(object) {
    let keys = []
    for (const key in object) {
      if ( typeof object[key] === 'object' && object[key] && object[key].hasOwnProperty('_bsontype')) { keys.push(key) }
      else if ((typeof object[key]) === 'object' && !Array.isArray(object[key]) ) {
        const temp = this.getFlatKeys(object[key])
        for ( const nestedKey in temp)
          keys.push(key + '.' + temp[nestedKey])
      }
      else if (Array.isArray(object[key]) && object[key].length) {
        if ((typeof object[key][0]) === 'object') {
          const temp = this.getFlatKeys(object[key][0])
          for ( const nestedKey in temp)
            keys.push(key + '.' + temp[nestedKey])
        }
        else keys.push(key)
      }
      else
        keys.push(key)
    }
    return keys;
  },

  getNestedValue(object, key) {
    const keys = key.split(".");
    let value = object;
    for (let k = 0; k < keys.length; k +=1) {
      if (keys[k] === "_id") { return value[keys[k]].toString() }
      else value = value[keys[k]];
    }
    return value;
  },

  checkQueryOwnership(document, tableInfo, context) {
    let flattenDocument;
    if (Array.isArray(document)) flattenDocument = flatten(document[0]);
    else if (document.hasOwnProperty("_id") && tableInfo.column === "_id") flattenDocument = { _id: document._id.toString()}
    else flattenDocument = flatten(document);
    const doc = flattenDocument[tableInfo.column]
    return doc === context.entity || doc === context;
  },

  checkDocumentOwnership(document, tableInfo, context) {
    const doc = this.getNestedValue(document, tableInfo.column);
    return doc === context.entity;
  },

  getDataFromUpdate(query) {
    const filter = query.getFilter();
    const update = query.getUpdate();
    const data = { ...filter, ...update };
    return Object.keys(flatten(data));
  }
};
