import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, ExternalLink } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import SubmissionDetail from '../../components/dashboard/SubmissionDetail';
import { hackathonAPI, submissionAPI } from '../../lib/api';

interface Submission {
  id: string;
  _id: string;
  studentName: string;
  submissionTitle: string;
  submissionDate: string;
  overallScore: number;
  parameters: {
    [key: string]: number;
  };
  isShortlisted: boolean;
  userId: {
    _id: string;
    fullName: string;
    phoneNumber?: string;
    state?: string;
    district?: string;
    grade?: string;
    gender?: string;
    schoolName?: string;
  };
  submissionText?: string;
  files?: Array<{
    filename: string;
    path: string;
    mimetype: string;
    url?: string;
  }>;
  evaluation?: Array<{
    parameterId: string;
    parameterName: string;
    score: number;
    feedback?: string;
  }>;
  feedback?: string;
  summary_feedback?: {
    summary: string;
    feedback: string;
    performance_category: string;
  };
}

interface SubmissionResponse {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phoneNumber?: string;
    state?: string;
    district?: string;
    grade?: string;
    gender?: string;
    schoolName?: string;
  };
  hackathonId: string;
  submissionText?: string;
  files?: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
  isShortlisted: boolean;
  evaluation?: Array<{
    parameterId: string;
    parameterName: string;
    score: number;
    feedback?: string;
  }>;
  totalScore: number;
  feedback?: string;
  summary_feedback?: {
    summary: string;
    feedback: string;
    performance_category: string;
  };
  submittedAt: string;
  evaluatedAt?: string;
}

const ShortlistedPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  // In a real app, you would use the hackathonId to fetch only shortlisted submissions for this specific hackathon
  console.log(`Loading shortlisted submissions for hackathon: ${hackathonId}`);
  
  const [shortlistedSubmissions, setShortlistedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shortlisted submissions
  useEffect(() => {
    const fetchShortlistedSubmissions = async () => {
      if (!hackathonId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Starting to fetch shortlisted submissions for hackathon: ${hackathonId}`);
        
        // Fetch shortlisted submissions
        const response = await hackathonAPI.getShortlisted(hackathonId);
        console.log('Shortlisted full response:', response);
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('Number of shortlisted submissions received:', response.data.data.length);
          
          // Transform the data to match our Submission interface
          const submissionsData = response.data.data.map((item: SubmissionResponse) => {
            // Extract parameter scores from the submission's evaluation
            const parameters: {[key: string]: number} = {};
            
            if (item.evaluation && Array.isArray(item.evaluation)) {
              item.evaluation.forEach((evaluation) => {
                parameters[evaluation.parameterName] = evaluation.score;
              });
            }
            
            return {
              id: item._id,
              _id: item._id,
              studentName: item.userId?.fullName || 'Unknown Student',
              submissionTitle: item.submissionText?.substring(0, 50) || 'Untitled Submission',
              submissionDate: item.submittedAt,
              overallScore: item.totalScore || 0,
              parameters,
              isShortlisted: true, // These are all shortlisted by definition
              userId: item.userId || {},
              submissionText: item.submissionText,
              files: item.files,
              evaluation: item.evaluation,
              feedback: item.feedback,
              summary_feedback: item.summary_feedback
            };
          });
          
          console.log('Transformed shortlisted data:', submissionsData);
          if (submissionsData.length > 0) {
            setShortlistedSubmissions(submissionsData);
          } else {
            tryFallbackSubmissions();
          }
        } else {
          console.warn('Shortlisted data is missing or in unexpected format:', response.data);
          tryFallbackSubmissions();
        }
      } catch (error) {
        console.error('Error fetching shortlisted submissions:', error);
        setError('Failed to load shortlisted submissions. Please try again.');
        tryFallbackSubmissions();
      } finally {
        setIsLoading(false);
      }
    };
    
    const tryFallbackSubmissions = async () => {
      console.log('Trying to fetch submissions directly as fallback');
      try {
        const submissionsResponse = await hackathonAPI.getSubmissions(hackathonId);
        console.log('Submissions fallback response:', submissionsResponse);
        
        if (submissionsResponse.data && 
            submissionsResponse.data.data && 
            Array.isArray(submissionsResponse.data.data) && 
            submissionsResponse.data.data.length > 0) {
          
          // Filter shortlisted submissions
          const shortlistedItems = submissionsResponse.data.data
            .filter((item: SubmissionResponse) => item.isShortlisted)
            .map((item: SubmissionResponse) => {
              // Extract parameter scores from the submission's evaluation
              const parameters: {[key: string]: number} = {};
              
              if (item.evaluation && Array.isArray(item.evaluation)) {
                item.evaluation.forEach((evaluation) => {
                  parameters[evaluation.parameterName] = evaluation.score;
                });
              }
              
              return {
                id: item._id,
                _id: item._id,
                studentName: item.userId?.fullName || 'Unknown Student',
                submissionTitle: item.submissionText?.substring(0, 50) || 'Untitled Submission',
                submissionDate: item.submittedAt,
                overallScore: item.totalScore || 0,
                parameters,
                isShortlisted: true,
                userId: item.userId || {},
                submissionText: item.submissionText,
                files: item.files,
                evaluation: item.evaluation,
                feedback: item.feedback,
                summary_feedback: item.summary_feedback
              };
            });
          
          console.log('Fallback shortlisted data:', shortlistedItems);
          if (shortlistedItems.length > 0) {
            setShortlistedSubmissions(shortlistedItems);
            setError(null);
          } else {
            setError('No shortlisted submissions found for this hackathon.');
          }
        } else {
          setError('Failed to load shortlisted submissions. No data returned from API.');
        }
      } catch (fallbackError) {
        console.error('Error fetching fallback submissions:', fallbackError);
        setError('Failed to load shortlisted submissions. Please try again.');
      }
    };
    
    fetchShortlistedSubmissions();
  }, [hackathonId]);

  // Toggle shortlist status
  const handleRemoveShortlist = async (submissionId: string) => {
    try {
      await submissionAPI.toggleShortlist(submissionId);
      
      // Update local state
      setShortlistedSubmissions(
        shortlistedSubmissions.filter(submission => submission.id !== submissionId)
      );
    } catch (error) {
      console.error('Error toggling shortlist:', error);
    }
  };

  const viewSubmissionDetails = (submissionId: string) => {
    navigate(`/dashboard/teacher/submission/${submissionId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Shortlisted Submissions</h1>
          <p className="text-gray-600 mt-1">View and manage submissions you've marked as important</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12 px-4">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : shortlistedSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submission
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shortlistedSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.submissionTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.submissionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Math.round(submission.overallScore)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleRemoveShortlist(submission.id)}
                              className="text-yellow-500 hover:text-yellow-700"
                            >
                              <Star className="w-5 h-5 fill-yellow-400" />
                            </button>
                            <button
                              onClick={() => setSelectedSubmission(selectedSubmission === submission.id ? null : submission.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => viewSubmissionDetails(submission.id)}
                              className="text-emerald-600 hover:text-emerald-900"
                              title="Open full submission view"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) :
                <div className="text-center py-12 px-4">
                  <Star className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No shortlisted submissions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't shortlisted any submissions yet.
                  </p>
                </div>
              }
            </div>
          </div>
          
          {selectedSubmission && (
            <div className="lg:w-1/4 bg-white rounded-lg shadow">
              <SubmissionDetail
                submission={shortlistedSubmissions.find(s => s.id === selectedSubmission)!}
                onClose={() => setSelectedSubmission(null)}
                fullSubmission
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShortlistedPage; 