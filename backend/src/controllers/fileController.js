const S3Service = require('../services/s3Service');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

class FileController {
  // Upload a file
  async uploadFile(req, res) {
    console.log('File upload request received:', req.file);
    console.log(req.body);
    try {
      const result = await S3Service.uploadFile(req.body.taskId, req.file);
      
      return successResponse(res, 'File uploaded successfully', result, 201);
    } catch (error) {
      console.error('Upload error:', error);
      return errorResponse(res, 'Failed to upload file', 500);
    }
  }

  // Get all files
  async getFiles(req, res) {
    try {
      const files = await S3Service.listFiles();
      
      const responseData = {
        files,
        count: files.length
      };

      return successResponse(res, 'Files retrieved successfully', responseData);
    } catch (error) {
      console.error('List files error:', error);
      return errorResponse(res, 'Failed to retrieve files', 500);
    }
  }

  // Download a file
  async downloadFile(req, res) {
    try {
      const { key } = req.params;
      
      const fileStream = await S3Service.downloadFile(key);
      
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      fileStream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      if (error.message === 'File not found') {
        return errorResponse(res, 'File not found', 404);
      }
      return errorResponse(res, 'Failed to download file', 500);
    }
  }

  // Get file URL
  async getFileUrl(req, res) {
    try {
      const { key } = req.params;
      const expiration = parseInt(req.query.expires) || 3600;
      
      const url = await S3Service.generateSignedUrl(key, expiration);
      
      const responseData = {
        url,
        expires: expiration
      };

      return successResponse(res, 'URL generated successfully', responseData);
    } catch (error) {
      console.error('Get URL error:', error);
      return errorResponse(res, 'Failed to generate URL', 500);
    }
  }

  // Delete a file
  async deleteFile(req, res) {
    try {
      const { key } = req.params;
      
      const result = await S3Service.deleteFile(key);
      
      return successResponse(res, 'File deleted successfully', result);
    } catch (error) {
      console.error('Delete error:', error);
      return errorResponse(res, 'Failed to delete file', 500);
    }
  }

  async previewFile(req, res) {
    try {
      const { key } = req.params;

      // Step 1: List all files in the S3 bucket
      const allFiles = await S3Service.listFiles();

      // Step 2: Filter files that end with the specified key (taskId)
      const filteredFiles = allFiles
        .map(file => file.key)
        .filter(filename => {
        // Remove file extension
        const baseName = filename.split('.').slice(0, -1).join('.');
        // Check if ends with key
        return baseName.endsWith(key);
      });

      // Step 3: Sort files based on datetime extracted from the filename
      const sortedFiles = filteredFiles.sort((a, b) => {
        const dateA = new Date(a.split('-')[0]);
        const dateB = new Date(b.split('-')[0]);
        return dateB - dateA;
      });

      // Step 4: Select the latest file
      const latestFileKey = sortedFiles[0];
      console.log('Latest file key:', latestFileKey);

      if (!latestFileKey) {
        return errorResponse(res, 'No files found for the specified task ID', 404);
      }

      // Get file metadata for the latest file
      const headResult = await S3Service.getFileMetadata(latestFileKey);
      const contentType = headResult.ContentType || 'application/octet-stream';
      const fileSize = headResult.ContentLength || 0;

      // For large files, return metadata only
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit for preview
        const responseData = {
          preview: false,
          message: 'File too large for preview',
          metadata: {
            contentType,
            size: fileSize,
            lastModified: headResult.LastModified
          }
        };
        return successResponse(res, 'File preview retrieved successfully', responseData);
      }

      const responseData = await S3Service.getFileObject(latestFileKey);

      return successResponse(res, 'File preview retrieved successfully', responseData);

    } catch (error) {
      console.error('Preview error:', error);
      if (error.message === 'File not found') {
        return errorResponse(res, 'File not found', 404);
      }
      return errorResponse(res, 'Failed to retrieve file preview', 500);
    }
  }

  // Health check
  async healthCheck(req, res) {
    try {
      const responseData = {
        status: 'OK',
        timestamp: new Date().toISOString()
      };

      return successResponse(res, 'Service is healthy', responseData);
    } catch (error) {
      console.error('Health check error:', error);
      return errorResponse(res, 'Service health check failed', 500);
    }
  }
}

module.exports = new FileController();