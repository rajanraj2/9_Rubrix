import React from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Star, MessageSquare } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';

const CompletedHackathonView: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();

  // In a real app, fetch this data based on hackathonId
  const hackathon = SAMPLE_COMPLETED_HACKATHONS.find(h => h.id === hackathonId);

  if (!hackathon || !hackathon.submission) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="student" />
        <main className="flex-1 p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Hackathon not found</h3>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{hackathon.title}</h1>
          <p className="text-gray-600 mt-1">{hackathon.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Your Performance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Trophy className="w-8 h-8 text-indigo-600" />
                    <span className="text-2xl font-bold text-indigo-600">
                      #{hackathon.submission.position}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-indigo-900">Leaderboard Position</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Star className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {hackathon.submission.score}/100
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-green-900">Overall Score</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="mt-2 text-sm text-purple-900">Feedback Received</p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Feedback</h3>
                <p className="text-gray-600">{hackathon.submission.feedback}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 h-fit">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Hackathon Details</h2>
            <div className="prose prose-sm">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium">
                    {new Date(hackathon.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">End Date</span>
                  <span className="font-medium">
                    {new Date(hackathon.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sample data - in a real app, this would come from your API
const SAMPLE_COMPLETED_HACKATHONS = [
  {
    id: '3',
    title: 'Mobile App Challenge',
    description: 'Design and develop mobile applications that address community needs.',
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    status: 'completed' as const,
    submission: {
      id: 'sub-1',
      position: 5,
      score: 85,
      feedback: 'Excellent work on the UI/UX. The implementation is solid and well-documented.',
    },
  },
  {
    id: '4',
    title: 'Data Science Competition',
    description: 'Analyze large datasets to derive meaningful insights and predictions.',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'completed' as const,
    submission: {
      id: 'sub-2',
      position: 12,
      score: 78,
      feedback: 'Good analysis but could improve on visualization aspects.',
    },
  },
];

export default CompletedHackathonView; 