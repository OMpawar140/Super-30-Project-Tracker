const express = require('express');
const FileController = require('../controllers/fileController');
const FileValidator = require('../validators/fileValidator');
const { upload } = require('../config/multer');

const router = express.Router();

// Upload file
router.post('/upload', 
  upload.single('file'),
  FileValidator.validateUpload(),
  FileValidator.handleValidationErrors(),
  FileController.uploadFile
);

// Get list of files
router.get('/files', FileController.getFiles);

// Download file
router.get('/download/:key',
  FileValidator.validateFileKey(),
  FileValidator.handleValidationErrors(),
  FileController.downloadFile
);

// Get file URL (signed URL)
router.get('/file-url/:key',
  FileValidator.validateFileKey(),
  FileValidator.validateUrlExpiration(),
  FileValidator.handleValidationErrors(),
  FileController.getFileUrl
);

// Delete file
router.delete('/delete/:key',
  FileValidator.validateFileKey(),
  FileValidator.handleValidationErrors(),
  FileController.deleteFile
);

// Preview file
router.get('/preview/:key',
  FileValidator.validateFileKey(),
  FileValidator.handleValidationErrors(),
  FileController.previewFile
);

// Health check
router.get('/health', FileController.healthCheck);

module.exports = router;