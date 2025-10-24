const fs = require('fs').promises;
const CSVParser = require('../utils/csvParser');
const DataTransformer = require('../utils/dataTransformer');
const AgeDistribution = require('../utils/ageDistribution');
const database = require('../config/database');

/**
 * CSV Processing Service
 * Handles CSV parsing, validation, database insertion, and reporting
 */
class CSVProcessingService {
  /**
   * Process uploaded CSV file
   * @param {string} filePath - Path to uploaded CSV file
   * @returns {Promise<Object>} Processing result with statistics
   */
  static async processCSVFile(filePath) {
    try {
      // Step 1: Read file
      const csvContent = await fs.readFile(filePath, 'utf-8');

      // Step 2: Parse CSV
      const parsedRecords = CSVParser.parse(csvContent);

      // Step 3: Validate mandatory fields
      CSVParser.validateMandatoryFields(parsedRecords);

      // Step 4: Transform records
      const transformedRecords = DataTransformer.transformRecords(parsedRecords);

      // Step 5: Insert into database
      const insertedCount = await this.insertRecordsToDB(transformedRecords);

      // Step 6: Calculate and print age distribution
      const distribution = AgeDistribution.calculate(transformedRecords);
      AgeDistribution.printReport(distribution);

      // Clean up uploaded file
      await fs.unlink(filePath);

      return {
        success: true,
        totalRecords: insertedCount,
        ageDistribution: distribution,
        message: `Successfully processed ${insertedCount} records`,
      };
    } catch (error) {
      // Clean up on error
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Error during file cleanup:', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Insert transformed records into database
   * @param {Array} records - Array of transformed records
   * @returns {Promise<number>} Number of inserted records
   */
  static async insertRecordsToDB(records) {
    const query = `
      INSERT INTO public.users (name, age, address, additional_info)
      VALUES ($1, $2, $3, $4)
    `;

    let inserted = 0;

    for (const record of records) {
      try {
        await database.query(query, [
          record.name,
          record.age,
          record.address ? JSON.stringify(record.address) : null,
          record.additional_info ? JSON.stringify(record.additional_info) : null,
        ]);
        inserted++;
      } catch (error) {
        console.error(`Error inserting record: ${JSON.stringify(record)}`, error);
        throw new Error(
          `Database insertion failed for record: ${record.name}. ${error.message}`
        );
      }
    }

    return inserted;
  }

  /**
   * Get all users from database
   * @returns {Promise<Array>} Array of user records
   */
  static async getAllUsers() {
    try {
      const result = await database.query('SELECT * FROM public.users ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get age distribution statistics
   * @returns {Promise<Object>} Age distribution data
   */
  static async getAgeDistribution() {
    try {
      const result = await database.query('SELECT age FROM public.users');
      const records = result.rows;
      return AgeDistribution.calculate(records);
    } catch (error) {
      console.error('Error calculating age distribution:', error);
      throw error;
    }
  }

  /**
   * Delete all users (for testing/reset)
   * @returns {Promise<number>} Number of deleted records
   */
  static async deleteAllUsers() {
    try {
      const result = await database.query('DELETE FROM public.users');
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  }
}

module.exports = CSVProcessingService;
