import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import SubmissionDetail from '../../components/dashboard/SubmissionDetail';

// Sample data - in a real app, you would fetch this from your API
const SAMPLE_SUBMISSIONS = Array.from({ length: 100 }, (_, i) => ({
  id: `submission-${i + 1}`,
  studentName: `Student ${i + 1}`,
  submissionTitle: `Project ${i + 1}`,
  submissionDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
  overallScore: Math.floor(Math.random() * 100),
  parameters: {
    innovation: Math.floor(Math.random() * 100),
    technical: Math.floor(Math.random() * 100),
    design: Math.floor(Math.random() * 100),
    presentation: Math.floor(Math.random() * 100),
  },
  isShortlisted: Math.random() > 0.8, // 20% are shortlisted randomly
}));

const ShortlistedPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  // In a real app, you would use the hackathonId to fetch only shortlisted submissions for this specific hackathon
  console.log(`Loading shortlisted submissions for hackathon: ${hackathonId}`);
  
  const [shortlistedSubmissions, setShortlistedSubmissions] = useState(
    SAMPLE_SUBMISSIONS.filter(submission => submission.isShortlisted)
  );
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  // Toggle shortlist status
  const handleRemoveShortlist = (submissionId: string) => {
    setShortlistedSubmissions(
      shortlistedSubmissions.filter(submission => submission.id !== submissionId)
    );
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
              {shortlistedSubmissions.length > 0 ? (
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
                            {submission.overallScore}
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <Star className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No shortlisted submissions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't shortlisted any submissions yet.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {selectedSubmission && (
            <div className="lg:w-1/4 bg-white rounded-lg shadow">
              <SubmissionDetail
                submission={shortlistedSubmissions.find(s => s.id === selectedSubmission)!}
                onClose={() => setSelectedSubmission(null)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShortlistedPage; 