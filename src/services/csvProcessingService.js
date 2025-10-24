const fs = require('fs').promises;
const CSVParser = require('../utils/csvParser');
const DataTransformer = require('../utils/dataTransformer');
const AgeDistribution = require('../utils/ageDistribution');

/**
 * CSV Processing Service
 * Handles CSV parsing, validation, and reporting
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

      // Step 5: Calculate and print age distribution
      const distribution = AgeDistribution.calculate(transformedRecords);
      AgeDistribution.printReport(distribution);

      // Clean up uploaded file
      await fs.unlink(filePath);

      return {
        success: true,
        totalRecords: transformedRecords.length,
        records: transformedRecords,
        ageDistribution: distribution,
        message: `Successfully processed ${transformedRecords.length} records`,
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
   * Get all cached records from memory
   * @returns {Promise<Array>} Array of processed records
   */
  static async getAllRecords() {
    try {
      // In-memory storage for processed records
      if (!CSVProcessingService.cachedRecords) {
        CSVProcessingService.cachedRecords = [];
      }
      return CSVProcessingService.cachedRecords;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }

  /**
   * Get age distribution statistics from cached records
   * @returns {Promise<Object>} Age distribution data
   */
  static async getAgeDistribution() {
    try {
      const records = await this.getAllRecords();
      return AgeDistribution.calculate(records);
    } catch (error) {
      console.error('Error calculating age distribution:', error);
      throw error;
    }
  }

  /**
   * Clear all cached records
   * @returns {Promise<number>} Number of deleted records
   */
  static async deleteAllRecords() {
    try {
      const count = CSVProcessingService.cachedRecords?.length || 0;
      CSVProcessingService.cachedRecords = [];
      return count;
    } catch (error) {
      console.error('Error clearing records:', error);
      throw error;
    }
  }
}

module.exports = CSVProcessingService;
