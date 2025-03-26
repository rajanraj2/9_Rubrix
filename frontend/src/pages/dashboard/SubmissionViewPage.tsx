import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Star } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import { submissionAPI } from '../../lib/api';

interface SubmissionFile {
  filename: string;
  path: string;
  mimetype: string;
  url?: string;
}

interface EvaluationParameter {
  parameterId: string;
  parameterName: string;
  score: number;
  feedback?: string;
}

interface SummaryFeedback {
  summary: string;
  feedback: string;
  performance_category: string;
}

interface SubmissionData {
  _id: string;
  studentName: string;
  submissionTitle: string;
  submissionText: string;
  submissionDate: string;
  overallScore: number;
  isShortlisted: boolean;
  userId: {
    _id: string;
    fullName: string;
    phoneNumber?: string;
    state?: string;
    district?: string;
    grade?: string;
    gender?: string;
    schoolCollegeName?: string;
  };
  files?: SubmissionFile[];
  evaluation?: EvaluationParameter[];
  feedback?: string;
  summary_feedback?: SummaryFeedback;
}

const SubmissionViewPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileUrls, setFileUrls] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submission' | 'feedback'>('submission');

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) return;
      
      try {
        setIsLoading(true);
        const response = await submissionAPI.getSubmission(submissionId);
        
        if (response.data && response.data.data) {
          const submissionData = response.data.data;
          
          // Transform the data to match our SubmissionData interface
          setSubmission({
            _id: submissionData._id,
            studentName: submissionData.userId.fullName,
            submissionTitle: submissionData.submissionText.substring(0, 50) || 'Untitled Submission',
            submissionText: submissionData.submissionText,
            submissionDate: submissionData.submittedAt,
            overallScore: submissionData.totalScore,
            isShortlisted: submissionData.isShortlisted || false,
            userId: submissionData.userId,
            files: submissionData.files,
            evaluation: submissionData.evaluation,
            feedback: submissionData.feedback,
            summary_feedback: submissionData.summary_feedback
          });
          
          // If there are files, fetch their URLs
          if (submissionData.files && submissionData.files.length > 0) {
            const urls: {[key: string]: string} = {};
            
            await Promise.all(submissionData.files.map(async (file: SubmissionFile, index: number) => {
              try {
                const urlResponse = await submissionAPI.getFilePresignedUrl(submissionData._id, index);
                if (urlResponse.data && urlResponse.data.url) {
                  urls[file.filename] = urlResponse.data.url;
                }
              } catch (error) {
                console.error(`Error fetching URL for file ${file.filename}:`, error);
              }
            }));
            
            setFileUrls(urls);
          }
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError('Failed to load submission details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmission();
  }, [submissionId]);

  const handleToggleShortlist = async () => {
    if (!submission) return;
    
    try {
      await submissionAPI.toggleShortlist(submission._id);
      
      // Update local state
      setSubmission({
        ...submission,
        isShortlisted: !submission.isShortlisted
      });
    } catch (error) {
      console.error('Error toggling shortlist:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to list
        </button>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4">
            <p className="text-red-500">{error}</p>
          </div>
        ) : submission ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{submission.submissionTitle}</h1>
                <p className="text-gray-600 mt-1">Submitted by {submission.studentName} on {new Date(submission.submissionDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(submission.overallScore)} text-white`}>
                  Score: {Math.round(submission.overallScore)}
                </span>
                <button
                  onClick={handleToggleShortlist}
                  className={`text-yellow-500 hover:text-yellow-700 p-1 rounded-full ${submission.isShortlisted ? 'bg-yellow-100' : ''}`}
                >
                  <Star className={`w-5 h-5 ${submission.isShortlisted ? 'fill-yellow-400' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('submission')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'submission'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Submission
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'feedback'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Feedback & Evaluation
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'submission' ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Details</h3>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Student Information</h4>
                      <div className="bg-gray-50 p-4 rounded-md text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p className="font-medium">{submission.userId.fullName}</p>
                          </div>
                          {submission.userId.schoolCollegeName && (
                            <div>
                              <p className="text-gray-500">School</p>
                              <p className="font-medium">{submission.userId.schoolCollegeName}</p>
                            </div>
                          )}
                          {submission.userId.grade && (
                            <div>
                              <p className="text-gray-500">Grade</p>
                              <p className="font-medium">{submission.userId.grade}</p>
                            </div>
                          )}
                          {submission.userId.state && (
                            <div>
                              <p className="text-gray-500">State</p>
                              <p className="font-medium">{submission.userId.state}</p>
                            </div>
                          )}
                          {submission.userId.district && (
                            <div>
                              <p className="text-gray-500">District</p>
                              <p className="font-medium">{submission.userId.district}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Project Description</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="whitespace-pre-wrap text-gray-800">{submission.submissionText}</p>
                      </div>
                    </div>
                    
                    {submission.files && submission.files.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted Files</h4>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <ul className="space-y-2">
                            {submission.files.map((file, index) => (
                              <li key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                  <span className="text-gray-800">{file.filename}</span>
                                </div>
                                {fileUrls[file.filename] && (
                                  <a
                                    href={fileUrls[file.filename]}
                                    download={file.filename}
                                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation & Feedback</h3>
                    
                    {submission.summary_feedback && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">AI-Generated Feedback</h4>
                        <div className="bg-gray-50 p-4 rounded-md mb-2">
                          <p className="font-medium text-gray-800">Summary</p>
                          <p className="text-gray-700 mt-1">{submission.summary_feedback.summary}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md mb-2">
                          <p className="font-medium text-gray-800">Feedback</p>
                          <p className="text-gray-700 mt-1">{submission.summary_feedback.feedback}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="font-medium text-gray-800">Performance Category</p>
                          <p className="text-gray-700 mt-1">{submission.summary_feedback.performance_category}</p>
                        </div>
                      </div>
                    )}
                    
                    {submission.feedback && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Teacher's Feedback</h4>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="whitespace-pre-wrap text-gray-800">{submission.feedback}</p>
                        </div>
                      </div>
                    )}
                    
                    {submission.evaluation && submission.evaluation.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Scoring Parameters</h4>
                        <div className="space-y-4">
                          {submission.evaluation.map((param, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-800">{param.parameterName}</span>
                                <span className="text-sm font-medium text-gray-700">{param.score}/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`${getScoreColor(param.score)} h-2.5 rounded-full`} 
                                  style={{ width: `${param.score}%` }}
                                ></div>
                              </div>
                              {param.feedback && (
                                <p className="mt-2 text-sm text-gray-700">{param.feedback}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Score</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">Overall Score</span>
                          <span className="text-sm font-medium text-gray-700">{Math.round(submission.overallScore)}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`${getScoreColor(submission.overallScore)} h-2.5 rounded-full`} 
                            style={{ width: `${submission.overallScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">Submission not found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubmissionViewPage; 