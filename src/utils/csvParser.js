/**
 * Custom CSV Parser - Converts CSV to JSON without external dependencies
 * Handles complex nested properties with dot notation
 */

class CSVParser {
  /**
   * Parse CSV content into array of objects
   * @param {string} csvContent - Raw CSV file content
   * @returns {Array} Array of parsed objects
   */
  static parse(csvContent) {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse header row
    const headers = this.parseCSVLine(lines[0]);

    // Parse data rows
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue; // Skip empty lines

      const values = this.parseCSVLine(lines[i]);

      if (values.length !== headers.length) {
        throw new Error(
          `Row ${i + 1} has ${values.length} columns but header has ${headers.length} columns`
        );
      }

      const record = this.mapRowToObject(headers, values);
      records.push(record);
    }

    return records;
  }

  /**
   * Parse a single CSV line handling quoted values
   * @param {string} line - CSV line
   * @returns {Array} Array of parsed values
   */
  static parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());
    return result;
  }

  /**
   * Map CSV row values to nested object using header keys
   * @param {Array} headers - Column headers
   * @param {Array} values - Row values
   * @returns {Object} Nested object with dot notation expanded
   */
  static mapRowToObject(headers, values) {
    const obj = {};

    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      const value = values[i];

      this.setNestedProperty(obj, key, value);
    }

    return obj;
  }

  /**
   * Set nested property on object using dot notation
   * @param {Object} obj - Target object
   * @param {string} path - Dot-separated property path (e.g., "address.line1")
   * @param {*} value - Value to set
   */
  static setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  }

  /**
   * Validate that CSV has mandatory fields
   * @param {Array} records - Parsed records
   * @throws {Error} If mandatory fields are missing
   */
  static validateMandatoryFields(records) {
    const mandatoryFields = ['name.firstName', 'name.lastName', 'age'];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // Check firstName
      if (!record.name?.firstName) {
        throw new Error(
          `Row ${i + 1}: Missing mandatory field 'name.firstName'`
        );
      }

      // Check lastName
      if (!record.name?.lastName) {
        throw new Error(
          `Row ${i + 1}: Missing mandatory field 'name.lastName'`
        );
      }

      // Check age
      if (!record.age) {
        throw new Error(`Row ${i + 1}: Missing mandatory field 'age'`);
      }

      // Validate age is a number
      const ageNum = parseInt(record.age, 10);
      if (isNaN(ageNum) || ageNum < 0) {
        throw new Error(
          `Row ${i + 1}: Age must be a valid non-negative number, got '${record.age}'`
        );
      }
    }
  }
}

module.exports = CSVParser;
