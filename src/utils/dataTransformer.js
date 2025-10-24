/**
 * Transform parsed CSV data into database format
 */

class DataTransformer {
  /**
   * Transform CSV record to database format
   * Mandatory fields: name (firstName + lastName), age
   * Additional fields go to additional_info
   * @param {Object} record - Parsed CSV record
   * @returns {Object} Transformed record with name, age, address, additional_info
   */
  static transformRecord(record) {
    const transformed = {
      name: `${record.name.firstName} ${record.name.lastName}`,
      age: parseInt(record.age, 10),
    };

    // Extract address if present
    if (record.address) {
      transformed.address = record.address;
    } else {
      transformed.address = null;
    }

    // Collect additional fields
    const additionalInfo = {};
    this.collectAdditionalFields(record, additionalInfo);

    transformed.additional_info =
      Object.keys(additionalInfo).length > 0 ? additionalInfo : null;

    return transformed;
  }

  /**
   * Recursively collect all fields except mandatory and address into additional_info
   * @param {Object} obj - Object to traverse
   * @param {Object} additional - Accumulator for additional fields
   * @param {string} prefix - Current path prefix for nested objects
   */
  static collectAdditionalFields(obj, additional, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      // Skip mandatory and address fields
      if (fullKey === 'name' || fullKey === 'age' || fullKey === 'address') {
        continue;
      }

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested objects
        this.collectAdditionalFields(value, additional, fullKey);
      } else {
        // Add field to additional info
        this.setNestedProperty(additional, fullKey, value);
      }
    }
  }

  /**
   * Set nested property using dot notation
   * @param {Object} obj - Target object
   * @param {string} path - Dot-separated path
   * @param {*} value - Value to set
   */
  static setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Transform array of records
   * @param {Array} records - Array of parsed records
   * @returns {Array} Array of transformed records
   */
  static transformRecords(records) {
    return records.map((record) => this.transformRecord(record));
  }
}

module.exports = DataTransformer;
