const { s3, BUCKET_NAME } = require('../config/aws');

class S3Service {
  static async uploadFile(fileData) {
    const fileKey = `${Date.now()}-${fileData.originalname}`;
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileData.buffer,
      ContentType: fileData.mimetype,
      ACL: 'private'
    };

    const result = await s3.upload(uploadParams).promise();
    
    return {
      key: fileKey,
      location: result.Location,
      bucket: result.Bucket,
      etag: result.ETag
    };
  }

  static async listFiles(maxKeys = 1000) {
    const params = {
      Bucket: BUCKET_NAME,
      MaxKeys: maxKeys
    };

    const result = await s3.listObjectsV2(params).promise();
    
    return result.Contents.map(file => ({
      key: file.Key,
      lastModified: file.LastModified,
      size: file.Size,
      etag: file.ETag
    }));
  }

  static async downloadFile(fileKey) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    // Check if file exists
    await this.checkFileExists(fileKey);

    return s3.getObject(params).createReadStream();
  }

  static async generateSignedUrl(fileKey, expiration = 3600) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Expires: expiration
    };

    return await s3.getSignedUrlPromise('getObject', params);
  }

  static async deleteFile(fileKey) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();
    return { key: fileKey };
  }

  static async getFileMetadata(fileKey) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    return await s3.headObject(params).promise();
  }

  static async getFileContent(fileKey) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    return await s3.getObject(params).promise();
  }

  static async checkFileExists(fileKey) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    try {
      await s3.headObject(params).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  static isTextFile(contentType) {
    return contentType.startsWith('text/') || 
           contentType.includes('json') || 
           contentType.includes('xml') ||
           contentType.includes('javascript') ||
           contentType.includes('css') ||
           contentType.includes('html');
  }

  static isImageFile(contentType) {
    return contentType.startsWith('image/');
  }

  static isPDFFile(contentType) {
    return contentType === 'application/pdf';
  }
}

module.exports = S3Service;