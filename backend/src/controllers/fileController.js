const S3Service = require('../services/s3Service');
const ResponseHelper = require('../utils/response');

class FileController {
  static async uploadFile(req, res, next) {
    try {
      const result = await S3Service.uploadFile(req.file);
      
      ResponseHelper.success(res, result, 'File uploaded successfully', 201);
    } catch (error) {
      console.error('Upload error:', error);
      next(error);
    }
  }

  static async getFiles(req, res, next) {
    try {
      const files = await S3Service.listFiles();
      
      ResponseHelper.success(res, {
        files,
        count: files.length
      }, 'Files retrieved successfully');
    } catch (error) {
      console.error('List files error:', error);
      next(error);
    }
  }

  static async downloadFile(req, res, next) {
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
        return ResponseHelper.notFound(res, 'File not found');
      }
      next(error);
    }
  }

  static async getFileUrl(req, res, next) {
    try {
      const { key } = req.params;
      const expiration = parseInt(req.query.expires) || 3600;
      
      const url = await S3Service.generateSignedUrl(key, expiration);
      
      ResponseHelper.success(res, {
        url,
        expires: expiration
      }, 'URL generated successfully');
    } catch (error) {
      console.error('Get URL error:', error);
      next(error);
    }
  }

  static async deleteFile(req, res, next) {
    try {
      const { key } = req.params;
      
      const result = await S3Service.deleteFile(key);
      
      ResponseHelper.success(res, result, 'File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      next(error);
    }
  }

  static async previewFile(req, res, next) {
    try {
      const { key } = req.params;
      
      // Get file metadata first
      const headResult = await S3Service.getFileMetadata(key);
      const contentType = headResult.ContentType || 'application/octet-stream';
      const fileSize = headResult.ContentLength || 0;

      // For large files, return metadata only
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit for preview
        return ResponseHelper.success(res, {
          preview: false,
          message: 'File too large for preview',
          metadata: {
            contentType,
            size: fileSize,
            lastModified: headResult.LastModified
          }
        });
      }

      // Get the file content
      const result = await S3Service.getFileContent(key);
      
      const isTextFile = S3Service.isTextFile(contentType);
      const isImageFile = S3Service.isImageFile(contentType);
      const isPDFFile = S3Service.isPDFFile(contentType);

      let responseData = {
        preview: true,
        metadata: {
          contentType,
          size: fileSize,
          lastModified: headResult.LastModified
        }
      };

      if (isTextFile) {
        responseData.type = 'text';
        responseData.content = result.Body.toString('utf-8');
      } else if (isImageFile || isPDFFile) {
        responseData.type = isImageFile ? 'image' : 'pdf';
        responseData.content = `data:${contentType};base64,${result.Body.toString('base64')}`;
      } else {
        responseData.preview = false;
        responseData.message = 'File type not supported for preview';
      }

      ResponseHelper.success(res, responseData, 'File preview retrieved successfully');
    } catch (error) {
      console.error('Preview error:', error);
      if (error.message === 'File not found') {
        return ResponseHelper.notFound(res, 'File not found');
      }
      next(error);
    }
  }

  static async healthCheck(req, res) {
    ResponseHelper.success(res, {
      status: 'OK',
      timestamp: new Date().toISOString()
    }, 'Service is healthy');
  }
}

module.exports = FileController;