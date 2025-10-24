const express = require('express');
const multer = require('multer');
const path = require('path');
const CSVController = require('../controllers/csvController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 52428800), // 50MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Routes
router.post('/csv/upload', upload.single('file'), CSVController.uploadCSV);
router.get('/csv/report', CSVController.getAgeDistribution);
router.get('/records', CSVController.getRecords);
router.get('/health', CSVController.healthCheck);

module.exports = router;
