import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  HiX, 
  HiUpload, 
  HiDocumentText, 
  HiEye, 
  HiCheckCircle,
  HiClock,
  HiExclamation,
  HiTrash
} from 'react-icons/hi';
import { apiService, useApiCall } from '@/services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface TaskFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  uploadedAt: string;
  size: number;
  mimeType: string;
}

interface TaskFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  taskStatus: string;
}

interface UploadResponse {
  bucket: string;
  etag: string;
  key: string;
  location: string;
}

const theme = localStorage.getItem('theme');

const sweetAlertOptions: Record<string, unknown> = {
    background: theme === "dark" ? 'rgba(0, 0, 0, 0.9)' : '#fff', 
    color: theme === "dark" ? '#fff' : '#000', 
    confirmButtonText: 'OK', 
    confirmButtonColor: theme === "dark" ? '#3085d6' : '#0069d9', 
    cancelButtonColor: theme === "dark" ? '#d33' : '#dc3545', 
};

const TaskFileModal: React.FC<TaskFileModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskStatus
}) => {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [requestingReview, setRequestingReview] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { callApi } = useApiCall();

  const showSuccessToast = useCallback(async (title: string, text: string) => {
    await MySwal.fire({
        ...sweetAlertOptions,
      title,
      text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }, []);

  const showConfirmDialog = useCallback(async (title: string, text: string) => {
    const result = await MySwal.fire({
      ...sweetAlertOptions,
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }, []);

  // Fetch existing files when modal opens
  const fetchTaskFiles = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await callApi(() => apiService.files.getFileDetails(taskId));
      console.log('Fetched task files:', response);
      // Check if response indicates a 404 error
      if (response?.status === 404 || 
          (response?.message && response.message.toLowerCase().includes('not found')) ||
          (!response?.data && response?.status >= 400)) {
        setError('Task files not found');
        return;
      }
      
      // Validate response data exists
      if (!response?.data) {
        throw new Error('No file data received');
      }

      const fileData = response.data;
    
      if (Array.isArray(fileData)) {
        setFiles(fileData);
      } else {
        setFiles(prevFiles => {
          const currentFiles = Array.isArray(prevFiles) ? prevFiles : [];
          const newFile = fileData;
          const filteredFiles = currentFiles.filter(file => 
            file.id !== newFile.id
          );
          return [...filteredFiles, newFile];
        });
      }
      
      setFilesLoaded(true);

    } catch (err) {
      console.error('Error fetching task files:', err);
      setError('No task files previously uploaded');
    } finally {
      setLoading(false);
    }
  }, [callApi, taskId]);

  // Use a ref to track if we've already initiated a fetch
  const fetchInitiatedRef = useRef(false);

  useEffect(() => {
    if (isOpen && taskId && !filesLoaded && !loading && !fetchInitiatedRef.current) {
      fetchInitiatedRef.current = true;
      fetchTaskFiles();
    }

    if (!isOpen) {
      fetchInitiatedRef.current = false;
    }
  }, [isOpen, taskId, filesLoaded, loading]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach(file => {
        uploadFile(file);
      });
    }
  };

  // Transform function
  const transformUploadResponseToTaskFile = (response: UploadResponse, originalFile: File): TaskFile => {
    // Extract timestamp and original name from key
    // Key format: "1750431513981-taskId-originalFileName.ext"
    const keyParts = response.key.split('-');
    const timestamp = keyParts[0]; // First part is timestamp
    
    // Convert timestamp to readable date
    const uploadedAt = new Date(parseInt(timestamp)).toISOString();
    
    // Extract original filename from key (everything after second dash)
    const originalName = originalFile.name;
    
    return {
      id: response.key,
      filename: response.key, // S3 key as filename
      originalName: originalName,
      url: response.location,
      uploadedAt: uploadedAt,
      size: originalFile.size, // From the original file object
      mimeType: originalFile.type // From the original file object
    };
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const response = await callApi(async () => apiService.files.uploadFile(taskId, file, {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }));

      if (response && response.data) {
        // Transform the response to match TaskFile interface
        const taskFile: TaskFile = transformUploadResponseToTaskFile(response.data, file);
        
        setFiles(prevFiles => {
          const currentFiles = Array.isArray(prevFiles) ? prevFiles : [];
          // Check if file already exists to prevent duplicates
          const existingFile = currentFiles.find(f => f.id === taskFile.id);
          if (existingFile) {
            return currentFiles;
          }
          return [...currentFiles, taskFile];
        });
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

const deleteFile = async (file: TaskFile) => {
  const confirmed = await showConfirmDialog(
    'Delete File',
    `Are you sure you want to delete "${file.originalName}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    setDeletingFileId(file.id);
    setError(null);

    // Call your API to delete the file - CHANGED: Use file.id as the key, remove taskId
    await callApi(() => apiService.files.deleteFile(file.id));

    // Remove the file from the local state
    setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));

    await showSuccessToast('File Deleted', 'File has been successfully deleted.');
  } catch (err) {
    console.error('Error deleting file:', err);
    setError(`Failed to delete ${file.originalName}`);
  } finally {
    setDeletingFileId(null);
  }
};

  const requestReview = async () => {
    try {
      setRequestingReview(true);
      setError(null);

      await callApi(() => apiService.tasks.updateTaskStatus(taskId, 'IN_REVIEW'));
      
      // Show success message or update UI as needed
      await showSuccessToast('Review requested!', 'Your review request has been sent successfully. You will be notified once the review is completed.');
      onClose();
    } catch (err) {
      console.error('Error requesting review:', err);
      setError('Failed to request review');
    } finally {
      setRequestingReview(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Invalid date format:', dateString, error);
      return 'Invalid Date';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (!mimeType) return <HiDocumentText className="w-5 h-5 text-gray-500" />;
    if (mimeType.startsWith('image/')) {
      return <HiEye className="w-5 h-5 text-blue-500" />;
    } else if (mimeType.includes('pdf')) {
      return <HiDocumentText className="w-5 h-5 text-red-500" />;
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return <HiDocumentText className="w-5 h-5 text-blue-600" />;
    } else {
      return <HiDocumentText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'done':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
      case 'in progress':
      case 'ongoing':
        return <HiClock className="w-5 h-5 text-blue-500" />;
      case 'blocked':
      case 'on_hold':
        return <HiExclamation className="w-5 h-5 text-red-500" />;
      default:
        return <HiClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const canRequestReview = files.length > 0 && taskStatus.toLowerCase() !== 'completed';
  const canDeleteFiles = taskStatus.toLowerCase() !== 'completed' && taskStatus.toLowerCase() !== 'in_review';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getStatusIcon(taskStatus)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Files & Review
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {taskTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* File Upload Area */}
          { (taskStatus.toLowerCase() !== 'completed' && taskStatus.toLowerCase() !== 'in_review') && (<div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Upload Files
            </h4>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
              title='File upload'
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept="*/*"
              />
              
              <HiUpload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  disabled={uploading}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Support for all file types
              </p>
              
              {uploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>)}

          {/* Uploaded Files */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Uploaded Files ({files.length || 0})
            </h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading files...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={`${file.id}-${file.uploadedAt}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View file"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      {canDeleteFiles && (
                        <button
                          onClick={() => deleteFile(file)}
                          disabled={deletingFileId === file.id}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete file"
                        >
                          {deletingFileId === file.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <HiTrash className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <HiDocumentText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No files uploaded yet
                </p>
              </div>
            )}
          </div>

          {/* Review Request Section */}
          {canRequestReview && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Request Review
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Submit your uploaded files for review. The task status will be updated to pending review.
              </p>
              <button
                onClick={requestReview}
                disabled={requestingReview || files.length === 0 || taskStatus.toLowerCase() === 'in_review' || taskStatus.toLowerCase() === 'in review'}
                className="w-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                {requestingReview ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Requesting Review...
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="w-4 h-4" />
                    {taskStatus.toLowerCase() === 'in_review' || taskStatus.toLowerCase() === 'in review' ? 'Review has already been requested' : 'Request review'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFileModal;