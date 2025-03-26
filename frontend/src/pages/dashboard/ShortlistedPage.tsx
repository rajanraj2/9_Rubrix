import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../components/dashboard/Sidebar';
import SubmissionDetail from '../../components/dashboard/SubmissionDetail';
import { hackathonAPI } from '../../lib/api';

interface Submission {
  id: string;
  studentName: string;
  submissionTitle: string;
  submissionDate: string;
  overallScore: number;
  isShortlisted: boolean;
}

const ShortlistedPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  console.log(`Loading shortlisted submissions for hackathon: ${hackathonId}`, hackathonAPI.getSubmissions(`/${hackathonId}`));
  console.log(`Loading shortlisted submissions for hackathon: ${hackathonId}`);

  const [shortlistedSubmissions, setShortlistedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch shortlisted submissions from backend
  useEffect(() => {
    const fetchShortlistedSubmissions = async () => {
      try {
        setLoading(true);
        // const submissionId = await hackathonAPI
        const response = await hackathonAPI.getShortlisted(`/${hackathonId}`);
        if (response.data.success) {
          setShortlistedSubmissions(response.data.data);
        } else {
          setError('Failed to fetch shortlisted submissions.');
        }
      } catch (err) {
        setError('Error fetching shortlisted submissions.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShortlistedSubmissions();
  }, [hackathonId]);

  // ✅ Handle removing from shortlist
  const handleRemoveShortlist = async (submissionId: string) => {
    try {
      await hackathonAPI.removeShortlisted( submissionId );
      setShortlistedSubmissions(shortlistedSubmissions.filter(submission => submission.id !== submissionId));
    } catch (err) {
      console.error('Error removing from shortlist:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Shortlisted Submissions</h1>
          <p className="text-gray-600 mt-1">View and manage submissions you've marked as important</p>
        </div>

        {loading ? (
          <div className="text-center py-12 px-4 text-gray-500">Loading shortlisted submissions...</div>
        ) : error ? (
          <div className="text-center py-12 px-4 text-red-500">{error}</div>
        ) : shortlistedSubmissions.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-3/4">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shortlistedSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">{submission.studentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{submission.submissionTitle}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(submission.submissionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{submission.overallScore}</td>
                          <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
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
              </div>
            </div>

            {/* {selectedSubmission && (
              <div className="lg:w-1/4 bg-white rounded-lg shadow">
                <SubmissionDetail
                  submissionId={selectedSubmission}
                  onClose={() => setSelectedSubmission(null)}
                />
              </div>
            )} */}
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
      </main>
    </div>
  );
};

export default ShortlistedPage;
