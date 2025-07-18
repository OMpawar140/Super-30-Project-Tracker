import React, { useState, useEffect, useCallback } from 'react';
import { 
  HiX, 
  HiDocumentText, 
  HiEye, 
  HiCheckCircle,
  HiClock,
  HiExclamation,
  HiXCircle,
  HiChat
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

interface TaskReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  taskStatus: string;
}

const theme = localStorage.getItem('theme');

const sweetAlertOptions: Record<string, unknown> = {
    background: theme === "dark" ? 'rgba(0, 0, 0, 0.9)' : '#fff', 
    color: theme === "dark" ? '#fff' : '#000', 
    confirmButtonText: 'OK', 
    confirmButtonColor: theme === "dark" ? '#3085d6' : '#0069d9', 
    cancelButtonColor: theme === "dark" ? '#d33' : '#dc3545', 
};

const TaskReviewModal: React.FC<TaskReviewModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskStatus
}) => {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { callApi } = useApiCall();

  const showSuccessToast = useCallback(async (title: string, text: string) => {
    await MySwal.fire({
        ...sweetAlertOptions,
      title,
      text,
      icon: 'success',
      // confirmButtonColor: '#6366f1',
      // background: '#18181b',
      // color: '#fff',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }, []);

  // Fetch existing files when modal opens
  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskFiles();
    }
  }, [isOpen, taskId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReviewDecision(null);
      setFeedback('');
      setShowFeedbackForm(false);
      setError(null);
    }
  }, [isOpen]);

  const fetchTaskFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await callApi(() => apiService.files.getFileDetails(taskId));
      console.log('Fetched task files:', response);

      // Check if response indicates a 404 error
      if (response?.status === 404 || 
          (response?.message && response.message.toLowerCase().includes('no files found')) ||
          (!response?.data && response?.status >= 400)) {
        setError('Task files not found');
        return;
      }
      
      // Validate response data exists
      if (!response?.data) {
        throw new Error('No file data received');
      }
      // setFiles(prevFiles => {
      //   const currentFiles = Array.isArray(prevFiles) ? prevFiles : [];
      //   return [...currentFiles, response.data];
      // });
      setFiles(prevFiles => {
        const currentFiles = Array.isArray(prevFiles) ? prevFiles : [];
        const newFile = response.data;
        
        // Remove duplicates based on file ID or name (adjust the key as needed)
        const filteredFiles = currentFiles.filter(file => 
          file.id !== newFile.id // Change 'id' to whatever unique identifier your files have
        );
        
        // Add the new file
        return [...filteredFiles, newFile];
      });
    } catch (err) {
      console.error('Error fetching task files:', err);
      setError('No task files available');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDecision = (decision: 'approved' | 'rejected') => {
    setReviewDecision(decision);
    setShowFeedbackForm(true);
  };

  const submitReview = async () => {
    if (!reviewDecision) return;

    try {
      setSubmittingReview(true);
      setError(null);

      let newTaskStatus = "COMPLETED";

      if(reviewDecision === 'rejected'){
        newTaskStatus = "IN_PROGRESS";
      }
      
      await callApi(() => apiService.tasks.updateTaskStatus(taskId, newTaskStatus));

      await callApi(() => apiService.tasks.submitReview(taskId, {
        status: reviewDecision.toUpperCase(),
        comment: feedback.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Show success message
      await showSuccessToast(`Task ${reviewDecision === 'approved' ? 'approved' : 'rejected'}!`, `This task has been ${reviewDecision === 'approved' ? 'approved successfully' : 'rejected'}. The task completer will be notified about the same.`);
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
      case 'pending_review':
      case 'pending review':
        return <HiClock className="w-5 h-5 text-amber-500" />;
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

  const canReview = files.length > 0 && 
    (taskStatus.toLowerCase() === 'in_review' || taskStatus.toLowerCase() === 'in review');

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
                Review Task Submission
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

          {/* Submitted Files */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Submitted Files ({files.length || 0})
            </h4>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading files...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • Submitted {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="View file"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      {/* <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file.url;
                          link.download = file.originalName;
                          link.click();
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Download file"
                      >
                        <HiDownload className="w-4 h-4" />
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <HiDocumentText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No files submitted yet
                </p>
              </div>
            )}
          </div>

          {/* Review Decision Section */}
          {canReview && !showFeedbackForm && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Review Decision
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Review the submitted files and decide whether to approve or reject the task completion.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReviewDecision('approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <HiCheckCircle className="w-5 h-5" />
                  Approve Task
                </button>
                <button
                  onClick={() => handleReviewDecision('rejected')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <HiXCircle className="w-5 h-5" />
                  Reject Task
                </button>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <HiChat className="w-5 h-5 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {reviewDecision === 'approved' ? 'Approval' : 'Rejection'} Feedback
                </h4>
              </div>
              
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                  reviewDecision === 'approved' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {reviewDecision === 'approved' ? (
                    <HiCheckCircle className="w-4 h-4" />
                  ) : (
                    <HiXCircle className="w-4 h-4" />
                  )}
                  {reviewDecision === 'approved' ? 'Approving Task' : 'Rejecting Task'}
                </div>
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  reviewDecision === 'approved' 
                    ? 'Add any additional comments or notes (optional)...'
                    : 'Please explain why the task is being rejected and what needs to be improved...'
                }
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {feedback.length}/500 characters
                </p>
                {reviewDecision === 'rejected' && feedback.trim().length < 10 && (
                  <p className="text-xs text-red-500">
                    Please provide detailed feedback for rejection
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
                >
                  Back
                </button>
                <button
                  onClick={submitReview}
                  disabled={
                    submittingReview || 
                    (reviewDecision === 'rejected' && feedback.trim().length < 10)
                  }
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 text-white ${
                    reviewDecision === 'approved'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                  } disabled:cursor-not-allowed`}
                >
                  {submittingReview ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      {reviewDecision === 'approved' ? (
                        <HiCheckCircle className="w-4 h-4" />
                      ) : (
                        <HiXCircle className="w-4 h-4" />
                      )}
                      Submit {reviewDecision === 'approved' ? 'Approval' : 'Rejection'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Info when task is not ready for review */}
          {!canReview && files.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <HiExclamation className="w-5 h-5 text-amber-500" />
                  <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                    Task is not pending review
                  </p>
                </div>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                  This task is currently {taskStatus} and cannot be reviewed at this time.
                </p>
              </div>
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

export default TaskReviewModal;