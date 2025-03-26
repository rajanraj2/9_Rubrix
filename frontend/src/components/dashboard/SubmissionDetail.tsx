import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, FileText, Download } from 'lucide-react';
import { submissionAPI } from '../../lib/api';

interface SubmissionDetailProps {
  submission: {
    id: string;
    _id?: string;
    studentName: string;
    submissionTitle: string;
    submissionDate: string;
    overallScore: number;
    parameters: {
      [key: string]: number;
    };
    isShortlisted: boolean;
    submissionText?: string;
    files?: Array<{
      filename: string;
      path: string;
      mimetype: string;
      url?: string;
    }>;
    feedback?: string;
    summary_feedback?: {
      summary: string;
      feedback: string;
      performance_category: string;
    };
  };
  onClose: () => void;
  fullSubmission?: boolean;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({ 
  submission, 
  onClose,
  fullSubmission = false 
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'feedback'>('preview');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [fileUrls, setFileUrls] = useState<{[key: string]: string}>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Function to fetch file URLs from S3
  useEffect(() => {
    const getFileUrls = async () => {
      if (!submission.files || submission.files.length === 0 || !fullSubmission) return;
      
      setIsLoadingFiles(true);
      
      try {
        const fileUrlsObj: {[key: string]: string} = {};
        
        // For each file, get a presigned URL
        await Promise.all(
          submission.files.map(async (file, index) => {
            try {
              const response = await submissionAPI.getFilePresignedUrl(
                submission.id || submission._id || '', 
                index
              );
              fileUrlsObj[file.filename] = response.data.url;
            } catch (error) {
              console.error(`Error getting URL for file ${file.filename}:`, error);
            }
          })
        );
        
        setFileUrls(fileUrlsObj);
      } catch (error) {
        console.error('Error fetching file URLs:', error);
      } finally {
        setIsLoadingFiles(false);
      }
    };
    
    getFileUrls();
  }, [submission.id, submission._id, submission.files, fullSubmission]);

  const handleSaveFeedback = async () => {
    if (!feedback.trim()) return;
    
    try {
      await submissionAPI.evaluateSubmission(submission.id || submission._id || '', {
        feedback,
        evaluation: []
      });
      
      setIsEditingFeedback(false);
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  // Function to render score bars with colored backgrounds based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get the actual submission content - either from summary_feedback or real text
  const getSubmissionContent = () => {
    if (submission.submissionText) {
      return submission.submissionText;
    }
    
    if (submission.summary_feedback?.summary) {
      return submission.summary_feedback.summary;
    }
    
    return "This project description is not available.";
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'preview'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'summary'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'feedback'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Feedback
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Project Title</h4>
              <p className="text-base font-medium">{submission.submissionTitle}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="text-sm whitespace-pre-line">{getSubmissionContent()}</p>
            </div>
            
            {fullSubmission && submission.files && submission.files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Files</h4>
                
                {isLoadingFiles ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <div key={index} className="p-2 border rounded-md flex justify-between items-center">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.filename}</span>
                        </div>
                        {fileUrls[file.filename] && (
                          <a
                            href={fileUrls[file.filename]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                            download={file.filename}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            <span className="text-sm">Download</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {submission.summary_feedback ? (
              <>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Performance Category</h4>
                  <p className="text-sm font-medium mt-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full inline-block">
                    {submission.summary_feedback.performance_category}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Summary</h4>
                  <p className="text-sm">{submission.summary_feedback.summary}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">AI Feedback</h4>
                  <p className="text-sm whitespace-pre-line">{submission.summary_feedback.feedback}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No summary feedback available for this submission.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-500">Teacher's Feedback</h4>
              {!isEditingFeedback ? (
                <button
                  onClick={() => setIsEditingFeedback(true)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveFeedback}
                  className="text-green-600 hover:text-green-800"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {!isEditingFeedback ? (
              feedback ? (
                <p className="text-sm whitespace-pre-line">{feedback}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No feedback provided yet.</p>
              )
            ) : (
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-32 p-2 border rounded-md text-sm"
                placeholder="Provide feedback..."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail; 