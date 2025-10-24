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
   * Get age distribution statistics
   * GET /api/csv/report
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
}

module.exports = CSVController;
