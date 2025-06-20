const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  uploadFileValidator,
  fileKeyValidator,
  urlExpirationValidator,
  fileSearchValidator
} = require('../validators/fileValidator');
const { upload } = require('../config/multer');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/files - Get list of files
router.get('/', fileSearchValidator, fileController.getFiles);

// POST /api/files/upload - Upload file
router.post('/upload', 
  upload.single('file'),
  uploadFileValidator,
  fileController.uploadFile
);

// GET /api/files/:key/preview - Get file preview
router.get('/:key/preview', fileKeyValidator, fileController.previewFile);

// DELETE /api/files/:key - Delete file
router.delete('/:key', fileKeyValidator, fileController.deleteFile);

// GET /api/files/:key/download - Download file
router.get('/:key/download', fileKeyValidator, fileController.downloadFile);

// GET /api/files/:key/url - Get file URL (signed URL)
router.get('/:key/url', fileKeyValidator, urlExpirationValidator, fileController.getFileUrl);

// GET /api/files/health - Health check
router.get('/health', fileController.healthCheck);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const fileController = require('../controllers/fileController');
// const { authenticateToken } = require('../middlewares/authMiddleware');
// const {
//   uploadFileValidator,
//   fileKeyValidator,
//   urlExpirationValidator,
//   fileSearchValidator,

// } = require('../validators/fileValidator');
// const { upload } = require('../config/multer');

// // Apply authentication middleware to all routes
// router.use(authenticateToken);

// // GET /api/files - Get list of files
// router.get('/', fileSearchValidator, fileController.getFiles);

// // POST /api/files/upload - Upload file
// router.post('/upload', 
//   upload.single('file'),
//   uploadFileValidator,
//   fileController.uploadFile
// );

// // GET /api/files/:key - Get file details/preview
// router.get('/:key', fileKeyValidator, fileController.previewFile);

// // PUT /api/files/:key - Update file metadata
// router.put('/:key', fileKeyValidator, fileMetadataValidator, fileController.updateFileMetadata);

// // DELETE /api/files/:key - Delete file
// router.delete('/:key', fileKeyValidator, fileController.deleteFile);

// // GET /api/files/:key/download - Download file
// router.get('/:key/download', fileKeyValidator, fileController.downloadFile);

// // GET /api/files/:key/url - Get file URL (signed URL)
// router.get('/:key/url', fileKeyValidator, urlExpirationValidator, fileController.getFileUrl);

// // POST /api/files/:key/share - Share file
// router.post('/:key/share', fileKeyValidator, fileShareValidator, fileController.shareFile);

// // POST /api/files/bulk/delete - Bulk delete files
// router.post('/bulk/delete', bulkFileValidator, fileController.bulkDeleteFiles);

// // POST /api/files/bulk/download - Bulk download files
// router.post('/bulk/download', bulkFileValidator, fileController.bulkDownloadFiles);

// // GET /api/files/health - Health check
// router.get('/health', fileController.healthCheck);

// module.exports = router;