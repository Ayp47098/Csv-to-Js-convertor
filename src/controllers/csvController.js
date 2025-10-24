const CSVProcessingService = require('../services/csvProcessingService');

/**
 * CSV Upload Controller
 */
class CSVController {
  /**
   * Upload and process CSV file
   * POST /api/csv/upload
   */
  static async uploadCSV(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
        // Clean up file
        const fs = require('fs').promises;
        await fs.unlink(req.file.path);

        return res.status(400).json({
          success: false,
          error: 'File must be a CSV file',
        });
      }

      // Process the CSV file
      const result = await CSVProcessingService.processCSVFile(req.file.path);

      res.status(200).json(result);
    } catch (error) {
      console.error('CSV upload error:', error);
      next(error);
    }
  }

  /**
   * Get all users from database
   * GET /api/users
   */
  static async getUsers(req, res, next) {
    try {
      const users = await CSVProcessingService.getAllUsers();

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Get users error:', error);
      next(error);
    }
  }

  /**
   * Get age distribution statistics
   * GET /api/statistics/age-distribution
   */
  static async getAgeDistribution(req, res, next) {
    try {
      const distribution = await CSVProcessingService.getAgeDistribution();

      res.status(200).json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      console.error('Get age distribution error:', error);
      next(error);
    }
  }

  /**
   * Health check endpoint
   * GET /api/health
   */
  static async healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'CSV to JSON Converter API is running',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Reset database (delete all users)
   * DELETE /api/users/reset
   */
  static async resetDatabase(req, res, next) {
    try {
      const deletedCount = await CSVProcessingService.deleteAllUsers();

      res.status(200).json({
        success: true,
        message: `Deleted ${deletedCount} records from database`,
        deletedCount,
      });
    } catch (error) {
      console.error('Reset database error:', error);
      next(error);
    }
  }
}

module.exports = CSVController;
