const Connection = require('../connection')
const ObjectId = require('mongodb').ObjectID
const ApiError = require('../helper/ErrorHandler')


class MongoController {
  /**
   * Checks if properties is complaint with the rule set declared in schema
   * @param {Object} properties 
   * @param {schema} schema 
   * @param {string} collection 
   */
  static async validate(properties, schema, collection) {
    try {
      const documents = await this.getAll(collection)
      Object.keys(schema).forEach(key => {
        if (schema[key].mandatory) {
          if (!(key in properties)) {
            throw new ApiError(400, `${key} is missing in body`)
          }
        }
        if (schema[key].unique) {
          documents.forEach(document => {
            if (document[key] === properties[key]) {
              throw new ApiError(400, `${key} is not unique`)
            }
          })
        }
        if (schema[key].type) {
          if (properties[key] && typeof properties[key] !== schema[key].type) {
            throw new ApiError(400, `${key} has wrong type`)
          }
        }
      })
    } catch (err) {
      throw err
    }
  }

  static filter(properties, schema) {
    let filteredProperties = {}
    Object.keys(schema).forEach(key => {
      if (schema[key].format === 2) {
        filteredProperties[key] = properties[key].toLowerCase()
      } else if (schema[key].format === 1) {
        filteredProperties[key] = properties[key].toUpperCase()
      } else {
        filteredProperties[key] = properties[key]
      }

    })
    return filteredProperties
  }

  /**
   * 
   * @param {string} collection 
   * @param {number} id 
   */
  static async getById(collection, id) {
    try {
      const document = await Connection.db.collection(collection).findOne({ _id: new ObjectId(id) })
      return document
    } catch (err) {
      console.error(`Couldnt get document with id ${id} from ${collection}: ${err}`)
      throw err
    }
  }

  static async getAll(collection) {
    try {
      const documents = await Connection.db.collection(collection).find().toArray()
      return documents
    } catch (err) {
      console.error(`Couldnt get all documents from ${collection}: ${err}`)
      throw err
    }
  }
}

module.exports = MongoController

/**
 * Describes the schema of an request to validate
 * @typedef schema
 * @property {boolean} mandatory
 * @property {string} type
 * @property {boolean} unique
 */